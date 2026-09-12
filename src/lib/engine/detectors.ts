import type {
  Appointment,
  BuyingCue,
  CallRecord,
  Contact,
  DetectorId,
  Draft,
  Enquiry,
  Invoice,
  Job,
  Membership,
  Payment,
  ProductId,
  Quote,
  Signal,
  WorkRecord,
} from "./types";
import { isoDaysAgo, uid } from "./ids";
import { draftFor } from "./seed";
import { shouldDraft } from "./products";

const DECLINE_WINDOW = 14;
const QUOTE_WINDOW = 7;
const INVOICE_WINDOW = 7;
const MEMBERSHIP_WINDOW = 21;
const REVIEW_WINDOW = 3;
const FORM_THRESHOLD_MIN = 15;
const CHAT_THRESHOLD_MIN = 5;

export type DetectInput = {
  shopId: string;
  jobs: Job[];
  quotes: Quote[];
  invoices: Invoice[];
  payments: Payment[];
  appointments: Appointment[];
  contacts: Contact[];
  memberships: Membership[];
  calls: CallRecord[];
  cues: BuyingCue[];
  enquiries: Enquiry[];
  works: WorkRecord[];
  existing: Signal[];
  personId: string;
  enabled: DetectorId[];
  products: ProductId[];
};

export function detect(input: DetectInput): { signals: Signal[]; drafts: Draft[] } {
  const now = new Date();
  const signals: Signal[] = [];
  const seen = new Set(input.existing.filter((s) => !s.suppressed).map((s) => `${s.detector}:${s.entityId}`));
  const on = new Set(input.enabled);

  const push = (s: Omit<Signal, "id" | "createdAt" | "suppressed" | "shopId">) => {
    const key = `${s.detector}:${s.entityId}`;
    if (seen.has(key)) return;
    if (!on.has(s.detector)) return;
    seen.add(key);
    signals.push({
      id: uid("sig"),
      shopId: input.shopId,
      createdAt: isoDaysAgo(0),
      suppressed: false,
      ...s,
    });
  };

  if (on.has("account.buying_cue")) {
    for (const cue of input.cues) {
      if (cue.shopId !== input.shopId || cue.routed) continue;
      push({
        detector: "account.buying_cue",
        entityId: cue.id,
        title: `${cue.company} · ${cue.reason}`,
        evidence: `${cue.source}. ${cue.reason}. Estimated ${cue.amount}. Not yet routed to a rep.`,
        source: cue.source,
        amount: cue.amount,
      });
    }
  }

  if (on.has("recommendation.declined")) {
    for (const job of input.jobs) {
      if (job.shopId !== input.shopId || !job.stillValid) continue;
      const age = daysBetween(job.declinedOn, now);
      if (age < DECLINE_WINDOW) continue;
      if (job.lastOutbound) continue;
      push({
        detector: "recommendation.declined",
        entityId: job.id,
        title: `${job.customer} · ${job.vehicle}`,
        evidence: `Opp ${job.ro}. Recommended: ${job.recommended}. Declined ${age} days ago. No outbound since. Amount ${job.amount}.`,
        source: job.ro,
        amount: job.amount,
      });
    }
  }

  if (on.has("quote.unfollowed")) {
    for (const quote of input.quotes) {
      if (quote.shopId !== input.shopId || !quote.open) continue;
      const age = daysBetween(quote.sentOn, now);
      if (age < QUOTE_WINDOW) continue;
      if (quote.lastOutbound && daysBetween(quote.lastOutbound, now) < QUOTE_WINDOW) continue;
      if (quote.lastOutbound && age >= QUOTE_WINDOW) continue;
      push({
        detector: "quote.unfollowed",
        entityId: quote.id,
        title: `${quote.customer} · ${quote.summary}`,
        evidence: `Proposal sent ${age} days ago. No follow-up. Amount ${quote.amount}.`,
        source: quote.id,
        amount: quote.amount,
      });
    }
  }

  if (on.has("invoice.aging")) {
    for (const inv of input.invoices) {
      if (inv.shopId !== input.shopId) continue;
      if (inv.agingDays < INVOICE_WINDOW) continue;
      push({
        detector: "invoice.aging",
        entityId: inv.id,
        title: `${inv.customer} · ${inv.number}`,
        evidence: `Invoice ${inv.number} is ${inv.agingDays} days past due. Balance ${inv.amount}. Bucket ${agingBucket(inv.agingDays)}.`,
        source: inv.number,
        amount: inv.amount,
      });
    }
  }

  if (on.has("payment.failed")) {
    for (const pay of input.payments) {
      if (pay.shopId !== input.shopId || pay.retried) continue;
      const route =
        pay.reason === "expired_card"
          ? "Ask for a new card."
          : pay.reason === "nsf"
            ? "Wait three days, then retry once."
            : "Call before retrying. Do not auto-retry.";
      push({
        detector: "payment.failed",
        entityId: pay.id,
        title: `${pay.customer} · failed charge`,
        evidence: `Charge failed ${daysBetween(pay.failedOn, now)} days ago. Reason: ${pay.reason.replaceAll("_", " ")}. ${route}`,
        source: pay.id,
        amount: pay.amount,
      });
    }
  }

  if (on.has("appointment.no_next")) {
    for (const ap of input.appointments) {
      if (ap.shopId !== input.shopId) continue;
      if (ap.nextOn) continue;
      push({
        detector: "appointment.no_next",
        entityId: ap.id,
        title: `${ap.customer} · ${ap.vehicle}`,
        evidence: `Meeting completed ${daysBetween(ap.completedOn, now)} days ago. No next step on the book. Last ticket ${ap.ticket}.`,
        source: ap.id,
        amount: ap.ticket,
      });
    }
  }

  if (on.has("contact.lapsed")) {
    for (const c of input.contacts) {
      if (c.shopId !== input.shopId) continue;
      const age = daysBetween(c.lastVisit, now);
      if (age < c.expectedDays) continue;
      push({
        detector: "contact.lapsed",
        entityId: c.id,
        title: `${c.customer} · quiet`,
        evidence: `Last conversation ${age} days ago. Expected interval ${c.expectedDays} days. Average ticket ${c.averageTicket}.`,
        source: c.id,
        amount: c.averageTicket,
      });
    }
  }

  if (on.has("membership.lapsing")) {
    for (const m of input.memberships) {
      if (m.shopId !== input.shopId || m.confirmed) continue;
      const daysTo = -daysBetween(m.renewsOn, now);
      if (daysTo > MEMBERSHIP_WINDOW) continue;
      push({
        detector: "membership.lapsing",
        entityId: m.id,
        title: `${m.customer} · ${m.plan}`,
        evidence: `Renewal ${daysTo >= 0 ? `in ${daysTo} days` : `${-daysTo} days ago`}. Not confirmed. ${m.plan}.`,
        source: m.id,
        amount: m.monthly * 12,
      });
    }
  }

  if (on.has("review.absent")) {
    for (const job of input.jobs) {
      if (job.shopId !== input.shopId || !job.completed || job.reviewRequested) continue;
      const age = daysBetween(job.declinedOn, now);
      if (age > 14) continue;
      if (age < REVIEW_WINDOW) continue;
      push({
        detector: "review.absent",
        entityId: job.id,
        title: `${job.customer} · ${job.vehicle}`,
        evidence: `Opp ${job.ro} completed. No testimonial request sent. Ticket ${job.amount}.`,
        source: job.ro,
        amount: job.amount,
      });
    }
  }

  if (on.has("call.unanswered")) {
    for (const call of input.calls) {
      if (call.shopId !== input.shopId) continue;
      if (call.answered || call.booked) continue;
      push({
        detector: "call.unanswered",
        entityId: call.id,
        title: `${call.company ?? call.from} · missed`,
        evidence: `Inbound ${daysBetween(call.at, now)} days ago. Not answered. No meeting followed. Number ${call.from}. Owner ${call.ownerName ?? "Unassigned"}.`,
        source: call.from,
        amount: call.estimated,
      });
    }
  }

  if (on.has("call.no_ask")) {
    for (const call of input.calls) {
      if (call.shopId !== input.shopId) continue;
      if (!call.answered || call.askedForBooking || call.booked) continue;
      push({
        detector: "call.no_ask",
        entityId: call.id,
        title: `${call.from} · no ask`,
        evidence: `Answered ${daysBetween(call.at, now)} days ago. Transcript classified as containing no meeting request. No meeting followed.`,
        source: call.from,
        amount: call.estimated,
      });
    }
  }

  if (on.has("enquiry.form") || on.has("enquiry.chat")) {
    for (const enq of input.enquiries) {
      if (enq.shopId !== input.shopId) continue;
      if (enq.repliedAt) continue;
      const detector: DetectorId = enq.kind === "chat" ? "enquiry.chat" : "enquiry.form";
      if (!on.has(detector)) continue;
      const age = minutesBetween(enq.at, now);
      const threshold = enq.kind === "chat" ? CHAT_THRESHOLD_MIN : FORM_THRESHOLD_MIN;
      if (age < threshold) continue;
      push({
        detector,
        entityId: enq.id,
        title: `${enq.name} · ${enq.company}`,
        evidence: `${enq.kind === "chat" ? "Chat" : "Web form"} ${age} minutes ago. No reply. From ${enq.name} at ${enq.company}. Email ${enq.email}. Asked: ${enq.message}. Owner ${enq.ownerName}. Threshold ${threshold} minutes.`,
        source: enq.kind === "chat" ? "chat" : enq.email,
        amount: enq.estimated,
      });
    }
  }

  const workDrafts: Draft[] = [];
  for (const w of input.works) {
    if (w.shopId !== input.shopId || w.done) continue;
    const detector: DetectorId = `work.${w.productId}`;
    if (!on.has(detector)) continue;
    const before = signals.length;
    push({
      detector,
      entityId: w.id,
      title: w.title,
      evidence: w.evidence,
      source: w.source,
      amount: w.amount,
    });
    const signal = signals[signals.length - 1];
    if (signals.length > before && signal && shouldDraft(detector, input.products)) {
      workDrafts.push({
        id: `draft_${signal.id}`,
        shopId: signal.shopId,
        signalId: signal.id,
        personId: input.personId,
        channel: w.channel,
        subject: w.subject,
        body: w.body,
        createdAt: signal.createdAt,
        expiresAt: isoDaysAgo(-7),
      });
    }
  }

  const drafts = [
    ...signals.filter((s) => !String(s.detector).startsWith("work.") && shouldDraft(s.detector, input.products)).map((s) => draftFor(s, input.personId)),
    ...workDrafts,
  ];
  return { signals, drafts };
}

export function daysBetween(iso: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000);
}

export function minutesBetween(iso: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 60000);
}

export function validateDraft(body: string, evidence: string, channel: "email" | "sms" | "chat" | "none" = "email"): string[] {
  const errors: string[] = [];
  if (/—|–/.test(body)) errors.push("Use commas or periods, not dashes.");
  if (/\bguaranteed\b/i.test(body)) errors.push("Do not promise a guarantee.");
  if (/\bfree\b/i.test(body)) errors.push("Do not offer free work in recovery copy.");
  if (channel === "sms") {
    if (body.length < 20) errors.push("Text is too short to send.");
    if (body.length > 320) errors.push("Text is over 320 characters. Cut it.");
  } else if (channel === "chat") {
    if (body.length < 20) errors.push("Reply is too short to send.");
    if (body.length > 500) errors.push("Chat reply is over 500 characters. Cut it.");
  } else if (body.length < 40) {
    errors.push("Draft is too short to send.");
  }
  if (channel !== "sms" && channel !== "chat") {
    const quote = evidence.match(/Recommended: ([^.]+)/)?.[1];
    if (quote && !body.toLowerCase().includes(quote.split(",")[0]!.toLowerCase().slice(0, 12))) {
      errors.push("The recommended work must appear in the draft.");
    }
  }
  return errors;
}

export function parseCsv(text: string, shopId: string): Job[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0]!.split(",").map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.findIndex((h) => h.includes(name));
  const jobs: Job[] = [];
  for (const line of lines.slice(1)) {
    const cols = splitCsv(line);
    const customer = cols[idx("customer")] ?? cols[0] ?? "Account";
    const vehicle = cols[idx("account")] ?? cols[idx("vehicle")] ?? cols[1] ?? "Account";
    const recommended = cols[idx("recommend")] ?? cols[idx("work")] ?? cols[2] ?? "Recommended work";
    const amount = Number((cols[idx("amount")] ?? cols[3] ?? "0").replace(/[^0-9.]/g, "")) || 0;
    const declined = cols[idx("declin")] ?? cols[idx("date")] ?? cols[4];
    jobs.push({
      id: uid("job"),
      shopId,
      customer: customer.trim(),
      vehicle: vehicle.trim(),
      ro: (cols[idx("opp")] ?? cols[idx("ro")] ?? uid("opp")).trim(),
      recommended: recommended.trim(),
      amount,
      declinedOn: declined ? new Date(declined).toISOString() : isoDaysAgo(30),
      lastOutbound: null,
      stillValid: true,
    });
  }
  return jobs;
}

function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === "," && !q) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function agingBucket(days: number): string {
  if (days >= 90) return "90";
  if (days >= 60) return "60";
  if (days >= 30) return "30";
  if (days >= 14) return "14";
  return "7";
}

export const SAMPLE_CSV = `customer,account,opp,recommended,amount,declined
Riley Brooks,Facilities,OPP-45001,VFD retrofit,4200,2026-07-02
Pat Okonkwo,Plant 2,OPP-45018,Spare controls kit,3800,2026-06-18
Jordan Lee,Lab services,OPP-45044,Calibration contract,16000,2026-05-29`;
