import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDesk } from "./store";
import { PRODUCTS, READ_ONLY_DETECTORS } from "./products";
import { catalogById, productIdFromDetector } from "./catalog";
import { money } from "./ids";
import type { Audience, Draft, Signal } from "./types";

export function audienceOf(signal: Signal): Audience {
  const pid = productIdFromDetector(signal.detector);
  if (!pid) return "rep";
  return catalogById(pid)?.audience ?? "rep";
}

export function usePending(shopId: string, audience: Audience = "rep"): { draft: Draft; signal: Signal }[] {
  const drafts = useDesk((s) => s.drafts);
  const signals = useDesk((s) => s.signals);
  const decisions = useDesk((s) => s.decisions);
  return useMemo(() => {
    const decided = new Set(decisions.filter((d) => d.status !== "queued").map((d) => d.draftId));
    return drafts
      .filter((d) => d.shopId === shopId && !decided.has(d.id))
      .map((d) => ({ draft: d, signal: signals.find((x) => x.id === d.signalId)! }))
      .filter(
        (x) =>
          x.signal &&
          !x.signal.suppressed &&
          !READ_ONLY_DETECTORS.has(x.signal.detector) &&
          audienceOf(x.signal) === audience,
      )
      .sort((a, b) => {
        const ua = urgency(a);
        const ub = urgency(b);
        if (ua !== ub) return ua - ub;
        if (ua <= 2) return recencyMinutes(a.signal.evidence) - recencyMinutes(b.signal.evidence);
        return b.signal.amount - a.signal.amount;
      });
  }, [drafts, signals, decisions, shopId, audience]);
}

function urgency(item: { draft: Draft; signal: Signal }): number {
  if (item.signal.detector === "work.afterhours") return -1;
  if (item.draft.channel === "sms") return 0;
  if (item.draft.channel === "chat") return 1;
  if (item.signal.detector === "enquiry.form") return 2;
  if (item.draft.channel === "none") return 4;
  return 3;
}

function recencyMinutes(evidence: string): number {
  const min = evidence.match(/(\d+) minutes ago/);
  if (min) return Number(min[1]);
  const days = evidence.match(/Inbound (\d+) days ago/);
  if (days) return Number(days[1]) * 1440;
  return 999999;
}

export function useOperatorPending(): { shopId: string; shopName: string; draft: Draft; signal: Signal }[] {
  const shops = useDesk((s) => s.shops);
  const drafts = useDesk((s) => s.drafts);
  const signals = useDesk((s) => s.signals);
  const decisions = useDesk((s) => s.decisions);
  return useMemo(() => {
    const decided = new Set(decisions.filter((d) => d.status !== "queued").map((d) => d.draftId));
    const names = new Map(shops.map((s) => [s.id, s.name]));
    return drafts
      .filter((d) => !decided.has(d.id))
      .map((d) => ({
        shopId: d.shopId,
        shopName: names.get(d.shopId) ?? d.shopId,
        draft: d,
        signal: signals.find((x) => x.id === d.signalId)!,
      }))
      .filter(
        (x) => x.signal && !x.signal.suppressed && !READ_ONLY_DETECTORS.has(x.signal.detector) && audienceOf(x.signal) === "operator",
      )
      .sort((a, b) => b.signal.amount - a.signal.amount || a.signal.title.localeCompare(b.signal.title));
  }, [shops, drafts, signals, decisions]);
}

export function useLatestMeasure(shopId: string) {
  return useDesk((s) => {
    const list = s.measurements.filter((m) => m.shopId === shopId);
    let best = list[0];
    for (const m of list) {
      if (!best || m.at > best.at) best = m;
    }
    return best;
  });
}

export function useShopHours(shopId: string) {
  return useDesk((s) => s.hours.filter((h) => h.shopId === shopId).reduce((n, h) => n + h.minutes, 0) / 60);
}

export function useDeskMetrics() {
  return useDesk(
    useShallow((s) => {
      const live = s.shops.filter((x) => x.status === "live" || x.status === "paused" || x.status === "onboarding");
      const recovered: Record<string, number> = {};
      for (const m of s.measurements) {
        recovered[m.shopId] = Math.max(recovered[m.shopId] ?? 0, m.recoveredAttributed);
      }
      const recoveredTotal = Object.values(recovered).reduce((n, v) => n + v, 0);
      const hoursTotal = s.hours.reduce((n, h) => n + h.minutes, 0) / 60;
      const onboardingShops = s.shops.filter((x) => x.status === "onboarding");
      const onboardingHours =
        s.hours.filter((h) => onboardingShops.some((x) => x.id === h.shopId)).reduce((n, h) => n + h.minutes, 0) / 60;
      const thisMonth = new Date().toISOString().slice(0, 7);
      const audits = s.leads.filter((l) => l.at.startsWith(thisMonth)).length;
      const customers = Math.max(live.length, 1);
      return {
        onboardingHoursPer: onboardingHours / Math.max(onboardingShops.length, 1),
        recoveredPer: recoveredTotal / customers,
        operatorHoursPer: hoursTotal / customers,
        auditsThisMonth: audits,
        recoveredTotal,
        hoursTotal,
      };
    }),
  );
}

export function leakRows(shopId: string) {
  const s = useDesk.getState();
  const pending = s.signals.filter((x) => x.shopId === shopId && !x.suppressed);
  const decided = new Set(s.decisions.filter((d) => d.status === "sent_dry_run" || d.status === "skipped").map((d) => d.draftId));
  const open = pending.filter((sig) => {
    const draft = s.drafts.find((d) => d.signalId === sig.id);
    return !draft || !decided.has(draft.id);
  });
  const byDetector = new Map<string, { label: string; amount: number; count: number }>();
  for (const sig of open) {
    const product = PRODUCTS.find((p) => p.detectors.includes(sig.detector));
    const key = product?.id ?? sig.detector;
    const prev = byDetector.get(key) ?? { label: product?.name ?? sig.detector, amount: 0, count: 0 };
    prev.amount += sig.amount;
    prev.count += 1;
    byDetector.set(key, prev);
  }
  const rows = [...byDetector.values()].sort((a, b) => b.amount - a.amount);
  const total = rows.reduce((n, r) => n + r.amount, 0);
  return { rows, total, formatted: money(total) };
}

export function editRate(shopId: string) {
  const s = useDesk.getState();
  const dec = s.decisions.filter((d) => d.shopId === shopId && d.status === "sent_dry_run");
  if (!dec.length) return 0;
  return dec.filter((d) => d.editedBody).length / dec.length;
}
