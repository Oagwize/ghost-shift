import { useEffect, useState } from "react";
import { Button, Pill, Panel, Textarea } from "@/components/ui";
import { money } from "@/lib/engine/ids";
import { validateDraft } from "@/lib/engine/detectors";
import { channelLabel, DETECTOR_LABEL } from "@/lib/engine/products";
import { cn } from "@/lib/cn";
import type { Draft, Signal } from "@/lib/engine/types";

export function ApprovalCard({
  draft,
  signal,
  paused,
  remaining,
  onDecide,
}: {
  draft: Draft;
  signal: Signal;
  paused: boolean;
  remaining: number;
  onDecide: (status: "approved" | "skipped", body?: string) => string | null;
}) {
  const [body, setBody] = useState(draft.body);
  const [error, setError] = useState<string | null>(null);
  const sms = draft.channel === "sms";
  const chat = draft.channel === "chat";
  const form = signal.detector === "enquiry.form";
  const night = signal.detector === "work.afterhours";
  const desk = draft.channel === "none";
  const errors = validateDraft(body, signal.evidence, draft.channel);
  const edited = body !== draft.body;
  const phone =
    signal.evidence.match(/Number ([0-9+().\-\s]+)/)?.[1]?.trim() ??
    (sms && /[0-9]{3}/.test(signal.source) && !/[a-z]/i.test(signal.source) ? signal.source : null);
  const email = signal.evidence.match(/Email (\S+)\./)?.[1] ?? (form ? signal.source : null);
  const asked = signal.evidence.match(/Asked: (.+)\. Owner /)?.[1] ?? null;
  const classified = signal.evidence.match(/Classified as ([^.]+)/)?.[1] ?? null;
  const maxChars = sms ? 320 : chat ? 500 : null;
  const approveLabel = desk ? "Approve" : sms ? "Approve text" : chat ? "Approve reply" : "Approve";
  const draftLabel = night
    ? "Morning reply, in the rep's voice"
    : sms
      ? "Drafted text, in the rep's voice"
      : chat
        ? "Chat reply, in the rep's voice"
        : form
          ? "Reply to the form, in the rep's voice"
          : desk
            ? "Internal note, held for a person"
            : "Draft in the rep's voice";
  const holdLine = night
    ? "Overnight inbound, held for morning. Nothing leaves until you approve. This preview is dry-run only."
    : sms
      ? "Text, held for you to send. Nothing leaves until you approve. This preview is dry-run only."
      : chat
        ? "Chat reply, held for you to send. Nothing leaves until you approve. This preview is dry-run only."
        : form
          ? "Reply to the form, held for you to send. Nothing leaves until you approve. This preview is dry-run only."
          : desk
            ? "Internal. Nothing writes to the customer system until a live adapter is on. This preview is dry-run only."
            : "Source " + signal.source + ". Nothing sends until you approve. This preview is dry-run only.";

  useEffect(() => {
    setBody(draft.body);
    setError(null);
  }, [draft.id, draft.body]);

  return (
    <Panel className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill status={DETECTOR_LABEL[signal.detector] ?? signal.detector} />
          {sms || chat || desk ? <Pill status={channelLabel(draft.channel)} /> : null}
          {classified ? <Pill status={classified} /> : null}
          {night ? <Pill status="Morning" /> : null}
          <span className="text-xs text-muted tabular-nums">{remaining} waiting</span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-medium tracking-tight">{signal.title}</h2>
        <p className="mt-1 font-display text-xl tabular-nums text-forest">{money(signal.amount)}</p>
        {sms && phone ? (
          <p className="mt-3 text-sm">
            To <span className="font-mono tabular-nums">{phone}</span>
          </p>
        ) : null}
        {form && email ? (
          <p className="mt-3 text-sm">
            To <span className="font-mono text-sm">{email}</span>
          </p>
        ) : null}
        {asked ? (
          <blockquote className="mt-4 border-l-2 border-forest/40 pl-3 text-sm leading-relaxed">
            {asked}
          </blockquote>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-muted">{signal.evidence}</p>
        )}
        {asked ? <p className="mt-3 text-sm leading-relaxed text-muted">{signal.evidence}</p> : null}
        <p className="mt-3 text-xs text-faint">{holdLine}</p>
      </div>
      <div>
        <p className="text-xs font-medium tracking-wide text-muted uppercase">{draftLabel}</p>
        <Textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setError(null);
          }}
          className={cn("mt-2 font-sans", sms || chat ? "min-h-32" : "min-h-48")}
        />
        {maxChars ? (
          <p className={cn("mt-1 text-xs tabular-nums", body.length > maxChars ? "text-danger" : "text-muted")}>
            {body.length} / {maxChars}
          </p>
        ) : null}
        {edited ? <p className="mt-1 text-xs text-muted">Your edit is stored with the decision.</p> : null}
        {errors.length ? (
          <ul className="mt-2 grid gap-1 text-sm text-danger">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        ) : null}
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1"
            disabled={paused || errors.length > 0}
            onClick={() => setError(onDecide("approved", edited ? body : undefined))}
          >
            {approveLabel} <span className="text-xs opacity-70">A</span>
          </Button>
          <Button variant="outline" className="flex-1" disabled={paused} onClick={() => setError(onDecide("skipped"))}>
            Skip <span className="text-xs opacity-70">S</span>
          </Button>
        </div>
        {paused ? (
          <p className="mt-3 text-sm text-danger">
            This workspace is paused. Mission Control has to resume it before anything can move.
          </p>
        ) : null}
      </div>
    </Panel>
  );
}
