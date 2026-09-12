import type { Shop } from "./types";

export function workspaceNext(
  shop: Shop,
  waiting: number,
): { text: string; tone: "work" | "warn" | "danger" | "ok" } {
  if (shop.killed) {
    return { text: "Paused. Nothing runs until you resume it.", tone: "danger" };
  }
  if (!shop.baselineAt) {
    return { text: "Count first. No write access until a baseline exists.", tone: "warn" };
  }
  if (shop.connector.health === "not_connected") {
    return { text: "Connect the customer system, or import a CSV.", tone: "warn" };
  }
  if (shop.status === "onboarding") {
    return {
      text: waiting > 0 ? `${waiting} drafts waiting. Finish onboarding, then the rep sends.` : "Baseline is in. Turn on the first product.",
      tone: "work",
    };
  }
  if (waiting > 0) {
    return { text: `${waiting} waiting on ${shop.staffName}. Morning replies, missed-call texts, and inbound sit first.`, tone: "work" };
  }
  return { text: "Live. Queue is clear.", tone: "ok" };
}

export function actionLabel(action: string): string {
  const map: Record<string, string> = {
    seeded: "Loaded the sample",
    detectors_ran: "Refreshed the queue",
    expired: "Let a draft expire",
    sent_dry_run: "Approved (dry-run)",
    skipped: "Skipped a draft",
    approved: "Approved a draft",
    csv_imported: "Imported a CSV",
    connector_connected: "Connected a system",
    product_enabled: "Turned on a product",
    kill_switch: "Paused a workspace",
    resumed: "Resumed a workspace",
    baseline: "Took a baseline",
    audit_requested: "Asked for a report",
  };
  return map[action] ?? action.replaceAll("_", " ");
}
