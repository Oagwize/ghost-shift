import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader, Wordmark } from "@/components/site-header";
import { Button, Panel, Stat } from "@/components/ui";
import { useAudits } from "@/lib/engine/audit-store";
import { methodLabel, moneyTotal, type GapAudit } from "@/lib/engine/gap-audit";
import { money } from "@/lib/engine/ids";
import { format } from "date-fns";

export const Route = createFileRoute("/audit/$id")({ component: AuditReport });

function AuditReport() {
  const { id } = Route.useParams();
  const hydrated = useAudits((s) => s.hydrated);
  const report = useAudits((s) => s.items.find((x) => x.id === id));

  if (!report) {
    return (
      <div className="min-h-dvh bg-paper">
        <SiteHeader solid />
        <main className="mx-auto max-w-xl px-5 py-16 sm:px-8">
          <h1 className="font-display text-3xl">
            {hydrated ? "This report is not in this browser." : "Opening the report…"}
          </h1>
          {hydrated ? (
            <>
              <p className="mt-4 text-muted">Run it again. Audits live here, next to playbooks in Mission Control.</p>
              <Link
                to="/audit"
                className="mt-8 inline-flex min-h-11 items-center rounded-md bg-forest px-5 font-medium text-cream"
              >
                Gap Audit
              </Link>
            </>
          ) : null}
        </main>
        <SiteFooter />
      </div>
    );
  }

  return <Document report={report} />;
}

function Document({ report }: { report: GapAudit }) {
  const lostTotal = report.lostCalls.unanswered.amount + report.lostCalls.noAsk.amount;
  const dateLabel = format(new Date(report.preparedAt), "MMMM d, yyyy");

  return (
    <div className="min-h-dvh bg-paper">
      <div className="no-print">
        <SiteHeader solid />
      </div>
      <div className="print-only hidden px-8 pt-8">
        <Wordmark />
      </div>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            Method v1 · {methodLabel(report.method)} · nothing sends
          </p>
          <div className="mb-16 flex flex-wrap gap-2 pr-24 sm:mb-0 sm:pr-0">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              Print
            </Button>
            <Link
              to="/desk"
              className="inline-flex min-h-11 items-center rounded-md border border-line bg-cream px-4 text-sm font-medium"
            >
              Mission Control
            </Link>
          </div>
        </div>

        <p className="text-xs font-medium tracking-wide text-forest uppercase">
          Gap Audit · {dateLabel} · {report.system}
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">{report.company}</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Prepared from the records, not from a conversation. Ranked by dollars sitting in a query. The Lost Call Report
          is pages of this, not a separate product.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <Stat label="Unrecovered work" value={moneyTotal(report.total)} note="Sum of open detectors." />
          <Stat
            label="Lost inbound"
            value={moneyTotal(lostTotal)}
            note={`${report.lostCalls.unanswered.count} unanswered · ${report.lostCalls.noAsk.count} answered, no ask`}
          />
          <Stat
            label="Companies to call"
            value={String(report.companiesToCall.length)}
            note="Public dated reasons, not yet routed."
          />
        </div>

        <section className="print-break mt-14">
          <h2 className="font-display text-2xl">The number</h2>
          <p className="mt-3 font-display text-5xl tabular-nums text-forest">{moneyTotal(report.total)}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted">{report.notes[0]}</p>
        </section>

        <section className="print-break mt-14">
          <h2 className="font-display text-2xl">Ranked leaks</h2>
          <p className="mt-2 text-sm text-muted">Every line is a named query. The product is the bundle that works it.</p>
          <ol className="mt-6 grid gap-3">
            {report.leaks.map((row, i) => (
              <li key={row.detector} className="border-t border-line pt-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p>
                    <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")} </span>
                    {row.label}
                    <span className="ml-2 text-xs text-muted">
                      {row.product} · {row.count} {row.count === 1 ? "item" : "items"}
                    </span>
                  </p>
                  <p className="tabular-nums">{money(row.amount)}</p>
                </div>
                <p className="mt-1 text-sm text-muted">{row.query}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="print-break mt-14">
          <h2 className="font-display text-2xl">Lost Call Report</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Detectors 4.9 and 4.10. Unanswered versus answered with no meeting request. Read-only. Classification of the
            ask is a label on the record in this desk, not a live transcript model.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Panel>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">Unanswered</p>
              <p className="mt-2 font-display text-3xl tabular-nums">{report.lostCalls.unanswered.count}</p>
              <p className="mt-1 text-sm text-muted">{money(report.lostCalls.unanswered.amount)}</p>
            </Panel>
            <Panel>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">Answered, no ask</p>
              <p className="mt-2 font-display text-3xl tabular-nums">{report.lostCalls.noAsk.count}</p>
              <p className="mt-1 text-sm text-muted">{money(report.lostCalls.noAsk.amount)}</p>
            </Panel>
            <Panel>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">Inbound in the file</p>
              <p className="mt-2 font-display text-3xl tabular-nums">{report.lostCalls.inbound}</p>
              <p className="mt-1 text-sm text-muted">{report.lostCalls.booked} became a meeting</p>
            </Panel>
          </div>
          {report.lostCalls.byPerson.length ? (
            <Panel className="mt-4">
              <h3 className="font-display text-xl">Per person</h3>
              <ul className="mt-4 grid gap-3">
                {report.lostCalls.byPerson.map((p) => (
                  <li key={p.name} className="flex items-baseline justify-between gap-4 border-t border-line pt-3 text-sm">
                    <span>
                      {p.name}
                      <span className="ml-2 text-xs text-muted">
                        {p.unanswered} missed · {p.noAsk} no ask
                      </span>
                    </span>
                    <span className="tabular-nums">{money(p.amount)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : (
            <p className="mt-4 text-sm text-muted">No inbound in this run.</p>
          )}
        </section>

        <section className="print-break mt-14">
          <h2 className="font-display text-2xl">Companies to call</h2>
          <p className="mt-2 text-sm text-muted">
            {report.method === "sample"
              ? "A dated reason, with the source. The Northline sample has five."
              : "A dated reason, with the source. Twenty is the cap."}
          </p>
          {report.companiesToCall.length === 0 ? (
            <p className="mt-4 text-sm text-muted">None in this file.</p>
          ) : (
            <ol className="mt-6 grid gap-3">
              {report.companiesToCall.map((c, i) => (
                <li key={c.company} className="border-t border-line pt-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <p>
                      <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")} </span>
                      {c.company}
                    </p>
                    <p className="tabular-nums text-sm">{money(c.amount)}</p>
                  </div>
                  <p className="mt-1 text-sm">{c.reason}</p>
                  <p className="mt-1 text-xs text-faint">{c.source}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="print-break mt-14">
          <h2 className="font-display text-2xl">Quiet work</h2>
          {report.quietDeals.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No quiet proposals or declined expansions in this run.</p>
          ) : (
            <ul className="mt-6 grid gap-3">
              {report.quietDeals.map((d) => (
                <li key={`${d.kind}-${d.customer}-${d.summary}`} className="flex items-baseline justify-between gap-4 border-t border-line pt-3 text-sm">
                  <span>
                    {d.customer}
                    <span className="ml-2 text-muted">
                      {d.kind === "proposal" ? "proposal" : "declined"} · {d.summary} · {d.ageDays}d
                    </span>
                  </span>
                  <span className="tabular-nums">{money(d.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="print-break mt-14">
          <h2 className="font-display text-2xl">Three fixes, in order</h2>
          <ol className="mt-6 grid gap-6">
            {report.fixes.map((f, i) => (
              <li key={f.title} className="border-t border-line pt-4">
                <p className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")} · {f.product}</p>
                <h3 className="mt-1 font-display text-2xl">{f.title}</h3>
                <p className="mt-1 font-display text-2xl tabular-nums">{money(f.amount)}</p>
                <p className="mt-2 max-w-2xl text-sm text-muted">{f.why}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="print-break mt-14">
          <h2 className="font-display text-2xl">Method</h2>
          <ul className="mt-4 grid gap-3 text-sm text-muted">
            {report.notes.map((n) => (
              <li key={n} className="border-t border-line pt-3">
                {n}
              </li>
            ))}
          </ul>
        </section>

        <section className="no-print mt-16 grid gap-8 rounded-xl bg-cream px-6 py-10 shadow-(--shadow-card) sm:px-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-2xl">This report is in Mission Control.</h2>
            <p className="mt-3 text-sm text-muted">
              Robert sees it in today's inbox. The queue still belongs to the rep. Nothing on this page sent a
              message.
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
              to="/playbook"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-5 font-medium"
            >
              Instant Playbook
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
