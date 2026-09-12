import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import type { ShopStatus } from "@/lib/engine/types";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "outline" }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-[0.95rem] font-medium transition-opacity duration-(--motion-quick) disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" && "bg-forest text-cream hover:opacity-90",
        variant === "outline" && "border border-line bg-cream text-ink hover:bg-paper-2",
        variant === "ghost" && "text-ink hover:bg-paper-2",
        variant === "danger" && "bg-danger text-cream hover:opacity-90",
        className,
      )}
      {...props}
    />
  );
}

export function Pill({ status }: { status: ShopStatus | string }) {
  const label =
    status === "live"
      ? "Live"
      : status === "onboarding"
        ? "Onboarding"
        : status === "paused"
          ? "Paused"
          : status === "audit"
            ? "Audit only"
            : String(status).replaceAll("_", " ");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        status === "live" && "bg-forest/12 text-forest",
        status === "onboarding" && "bg-warn/12 text-warn",
        status === "paused" && "bg-danger/10 text-danger",
        status === "audit" && "bg-ink/8 text-muted",
        !["live", "onboarding", "paused", "audit"].includes(String(status)) && "bg-ink/8 text-muted",
      )}
    >
      {label}
    </span>
  );
}

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("rounded-xl bg-cream p-5 shadow-(--shadow-card) sm:p-6", className)} {...props} />;
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="min-h-11 w-full rounded-md border border-line bg-paper px-3 text-ink outline-none ring-forest/30 focus:ring-2"
      {...props}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-32 w-full rounded-md border border-line bg-paper px-3 py-2 text-ink outline-none ring-forest/30 focus:ring-2"
      {...props}
    />
  );
}

export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg bg-paper p-4">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-1 font-display text-2xl font-medium tabular-nums tracking-tight">{value}</p>
      {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
    </div>
  );
}
