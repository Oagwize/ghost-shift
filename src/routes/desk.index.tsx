import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Pill, Panel, Stat } from "@/components/ui";
import { useDesk } from "@/lib/engine/store";
import { useDeskMetrics, audienceOf } from "@/lib/engine/selectors";
import { money } from "@/lib/engine/ids";
import { computePlaybook, encodeAnswers } from "@/lib/engine/playbook";
import { usePlaybooks } from "@/lib/engine/playbook-store";
import { useAudits } from "@/lib/engine/audit-store";
import { methodLabel } from "@/lib/engine/gap-audit";
import { actionLabel, workspaceNext } from "@/lib/engine/desk-copy";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/desk/")({ component: DeskHome });

function DeskHome() {
  const shops = useDesk((s) => s.shops);
  const events = useDesk((s) => s.events);
  const leads = useDesk((s) => s.leads);
  const drafts = useDesk((s) => s.drafts);
  const signals = useDesk((s) => s.signals);
  const decisions = useDesk((s) => s.decisions);
  const metrics = useDeskMetrics();
  const playbooks = usePlaybooks((s) => s.items);
  const markReviewed = usePlaybooks((s) => s.markReviewed);
  const audits = useAudits((s) => s.items);
  const auditReviewed = useAudits((s) => s.reviewed);
  const markAudit = useAudits((s) => s.markReviewed);
  const decided = useMemo(
    () => new Set(decisions.filter((d) => d.status !== "queued").map((d) => d.draftId)),
    [decisions],
  );

  const waitingByShop = useMemo(() => {
    const rep: Record<string, number> = {};
    const ops: Record<string, number> = {};
    for (const d of drafts) {
      if (decided.has(d.id)) continue;
      const sig = signals.find((x) => x.id === d.signalId);
      if (!sig || sig.suppressed) continue;
      const map = audienceOf(sig) === "operator" ? ops : rep;
      map[d.shopId] = (map[d.shopId] ?? 0) + 1;
    }
    return { rep, ops };
  }, [drafts, signals, decided]);

  const inbox = useMemo(() => {
    return [...playbooks].sort((a, b) => {
      const ar = a.reviewedAt ? 1 : 0;
      const br = b.reviewedAt ? 1 : 0;
      if (ar !== br) return ar - br;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [playbooks]);

  const openPlaybooks = inbox.filter((p) => !p.reviewedAt).length;
  const openAudits = audits.filter((a) => !auditReviewed[a.id]).length;
  const waitingTotal = Object.values(waitingByShop.rep).reduce((n, v) => n + v, 0);
  const opsTotal = Object.values(waitingByShop.ops).reduce((n, v) => n + v, 0);
  const stuck = shops.filter((s) => s.killed || !s.baselineAt || s.status === "onboarding");

  return (
    <div className="grid gap-10">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Mission Control</p>
        <h1 className="mt-1 font-display text-3xl">What needs you today.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Playbooks and reports land here. Workspaces that cannot run wait here. Scoring, hygiene, pacing, and
          paperwork live on the operator board. The queue still belongs to the rep.
        </p>
        <Link to="/desk/ops" className="mt-4 inline-flex min-h-11 items-center text-sm text-forest">
          Open the operator board
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="New playbooks"
          value={String(openPlaybooks)}
          note={openPlaybooks === 0 ? "Inbox is clear." : "Open, then mark reviewed."}
        />
        <Stat
          label="Measured reports"
          value={String(openAudits)}
          note={openAudits === 0 ? "No new Gap Audits." : "From the public report."}
        />
        <Stat
          label="Rep queue"
          value={String(waitingTotal)}
          note="Held for the seller. Nothing sends itself."
        />
        <Stat
          label="Operator board"
          value={String(opsTotal)}
          note="Scoring, hygiene, pacing, paperwork."
        />
        <Stat
          label="Workspaces that need you"
          value={String(stuck.length)}
          note={stuck.length ? stuck.map((s) => s.name).join(", ") : "Both running."}
        />
      </div>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Inbox</h2>
            <p className="mt-1 text-sm text-muted">Estimates from Instant Playbook, then measured Gap Audits.</p>
          </div>
        </div>
        <ul className="mt-5 grid gap-3">
          {inbox.map((row) => {
            const result = computePlaybook(row.answers);
            return (
              <li key={row.id}>
                <Panel className={cn("grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center", row.reviewedAt && "opacity-60")}>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-forest uppercase">
                      Playbook · {row.reviewedAt ? "Reviewed" : "New"} · {result.industry.label}
                    </p>
                    <h3 className="mt-1 font-display text-2xl">{row.answers.company}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {money(result.total)} recoverable · score {result.score} / 100 · {row.answers.sellers} sellers
                    </p>
                    <p className="mt-1 text-xs text-faint">
                      {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="mb-16 flex flex-col gap-2 pr-24 sm:mb-0 sm:items-end sm:pr-0">
                    <Link
                      to="/playbook/$id"
                      params={{ id: row.id }}
                      search={{ a: encodeAnswers(row.answers) }}
                      className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest px-4 text-sm font-medium text-cream"
                    >
                      Open playbook
                    </Link>
                    {!row.reviewedAt ? (
                      <Button variant="ghost" className="text-sm" onClick={() => markReviewed(row.id)}>
                        Mark reviewed
                      </Button>
                    ) : null}
                  </div>
                </Panel>
              </li>
            );
          })}
          {audits.map((row) => (
            <li key={row.id}>
              <Panel className={cn("grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center", auditReviewed[row.id] && "opacity-60")}>
                <div>
                  <p className="text-xs font-medium tracking-wide text-forest uppercase">
                    Gap Audit · {auditReviewed[row.id] ? "Reviewed" : "New"} · {methodLabel(row.method)}
                  </p>
                  <h3 className="mt-1 font-display text-2xl">{row.company}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {money(row.total)} unrecovered · {row.lostCalls.unanswered.count + row.lostCalls.noAsk.count} lost
                    inbound · {row.companiesToCall.length} to call
                  </p>
                  <p className="mt-1 text-xs text-faint">
                    {formatDistanceToNow(new Date(row.preparedAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="mb-16 flex flex-col gap-2 pr-24 sm:mb-0 sm:items-end sm:pr-0">
                  <Link
                    to="/audit/$id"
                    params={{ id: row.id }}
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest px-4 text-sm font-medium text-cream"
                  >
                    Open report
                  </Link>
                  {!auditReviewed[row.id] ? (
                    <Button variant="ghost" className="text-sm" onClick={() => markAudit(row.id)}>
                      Mark reviewed
                    </Button>
                  ) : null}
                </div>
              </Panel>
            </li>
          ))}
          {leads.map((l) => (
            <li key={l.id}>
              <Panel>
                <p className="text-xs font-medium tracking-wide text-muted uppercase">Measured report request</p>
                <h3 className="mt-1 font-display text-2xl">{l.shop}</h3>
                <p className="mt-1 text-sm text-muted">
                  {l.name} · {l.email} · {l.system}
                </p>
                <p className="mt-1 text-xs text-faint">{formatDistanceToNow(new Date(l.at), { addSuffix: true })}</p>
              </Panel>
            </li>
          ))}
          {inbox.length === 0 && leads.length === 0 && audits.length === 0 ? (
            <p className="text-sm text-muted">Nothing in the inbox. A finished playbook or Gap Audit lands here.</p>
          ) : null}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl">Workspaces</h2>
        <p className="mt-1 text-sm text-muted">Two sample companies. Open one when it needs a baseline, a product, or a pause.</p>
        <ul className="mt-5 grid gap-3">
          {shops.map((shop) => {
            const waiting = waitingByShop.rep[shop.id] ?? 0;
            const board = waitingByShop.ops[shop.id] ?? 0;
            const next = workspaceNext(shop, waiting);
            return (
              <li key={shop.id}>
                <Panel className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-2xl">{shop.name}</h3>
                      <Pill status={shop.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {shop.city} · {shop.reps} sellers · {shop.system} · {shop.staffName}
                    </p>
                    <p
                      className={cn(
                        "mt-3 text-sm",
                        next.tone === "danger" && "text-danger",
                        next.tone === "warn" && "text-warn",
                        next.tone === "work" && "text-ink",
                        next.tone === "ok" && "text-muted",
                      )}
                    >
                      {next.text}
                    </p>
                  </div>
                  <div className="mb-16 flex flex-col gap-2 pr-24 sm:mb-0 sm:flex-row sm:pr-0 lg:mb-0 lg:flex-col lg:items-end">
                    <Link
                      to="/desk/$shopId"
                      params={{ shopId: shop.id }}
                      className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest px-4 text-sm font-medium text-cream"
                    >
                      Open workspace
                    </Link>
                    <Link
                      to="/shop"
                      className="inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-cream px-4 text-sm font-medium"
                      onClick={() => useDesk.getState().selectShop(shop.id)}
                    >
                      {waiting ? `Queue · ${waiting}` : "Queue"}
                    </Link>
                    {board ? (
                      <Link
                        to="/desk/ops"
                        className="inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-cream px-4 text-sm font-medium"
                      >
                        Board · {board}
                      </Link>
                    ) : null}
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-xl">What changed</h2>
          <ul className="mt-4 grid gap-3">
            {events.slice(0, 8).map((e) => (
              <li key={e.id} className="border-t border-line pt-3 text-sm">
                <p>
                  <span className="font-medium">{e.actor}</span> · {actionLabel(e.action)}
                </p>
                <p className="text-muted">{e.detail}</p>
                <p className="text-xs text-faint">{formatDistanceToNow(new Date(e.at), { addSuffix: true })}</p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <h2 className="font-display text-xl">How the month looks</h2>
          <dl className="mt-4 grid gap-4 text-sm">
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <dt className="text-muted">Recovered, attributed</dt>
              <dd className="tabular-nums">{money(metrics.recoveredPer)} / workspace</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <dt className="text-muted">Hours you logged</dt>
              <dd className="tabular-nums">{metrics.operatorHoursPer.toFixed(1)} / workspace</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <dt className="text-muted">Onboarding hours</dt>
              <dd className="tabular-nums">{metrics.onboardingHoursPer.toFixed(1)} on the one still coming in</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <dt className="text-muted">Report requests</dt>
              <dd className="tabular-nums">{metrics.auditsThisMonth} this month</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted">Dry-run. Recovered dollars are attributed decisions, not cash.</p>
        </Panel>
      </section>
    </div>
  );
}
