import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Panel, Stat } from "@/components/ui";
import { useDesk } from "@/lib/engine/store";
import { money } from "@/lib/engine/ids";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

export const Route = createFileRoute("/report/$shopId")({ component: Report });

function Report() {
  const { shopId } = Route.useParams();
  const shop = useDesk((s) => s.shops.find((x) => x.id === shopId));
  const allMeasures = useDesk((s) => s.measurements);
  const allEvents = useDesk((s) => s.events);
  const measures = useMemo(
    () => allMeasures.filter((m) => m.shopId === shopId).slice().sort((a, b) => a.at.localeCompare(b.at)),
    [allMeasures, shopId],
  );
  const events = useMemo(() => allEvents.filter((e) => e.shopId === shopId), [allEvents, shopId]);
  const first = measures[0];
  const last = measures[measures.length - 1];

  if (!shop) {
    return (
      <div className="min-h-dvh bg-paper">
        <SiteHeader solid />
        <p className="p-8">Shop not found.</p>
      </div>
    );
  }

  const data = measures.map((m) => ({
    at: format(new Date(m.at), "MMM d"),
    recovered: m.recoveredAttributed,
    declined: m.declinedUnfollowed,
  }));

  return (
    <div className="min-h-dvh bg-paper">
      <SiteHeader solid />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Delta report · method v1</p>
        <h1 className="mt-2 font-display text-4xl">{shop.name}</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Generated, not written. Baseline and current side by side. Assumptions listed. Every number linked to a query
          in the audit log. Recovered dollars count only on an attributed chain: signal, action, decision, execution,
          result.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Stat
            label="Baseline declined unfollowed"
            value={first ? money(first.declinedUnfollowed) : "No baseline"}
            note={first ? format(new Date(first.at), "MMMM d, yyyy") : "Take a baseline on the desk."}
          />
          <Stat
            label="Attributed recovered"
            value={last ? money(last.recoveredAttributed) : money(0)}
            note="Dry-run in this desk. Not cash in the till."
          />
          <Stat
            label="Aging still open"
            value={last ? money(last.agingOpen) : "—"}
            note="Insert-only snapshots. The baseline cannot be overwritten."
          />
        </div>

        <Panel className="mt-8">
          <h2 className="font-display text-xl">Recovered, over snapshots</h2>
          <div className="mt-4 h-64">
            {data.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#d8d0c3" vertical={false} />
                  <XAxis dataKey="at" stroke="#6b645a" fontSize={12} tickLine={false} />
                  <YAxis stroke="#6b645a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#faf7f0", border: "1px solid #d8d0c3", borderRadius: 8 }}
                    formatter={(value) => money(Number(value ?? 0))}
                  />
                  <Area type="monotone" dataKey="recovered" stroke="#2c4a3e" fill="#2c4a3e" fillOpacity={0.12} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted">Approve items in the queue to plot a series.</p>
            )}
          </div>
        </Panel>

        <Panel className="mt-6">
          <h2 className="font-display text-xl">Assumptions</h2>
          <ul className="mt-4 grid gap-2 text-sm text-muted">
            <li>Declined work fires after 14 days with no outbound.</li>
            <li>Open estimates fire after 7 days with no follow-up.</li>
            <li>Invoices fire at 7, 14, 30, 60, 90 day buckets.</li>
            <li>Attribution requires a recorded approval in this window.</li>
            <li>This desk does not send. Dry-run only.</li>
          </ul>
        </Panel>

        <Panel className="mt-6">
          <h2 className="font-display text-xl">Queries behind the numbers</h2>
          <ul className="mt-4 grid max-h-72 gap-3 overflow-auto text-sm">
            {events
              .filter((e) => ["baseline", "sent_dry_run", "detectors_ran"].includes(e.action))
              .slice(0, 20)
              .map((e) => (
                <li key={e.id} className="border-t border-line pt-3">
                  <span className="font-medium">{e.action.replaceAll("_", " ")}</span>
                  <span className="text-muted"> · {e.detail}</span>
                </li>
              ))}
          </ul>
        </Panel>

        <Link to="/enter" className="mt-8 inline-flex min-h-11 items-center text-sm text-forest">
          Back to the desk
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
