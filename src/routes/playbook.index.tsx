import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  INDUSTRIES,
  QUESTIONS,
  SAMPLE_ANSWERS,
  encodeAnswers,
  parseMoneyInput,
  parseSellers,
  playbookId,
  type IndustryId,
  type NurtureHabit,
  type PainId,
  type PlaybookAnswers,
  type ProspectingHabit,
  type QuietShare,
} from "@/lib/engine/playbook";
import { usePlaybooks } from "@/lib/engine/playbook-store";
import { money } from "@/lib/engine/ids";

export const Route = createFileRoute("/playbook/")({ component: PlaybookIntro });

type Draft = {
  company: string;
  website: string;
  industry: IndustryId | null;
  sellers: string;
  revenue: string;
  avgDeal: string;
  quietShare: QuietShare | null;
  nurture: NurtureHabit | null;
  prospecting: ProspectingHabit | null;
  pain: PainId | null;
};

const EMPTY: Draft = {
  company: "",
  website: "",
  industry: null,
  sellers: "",
  revenue: "",
  avgDeal: "",
  quietShare: null,
  nurture: null,
  prospecting: null,
  pain: null,
};

function PlaybookIntro() {
  const navigate = useNavigate();
  const save = usePlaybooks((s) => s.save);
  const items = usePlaybooks((s) => s.items);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const recent = items[0];

  function finish(answers: PlaybookAnswers) {
    const id = playbookId(answers.company);
    save({ id, createdAt: new Date().toISOString(), answers });
    void navigate({ to: "/playbook/$id", params: { id }, search: { a: encodeAnswers(answers) } });
  }

  function onSample() {
    finish(SAMPLE_ANSWERS);
  }

  return (
    <div className="min-h-dvh bg-paper">
      <SiteHeader solid />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {step === 0 ? (
          <Intro recent={recent} onStart={() => setStep(1)} onSample={onSample} />
        ) : (
          <Conversation
            step={step}
            setStep={setStep}
            draft={draft}
            setDraft={setDraft}
            error={error}
            setError={setError}
            onFinish={finish}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Intro({
  onStart,
  onSample,
  recent,
}: {
  onStart: () => void;
  onSample: () => void;
  recent?: { id: string; answers: PlaybookAnswers };
}) {
  return (
    <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
      <div>
        <p className="text-xs font-medium tracking-wide text-forest uppercase">Instant Playbook</p>
        <h1 className="mt-3 max-w-xl font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Five minutes. A number you can defend.
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted">
          Ten questions, a benchmark table, and five queries. You get a loss estimate, an industry score, a competitor
          scan, three opportunities, quick wins, and a ninety-day plan. No customer system. Nothing sends.
        </p>
        <div className="mt-8 mb-20 flex flex-col gap-3 pr-24 sm:mb-0 sm:flex-row sm:pr-0">
          <Button type="button" onClick={onStart} className="sm:w-auto">
            Start the conversation
          </Button>
          <Button type="button" variant="outline" onClick={onSample} className="sm:w-auto">
            Use the Northline sample
          </Button>
        </div>
        {recent ? (
          <p className="mt-6 text-sm text-muted">
            Last playbook in this browser:{" "}
            <Link
              to="/playbook/$id"
              params={{ id: recent.id }}
              search={{ a: encodeAnswers(recent.answers) }}
              className="text-forest underline-offset-2 hover:underline"
            >
              {recent.answers.company}
            </Link>
          </p>
        ) : null}
      </div>
      <aside className="rounded-xl bg-cream p-6 shadow-(--shadow-card)">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">What the queries count</p>
        <ul className="mt-5 grid gap-3 text-sm">
          {[
            "Quiet proposals with no second conversation",
            "Closed-lost with no scheduled return",
            "Accounts with a public reason nobody routed",
            "Inbound that never became a meeting",
            "Aging and failed payments still sitting",
          ].map((line, i) => (
            <li key={line} className="flex gap-3 border-t border-line pt-3">
              <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-muted">
          This is an estimate from answers and a table, not a measurement from your CRM. The Gap Audit is the measured
          number.
        </p>
      </aside>
    </div>
  );
}

function Conversation({
  step,
  setStep,
  draft,
  setDraft,
  error,
  setError,
  onFinish,
}: {
  step: number;
  setStep: (n: number) => void;
  draft: Draft;
  setDraft: (d: Draft) => void;
  error: string | null;
  setError: (s: string | null) => void;
  onFinish: (a: PlaybookAnswers) => void;
}) {
  const qIndex = step - 1;
  const total = 10;

  function nextFrom(partial: Partial<Draft>) {
    const next = { ...draft, ...partial };
    setDraft(next);
    setError(null);
    if (step < 10) {
      setStep(step + 1);
      return;
    }
    const answers = toAnswers(next);
    if (!answers) {
      setError("That last answer did not parse. Try again.");
      return;
    }
    onFinish(answers);
  }

  function submitText() {
    if (step === 1) {
      const company = draft.company.trim();
      if (company.length < 2) return setError("Give the company name as people say it.");
      nextFrom({ company });
      return;
    }
    if (step === 2) {
      nextFrom({ website: draft.website.trim() });
      return;
    }
    if (step === 4) {
      const sellers = parseSellers(draft.sellers);
      if (!sellers) return setError("Sellers must be a whole number from 1 to 80.");
      nextFrom({ sellers: String(sellers) });
      return;
    }
    if (step === 5) {
      const revenue = parseMoneyInput(draft.revenue);
      if (!revenue || revenue < 10_000) return setError("Revenue as 1.6m, 400k, or a full dollar amount.");
      nextFrom({ revenue: String(revenue) });
      return;
    }
    if (step === 6) {
      const avgDeal = parseMoneyInput(draft.avgDeal);
      if (!avgDeal || avgDeal < 50) return setError("Average deal as 18.5k or a full dollar amount.");
      nextFrom({ avgDeal: String(avgDeal) });
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <Transcript draft={draft} qIndex={qIndex} />
      <section className="min-w-0">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-medium tracking-wide text-forest uppercase">
            Question {String(step).padStart(2, "0")} of {total}
          </p>
          <button
            type="button"
            className="text-sm text-muted hover:text-ink"
            onClick={() => {
              setError(null);
              setStep(Math.max(1, step - 1));
            }}
          >
            Back
          </button>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full bg-forest transition-[width] duration-(--motion-fast) ease-(--ease-smooth-out)"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
        <div key={step} className="pb-in mt-8">
          <QuestionBody
            step={step}
            draft={draft}
            setDraft={setDraft}
            onChip={nextFrom}
            onSubmitText={submitText}
          />
          {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        </div>
      </section>
    </div>
  );
}

function QuestionBody({
  step,
  draft,
  setDraft,
  onChip,
  onSubmitText,
}: {
  step: number;
  draft: Draft;
  setDraft: (d: Draft) => void;
  onChip: (p: Partial<Draft>) => void;
  onSubmitText: () => void;
}) {
  if (step === 1) {
    return (
      <TextQuestion
        title="What is the company called?"
        hint="As people say it. Not the legal entity unless that is the name on the door."
        value={draft.company}
        onChange={(company) => setDraft({ ...draft, company })}
        placeholder="Northline Supply"
        autoComplete="organization"
        onSubmit={onSubmitText}
      />
    );
  }
  if (step === 2) {
    return (
      <TextQuestion
        title="Public website?"
        hint="Used to name the host in the competitor scan. This playbook does not crawl it. Skip if there is not one."
        value={draft.website}
        onChange={(website) => setDraft({ ...draft, website })}
        placeholder="northline.example"
        autoComplete="url"
        onSubmit={onSubmitText}
        skipLabel="Skip, no site"
        onSkip={() => onChip({ website: "" })}
      />
    );
  }
  if (step === 3) {
    return (
      <ChipQuestion
        title="What do you sell into?"
        hint="Picks the benchmark table. Industry language lives here, not in the engine."
        options={INDUSTRIES.map((i) => ({ value: i.id, label: i.label }))}
        selected={draft.industry}
        onPick={(industry) => onChip({ industry })}
      />
    );
  }
  if (step === 4) {
    return (
      <div>
        <ChipQuestion
          title="How many people carry a number?"
          hint="Sellers only. Not the whole company."
          options={[2, 5, 8, 12].map((n) => ({ value: String(n), label: String(n) }))}
          selected={["2", "5", "8", "12"].includes(draft.sellers) ? draft.sellers : null}
          onPick={(sellers) => onChip({ sellers })}
        />
        <form
          className="mt-6 max-w-xs"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitText();
          }}
        >
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Or a different count</span>
            <Input
              value={draft.sellers}
              onChange={(e) => setDraft({ ...draft, sellers: e.target.value })}
              inputMode="numeric"
              placeholder="5"
            />
          </label>
          <Button type="submit" className="mt-3">
            Continue
          </Button>
        </form>
      </div>
    );
  }
  if (step === 5) {
    return (
      <TextQuestion
        title="Rough annual revenue from that team?"
        hint="1.6m, 400k, or the full dollar amount. Not a forecast. Last twelve months is fine."
        value={draft.revenue}
        onChange={(revenue) => setDraft({ ...draft, revenue })}
        placeholder="1.6m"
        onSubmit={onSubmitText}
      />
    );
  }
  if (step === 6) {
    return (
      <TextQuestion
        title="Average deal you actually close?"
        hint="Won deals, not the quote book. 18.5k works."
        value={draft.avgDeal}
        onChange={(avgDeal) => setDraft({ ...draft, avgDeal })}
        placeholder="18500"
        onSubmit={onSubmitText}
      />
    );
  }
  if (step === 7) {
    return (
      <ChipQuestion
        title="Of the quotes you send, what share never get a second conversation?"
        hint="The quiet-proposal query uses this share against the implied quote book."
        options={(Object.entries(QUESTIONS.quiet) as [string, string][]).map(([value, label]) => ({
          value,
          label,
        }))}
        selected={draft.quietShare == null ? null : String(draft.quietShare)}
        onPick={(v) => onChip({ quietShare: Number(v) as QuietShare })}
      />
    );
  }
  if (step === 8) {
    return (
      <ChipQuestion
        title="When a deal dies, does anyone write again on a schedule?"
        hint="Scheduled means a calendar, not a good intention."
        options={(Object.entries(QUESTIONS.nurture) as [NurtureHabit, string][]).map(([value, label]) => ({
          value,
          label,
        }))}
        selected={draft.nurture}
        onPick={(nurture) => onChip({ nurture })}
      />
    );
  }
  if (step === 9) {
    return (
      <ChipQuestion
        title="Who finds the next company to call?"
        hint="A researcher is a person whose job is the next account, not a tool sitting unused."
        options={(Object.entries(QUESTIONS.prospect) as [ProspectingHabit, string][]).map(([value, label]) => ({
          value,
          label,
        }))}
        selected={draft.prospecting}
        onPick={(prospecting) => onChip({ prospecting })}
      />
    );
  }
  return (
    <ChipQuestion
      title="What hurts most right now?"
      hint="Raises one query. The others still run."
      options={(Object.entries(QUESTIONS.pain) as [PainId, string][]).map(([value, label]) => ({
        value,
        label,
      }))}
      selected={draft.pain}
      onPick={(pain) => onChip({ pain })}
    />
  );
}

function TextQuestion({
  title,
  hint,
  value,
  onChange,
  placeholder,
  autoComplete,
  onSubmit,
  skipLabel,
  onSkip,
}: {
  title: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  onSubmit: () => void;
  skipLabel?: string;
  onSkip?: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <h2 className="font-display text-3xl tracking-tight">{title}</h2>
      <p className="mt-3 max-w-md text-sm text-muted">{hint}</p>
      <div className="mt-6 max-w-md">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus
        />
      </div>
      <div className="mt-4 mb-20 flex flex-col gap-3 pr-24 sm:mb-0 sm:flex-row sm:pr-0">
        <Button type="submit">{skipLabel ? "Use this site" : "Continue"}</Button>
        {onSkip ? (
          <Button type="button" variant="ghost" onClick={onSkip}>
            {skipLabel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function ChipQuestion<T extends string>({
  title,
  hint,
  options,
  selected,
  onPick,
}: {
  title: string;
  hint: string;
  options: { value: T; label: string }[];
  selected: T | null;
  onPick: (v: T) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-3xl tracking-tight">{title}</h2>
      <p className="mt-3 max-w-md text-sm text-muted">{hint}</p>
      <div className="mt-6 mb-20 flex flex-col gap-2 pr-24 sm:mb-0 sm:pr-0">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onPick(o.value)}
            className={cn(
              "min-h-11 rounded-md border px-4 py-3 text-left text-sm transition-colors duration-(--motion-quick)",
              selected === o.value
                ? "border-forest bg-forest text-cream"
                : "border-line bg-cream hover:border-forest/40",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Transcript({ draft, qIndex }: { draft: Draft; qIndex: number }) {
  const rows = useMemo(() => {
    const list: { k: string; v: string }[] = [];
    if (draft.company.trim()) list.push({ k: "Company", v: draft.company.trim() });
    if (qIndex >= 1) list.push({ k: "Site", v: draft.website.trim() || "Not given" });
    if (draft.industry) {
      list.push({ k: "Industry", v: INDUSTRIES.find((i) => i.id === draft.industry)?.label ?? draft.industry });
    }
    if (qIndex >= 3 && draft.sellers) list.push({ k: "Sellers", v: draft.sellers });
    const rev = parseMoneyInput(draft.revenue);
    if (qIndex >= 4 && rev) list.push({ k: "Revenue", v: money(rev) });
    const deal = parseMoneyInput(draft.avgDeal);
    if (qIndex >= 5 && deal) list.push({ k: "Average deal", v: money(deal) });
    if (draft.quietShare != null) list.push({ k: "Quiet quotes", v: QUESTIONS.quiet[draft.quietShare] });
    if (draft.nurture) list.push({ k: "Closed-lost", v: QUESTIONS.nurture[draft.nurture] });
    if (draft.prospecting) list.push({ k: "Next account", v: QUESTIONS.prospect[draft.prospecting] });
    if (draft.pain) list.push({ k: "Named wound", v: QUESTIONS.pain[draft.pain] });
    return list;
  }, [draft, qIndex]);

  return (
    <aside className="hidden lg:block">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">Answers so far</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Nothing yet. One question at a time.</p>
      ) : (
        <dl className="mt-4 grid gap-3">
          {rows.map((r) => (
            <div key={r.k} className="border-t border-line pt-3">
              <dt className="text-xs text-muted">{r.k}</dt>
              <dd className="mt-1 text-sm">{r.v}</dd>
            </div>
          ))}
        </dl>
      )}
    </aside>
  );
}

function toAnswers(d: Draft): PlaybookAnswers | null {
  const company = d.company.trim();
  if (company.length < 2) return null;
  if (!d.industry || d.quietShare == null || !d.nurture || !d.prospecting || !d.pain) return null;
  const sellers = parseSellers(d.sellers);
  const revenue = parseMoneyInput(d.revenue) ?? (Number(d.revenue) || null);
  const avgDeal = parseMoneyInput(d.avgDeal) ?? (Number(d.avgDeal) || null);
  if (!sellers || !revenue || !avgDeal) return null;
  if (revenue < 10_000 || avgDeal < 50) return null;
  return {
    company,
    website: d.website.trim(),
    industry: d.industry,
    sellers,
    revenue,
    avgDeal,
    quietShare: d.quietShare,
    nurture: d.nurture,
    prospecting: d.prospecting,
    pain: d.pain,
  };
}
