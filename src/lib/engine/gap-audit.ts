import type { CallRecord, EngineDetectorId, DetectorId, Job, Quote } from "./types";
import type { DetectInput } from "./detectors";
import { daysBetween, detect } from "./detectors";
import { ENGINE_DETECTORS, ENGINE_LABEL, productForDetector } from "./products";
import { money, uid } from "./ids";
import { useDesk } from "./store";
import {
  HARBOR,
  harborAppointments,
  harborCalls,
  harborContacts,
  harborCues,
  harborEnquiries,
  harborInvoices,
  harborJobs,
  harborMemberships,
  harborPayments,
  harborQuotes,
} from "./seed";
import { harborWorks } from "./work-seed";

export function deskWorld(shopId: string): Omit<DetectInput, "enabled" | "personId" | "existing" | "products"> & {
  quotes: Quote[];
  jobs: Job[];
} {
  const s = useDesk.getState();
  const connected = s.jobs.some((j) => j.shopId === shopId);
  if (shopId === HARBOR && !connected) {
    return {
      shopId,
      jobs: [...s.jobs, ...harborJobs],
      quotes: [...s.quotes, ...harborQuotes],
      invoices: [...s.invoices, ...harborInvoices],
      payments: [...s.payments, ...harborPayments],
      appointments: [...s.appointments, ...harborAppointments],
      contacts: [...s.contacts, ...harborContacts],
      memberships: [...s.memberships, ...harborMemberships],
      calls: [...s.calls, ...harborCalls],
      cues: [...s.cues, ...harborCues],
      enquiries: [...s.enquiries, ...harborEnquiries],
      works: [...(s.works ?? []), ...harborWorks],
    };
  }
  return {
    shopId,
    jobs: s.jobs,
    quotes: s.quotes,
    invoices: s.invoices,
    payments: s.payments,
    appointments: s.appointments,
    contacts: s.contacts,
    memberships: s.memberships,
    calls: s.calls,
    cues: s.cues,
    enquiries: s.enquiries,
    works: s.works ?? [],
  };
}

export type GapMethod = "sample" | "workspace" | "csv";

export type GapLeak = {
  detector: DetectorId;
  label: string;
  product: string;
  count: number;
  amount: number;
  query: string;
};

export type LostCallPerson = {
  name: string;
  unanswered: number;
  noAsk: number;
  amount: number;
};

export type LostCallReport = {
  unanswered: { count: number; amount: number };
  noAsk: { count: number; amount: number };
  booked: number;
  inbound: number;
  byPerson: LostCallPerson[];
};

export type CueRow = {
  company: string;
  reason: string;
  source: string;
  amount: number;
};

export type QuietRow = {
  customer: string;
  summary: string;
  amount: number;
  ageDays: number;
  kind: "proposal" | "declined";
};

export type GapFix = {
  title: string;
  why: string;
  amount: number;
  product: string;
};

export type GapAudit = {
  id: string;
  company: string;
  system: string;
  shopId: string;
  preparedAt: string;
  method: GapMethod;
  total: number;
  leaks: GapLeak[];
  lostCalls: LostCallReport;
  companiesToCall: CueRow[];
  quietDeals: QuietRow[];
  fixes: GapFix[];
  notes: string[];
};

const QUERY: Record<EngineDetectorId, string> = {
  "account.buying_cue": "Public dated reason, not yet routed to the owner of the territory.",
  "recommendation.declined": "Expansion declined once, still valid, no outbound since.",
  "quote.unfollowed": "Open proposal past 7 days with no follow-up.",
  "invoice.aging": "Invoice past due 7 days or more.",
  "payment.failed": "Failed charge, not yet retried by failure reason.",
  "appointment.no_next": "Meeting completed, no next step on the book.",
  "contact.lapsed": "Last conversation past that account's expected interval.",
  "membership.lapsing": "Renewal window open, not confirmed.",
  "review.absent": "Work completed, no testimonial request sent.",
  "call.unanswered": "Inbound not answered. No meeting followed.",
  "call.no_ask": "Answered. Transcript has no meeting request. No meeting followed.",
  "enquiry.form": "Web form past 15 minutes with no reply.",
  "enquiry.chat": "Chat past 5 minutes with no reply.",
};

export function buildGapAudit(args: {
  company: string;
  system: string;
  shopId: string;
  method: GapMethod;
  world: Omit<DetectInput, "enabled" | "personId" | "existing" | "products"> & {
    quotes: Quote[];
    jobs: Job[];
  };
}): GapAudit {
  const now = new Date();
  const { signals } = detect({
    ...args.world,
    existing: [],
    personId: "audit",
    enabled: ENGINE_DETECTORS,
    products: [],
  });

  const grouped = new Map<DetectorId, GapLeak>();
  for (const sig of signals) {
    const prev = grouped.get(sig.detector);
    const product = productForDetector(sig.detector)?.name ?? "Unbundled";
    if (!prev) {
      grouped.set(sig.detector, {
        detector: sig.detector,
        label: ENGINE_LABEL[sig.detector as EngineDetectorId] ?? sig.detector,
        product,
        count: 1,
        amount: sig.amount,
        query: QUERY[sig.detector as EngineDetectorId] ?? "",
      });
    } else {
      prev.count += 1;
      prev.amount += sig.amount;
    }
  }
  const leaks = [...grouped.values()].sort((a, b) => b.amount - a.amount);
  const total = leaks.reduce((n, r) => n + r.amount, 0);

  const shopCalls = args.world.calls.filter((c) => c.shopId === args.shopId);
  const lostCalls = lostCallReport(shopCalls);

  const companiesToCall = args.world.cues
    .filter((c) => c.shopId === args.shopId && !c.routed)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 20)
    .map((c) => ({ company: c.company, reason: c.reason, source: c.source, amount: c.amount }));

  const quietDeals: QuietRow[] = [
    ...args.world.quotes
      .filter((q) => q.shopId === args.shopId && q.open)
      .filter((q) => daysBetween(q.sentOn, now) >= 7 && !q.lastOutbound)
      .map((q) => ({
        customer: q.customer,
        summary: q.summary,
        amount: q.amount,
        ageDays: daysBetween(q.sentOn, now),
        kind: "proposal" as const,
      })),
    ...args.world.jobs
      .filter((j) => j.shopId === args.shopId && j.stillValid && !j.lastOutbound)
      .filter((j) => daysBetween(j.declinedOn, now) >= 14)
      .map((j) => ({
        customer: j.customer,
        summary: j.recommended,
        amount: j.amount,
        ageDays: daysBetween(j.declinedOn, now),
        kind: "declined" as const,
      })),
  ].sort((a, b) => b.amount - a.amount);

  const fixes = leaks.slice(0, 3).map((row) => ({
    title: row.label,
    why: fixWhy(row.detector),
    amount: row.amount,
    product: row.product,
  }));

  const notes: string[] = [
    args.method === "sample"
      ? "This run used the Northline Supply sample export. Every line is a detector over that file. Not a forecast."
      : args.method === "workspace"
        ? "This run used the records already on the workspace. Read-only. Nothing sent."
        : "This run used only the CSV you pasted. Calls, invoices, and buying cues are absent unless they were in that file.",
    "An outcome counts only when it traces signal to action to decision to execution to result. This page is the signal. The desk is the rest.",
    "Lost Call Report is detectors 4.9 and 4.10. It is read-only. It feeds this audit. It does not draft a message. Missed-call recovery, if it is on, drafts a text from unanswered inbound. That lives in the queue, not here.",
  ];

  return {
    id: uid("audit"),
    company: args.company,
    system: args.system,
    shopId: args.shopId,
    preparedAt: now.toISOString(),
    method: args.method,
    total,
    leaks,
    lostCalls,
    companiesToCall,
    quietDeals,
    fixes,
    notes,
  };
}

export function lostCallReport(calls: CallRecord[]): LostCallReport {
  const unanswered = calls.filter((c) => !c.answered && !c.booked);
  const noAsk = calls.filter((c) => c.answered && !c.askedForBooking && !c.booked);
  const people = new Map<string, LostCallPerson>();
  const bump = (c: CallRecord, kind: "unanswered" | "noAsk") => {
    const name = c.ownerName?.trim() || "Unassigned";
    const row = people.get(name) ?? { name, unanswered: 0, noAsk: 0, amount: 0 };
    row[kind] += 1;
    row.amount += c.estimated;
    people.set(name, row);
  };
  for (const c of unanswered) bump(c, "unanswered");
  for (const c of noAsk) bump(c, "noAsk");
  return {
    unanswered: {
      count: unanswered.length,
      amount: unanswered.reduce((n, c) => n + c.estimated, 0),
    },
    noAsk: {
      count: noAsk.length,
      amount: noAsk.reduce((n, c) => n + c.estimated, 0),
    },
    booked: calls.filter((c) => c.booked).length,
    inbound: calls.length,
    byPerson: [...people.values()].sort((a, b) => b.amount - a.amount),
  };
}

function fixWhy(id: DetectorId): string {
  switch (id) {
    case "call.unanswered":
      return "Every missed inbound gets a drafted text, held for a person. That is missed-call recovery. This page only counts.";
    case "call.no_ask":
      return "The people who answer without asking need a one-question prompt, scored weekly. Coaching, not a script dump.";
    case "enquiry.form":
    case "enquiry.chat":
      return "A drafted reply in the rep's voice, held until they send it. Fifteen minutes for a form, five for chat.";
    case "account.buying_cue":
      return "Route the reason to the rep who owns the territory. Signal Ledger. Not a list of names.";
    case "quote.unfollowed":
      return "Quiet proposals past seven days get a second conversation in the rep's voice. Held for approve.";
    case "recommendation.declined":
      return "Declined once is not lost. Follow up while the recommendation is still valid.";
    case "contact.lapsed":
      return "Useful letter, no ask, every 14 to 21 days until they come back or tell you to stop.";
    case "invoice.aging":
    case "payment.failed":
      return "Age into buckets. Draft the 14-day note first. A person still sends it.";
    default:
      return `${ENGINE_LABEL[id as EngineDetectorId] ?? id} is a query with a product attached. Turn it on after the baseline.`;
  }
}

export function methodLabel(method: GapMethod): string {
  if (method === "sample") return "Northline sample export";
  if (method === "workspace") return "Workspace records, read-only";
  return "CSV you pasted";
}

export function moneyTotal(n: number): string {
  return money(n);
}
