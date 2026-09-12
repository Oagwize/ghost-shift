import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader, Wordmark } from "@/components/site-header";
import { Button, Panel, Stat } from "@/components/ui";
import {
  computePlaybook,
  decodeAnswers,
  describeAnswers,
  encodeAnswers,
  type PlaybookResult,
} from "@/lib/engine/playbook";
import { usePlaybooks } from "@/lib/engine/playbook-store";
import { phrasePlaybook } from "@/lib/engine/playbook-ai";
import { money } from "@/lib/engine/ids";
import { format } from "date-fns";

type Search = { a?: string };

export const Route = createFileRoute("/playbook/$id")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    a: typeof s.a === "string" ? s.a : undefined,
  }),
  component: PlaybookPage,
});

function PlaybookPage() {
  const { id } = Route.useParams();
  const { a } = Route.useSearch();
  const hydrated = usePlaybooks((s) => s.hydrated);
  const items = usePlaybooks((s) => s.items);
  const save = usePlaybooks((s) => s.save);
  const setPhrasing = usePlaybooks((s) => s.setPhrasing);
  const saved = items.find((x) => x.id === id);
  const fromQuery = useMemo(() => (a ? decodeAnswers(a) : null), [a]);
  const answers = fromQuery ?? saved?.answers ?? null;

  useEffect(() => {
    if (!answers) return;
    const existing = usePlaybooks.getState().items.find((x) => x.id === id);
    if (existing && encodeAnswers(existing.answers) === encodeAnswers(answers)) return;
    save({
      id,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      answers,
      phrasing: existing?.phrasing,
    });
  }, [answers, id, save]);

  const result = useMemo(() => (answers ? computePlaybook(answers) : null), [answers]);

  if (!answers || !result) {
    if (!hydrated && !a) {
      return (
        <div className="min-h-dvh bg-paper">
          <SiteHeader solid />
          <p className="px-8 py-16 text-sm text-muted">Opening the playbook…</p>
        </div>
      );
    }
    return (
      <div className="min-h-dvh bg-paper">
        <SiteHeader solid />
        <main className="mx-auto max-w-xl px-5 py-16 sm:px-8">
          <h1 className="font-display text-3xl">This playbook is not in this browser.</h1>
          <p className="mt-4 text-muted">
            Estimates live in this browser and in the share link. Start a new conversation if the link has no payload.
          </p>
          <Link
            to="/playbook"
            className="mt-8 inline-flex min-h-11 items-center rounded-md bg-forest px-5 font-medium text-cream"
          >
            Start a playbook
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <PlaybookDocument
      id={id}
      result={result}
      createdAt={saved?.createdAt ?? null}
      phrasing={saved?.phrasing}
      onPhrased={(p) => setPhrasing(id, p)}
    />
  );
}

function PlaybookDocument({
  id,
  result,
  createdAt,
  phrasing,
  onPhrased,
}: {
  id: string;
  result: PlaybookResult;
  createdAt: string | null;
  phrasing?: { opportunities: string[]; roadmapLead: string; at: string };
  onPhrased: (p: { opportunities: string[]; roadmapLead: string; at: string }) => void;
}) {
  const { answers } = result;
  const [copied, setCopied] = useState(false);
  const [aiState, setAiState] = useState<"idle" | "loading" | "error">("idle");
  const [aiError, setAiError] = useState<string | null>(null);

  async function copyLink() {
    const url = `${window.location.origin}/playbook/${id}?a=${encodeURIComponent(encodeAnswers(answers))}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function phrase() {
    setAiState("loading");
    setAiError(null);
    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      setAiState("error");
      setAiError("Phrasing took too long. The numbers still stand.");
    }, 25000);
    try {
      const res = await phrasePlaybook({ data: { answers } });
      if (timedOut) return;
      if (!res.ok) {
        setAiState("error");
        setAiError(res.error);
        return;
      }
      onPhrased({ opportunities: res.opportunities, roadmapLead: res.roadmapLead, at: new Date().toISOString() });
      setAiState("idle");
    } catch {
      if (timedOut) return;
      setAiState("error");
      setAiError("Phrasing is not available. The numbers still stand.");
    } finally {
      window.clearTimeout(timer);
    }
  }

  const dateLabel = createdAt ? format(new Date(createdAt), "MMMM d, yyyy") : "Prepared now";
  const oppBodies = phrasing?.opportunities ?? result.opportunities.map((o) => o.body);

  return (
    <div className="min-h-dvh bg-paper">
      <div className="no-print">
        <SiteHeader solid />
      </div>
      <div className="print-only hidden border-b border-line px-8 py-5">
        <Wordmark />
      </div>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="no-print mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Method v1 · every number is a query · nothing sends</p>
          <div className="flex flex-col gap-2 pr-24 sm:flex-row sm:pr-0">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              Print
            </Button>
            <Button type="button" variant="outline" onClick={() => void copyLink()}>
              {copied ? "Link copied" : "Copy link"}
            </Button>
            <Button type="button" variant="ghost" disabled={aiState === "loading"} onClick={() => void phrase()}>
              {aiState === "loading" ? "Phrasing…" : phrasing ? "Rephrase opportunities" : "Phrase opportunities"}
            </Button>
          </div>
        </div>
        {aiError ? <p className="no-print mb-6 text-sm text-danger">{aiError}</p> : null}

        <header className="border-b border-line pb-10">
          <p className="text-xs font-medium tracking-wide text-forest uppercase">
            Instant Playbook · {dateLabel} · {result.industry.label}
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">{answers.company}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Prepared from ten answers and the {result.industry.label.toLowerCase()} table. Not a measurement from the
            customer system. The Gap Audit is the measured number.
          </p>
        </header>

        <section className="grid gap-4 py-10 sm:grid-cols-3">
          <Stat
            label="Annual recoverable"
            value={money(result.total)}
            note={result.capped ? "Capped at 1.6 × stated revenue." : "Sum of five queries."}
          />
          <Stat label="Industry score" value={`${result.score} / 100`} note={`${money(result.revPerRep)} per seller.`} />
          <Stat
            label="Implied quote book"
            value={String(result.annualQuotes)}
            note={`${result.closedLost} closed-lost at ${Math.round(result.industry.winRate * 100)}% win rate.`}
          />
        </section>

        <section className="print-break rounded-xl bg-forest px-6 py-10 text-cream sm:px-10">
          <p className="text-xs font-medium tracking-wide text-cream/70 uppercase">The number</p>
          <p className="mt-3 font-display text-5xl tabular-nums tracking-tight sm:text-6xl">{money(result.total)}</p>
          <p className="mt-4 max-w-2xl text-cream/80">
            Work sitting around the conversation for a team of {answers.sellers} doing {money(answers.revenue)} a year.
            A competitor three times this size staffed these jobs. This prices doing them without the hires.
          </p>
        </section>

        <section className="print-break mt-14">
          <h2 className="font-display text-3xl">Five queries</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">{result.methodNote}</p>
          <ol className="mt-8 grid gap-4">
            {result.leaks.map((row, i) => (
              <li key={row.id} className="grid gap-2 border-t border-line pt-4 sm:grid-cols-[1fr_auto] sm:items-baseline">
                <div>
                  <p>
                    <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")} </span>
                    {row.label}
                    <span className="ml-2 text-xs text-muted">{row.product}</span>
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">{row.query}</p>
                </div>
                <p className="font-display text-2xl tabular-nums">{money(row.amount)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="print-break mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-3xl">Industry score</h2>
            <p className="mt-2 text-sm text-muted">
              100 is a team already running research, a second-conversation habit, and a closed-lost calendar. 50 is a
              normal small sales org.
            </p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-forest" style={{ width: `${result.score}%` }} />
            </div>
            <ul className="mt-6 grid gap-4">
              {result.scoreParts.map((p) => (
                <li key={p.label} className="border-t border-line pt-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <span>{p.label}</span>
                    <span className="font-mono text-sm tabular-nums">
                      {p.points} / {p.max}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{p.note}</p>
                </li>
              ))}
            </ul>
          </div>
          <Panel>
            <h3 className="font-display text-2xl">The ten answers</h3>
            <dl className="mt-4 grid gap-3 text-sm">
              {describeAnswers(answers).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-t border-line pt-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </section>

        <section className="print-break mt-14">
          <h2 className="font-display text-3xl">Competitor scan</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ScanBlock title="Where this team sits" body={result.competitor.standing} />
            <ScanBlock title="How peers actually run" body={result.competitor.pattern} />
            <ScanBlock title="What this scan used" body={result.competitor.sources} />
          </div>
        </section>

        <section className="print-break mt-14">
          <h2 className="font-display text-3xl">Three opportunities</h2>
          {phrasing ? (
            <p className="no-print mt-2 text-xs text-muted">
              Opportunity copy phrased {format(new Date(phrasing.at), "MMM d, h:mm a")}. Dollars unchanged.
            </p>
          ) : null}
          <ol className="mt-8 grid gap-8">
            {result.opportunities.map((o, i) => (
              <li key={o.rank} className="border-t border-line pt-5">
                <p className="font-mono text-xs text-faint">
                  {String(o.rank).padStart(2, "0")} · {o.product}
                </p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="font-display text-2xl">{o.title}</h3>
                  <p className="font-display text-2xl tabular-nums text-forest">{money(o.amount)}</p>
                </div>
                <p className="mt-3 max-w-3xl text-muted">{oppBodies[i] ?? o.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="print-break mt-14">
          <h2 className="font-display text-3xl">Quick wins this week</h2>
          <p className="mt-2 text-sm text-muted">No connector. No send. A person still does the work.</p>
          <ol className="mt-6 grid gap-4">
            {result.wins.map((w, i) => (
              <li key={w} className="flex gap-4 rounded-lg bg-cream px-4 py-4 shadow-(--shadow-card)">
                <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-sm">{w}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="print-break mt-14">
          <h2 className="font-display text-3xl">Ninety days</h2>
          {phrasing?.roadmapLead ? <p className="mt-3 max-w-2xl text-muted">{phrasing.roadmapLead}</p> : null}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {result.roadmap.map((phase) => (
              <article key={phase.window} className="rounded-xl bg-cream p-5 shadow-(--shadow-card)">
                <p className="text-xs font-medium tracking-wide text-forest uppercase">{phase.window}</p>
                <h3 className="mt-2 font-display text-xl">{phase.title}</h3>
                <ul className="mt-4 grid gap-3 text-sm text-muted">
                  {phase.items.map((item) => (
                    <li key={item} className="border-t border-line pt-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="no-print mt-16 grid gap-8 rounded-xl bg-cream px-6 py-10 shadow-(--shadow-card) sm:px-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-2xl">This estimate is in Mission Control.</h2>
            <p className="mt-3 text-sm text-muted">
              Robert sees it in today's inbox. The Gap Audit is the measured number from the customer system, if
              they continue. A person still approves every message.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              to="/enter"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest px-5 font-medium text-cream"
            >
              Open Mission Control
            </Link>
            <Link
              to="/audit"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-5 font-medium"
            >
              Measured report
            </Link>
          </div>
        </section>
      </main>
      <div className="no-print">
        <SiteFooter />
      </div>
    </div>
  );
}

function ScanBlock({ title, body }: { title: string; body: string }) {
  return (
    <article className="border-t border-line pt-4">
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mt-3 text-sm text-muted">{body}</p>
    </article>
  );
}
