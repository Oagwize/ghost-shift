import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Panel } from "@/components/ui";
import { useDesk } from "@/lib/engine/store";
import { usePending } from "@/lib/engine/selectors";
import { money } from "@/lib/engine/ids";
import { DETECTOR_LABEL, channelLabel } from "@/lib/engine/products";

export const Route = createFileRoute("/shop/batch")({ component: Batch });

function Batch() {
  const session = useDesk((s) => s.session);
  const shopId = session?.shopId ?? "";
  const pending = usePending(shopId);
  const decideMany = useDesk((s) => s.decideMany);
  const [picked, setPicked] = useState<string[]>([]);

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <div className="grid gap-6">
      <div>
        <Link to="/shop" className="text-sm text-forest">
          Back to one-at-a-time
        </Link>
        <h1 className="mt-2 font-display text-3xl">Batch preview</h1>
        <p className="mt-2 max-w-xl text-muted">
          Per-item preview stays required. Select, then approve or skip. Each decision is logged with the body you saw.
        </p>
      </div>
      {pending.length === 0 ? (
        <Panel>
          <p>Nothing waiting.</p>
        </Panel>
      ) : (
        <>
          <ul className="grid gap-3">
            {pending.map((item) => (
              <li key={item.draft.id}>
                <label className="flex cursor-pointer gap-4 rounded-xl bg-cream p-4 shadow-(--shadow-card)">
                  <input
                    type="checkbox"
                    className="mt-1 size-5"
                    checked={picked.includes(item.draft.id)}
                    onChange={() => toggle(item.draft.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-faint">
                      {channelLabel(item.draft.channel)} · {DETECTOR_LABEL[item.signal.detector]}
                    </p>
                    <p className="font-medium">{item.signal.title}</p>
                    <p className="text-sm tabular-nums text-forest">{money(item.signal.amount)}</p>
                    <p className="mt-2 line-clamp-3 text-sm text-muted">{item.draft.body}</p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              disabled={!picked.length}
              onClick={() => {
                decideMany(picked, "approved");
                setPicked([]);
              }}
            >
              Approve selected
            </Button>
            <Button
              variant="outline"
              disabled={!picked.length}
              onClick={() => {
                decideMany(picked, "skipped");
                setPicked([]);
              }}
            >
              Skip selected
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
