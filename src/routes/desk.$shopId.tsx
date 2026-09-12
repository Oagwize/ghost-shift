import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button, Field, Input, Panel, Pill, Stat, Textarea } from "@/components/ui";
import { useDesk } from "@/lib/engine/store";
import { useLatestMeasure, usePending, useShopHours } from "@/lib/engine/selectors";
import { PRODUCTS } from "@/lib/engine/products";
import { STAGE_NAME, STAGE_ORDER } from "@/lib/engine/catalog";
import { SAMPLE_CSV } from "@/lib/engine/detectors";
import { money } from "@/lib/engine/ids";
import { workspaceNext } from "@/lib/engine/desk-copy";
import { buildGapAudit, deskWorld } from "@/lib/engine/gap-audit";
import { useAudits } from "@/lib/engine/audit-store";
import { formatDistanceToNow } from "date-fns";
import type { ProductId } from "@/lib/engine/types";

export const Route = createFileRoute("/desk/$shopId")({ component: ShopDesk });

function ShopDesk() {
  const { shopId } = Route.useParams();
  const shop = useDesk((s) => s.shops.find((x) => x.id === shopId));
  const allEvents = useDesk((s) => s.events);
  const allHours = useDesk((s) => s.hours);
  const events = useMemo(() => allEvents.filter((e) => e.shopId === shopId), [allEvents, shopId]);
  const hoursLog = useMemo(() => allHours.filter((h) => h.shopId === shopId), [allHours, shopId]);
  const connectShop = useDesk((s) => s.connectShop);
  const takeBaseline = useDesk((s) => s.takeBaseline);
  const runDetectors = useDesk((s) => s.runDetectors);
  const importCsv = useDesk((s) => s.importCsv);
  const enableProduct = useDesk((s) => s.enableProduct);
  const kill = useDesk((s) => s.kill);
  const resume = useDesk((s) => s.resume);
  const selectShop = useDesk((s) => s.selectShop);
  const pending = usePending(shopId);
  const navigate = useNavigate();
  const saveAudit = useAudits((s) => s.save);
  const measure = useLatestMeasure(shopId);
  const hours = useShopHours(shopId);
  const [csv, setCsv] = useState(SAMPLE_CSV);
  const [reason, setReason] = useState("Operator pause from Mission Control.");
  const [err, setErr] = useState<string | null>(null);

  if (!shop) {
    return <p>Workspace not found.</p>;
  }

  const next = workspaceNext(shop, pending.length);

  return (
    <div className="grid gap-8">
      <div>
        <Link to="/desk" className="text-sm text-muted hover:text-ink">
          All workspaces
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl">{shop.name}</h1>
              <Pill status={shop.status} />
            </div>
            <p className="mt-1 text-sm text-muted">
              {shop.city} · {shop.ownerName} · {shop.staffName}, {shop.staffRole} · {shop.reps} sellers
            </p>
            <p className="mt-3 max-w-xl text-sm">{next.text}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/shop"
              className="inline-flex min-h-11 items-center rounded-md bg-forest px-4 text-sm font-medium text-cream"
              onClick={() => selectShop(shop.id)}
            >
              {pending.length ? `Open queue · ${pending.length}` : "Open queue"}
            </Link>
            <Link
              to="/report/$shopId"
              params={{ shopId: shop.id }}
              className="inline-flex min-h-11 items-center rounded-md border border-line bg-cream px-4 text-sm font-medium"
            >
              After vs before
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                const report = buildGapAudit({
                  company: shop.name,
                  system: shop.system,
                  shopId: shop.id,
                  method: "workspace",
                  world: deskWorld(shop.id),
                });
                saveAudit(report);
                void navigate({ to: "/audit/$id", params: { id: report.id } });
              }}
            >
              Measured report
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Quiet proposals at start"
          value={measure ? money(measure.declinedUnfollowed) : "No baseline yet"}
          note="Counted once. Cannot be overwritten."
        />
        <Stat label="Invoices still open" value={measure ? money(measure.agingOpen) : "—"} />
        <Stat
          label="Recovered (dry-run)"
          value={measure ? money(measure.recoveredAttributed) : money(0)}
          note="Attributed decisions only."
        />
        <Stat label="Hours on this workspace" value={hours.toFixed(1)} note={`${pending.length} waiting on a person`} />
      </div>

      {shop.killed ? (
        <Panel className="border border-danger/30">
          <p className="text-sm text-danger">Paused. {shop.killedReason}</p>
          <Button className="mt-4" onClick={() => resume(shop.id)}>
            Resume
          </Button>
        </Panel>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-xl">Customer system</h2>
          <p className="mt-2 text-sm text-muted">
            {shop.system}
            {shop.connector.health === "ok" ? " connected" : ` · ${shop.connector.health.replaceAll("_", " ")}`}
            {shop.connector.lastSync
              ? ` · last read ${formatDistanceToNow(new Date(shop.connector.lastSync), { addSuffix: true })}`
              : ". CSV works if they cannot connect yet."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setErr(null);
                connectShop(shop.id);
              }}
            >
              Connect {shop.system}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const msg = takeBaseline(shop.id);
                setErr(msg);
              }}
            >
              Count before we change anything
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                runDetectors(shop.id);
              }}
            >
              Refresh the queue
            </Button>
          </div>
          {err ? <p className="mt-3 text-sm text-danger">{err}</p> : null}
          <Field label="Or paste a CSV" hint="Same mapping the cloud pull uses. Keep the sample if you are just looking.">
            <Textarea value={csv} onChange={(e) => setCsv(e.target.value)} className="mt-2 font-mono text-sm" />
          </Field>
          <Button className="mt-3" onClick={() => importCsv(shop.id, csv)}>
            Import CSV
          </Button>
        </Panel>

        <Panel>
          <h2 className="font-display text-xl">What is running</h2>
          <p className="mt-2 text-sm text-muted">
            {shop.products.length} on
            {shop.products.length >= PRODUCTS.filter((p) => !p.readOnly).length
              ? ". Full catalog on this sample."
              : ". The rest wait."}{" "}
            <Link to="/desk/ops" className="text-forest">
              Operator board
            </Link>
          </p>
          <div className="mt-4 grid gap-8">
            {STAGE_ORDER.map((stage) => {
              const items = PRODUCTS.filter((p) => p.stage === stage);
              if (!items.length) return null;
              return (
                <div key={stage}>
                  <p className="text-xs font-medium tracking-wide text-muted uppercase">{STAGE_NAME[stage]}</p>
                  <ul className="mt-2 grid gap-3">
                    {items.map((p) => {
                      const on = shop.products.includes(p.id);
                      return (
                        <li key={p.id} className="flex items-start justify-between gap-3 border-t border-line pt-3">
                          <div>
                            <p className="font-medium">
                              {p.name} {p.readOnly ? <span className="text-xs text-muted">read-only</span> : null}
                            </p>
                            <p className="text-sm text-muted">{p.pitch}</p>
                          </div>
                          {on ? (
                            <span className="text-xs text-forest">On</span>
                          ) : (
                            <Button
                              variant="outline"
                              className="min-h-11 shrink-0 px-3 text-sm"
                              onClick={() => setErr(enableProduct(shop.id, p.id as ProductId))}
                            >
                              Turn on
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel>
        <h2 className="font-display text-xl">Pause this workspace</h2>
        <p className="mt-2 text-sm text-muted">
          Stops scheduled work. Leaves the records. The queue stays visible. Use this when something is wrong.
        </p>
        <Field label="Reason they will see">
          <Input value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <Button variant="danger" className="mt-3" disabled={shop.killed} onClick={() => kill(shop.id, reason)}>
          Pause
        </Button>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-xl">Hours</h2>
          <ul className="mt-4 grid max-h-72 gap-3 overflow-auto">
            {hoursLog.map((h) => (
              <li key={h.id} className="flex justify-between gap-3 border-t border-line pt-3 text-sm">
                <span>{h.kind}</span>
                <span className="tabular-nums text-muted">{h.minutes} min</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <h2 className="font-display text-xl">History</h2>
          <ul className="mt-4 grid max-h-72 gap-3 overflow-auto">
            {events.slice(0, 16).map((e) => (
              <li key={e.id} className="border-t border-line pt-3 text-sm">
                <p className="font-medium">{e.action.replaceAll("_", " ")}</p>
                <p className="text-muted">{e.detail}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
