import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ApprovalCard } from "@/components/approval-card";
import { Panel } from "@/components/ui";
import { useDesk } from "@/lib/engine/store";
import { useOperatorPending } from "@/lib/engine/selectors";
import { catalogById, productIdFromDetector, STAGE_NAME } from "@/lib/engine/catalog";
import { DETECTOR_LABEL } from "@/lib/engine/products";
import { money } from "@/lib/engine/ids";
import { cn } from "@/lib/cn";
import type { StageId } from "@/lib/engine/types";

export const Route = createFileRoute("/desk/ops")({ component: OpsBoard });

function OpsBoard() {
  const pending = useOperatorPending();
  const decide = useDesk((s) => s.decide);
  const [picked, setPicked] = useState<string | null>(pending[0]?.draft.id ?? null);
  const current = pending.find((p) => p.draft.id === picked) ?? pending[0];

  const grouped = useMemo(() => {
    const map = new Map<string, typeof pending>();
    for (const item of pending) {
      const pid = productIdFromDetector(item.signal.detector);
      const stage = pid ? (catalogById(pid)?.stage ?? "B") : "B";
      const list = map.get(stage) ?? [];
      list.push(item);
      map.set(stage, list);
    }
    return [...map.entries()];
  }, [pending]);

  if (!pending.length) {
    return (
      <Panel>
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Operator board</p>
        <h1 className="mt-2 font-display text-3xl">No internal work waiting.</h1>
        <p className="mt-3 max-w-xl text-muted">
          Turn on people, process, knowledge, or paperwork products in a workspace. Scoring, hygiene, pacing, consent,
          and the rest land here. The rep queue stays the rep's.
        </p>
        <Link to="/desk" className="mt-6 inline-flex min-h-11 items-center text-sm text-forest">
          Back to today
        </Link>
      </Panel>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <aside>
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Operator board</p>
        <h1 className="mt-1 font-display text-3xl">Internal work.</h1>
        <p className="mt-2 text-sm text-muted">{pending.length} held for you. Nothing writes until you approve.</p>
        <ul className="mt-6 grid gap-6">
          {grouped.map(([stage, items]) => (
            <li key={stage}>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">{STAGE_NAME[stage as StageId] ?? stage}</p>
              <ul className="mt-2 grid gap-1">
                {items.map((item) => (
                  <li key={item.draft.id}>
                    <button
                      type="button"
                      onClick={() => setPicked(item.draft.id)}
                      className={cn(
                        "w-full rounded-md px-3 py-2 text-left",
                        current?.draft.id === item.draft.id ? "bg-cream shadow-(--shadow-card)" : "hover:bg-paper-2",
                      )}
                    >
                      <p className="text-xs text-faint">{DETECTOR_LABEL[item.signal.detector] ?? item.signal.detector}</p>
                      <p className="truncate text-sm">{item.signal.title}</p>
                      {item.signal.amount ? (
                        <p className="text-xs tabular-nums text-muted">{money(item.signal.amount)}</p>
                      ) : (
                        <p className="text-xs text-muted">{item.shopName}</p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </aside>
      {current ? (
        <ApprovalCard
          key={current.draft.id}
          draft={current.draft}
          signal={current.signal}
          paused={false}
          remaining={pending.length}
          onDecide={(status, body) => {
            const err = decide(current.draft.id, status, body);
            if (!err) {
              const next = pending.find((p) => p.draft.id !== current.draft.id);
              setPicked(next?.draft.id ?? null);
            }
            return err;
          }}
        />
      ) : null}
    </div>
  );
}
