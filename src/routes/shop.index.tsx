import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ApprovalCard } from "@/components/approval-card";
import { Panel } from "@/components/ui";
import { useDesk } from "@/lib/engine/store";
import { usePending } from "@/lib/engine/selectors";
import { money } from "@/lib/engine/ids";
import { DETECTOR_LABEL, channelLabel } from "@/lib/engine/products";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/shop/")({ component: ShopQueue });

type ChannelFilter = "all" | "morning" | "sms" | "chat" | "email" | "docs";

function ShopQueue() {
  const session = useDesk((s) => s.session);
  const shopId = session?.shopId;
  const shop = useDesk((s) => s.shops.find((x) => x.id === shopId));
  const decide = useDesk((s) => s.decide);
  const pending = usePending(shopId ?? "");
  const [filter, setFilter] = useState<ChannelFilter>("all");
  const [picked, setPicked] = useState<string | null>(null);
  const visible = useMemo(() => {
    if (filter === "all") return pending;
    if (filter === "morning") return pending.filter((x) => x.signal.detector === "work.afterhours");
    if (filter === "docs") return pending.filter((x) => x.draft.channel === "none");
    return pending.filter((x) => x.draft.channel === filter && x.signal.detector !== "work.afterhours");
  }, [pending, filter]);
  const current = visible.find((x) => x.draft.id === picked) ?? visible[0];
  const morning = pending.filter((x) => x.signal.detector === "work.afterhours").length;
  const texts = pending.filter((x) => x.draft.channel === "sms" && x.signal.detector !== "work.afterhours").length;
  const chats = pending.filter((x) => x.draft.channel === "chat" && x.signal.detector !== "work.afterhours").length;
  const mail = pending.filter((x) => x.draft.channel === "email" && x.signal.detector !== "work.afterhours").length;
  const docs = pending.filter((x) => x.draft.channel === "none").length;

  useEffect(() => {
    if (picked && !visible.some((v) => v.draft.id === picked)) setPicked(null);
  }, [visible, picked]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.tagName === "SELECT")) return;
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        decide(current.draft.id, "approved");
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        decide(current.draft.id, "skipped");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, decide]);

  if (!shop) return <p>No workspace selected.</p>;

  if (shop.connector.health === "not_connected" || !shop.baselineAt) {
    return (
      <Panel>
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Onboarding</p>
        <h1 className="mt-2 font-display text-3xl">{shop.name} is not live yet.</h1>
        <p className="mt-3 max-w-xl text-muted">
          Connect the source and take a baseline before the queue fills. Write access stays dry-run after that.
        </p>
        <Link
          to="/desk/$shopId"
          params={{ shopId: shop.id }}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-forest px-5 font-medium text-cream"
        >
          Finish onboarding in Mission Control
        </Link>
      </Panel>
    );
  }

  if (!pending.length) {
    return (
      <Panel>
        <h1 className="font-display text-3xl">Queue is clear.</h1>
        <p className="mt-3 max-w-xl text-muted">
          Nothing waiting for {shop.staffName}. Morning replies, missed-call texts, form and chat, and buying cues
          land here when detectors fire. The same entity will not appear twice in this window.
        </p>
        <Link to="/shop/batch" className="mt-6 inline-flex min-h-11 items-center text-sm text-forest">
          Review batch log
        </Link>
      </Panel>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">{shop.name} · one at a time</p>
            <h1 className="mt-1 font-display text-3xl">Approve, skip, or edit.</h1>
            {morning ? (
              <p className="mt-2 max-w-xl text-sm text-muted">
                Overnight inbound sits first. Classified. Held for morning. A person still sends.
              </p>
            ) : texts || chats ? (
              <p className="mt-2 max-w-xl text-sm text-muted">
                Missed calls sit first. Form and chat replies next, once they miss the window. A person still sends.
              </p>
            ) : null}
          </div>
          <Link to="/shop/batch" className="text-sm text-forest">
            Batch preview
          </Link>
        </div>
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          {(
            [
              ["all", `All · ${pending.length}`],
              ["morning", `Morning · ${morning}`],
              ["sms", `Texts · ${texts}`],
              ["chat", `Chat · ${chats}`],
              ["email", `Mail · ${mail}`],
              ["docs", `Desk · ${docs}`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setFilter(id);
                setPicked(null);
              }}
              className={cn(
                "min-h-11 rounded-md px-3",
                filter === id ? "bg-forest text-cream" : "border border-line bg-cream text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {current && visible.length > 1 ? (
          <label className="mb-4 block lg:hidden">
            <span className="text-xs font-medium tracking-wide text-muted uppercase">Jump to</span>
            <select
              className="mt-1 min-h-11 w-full rounded-md border border-line bg-cream px-3 text-sm"
              value={current.draft.id}
              onChange={(e) => setPicked(e.target.value)}
            >
              {visible.map((item) => (
                <option key={item.draft.id} value={item.draft.id}>
                  {DETECTOR_LABEL[item.signal.detector]} · {item.signal.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {current ? (
          <ApprovalCard
            key={current.draft.id}
            draft={current.draft}
            signal={current.signal}
            paused={shop.killed}
            remaining={visible.length}
            onDecide={(status, body) => {
              const err = decide(current.draft.id, status, body);
              if (!err) {
                const next = visible.find((p) => p.draft.id !== current.draft.id);
                setPicked(next?.draft.id ?? null);
              }
              return err;
            }}
          />
        ) : (
          <Panel>
            <p className="text-muted">Nothing in this filter. Switch back to All.</p>
          </Panel>
        )}
        <p className="mt-3 text-xs text-faint">Keys: A approve, S skip. Editing the draft stores both versions.</p>
      </div>
      <aside className="hidden lg:block">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Waiting · {visible.length}</p>
        <ul className="mt-3 grid max-h-[70vh] gap-1 overflow-y-auto pr-1">
          {visible.map((item) => (
            <li key={item.draft.id}>
              <button
                type="button"
                onClick={() => setPicked(item.draft.id)}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left",
                  current?.draft.id === item.draft.id ? "bg-cream p-3 shadow-(--shadow-card)" : "hover:bg-paper-2",
                )}
              >
                <p className="text-xs text-faint">
                  {channelLabel(item.draft.channel)} · {DETECTOR_LABEL[item.signal.detector]}
                </p>
                <p className="truncate text-sm">{item.signal.title}</p>
                {item.signal.amount ? (
                  <p className="text-xs tabular-nums text-muted">{money(item.signal.amount)}</p>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}