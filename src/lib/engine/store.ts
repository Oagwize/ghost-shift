import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ActionStatus,
  Appointment,
  AuditEvent,
  AuditLead,
  BuyingCue,
  CallRecord,
  Contact,
  Decision,
  Draft,
  Enquiry,
  HoursEntry,
  Invoice,
  Job,
  Measurement,
  Membership,
  Notice,
  Payment,
  Person,
  ProductId,
  Quote,
  Role,
  Session,
  Shop,
  Signal,
  WorkRecord,
} from "./types";
import {
  appointments as seedAppointments,
  baseline,
  calls as seedCalls,
  contacts as seedContacts,
  cues as seedCues,
  enquiries as seedEnquiries,
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
  invoices as seedInvoices,
  jobs as seedJobs,
  memberships as seedMemberships,
  payments as seedPayments,
  people,
  quotes as seedQuotes,
  seedHours,
  shops as seedShops,
  HARBOR,
  RIVERSIDE,
} from "./seed";
import { harborWorks, works as seedWorks } from "./work-seed";
import { detect, parseCsv, validateDraft } from "./detectors";
import { detectorsFor, PRODUCTS, READ_ONLY_DETECTORS } from "./products";
import { uid } from "./ids";

type State = {
  shops: Shop[];
  people: Person[];
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
  signals: Signal[];
  drafts: Draft[];
  decisions: Decision[];
  measurements: Measurement[];
  events: AuditEvent[];
  hours: HoursEntry[];
  leads: AuditLead[];
  session: Session | null;
  hydrated: boolean;
  notice: Notice;
  enter: (role: Role, shopId?: string) => void;
  leave: () => void;
  selectShop: (shopId: string) => void;
  runDetectors: (shopId: string) => number;
  decide: (draftId: string, status: Exclude<ActionStatus, "queued" | "expired">, editedBody?: string) => string | null;
  decideMany: (draftIds: string[], status: "approved" | "skipped") => number;
  importCsv: (shopId: string, csv: string) => number;
  connectShop: (shopId: string) => void;
  enableProduct: (shopId: string, productId: ProductId) => string | null;
  kill: (shopId: string, reason: string) => void;
  resume: (shopId: string) => void;
  takeBaseline: (shopId: string) => string | null;
  requestAudit: (lead: Omit<AuditLead, "id" | "at">) => void;
  resetDemo: () => void;
  clearNotice: () => void;
};

function log(
  events: AuditEvent[],
  actor: string,
  action: string,
  detail: string,
  shopId: string | null,
): AuditEvent[] {
  return [
    { id: uid("evt"), shopId, at: new Date().toISOString(), actor, action, detail },
    ...events,
  ].slice(0, 400);
}

function hours(list: HoursEntry[], shopId: string, minutes: number, kind: string): HoursEntry[] {
  return [{ id: uid("hr"), shopId, at: new Date().toISOString(), minutes, kind }, ...list];
}

function detectShop(
  s: {
    shops: Shop[];
    jobs: Job[];
    quotes: Quote[];
    invoices: Invoice[];
    payments: Payment[];
    appointments: Appointment[];
    contacts: Contact[];
    memberships: Membership[];
    calls: CallRecord[];
    cues: BuyingCue[];
    enquiries?: Enquiry[];
    works?: WorkRecord[];
    signals: Signal[];
    people: Person[];
  },
  shopId: string,
) {
  const shop = s.shops.find((x) => x.id === shopId);
  if (!shop) return { signals: [] as Signal[], drafts: [] as Draft[] };
  const enabled = detectorsFor(shop.products);
  const desk = s.people.find((p) => p.shopId === shopId && p.role === "desk") ?? s.people.find((p) => p.shopId === shopId);
  return detect({
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
    enquiries: s.enquiries ?? [],
    works: s.works ?? [],
    existing: s.signals,
    personId: desk?.id ?? "p_dana",
    enabled,
    products: shop.products,
  });
}

function seedWorld() {
  const world = {
    shops: seedShops.map((s) => ({ ...s, products: [...s.products] })),
    people: people.map((p) => ({ ...p })),
    jobs: seedJobs.map((j) => ({ ...j })),
    quotes: seedQuotes.map((q) => ({ ...q })),
    invoices: seedInvoices.map((i) => ({ ...i })),
    payments: seedPayments.map((p) => ({ ...p })),
    appointments: seedAppointments.map((a) => ({ ...a })),
    contacts: seedContacts.map((c) => ({ ...c })),
    memberships: seedMemberships.map((m) => ({ ...m })),
    calls: seedCalls.map((c) => ({ ...c })),
    cues: seedCues.map((c) => ({ ...c })),
    enquiries: seedEnquiries.map((e) => ({ ...e })),
    works: seedWorks.map((w) => ({ ...w })),
    signals: [] as Signal[],
    drafts: [] as Draft[],
    decisions: [] as Decision[],
    measurements: [{ ...baseline }],
    events: [] as AuditEvent[],
    hours: seedHours.map((h) => ({ ...h })),
    leads: [] as AuditLead[],
  };
  const { signals, drafts } = detectShop(world, RIVERSIDE);
  world.signals = signals;
  world.drafts = drafts;
  world.events = log(
    [],
    "system",
    "seeded",
    "Northline Supply loaded from the sample export. Meridian Instruments is still in onboarding.",
    RIVERSIDE,
  );
  return world;
}

export const useDesk = create<State>()(
  persist(
    (set, get) => ({
      ...seedWorld(),
      session: null,
      hydrated: false,
      notice: null,
      enter: (role, shopId) => {
        const actorName = role === "operator" ? "Robert Greenleaf" : "Dana Ruiz";
        set({
          session: { role, shopId: role === "staff" ? RIVERSIDE : shopId ?? RIVERSIDE, actorName },
        });
      },
      leave: () => set({ session: null }),
      selectShop: (shopId) => {
        const s = get();
        if (!s.session) return;
        set({ session: { ...s.session, shopId } });
      },
      runDetectors: (shopId) => {
        const s = get();
        const shop = s.shops.find((x) => x.id === shopId);
        if (!shop || shop.killed) return 0;
        if (shop.connector.health === "not_connected") return 0;
        const { signals, drafts } = detectShop(s, shopId);
        set({
          signals: [...signals, ...s.signals],
          drafts: [...drafts, ...s.drafts],
          events: log(s.events, s.session?.actorName ?? "system", "detectors_ran", `${signals.length} new items.`, shopId),
          hours: hours(s.hours, shopId, 8, "detector run"),
          notice: { kind: "ok", text: `${signals.length} new items in the queue.` },
        });
        return signals.length;
      },
      decide: (draftId, status, editedBody) => {
        const s = get();
        const draft = s.drafts.find((d) => d.id === draftId);
        if (!draft) return "Draft not found.";
        const shop = s.shops.find((x) => x.id === draft.shopId);
        if (!shop) return "Workspace not found.";
        if (shop.killed) return "This workspace is paused. Resume it before acting.";
        if (s.session?.role === "staff" && s.session.shopId !== draft.shopId) {
          return "This item belongs to another workspace.";
        }
        if (s.decisions.some((d) => d.draftId === draftId && (d.status === "approved" || d.status === "sent_dry_run" || d.status === "skipped"))) {
          return "This item already has a decision.";
        }
        if (new Date(draft.expiresAt).getTime() < Date.now()) {
          const expired: Decision = {
            id: uid("dec"),
            shopId: draft.shopId,
            draftId,
            actor: "system",
            status: "expired",
            seenBody: draft.body,
            at: new Date().toISOString(),
          };
          set({
            decisions: [expired, ...s.decisions],
            events: log(s.events, "system", "expired", "Unapproved action expired and will never execute.", draft.shopId),
          });
          return "This item expired. It will not execute.";
        }
        const signal = s.signals.find((x) => x.id === draft.signalId);
        const body = editedBody ?? draft.body;
        if (status === "approved" || status === "sent_dry_run") {
          const errors = validateDraft(body, signal?.evidence ?? "", draft.channel);
          if (errors.length) return errors[0]!;
        }
        const finalStatus: ActionStatus = status === "approved" ? "sent_dry_run" : status;
        const decision: Decision = {
          id: uid("dec"),
          shopId: draft.shopId,
          draftId,
          actor: s.session?.actorName ?? "unknown",
          status: finalStatus,
          editedBody,
          seenBody: body,
          at: new Date().toISOString(),
        };
        let recovered = 0;
        if (finalStatus === "sent_dry_run" && signal && !READ_ONLY_DETECTORS.has(signal.detector)) {
          recovered = signal.amount;
        }
        const latest = s.measurements.filter((m) => m.shopId === draft.shopId).sort((a, b) => b.at.localeCompare(a.at))[0];
        const nextMeasure: Measurement | null =
          recovered && latest
            ? {
                id: uid("m"),
                shopId: draft.shopId,
                at: new Date().toISOString(),
                method: latest.method,
                declinedUnfollowed: latest.declinedUnfollowed,
                agingOpen: latest.agingOpen,
                recoveredAttributed: latest.recoveredAttributed + recovered,
                hoursFollowUp: latest.hoursFollowUp,
              }
            : null;
        set({
          decisions: [decision, ...s.decisions],
          measurements: nextMeasure ? [nextMeasure, ...s.measurements] : s.measurements,
          events: log(
            s.events,
            decision.actor,
            finalStatus,
            signal ? `${signal.title} · ${finalStatus.replaceAll("_", " ")}` : draftId,
            draft.shopId,
          ),
          hours: hours(s.hours, draft.shopId, 2, "approval"),
          notice:
            finalStatus === "sent_dry_run"
              ? {
                  kind: "ok",
                  text:
                    draft.channel === "sms"
                      ? "Text held as dry-run. Nothing left the building."
                      : draft.channel === "chat"
                        ? "Chat reply held as dry-run. Nothing left the building."
                        : "Held as dry-run. Nothing left the building.",
                }
              : { kind: "ok", text: "Skipped. Logged." },
        });
        return null;
      },
      decideMany: (draftIds, status) => {
        let n = 0;
        for (const id of draftIds) {
          const err = get().decide(id, status);
          if (!err) n += 1;
        }
        return n;
      },
      importCsv: (shopId, csv) => {
        const s = get();
        const shop = s.shops.find((x) => x.id === shopId);
        if (!shop) return 0;
        const jobs = parseCsv(csv, shopId);
        if (!jobs.length) return 0;
        const nextJobs = [...jobs, ...s.jobs];
        const shops = s.shops.map((x) =>
          x.id === shopId
            ? {
                ...x,
                system: "CSV" as const,
                connector: { kind: "csv" as const, lastSync: new Date().toISOString(), health: "ok" as const },
              }
            : x,
        );
        const next = { ...s, jobs: nextJobs, shops };
        const { signals, drafts } = detectShop(next, shopId);
        set({
          jobs: nextJobs,
          signals: [...signals, ...s.signals],
          drafts: [...drafts, ...s.drafts],
          shops,
          events: log(
            s.events,
            s.session?.actorName ?? "system",
            "csv_imported",
            `${jobs.length} rows. ${signals.length} new items.`,
            shopId,
          ),
          hours: hours(s.hours, shopId, 12, "csv import"),
          notice: { kind: "ok", text: `${jobs.length} rows imported.` },
        });
        return jobs.length;
      },
      connectShop: (shopId) => {
        const s = get();
        const shop = s.shops.find((x) => x.id === shopId);
        if (!shop) return;
        const already = s.jobs.some((j) => j.shopId === shopId && j.id.startsWith("hjob"));
        const jobs = already ? s.jobs : [...harborJobs, ...s.jobs];
        const quotes = already ? s.quotes : [...harborQuotes, ...s.quotes];
        const invoices = already ? s.invoices : [...harborInvoices, ...s.invoices];
        const payments = already ? s.payments : [...harborPayments, ...s.payments];
        const appointments = already ? s.appointments : [...harborAppointments, ...s.appointments];
        const contacts = already ? s.contacts : [...harborContacts, ...s.contacts];
        const memberships = already ? s.memberships : [...harborMemberships, ...s.memberships];
        const calls = already ? s.calls : [...harborCalls, ...s.calls];
        const cues = already ? s.cues : [...harborCues, ...s.cues];
        const enquiries = already ? s.enquiries : [...harborEnquiries, ...s.enquiries];
        const works = already ? s.works : [...harborWorks, ...s.works];
        const shops = s.shops.map((x) =>
          x.id === shopId
            ? { ...x, connector: { ...x.connector, lastSync: new Date().toISOString(), health: "ok" as const } }
            : x,
        );
        set({
          jobs,
          quotes,
          invoices,
          payments,
          appointments,
          contacts,
          memberships,
          calls,
          cues,
          enquiries,
          works,
          shops,
          events: log(
            s.events,
            s.session?.actorName ?? "system",
            "connector_connected",
            `${shop.system} read-only. Write access stays dry-run.`,
            shopId,
          ),
          hours: hours(s.hours, shopId, 18, "connector connect"),
          notice: { kind: "ok", text: `${shop.system} connected. Read-only. Take a baseline before write access.` },
        });
      },
      enableProduct: (shopId, productId) => {
        const s = get();
        const shop = s.shops.find((x) => x.id === shopId);
        if (!shop) return "Workspace not found.";
        if (!shop.baselineAt) return "Take a baseline before enabling a product.";
        if (shop.connector.health === "not_connected") return "Connect a source first.";
        if (shop.products.includes(productId)) return "Already enabled.";
        const product = PRODUCTS.find((p) => p.id === productId);
        const shops = s.shops.map((x) =>
          x.id === shopId ? { ...x, products: [...x.products, productId], status: x.killed ? x.status : "live" } : x,
        );
        const next = { ...s, shops };
        const { signals, drafts } = detectShop(next, shopId);
        set({
          shops,
          signals: [...signals, ...s.signals],
          drafts: [...drafts, ...s.drafts],
          events: log(
            s.events,
            s.session?.actorName ?? "system",
            "product_enabled",
            product?.name ?? productId,
            shopId,
          ),
          hours: hours(s.hours, shopId, 6, "product enable"),
          notice: { kind: "ok", text: `${product?.name ?? productId} is on. ${signals.length} new items in the queue.` },
        });
        return null;
      },
      kill: (shopId, reason) => {
        const s = get();
        set({
          shops: s.shops.map((x) =>
            x.id === shopId ? { ...x, killed: true, status: "paused", killedReason: reason, sendEnabled: false } : x,
          ),
          events: log(s.events, s.session?.actorName ?? "system", "kill_switch", reason, shopId),
          notice: { kind: "warn", text: "Workspace paused. History kept." },
        });
      },
      resume: (shopId) => {
        const s = get();
        set({
          shops: s.shops.map((x) =>
            x.id === shopId ? { ...x, killed: false, status: x.baselineAt ? "live" : "onboarding", killedReason: null } : x,
          ),
          events: log(s.events, s.session?.actorName ?? "system", "resumed", "Kill switch cleared. History kept.", shopId),
          notice: { kind: "ok", text: "Workspace resumed." },
        });
      },
      takeBaseline: (shopId) => {
        const s = get();
        const shop = s.shops.find((x) => x.id === shopId);
        if (!shop) return "Workspace not found.";
        if (shop.connector.health === "not_connected") return "Connect a source before taking a baseline.";
        const shopJobs = s.jobs.filter((j) => j.shopId === shopId && !j.lastOutbound && j.stillValid);
        const aging = s.invoices.filter((i) => i.shopId === shopId).reduce((n, i) => n + i.amount, 0);
        const declined = shopJobs.reduce((n, j) => n + j.amount, 0);
        const m: Measurement = {
          id: uid("m"),
          shopId,
          at: new Date().toISOString(),
          method: 1,
          declinedUnfollowed: declined,
          agingOpen: aging,
          recoveredAttributed: 0,
          hoursFollowUp: 0,
        };
        set({
          measurements: [m, ...s.measurements],
          shops: s.shops.map((x) =>
            x.id === shopId ? { ...x, baselineAt: m.at, status: x.killed ? "paused" : x.status } : x,
          ),
          events: log(
            s.events,
            s.session?.actorName ?? "system",
            "baseline",
            `Declined unfollowed ${declined}. Aging ${aging}. Write access still dry-run.`,
            shopId,
          ),
          hours: hours(s.hours, shopId, 15, "baseline snapshot"),
          notice: { kind: "ok", text: "Baseline stored. It cannot be overwritten. Write access stays dry-run." },
        });
        return null;
      },
      requestAudit: (lead) => {
        const s = get();
        const row: AuditLead = { ...lead, id: uid("lead"), at: new Date().toISOString() };
        set({
          leads: [row, ...s.leads],
          events: log(s.events, lead.name, "audit_requested", `${lead.shop} · ${lead.system}`, null),
        });
      },
      resetDemo: () => {
        const world = seedWorld();
        set({ ...world, session: get().session, notice: { kind: "ok", text: "Sample reset to the original export." } });
      },
      clearNotice: () => set({ notice: null }),
    }),
    {
      name: "ghost-shift-desk-v10",
      skipHydration: true,
      partialize: (s) => ({
        shops: s.shops,
        people: s.people,
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
        works: s.works,
        signals: s.signals,
        drafts: s.drafts,
        decisions: s.decisions,
        measurements: s.measurements,
        events: s.events,
        hours: s.hours,
        leads: s.leads,
      }),
    },
  ),
);

export function pendingQueue(shopId: string) {
  const s = useDesk.getState();
  const decided = new Set(s.decisions.filter((d) => d.status !== "queued").map((d) => d.draftId));
  return s.drafts
    .filter((d) => d.shopId === shopId && !decided.has(d.id))
    .map((d) => ({
      draft: d,
      signal: s.signals.find((x) => x.id === d.signalId)!,
    }))
    .filter((x) => x.signal && !x.signal.suppressed);
}

export { HARBOR, RIVERSIDE };
