export type ShopStatus = "audit" | "onboarding" | "live" | "paused";
export type Role = "operator" | "staff";
export type Channel = "email" | "sms" | "chat" | "none";
export type Audience = "rep" | "operator";
export type StageId = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "A" | "B" | "C" | "D";

export type EngineProductId = "ledger" | "nurture" | "mlott" | "cash" | "gap" | "missed" | "intake";
export type WorkProductId =
  | "reviews"
  | "presence"
  | "resource"
  | "afterhours"
  | "routing"
  | "sweep"
  | "fit"
  | "quotedraft"
  | "fieldquote"
  | "rfp"
  | "sequences"
  | "objections"
  | "displace"
  | "meetingcrm"
  | "brief"
  | "onboard"
  | "jobstatus"
  | "warranty"
  | "dunning"
  | "payplan"
  | "deposit"
  | "waitlist"
  | "noshow"
  | "memretain"
  | "secondbook"
  | "referral"
  | "partner"
  | "testimonial"
  | "enablement"
  | "coldcall"
  | "scoring"
  | "hiring"
  | "handoff"
  | "comp"
  | "roleplay"
  | "training"
  | "oneonone"
  | "pacing"
  | "pipeline"
  | "hygiene"
  | "revops"
  | "custom"
  | "leadership"
  | "interview"
  | "voice"
  | "benchmark"
  | "sop"
  | "supplier"
  | "insurance"
  | "claims"
  | "filings"
  | "consent"
  | "purge";
export type ProductId = EngineProductId | WorkProductId;

export type EngineDetectorId =
  | "account.buying_cue"
  | "recommendation.declined"
  | "quote.unfollowed"
  | "invoice.aging"
  | "payment.failed"
  | "appointment.no_next"
  | "contact.lapsed"
  | "membership.lapsing"
  | "review.absent"
  | "call.unanswered"
  | "call.no_ask"
  | "enquiry.form"
  | "enquiry.chat";
export type DetectorId = EngineDetectorId | `work.${WorkProductId}`;
export type ActionStatus = "queued" | "approved" | "skipped" | "expired" | "sent_dry_run";
export type ConnectorHealth = "ok" | "stale" | "down" | "not_connected";

export type Shop = {
  id: string;
  name: string;
  city: string;
  reps: number;
  system: "HubSpot" | "Salesforce" | "CSV";
  status: ShopStatus;
  ownerName: string;
  staffName: string;
  staffRole: string;
  monthlyFee: number;
  products: ProductId[];
  connector: {
    kind: "csv" | "hubspot";
    lastSync: string | null;
    health: ConnectorHealth;
  };
  sendEnabled: boolean;
  killed: boolean;
  killedReason: string | null;
  baselineAt: string | null;
};

export type Person = {
  id: string;
  shopId: string;
  name: string;
  role: "owner" | "desk" | "tech";
};

export type Job = {
  id: string;
  shopId: string;
  customer: string;
  vehicle: string;
  ro: string;
  recommended: string;
  amount: number;
  declinedOn: string;
  lastOutbound: string | null;
  stillValid: boolean;
  completed?: boolean;
  reviewRequested?: boolean;
};

export type Quote = {
  id: string;
  shopId: string;
  customer: string;
  vehicle: string;
  summary: string;
  amount: number;
  sentOn: string;
  lastOutbound: string | null;
  open: boolean;
};

export type Invoice = {
  id: string;
  shopId: string;
  customer: string;
  number: string;
  amount: number;
  dueOn: string;
  agingDays: number;
};

export type Payment = {
  id: string;
  shopId: string;
  customer: string;
  amount: number;
  failedOn: string;
  reason: "expired_card" | "nsf" | "do_not_honor";
  retried: boolean;
};

export type Appointment = {
  id: string;
  shopId: string;
  customer: string;
  vehicle: string;
  completedOn: string;
  nextOn: string | null;
  ticket: number;
};

export type Contact = {
  id: string;
  shopId: string;
  customer: string;
  lastVisit: string;
  expectedDays: number;
  averageTicket: number;
};

export type Membership = {
  id: string;
  shopId: string;
  customer: string;
  plan: string;
  renewsOn: string;
  confirmed: boolean;
  monthly: number;
};

export type BuyingCue = {
  id: string;
  shopId: string;
  company: string;
  reason: string;
  source: string;
  dated: string;
  amount: number;
  routed: boolean;
};

export type CallRecord = {
  id: string;
  shopId: string;
  from: string;
  at: string;
  answered: boolean;
  askedForBooking: boolean;
  booked: boolean;
  estimated: number;
  ownerName: string;
  company?: string;
};

export type Enquiry = {
  id: string;
  shopId: string;
  kind: "form" | "chat";
  name: string;
  company: string;
  email: string;
  message: string;
  at: string;
  repliedAt: string | null;
  ownerName: string;
  estimated: number;
};

export type WorkRecord = {
  id: string;
  shopId: string;
  productId: WorkProductId;
  title: string;
  detail: string;
  evidence: string;
  source: string;
  amount: number;
  ownerName: string;
  channel: Channel;
  classification: string | null;
  subject: string;
  body: string;
  done: boolean;
};

export type Signal = {
  id: string;
  shopId: string;
  detector: DetectorId;
  entityId: string;
  title: string;
  evidence: string;
  source: string;
  amount: number;
  createdAt: string;
  suppressed: boolean;
};

export type Draft = {
  id: string;
  shopId: string;
  signalId: string;
  personId: string;
  channel: Channel;
  subject: string;
  body: string;
  createdAt: string;
  expiresAt: string;
};

export type Decision = {
  id: string;
  shopId: string;
  draftId: string;
  actor: string;
  status: ActionStatus;
  editedBody?: string;
  seenBody: string;
  at: string;
};

export type Measurement = {
  id: string;
  shopId: string;
  at: string;
  method: number;
  declinedUnfollowed: number;
  agingOpen: number;
  recoveredAttributed: number;
  hoursFollowUp: number;
};

export type AuditEvent = {
  id: string;
  shopId: string | null;
  at: string;
  actor: string;
  action: string;
  detail: string;
};

export type HoursEntry = {
  id: string;
  shopId: string;
  at: string;
  kind: string;
  minutes: number;
};

export type AuditLead = {
  id: string;
  name: string;
  shop: string;
  email: string;
  system: string;
  at: string;
};

export type Session = {
  role: Role;
  shopId: string | null;
  actorName: string;
};

export type Notice = {
  kind: "ok" | "warn" | "danger";
  text: string;
} | null;
