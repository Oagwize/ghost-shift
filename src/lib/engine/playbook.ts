import { money, uid } from "./ids";

export type IndustryId =
  | "wholesale"
  | "industrial"
  | "professional"
  | "software"
  | "construction"
  | "healthcare"
  | "other";

export type QuietShare = 0.05 | 0.25 | 0.5 | 0.75;
export type NurtureHabit = "scheduled" | "sometimes" | "never";
export type ProspectingHabit = "researcher" | "reps" | "inbound" | "none";
export type PainId = "quiet" | "cues" | "inbound" | "cash" | "coaching";

export type PlaybookAnswers = {
  company: string;
  website: string;
  industry: IndustryId;
  sellers: number;
  revenue: number;
  avgDeal: number;
  quietShare: QuietShare;
  nurture: NurtureHabit;
  prospecting: ProspectingHabit;
  pain: PainId;
};

export type LeakId = "quiet" | "nurture" | "cues" | "inbound" | "cash";

export type LeakLine = {
  id: LeakId;
  label: string;
  amount: number;
  query: string;
  product: string;
  why: string;
};

export type Opportunity = {
  rank: 1 | 2 | 3;
  title: string;
  product: string;
  amount: number;
  body: string;
};

export type RoadmapPhase = {
  window: string;
  title: string;
  items: string[];
};

export type PlaybookResult = {
  answers: PlaybookAnswers;
  industry: Benchmark;
  host: string | null;
  annualQuotes: number;
  closedLost: number;
  revPerRep: number;
  leaks: LeakLine[];
  total: number;
  capped: boolean;
  score: number;
  scoreParts: { label: string; points: number; max: number; note: string }[];
  opportunities: Opportunity[];
  wins: string[];
  roadmap: RoadmapPhase[];
  competitor: {
    standing: string;
    pattern: string;
    sources: string;
  };
  methodNote: string;
};

export type Benchmark = {
  id: IndustryId;
  label: string;
  medianRevPerRep: number;
  winRate: number;
  nurtureReopen: number;
  cueMeetingsPerRep: number;
  cueWinRate: number;
  inboundLeakShare: number;
  typicalQuietShare: number;
  peerPattern: string;
};

export const INDUSTRIES: Benchmark[] = [
  {
    id: "wholesale",
    label: "Wholesale / distribution",
    medianRevPerRep: 420_000,
    winRate: 0.22,
    nurtureReopen: 0.08,
    cueMeetingsPerRep: 12,
    cueWinRate: 0.18,
    inboundLeakShare: 0.05,
    typicalQuietShare: 0.45,
    peerPattern:
      "A distributor this size usually has reps hunting their own names, a shared inbox, and no one whose job is reading what customers announced this week. The teams that pull ahead put a dated reason on every first call.",
  },
  {
    id: "industrial",
    label: "Industrial equipment",
    medianRevPerRep: 480_000,
    winRate: 0.2,
    nurtureReopen: 0.09,
    cueMeetingsPerRep: 10,
    cueWinRate: 0.16,
    inboundLeakShare: 0.04,
    typicalQuietShare: 0.4,
    peerPattern:
      "Industrial sellers live on long cycles. Peers at this headcount lose the year in the quiet months after a quote, not in the first meeting. The ones who grow keep a no-ask letter on a calendar and watch plant expansions, not just inbound.",
  },
  {
    id: "professional",
    label: "Professional services",
    medianRevPerRep: 310_000,
    winRate: 0.28,
    nurtureReopen: 0.11,
    cueMeetingsPerRep: 14,
    cueWinRate: 0.2,
    inboundLeakShare: 0.07,
    typicalQuietShare: 0.35,
    peerPattern:
      "Services firms of this size win on referrals and lose on follow-up. A competitor with three times the people is not better on the call. They are better at writing again, and at noticing when a client’s public work creates a new need.",
  },
  {
    id: "software",
    label: "Software",
    medianRevPerRep: 360_000,
    winRate: 0.18,
    nurtureReopen: 0.07,
    cueMeetingsPerRep: 16,
    cueWinRate: 0.14,
    inboundLeakShare: 0.09,
    typicalQuietShare: 0.5,
    peerPattern:
      "Software teams at this count usually drown in a CRM full of stages and still miss the second conversation. Competitors that look bigger have an SDR motion and a closed-lost cadence. The product is rarely the gap.",
  },
  {
    id: "construction",
    label: "Construction / trades",
    medianRevPerRep: 390_000,
    winRate: 0.24,
    nurtureReopen: 0.07,
    cueMeetingsPerRep: 9,
    cueWinRate: 0.17,
    inboundLeakShare: 0.08,
    typicalQuietShare: 0.4,
    peerPattern:
      "Trade and construction sellers of this size live on inbound and relationships. Peers leak the unanswered call and the estimate that sat. The firms that scale treat every quiet bid as a job, and watch permits and awards the way a researcher would.",
  },
  {
    id: "healthcare",
    label: "Healthcare services",
    medianRevPerRep: 340_000,
    winRate: 0.21,
    nurtureReopen: 0.08,
    cueMeetingsPerRep: 11,
    cueWinRate: 0.15,
    inboundLeakShare: 0.06,
    typicalQuietShare: 0.38,
    peerPattern:
      "Healthcare sellers at this size wait on credentialing and committees. The leak is not the first visit. It is the months after a no, and the public program changes nobody on the team is paid to read.",
  },
  {
    id: "other",
    label: "Other B2B",
    medianRevPerRep: 380_000,
    winRate: 0.22,
    nurtureReopen: 0.08,
    cueMeetingsPerRep: 12,
    cueWinRate: 0.17,
    inboundLeakShare: 0.06,
    typicalQuietShare: 0.42,
    peerPattern:
      "Small B2B teams at this count usually ask the same people to find the work, write the follow-up, and keep the records. A competitor three times the size split those jobs. That split is what this estimate prices.",
  },
];

export const SAMPLE_ANSWERS: PlaybookAnswers = {
  company: "Northline Supply",
  website: "https://northline.example",
  industry: "wholesale",
  sellers: 5,
  revenue: 1_600_000,
  avgDeal: 18_500,
  quietShare: 0.5,
  nurture: "never",
  prospecting: "reps",
  pain: "cues",
};

export const INBOUND_ANSWERS: PlaybookAnswers = {
  company: "Cedar & Pine Advisors",
  website: "https://cedarpine.example",
  industry: "professional",
  sellers: 6,
  revenue: 2_100_000,
  avgDeal: 28_000,
  quietShare: 0.25,
  nurture: "sometimes",
  prospecting: "inbound",
  pain: "quiet",
};

export const SEED_PLAYBOOK_ID = "cedar-pine-advisors-seed";

const QUIET_LABEL: Record<QuietShare, string> = {
  0.05: "almost none (~5%)",
  0.25: "about a quarter",
  0.5: "about half",
  0.75: "most of them",
};

const NURTURE_LABEL: Record<NurtureHabit, string> = {
  scheduled: "on a calendar",
  sometimes: "when someone remembers",
  never: "once it is lost, it is lost",
};

const PROSPECT_LABEL: Record<ProspectingHabit, string> = {
  researcher: "someone whose job is finding accounts",
  reps: "reps find their own",
  inbound: "inbound only",
  none: "it is not systematic",
};

const PAIN_LABEL: Record<PainId, string> = {
  quiet: "deals that go quiet",
  cues: "finding who to call next",
  inbound: "inbound that dies",
  cash: "cash sitting on invoices",
  coaching: "the team is not coached",
};

const NURTURE_GAP: Record<NurtureHabit, number> = {
  never: 1,
  sometimes: 0.55,
  scheduled: 0.12,
};

const CUE_GAP: Record<ProspectingHabit, number> = {
  none: 1,
  inbound: 0.85,
  reps: 0.7,
  researcher: 0.15,
};

export function industryById(id: IndustryId): Benchmark {
  return INDUSTRIES.find((x) => x.id === id) ?? INDUSTRIES[INDUSTRIES.length - 1]!;
}

export function parseMoneyInput(raw: string): number | null {
  const t = raw.trim().toLowerCase().replace(/[$,\s]/g, "");
  if (!t) return null;
  const m = t.match(/^([\d.]+)(k|m|mm|b)?$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  const mul = m[2] === "k" ? 1_000 : m[2] === "m" || m[2] === "mm" ? 1_000_000 : m[2] === "b" ? 1_000_000_000 : 1;
  return Math.round(n * mul);
}

export function parseSellers(raw: string): number | null {
  const n = Number(String(raw).replace(/[^\d]/g, ""));
  if (!Number.isInteger(n) || n < 1 || n > 80) return null;
  return n;
}

export function hostFromWebsite(website: string): string | null {
  const t = website.trim();
  if (!t) return null;
  try {
    const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
    const url = new URL(withProto);
    const host = url.hostname.replace(/^www\./i, "");
    if (!host || host === "localhost" || !host.includes(".")) return null;
    return host;
  } catch {
    return null;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function roundDollars(n: number) {
  return Math.max(0, Math.round(n));
}

export function computePlaybook(answers: PlaybookAnswers): PlaybookResult {
  const industry = industryById(answers.industry);
  const sellers = Math.max(1, answers.sellers);
  const revenue = Math.max(1, answers.revenue);
  const avgDeal = Math.max(1, answers.avgDeal);
  const winRate = industry.winRate;
  const annualQuotes = revenue / avgDeal / winRate;
  const closedLost = annualQuotes * (1 - winRate);
  const revPerRep = revenue / sellers;
  const host = hostFromWebsite(answers.website);

  const quietQuotes = annualQuotes * answers.quietShare;
  const quietAmount = quietQuotes * avgDeal * industry.nurtureReopen;
  const nurtureAmount = closedLost * avgDeal * industry.nurtureReopen * NURTURE_GAP[answers.nurture];
  const cueAmount = sellers * industry.cueMeetingsPerRep * avgDeal * industry.cueWinRate * CUE_GAP[answers.prospecting];
  const inboundShare = answers.pain === "inbound" ? industry.inboundLeakShare : industry.inboundLeakShare * 0.4;
  const inboundAmount = revenue * inboundShare;
  const cashShare = answers.pain === "cash" ? 0.04 : 0.015;
  const cashAmount = revenue * cashShare;

  const rawLeaks: LeakLine[] = [
    {
      id: "quiet",
      label: "Quiet proposals with no second conversation",
      amount: roundDollars(quietAmount),
      query: `annual quotes (${Math.round(annualQuotes)}) × ${QUIET_LABEL[answers.quietShare]} still quiet × ${pct(industry.nurtureReopen)} industry reopen rate × ${money(avgDeal)} average deal`,
      product: "Pipeline follow-up",
      why: "A quote that never gets a second conversation is not a lost deal. It is an unworked one.",
    },
    {
      id: "nurture",
      label: "Closed-lost with no scheduled return",
      amount: roundDollars(nurtureAmount),
      query: `closed-lost (${Math.round(closedLost)}) × ${money(avgDeal)} × ${pct(industry.nurtureReopen)} reopen × ${pct(NURTURE_GAP[answers.nurture])} of a missing calendar`,
      product: "Nurture Engine",
      why: "Useful contact every 14 to 21 days, in the rep's voice, with no ask in the early rounds.",
    },
    {
      id: "cues",
      label: "Accounts with a public reason nobody routed",
      amount: roundDollars(cueAmount),
      query: `${sellers} sellers × ${industry.cueMeetingsPerRep} extra cue-sourced meetings / year × ${money(avgDeal)} × ${pct(industry.cueWinRate)} cue win rate × ${pct(CUE_GAP[answers.prospecting])} gap vs a researcher`,
      product: "Signal Ledger",
      why: "Not names. A dated reason, with the source attached, in the rep who owns the territory.",
    },
    {
      id: "inbound",
      label: "Inbound that never became a meeting",
      amount: roundDollars(inboundAmount),
      query: `${money(revenue)} revenue × ${pct(inboundShare)} inbound-death share for this industry${answers.pain === "inbound" ? "" : " (reduced because inbound was not named as the wound)"}`,
      product: "Gap Audit",
      why: "Unanswered and answered-with-no-ask, counted separately. Read-only until a baseline exists.",
    },
    {
      id: "cash",
      label: "Aging and failed payments still sitting",
      amount: roundDollars(cashAmount),
      query: `${money(revenue)} revenue × ${pct(cashShare)} typical drag on small teams${answers.pain === "cash" ? " (raised because cash was named)" : ""}`,
      product: "Cash Recovery",
      why: "Reminders at 7, 14, 30, 60, 90 days, routed by failure reason, held for a person.",
    },
  ];

  const uncapped = rawLeaks.reduce((sum, row) => sum + row.amount, 0);
  const cap = roundDollars(revenue * 1.6);
  const capped = uncapped > cap;
  const scale = capped && uncapped > 0 ? cap / uncapped : 1;
  const leaks = rawLeaks
    .map((row) => ({ ...row, amount: roundDollars(row.amount * scale) }))
    .sort((a, b) => b.amount - a.amount);
  const total = leaks.reduce((sum, row) => sum + row.amount, 0);

  const followPoints = clamp((1 - answers.quietShare) * 25, 0, 25);
  const nurturePoints = answers.nurture === "scheduled" ? 15 : answers.nurture === "sometimes" ? 8 : 2;
  const prospectPoints =
    answers.prospecting === "researcher" ? 20 : answers.prospecting === "reps" ? 11 : answers.prospecting === "inbound" ? 8 : 3;
  const revPoints = clamp(revPerRep / industry.medianRevPerRep, 0, 1.2) * (40 / 1.2);
  const scoreParts = [
    {
      label: "Revenue per seller",
      points: round1(revPoints),
      max: 40,
      note: `${money(revPerRep)} against a ${money(industry.medianRevPerRep)} median for this industry.`,
    },
    {
      label: "Second conversation",
      points: round1(followPoints),
      max: 25,
      note: `Quotes that never get another pass: ${QUIET_LABEL[answers.quietShare]}. Industry typical is ${pct(industry.typicalQuietShare)}.`,
    },
    {
      label: "Return to the lost deal",
      points: nurturePoints,
      max: 15,
      note: `Closed-lost habit: ${NURTURE_LABEL[answers.nurture]}.`,
    },
    {
      label: "Who finds the next account",
      points: prospectPoints,
      max: 20,
      note: `Prospecting: ${PROSPECT_LABEL[answers.prospecting]}.`,
    },
  ];
  const score = Math.round(scoreParts.reduce((sum, p) => sum + p.points, 0));

  const top = leaks.slice(0, 3);
  const opportunities: Opportunity[] = top.map((row, i) => ({
    rank: (i + 1) as 1 | 2 | 3,
    title: row.label,
    product: row.product,
    amount: row.amount,
    body: `${row.why} This line is ${money(row.amount)} of the ${money(total)} estimate.`,
  }));

  const wins = quickWins(answers, industry, host);
  const roadmap = buildRoadmap(top.map((r) => r.id), answers);
  const standing =
    revPerRep >= industry.medianRevPerRep * 1.15
      ? `This team is already above the median ${money(industry.medianRevPerRep)} per seller. The remaining money is in the work around the conversation, not in hiring another closer.`
      : revPerRep >= industry.medianRevPerRep * 0.85
        ? `Revenue per seller sits near the ${industry.label.toLowerCase()} median of ${money(industry.medianRevPerRep)}. A competitor three times the size is usually not better on the call. They staffed the work around it.`
        : `Revenue per seller is ${money(revPerRep)} against a ${money(industry.medianRevPerRep)} median. The gap is large enough that the next hire is the expensive way to close it.`;

  const sources = host
    ? `A public site at ${host} is one of three sources a buying-cue desk reads. The others are filings and trade press. This playbook does not crawl the site. It uses the ten answers and the ${industry.label.toLowerCase()} table. The Gap Audit is the measured number from the customer system.`
    : `No public site was given, so the scan uses the ${industry.label.toLowerCase()} table and the answers only. A URL would add a third source for buying cues. The Gap Audit is still the measured number.`;

  return {
    answers,
    industry,
    host,
    annualQuotes: Math.round(annualQuotes),
    closedLost: Math.round(closedLost),
    revPerRep: roundDollars(revPerRep),
    leaks,
    total,
    capped,
    score,
    scoreParts,
    opportunities,
    wins,
    roadmap,
    competitor: {
      standing,
      pattern: industry.peerPattern,
      sources,
    },
    methodNote: capped
      ? `Raw sum was ${money(uncapped)}. Capped at 1.6 × stated revenue so one aggressive answer cannot invent a company. Each line was scaled by the same factor.`
      : `Sum of the five queries. No cap applied. Stated revenue ${money(revenue)}.`,
  };
}

function quickWins(answers: PlaybookAnswers, industry: Benchmark, host: string | null): string[] {
  const wins: string[] = [
    `Export every open proposal older than seven days. Count them. Call the ten largest. That is the quiet-proposal query, done by hand, today.`,
    `Pick one closed-lost from this quarter. Write one useful letter with no ask, in the rep's own sentences. Put the next one on a 14-day calendar.`,
    host
      ? `Open ${host} next to five target accounts. For each, find one public, dated reason they might buy ${industry.label.toLowerCase()} this quarter. Attach the source. That is Signal Ledger without the desk.`
      : `Pick five accounts you already like. For each, find one public, dated reason they might buy this quarter. Attach the source. That is Signal Ledger without the desk.`,
  ];
  if (answers.pain === "inbound") {
    wins[0] =
      "For the last ten inbound calls or forms, mark answered or not, and whether anyone asked for a meeting. That split is the Gap Audit, done on paper.";
  }
  if (answers.pain === "cash") {
    wins[1] =
      "Age every open invoice into 7, 14, 30, 60, 90. Draft the 14-day note first. A person still sends it.";
  }
  return wins;
}

function buildRoadmap(order: LeakId[], answers: PlaybookAnswers): RoadmapPhase[] {
  const first = order[0] ?? "quiet";
  const second = order[1] ?? "nurture";
  const third = order[2] ?? "cues";
  return [
    {
      window: "Days 1-30",
      title: "Count, then the largest leak",
      items: [
        "Take a baseline. Hours on follow-up, deals with a real next step, time to first call. No baseline, no write access.",
        phaseItem(first, answers),
        "A person on the team approves every draft. Unapproved items expire.",
      ],
    },
    {
      window: "Days 31-60",
      title: "Install the second system",
      items: [
        phaseItem(second, answers),
        "Voice profile from sent mail, not from a style prompt.",
        "Weekly score on one behavior. One note per rep.",
      ],
    },
    {
      window: "Days 61-90",
      title: "Measure, then the third",
      items: [
        "Re-run the same queries against the baseline. If the numbers have not moved, stop.",
        phaseItem(third, answers),
        "Decide the bottleneck that is only theirs. That is the custom build, not a dashboard.",
      ],
    },
  ];
}

function phaseItem(id: LeakId, answers: PlaybookAnswers): string {
  switch (id) {
    case "quiet":
      return "Pipeline follow-up on quiet proposals past seven days. Draft in the rep's voice. Held for approve.";
    case "nurture":
      return `Nurture Engine on closed-lost. Useful letter, no ask, every 14 to 21 days. ${answers.company} keeps the send.`;
    case "cues":
      return "Signal Ledger: twenty accounts with a public dated reason, routed to the owner of the territory.";
    case "inbound":
      return "Gap Audit on inbound. Unanswered versus answered with no ask. Read-only.";
    case "cash":
      return "Cash Recovery on aging buckets and failed payments, routed by reason.";
  }
}

function pct(n: number) {
  const v = n * 100;
  return `${Number.isInteger(v) ? v : v.toFixed(1)}%`;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function playbookId(company: string): string {
  const slug =
    company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 28) || "company";
  return `${slug}-${uid("x").slice(2)}`;
}

export function encodeAnswers(answers: PlaybookAnswers): string {
  const payload = [
    answers.company,
    answers.website,
    answers.industry,
    answers.sellers,
    answers.revenue,
    answers.avgDeal,
    answers.quietShare,
    answers.nurture,
    answers.prospecting,
    answers.pain,
  ];
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeAnswers(raw: string): PlaybookAnswers | null {
  try {
    const pad = raw.length % 4 === 0 ? "" : "=".repeat(4 - (raw.length % 4));
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const p = JSON.parse(json) as unknown;
    if (!Array.isArray(p) || p.length !== 10) return null;
    const company = String(p[0] ?? "").trim();
    if (company.length < 2 || company.length > 80) return null;
    const website = String(p[1] ?? "").trim().slice(0, 160);
    const industry = INDUSTRIES.some((i) => i.id === p[2]) ? (p[2] as IndustryId) : null;
    const sellers = Number(p[3]);
    const revenue = Number(p[4]);
    const avgDeal = Number(p[5]);
    const quietShare = [0.05, 0.25, 0.5, 0.75].includes(Number(p[6])) ? (Number(p[6]) as QuietShare) : null;
    const nurture = (["scheduled", "sometimes", "never"] as const).includes(p[7] as NurtureHabit)
      ? (p[7] as NurtureHabit)
      : null;
    const prospecting = (["researcher", "reps", "inbound", "none"] as const).includes(p[8] as ProspectingHabit)
      ? (p[8] as ProspectingHabit)
      : null;
    const pain = (["quiet", "cues", "inbound", "cash", "coaching"] as const).includes(p[9] as PainId)
      ? (p[9] as PainId)
      : null;
    if (!industry || !quietShare || !nurture || !prospecting || !pain) return null;
    if (!Number.isInteger(sellers) || sellers < 1 || sellers > 80) return null;
    if (!Number.isFinite(revenue) || revenue < 10_000 || revenue > 5_000_000_000) return null;
    if (!Number.isFinite(avgDeal) || avgDeal < 50 || avgDeal > 50_000_000) return null;
    return { company, website, industry, sellers, revenue, avgDeal, quietShare, nurture, prospecting, pain };
  } catch {
    return null;
  }
}

export function describeAnswers(answers: PlaybookAnswers) {
  return [
    ["Company", answers.company],
    ["Site", hostFromWebsite(answers.website) ?? "Not given"],
    ["Industry", industryById(answers.industry).label],
    ["Sellers", String(answers.sellers)],
    ["Revenue", money(answers.revenue)],
    ["Average deal", money(answers.avgDeal)],
    ["Quiet quotes", QUIET_LABEL[answers.quietShare]],
    ["Closed-lost", NURTURE_LABEL[answers.nurture]],
    ["Next account", PROSPECT_LABEL[answers.prospecting]],
    ["Named wound", PAIN_LABEL[answers.pain]],
  ] as const;
}

export const QUESTIONS = {
  quiet: QUIET_LABEL,
  nurture: NURTURE_LABEL,
  prospect: PROSPECT_LABEL,
  pain: PAIN_LABEL,
} as const;
