import type { Audience, DetectorId, EngineProductId, ProductId, StageId, WorkProductId } from "./types";

export type CatalogEntry = {
  id: ProductId;
  name: string;
  pitch: string;
  stage: StageId;
  audience: Audience;
  detectors: DetectorId[];
  readOnly?: boolean;
  href?: string;
};

export const STAGE_NAME: Record<StageId, string> = {
  "1": "Attention",
  "2": "Inquiry",
  "3": "Qualification",
  "4": "Proposal",
  "5": "Decision",
  "6": "Delivery",
  "7": "Payment",
  "8": "Retention",
  "9": "Advocacy",
  A: "People",
  B: "Process",
  C: "Knowledge",
  D: "Compliance",
};

export const STAGE_ORDER: StageId[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D"];

const ENGINE: Record<
  EngineProductId,
  { name: string; pitch: string; stage: StageId; detectors: DetectorId[]; readOnly?: boolean }
> = {
  ledger: {
    name: "Signal Ledger",
    pitch: "Companies with a public, dated reason to buy. The source is attached. The first note is drafted before the rep decides.",
    stage: "1",
    detectors: ["account.buying_cue"],
  },
  nurture: {
    name: "Nurture Engine",
    pitch: "Closed and quiet deals hear from the rep again, with something useful and no ask, until they come back or tell you to stop.",
    stage: "5",
    detectors: ["quote.unfollowed", "contact.lapsed"],
  },
  mlott: {
    name: "Money Left on the Table",
    pitch: "Quotes never followed up, expansions declined once, meetings with no next step. The follow-up is drafted and held.",
    stage: "5",
    detectors: ["recommendation.declined", "appointment.no_next", "membership.lapsing"],
  },
  cash: {
    name: "Cash Recovery",
    pitch: "Aging invoices at 7, 14, 30, 60, 90 days, and failed payments routed by reason.",
    stage: "7",
    detectors: ["invoice.aging", "payment.failed"],
  },
  missed: {
    name: "Missed-call recovery",
    pitch: "Every unanswered inbound gets a text within minutes, drafted from the number. A person still sends it.",
    stage: "2",
    detectors: ["call.unanswered"],
  },
  intake: {
    name: "Web form and chat response",
    pitch: "Every form and chat that sits past the response window gets a drafted reply and a task. Timed. Held for the rep.",
    stage: "2",
    detectors: ["enquiry.form", "enquiry.chat"],
  },
  gap: {
    name: "Gap Audit",
    pitch: "Inbound that never became a meeting, split into unanswered and answered with no ask. Read-only.",
    stage: "B",
    detectors: ["call.unanswered", "call.no_ask", "review.absent"],
    readOnly: true,
  },
};

function w(
  id: WorkProductId,
  name: string,
  pitch: string,
  stage: StageId,
  audience: Audience,
): CatalogEntry {
  return { id, name, pitch, stage, audience, detectors: [`work.${id}`] };
}

export const WORK_CATALOG: CatalogEntry[] = [
  w("reviews", "Reputation / review generation", "Asks for a review at completion and drafts a reply to every review received. A person still sends it.", "1", "rep"),
  w("presence", "Local presence engine", "Keeps the public profile current, drafts the post, flags a ranking change for the terms buyers use.", "1", "operator"),
  w("resource", "Free-resource engine", "One monthly asset the company gives away, plus the outreach that distributes it. Held for approve.", "1", "rep"),
  w("afterhours", "After-hours coverage", "Overnight calls and messages, classified, with a drafted reply waiting for morning. A person still sends it.", "2", "rep"),
  w("routing", "Lead routing", "Assigns by territory, capacity and availability rather than round-robin. Overload reassigns.", "3", "operator"),
  w("sweep", "Untouched-lead sweep", "Leads nobody contacted, with age, owner and value. Reassignment proposed. Held for approve.", "3", "rep"),
  w("fit", "Fit scoring", "Scores inbound against this company's definition of a good fit, captured in onboarding.", "3", "operator"),
  w("sequences", "Sequence libraries", "One outreach sequence per signal type, written in the rep's voice. Installed after you approve.", "4", "operator"),
  w("quotedraft", "Quote drafting", "The quote document from the notes. Price book attached. Held for the estimator.", "4", "rep"),
  w("fieldquote", "Field tech to revenue", "A note from the field becomes a drafted quote before they leave the site.", "4", "rep"),
  w("rfp", "Proposal and RFP assembly", "Assembles a response from prior answers. Deadline, required attachments, gap list.", "4", "operator"),
  w("objections", "Objection library", "The objections that actually occurred and the answers that worked, per rep. Refreshed quarterly.", "5", "operator"),
  w("displace", "Competitor displacement", "Incumbent contract end dates. The account resurfaces before renewal, with the original evidence.", "5", "rep"),
  w("meetingcrm", "Meeting-to-CRM", "The recording becomes the notes, the next step, and a proposed stage change. The rep confirms.", "6", "rep"),
  w("brief", "Meeting prep brief", "One page the morning of the meeting. CRM, past calls, public sources.", "6", "rep"),
  w("onboard", "New-customer onboarding", "The first thirty days, scheduled and drafted. Held for approve.", "6", "rep"),
  w("jobstatus", "Job status updates", "The customer hears where the work stands without anyone being asked.", "6", "rep"),
  w("warranty", "Warranty follow-up", "The check-in, the warranty reminder, the maintenance visit. Drafted, on the calendar.", "6", "rep"),
  w("dunning", "Card updater and dunning", "Expiring cards before the charge. Escalation by channel when it fails.", "7", "rep"),
  w("payplan", "Payment plan offers", "Structured terms on balances above a threshold, instead of writing them off.", "7", "rep"),
  w("deposit", "Deposit chasing", "The deposit that gates the job from starting. Drafted reminder, job-start flag.", "7", "rep"),
  w("secondbook", "The Second Booking", "Rebooks before they leave, reactivates the quiet ones, catches a membership about to lapse.", "8", "rep"),
  w("waitlist", "Schedule density", "A cancellation offers the slot to the waitlist before it dies. Priority order.", "8", "rep"),
  w("noshow", "No-show prevention", "Reminder sequence tuned to this company's no-show pattern. Confirmation captured.", "8", "rep"),
  w("memretain", "Membership retention", "Members whose usage predicts cancellation. Flagged list, drafted outreach.", "8", "rep"),
  w("referral", "Referral revival", "Past referrers and partners who went quiet. Drafted outreach, tracked.", "9", "rep"),
  w("partner", "Partner program", "A structured referral relationship with adjacent businesses. Touches, attribution, payout.", "9", "operator"),
  w("testimonial", "Testimonial capture", "Asks at the moment of delight. Permission tracked. Quote and asset.", "9", "rep"),
  w("enablement", "AI Enablement", "Trains the team, installs the automations per person, measured before and after.", "A", "operator"),
  w("coldcall", "Cold-call certification", "Opener, note card, one-question discovery, objection map. Mock calls until they pass.", "A", "operator"),
  w("scoring", "Weekly call scoring", "One coaching note per rep per week, scored against the behaviors the leader wants repeated.", "A", "operator"),
  w("hiring", "SDR hiring pack", "Scorecard, take-home, interview rubric, onboarding kit with their terminology.", "A", "operator"),
  w("handoff", "Founder-to-first-rep", "The founder's calls packaged into playbook, sequences and objection map.", "A", "operator"),
  w("comp", "Compensation plan", "The plan and the model behind it. Quota, current plan, workshop notes.", "A", "operator"),
  w("roleplay", "Role-play bot", "Practice conversations trained on the objections this company actually hears.", "A", "operator"),
  w("training", "New-hire training", "The best performer's real calls turned into the course and the written SOP.", "A", "operator"),
  w("oneonone", "One-on-one prep", "Each session built from last week's assignment and this week's work.", "A", "operator"),
  w("revops", "RevOps and SalesOps", "Records, routing, pacing, forecasting, pipeline discipline. Run for them, not a dashboard they run.", "B", "operator"),
  w("pacing", "Pacing and forecast", "Daily standing of each rep against the number, with the assumptions visible.", "B", "operator"),
  w("pipeline", "Pipeline review pack", "Stale deals, missing next steps, wrong stages. Prepared before the meeting.", "B", "operator"),
  w("hygiene", "CRM hygiene", "Dead sequences, orphan tasks, stage rot. Findings, proposed fixes for approval.", "B", "operator"),
  w("custom", "Custom bottleneck", "The repetitive process that is specific to this business. Built, measured before and after.", "B", "operator"),
  w("leadership", "Fractional leadership", "Strategy, reviews, coaching, hiring, the number owned alongside them.", "B", "operator"),
  w("interview", "Onboarding interview", "Who signs, what evidence precedes a purchase, what runway is needed, who to reject.", "C", "operator"),
  w("voice", "Voice profiles", "Each person's writing voice from their own sent messages and calls. Approved, versioned, revocable.", "C", "operator"),
  w("benchmark", "Benchmark dataset", "Anonymized cross-customer metrics by industry and size. The table the playbook uses.", "C", "operator"),
  w("sop", "SOP capture", "How the task is actually performed, written as procedure.", "C", "operator"),
  w("supplier", "Supplier price watch", "Supplier price changes and the margin impact. Alert, not a surprise.", "C", "operator"),
  w("insurance", "Insurance verification", "Coverage before the visit. Gaps that cause denials, flagged.", "D", "operator"),
  w("claims", "Claim denial prevention", "Checks claims against denial patterns before submission.", "D", "operator"),
  w("filings", "Permit and rebate paperwork", "Filings with deadlines. Prepared, tracked.", "D", "operator"),
  w("consent", "Consent and opt-out", "One consent record per contact per channel, enforced at send time. Never at compose time.", "D", "operator"),
  w("purge", "Records retention", "Deletes what must be deleted, on schedule, with a log. Export on request.", "D", "operator"),
];

export const ENGINE_CATALOG: CatalogEntry[] = (Object.keys(ENGINE) as EngineProductId[]).map((id) => ({
  id,
  ...ENGINE[id],
  audience: id === "gap" ? "operator" : "rep",
}));

export const CATALOG: CatalogEntry[] = [...ENGINE_CATALOG, ...WORK_CATALOG];

export const ROUTE_ITEMS: { name: string; pitch: string; stage: StageId; href: string }[] = [
  {
    name: "Instant Playbook",
    pitch: "Ten questions. A number you can defend. Printable, shareable.",
    stage: "1",
    href: "/playbook",
  },
  {
    name: "Lost Call Report",
    pitch: "Inbound that never became a meeting, split into unanswered and answered with no ask. Lives inside the Gap Audit.",
    stage: "2",
    href: "/audit",
  },
  {
    name: "Self-serve Gap Audit",
    pitch: "The measured number from the records. Lost Call Report sits inside it.",
    stage: "B",
    href: "/audit",
  },
  {
    name: "Baseline and delta",
    pitch: "Count before anything changes. Count again. Attribution only when the chain is complete.",
    stage: "B",
    href: "/enter",
  },
];

export const PACKAGES: { name: string; contains: string; href?: string }[] = [
  { name: "Instant Playbook", contains: "The estimate. Ten questions. A number you can defend.", href: "/playbook" },
  { name: "Gap Audit", contains: "The measured number from the records. Lost Call sits inside.", href: "/audit" },
  { name: "Fixed-fee build", contains: "One product installed in their stack." },
  { name: "Single product retainer", contains: "One product, operated." },
  { name: "Multi-product retainer", contains: "Two or more products, operated." },
  { name: "Fractional sales leadership", contains: "Any products plus leadership." },
  { name: "Signal Ledger desk", contains: "B2B prospecting, operated." },
  { name: "AI Enablement program", contains: "Training plus installs plus measurement." },
  { name: "Custom build", contains: "Scoped separately." },
];

export function catalogById(id: ProductId): CatalogEntry | undefined {
  return CATALOG.find((p) => p.id === id);
}

export function workDetector(id: WorkProductId): DetectorId {
  return `work.${id}`;
}

export function productIdFromDetector(detector: DetectorId): ProductId | null {
  if (detector.startsWith("work.")) return detector.slice(5) as WorkProductId;
  return ENGINE_CATALOG.find((p) => p.detectors.includes(detector))?.id ?? null;
}
