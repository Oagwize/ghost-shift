import type { DetectorId, EngineDetectorId, ProductId, WorkProductId } from "./types";
import { CATALOG, catalogById, type CatalogEntry } from "./catalog";

export type Product = CatalogEntry;

export const PRODUCTS: Product[] = CATALOG;

export const ENGINE_LABEL: Record<EngineDetectorId, string> = {
  "account.buying_cue": "Buying cue",
  "recommendation.declined": "Declined expansion",
  "quote.unfollowed": "Quiet proposal",
  "invoice.aging": "Past due invoice",
  "payment.failed": "Failed payment",
  "appointment.no_next": "No next meeting",
  "contact.lapsed": "Quiet account",
  "membership.lapsing": "Renewal window",
  "review.absent": "No testimonial ask",
  "call.unanswered": "Unanswered inbound",
  "call.no_ask": "Answered, no ask",
  "enquiry.form": "Web form, no reply",
  "enquiry.chat": "Chat, no reply",
};

export const DETECTOR_LABEL: Record<DetectorId, string> = {
  ...ENGINE_LABEL,
  ...(Object.fromEntries(
    CATALOG.filter((p) => p.detectors[0]?.startsWith("work.")).map((p) => [p.detectors[0], p.name]),
  ) as Record<`work.${WorkProductId}`, string>),
};

export const ENGINE_DETECTORS: EngineDetectorId[] = Object.keys(ENGINE_LABEL) as EngineDetectorId[];
export const ALL_DETECTORS: DetectorId[] = Object.keys(DETECTOR_LABEL) as DetectorId[];

export const READ_ONLY_DETECTORS = new Set<DetectorId>(["call.no_ask"]);

export function shouldDraft(detector: DetectorId, products: ProductId[]): boolean {
  if (detector === "call.no_ask") return false;
  if (detector === "review.absent") return false;
  if (detector === "call.unanswered") return products.includes("missed");
  if (detector === "enquiry.form" || detector === "enquiry.chat") return products.includes("intake");
  if (detector.startsWith("work.")) return products.includes(detector.slice(5) as ProductId);
  return true;
}

export function channelLabel(channel: "email" | "sms" | "chat" | "none"): string {
  if (channel === "sms") return "Text";
  if (channel === "chat") return "Chat";
  if (channel === "none") return "Desk";
  return "Mail";
}

export function detectorsFor(productIds: ProductId[]): DetectorId[] {
  const set = new Set<DetectorId>();
  for (const id of productIds) {
    const p = catalogById(id);
    if (!p) continue;
    for (const d of p.detectors) set.add(d);
  }
  return [...set];
}

export function productForDetector(id: DetectorId): Product | undefined {
  return PRODUCTS.find((p) => p.detectors.includes(id));
}

export const FLAGSHIP: ProductId[] = ["ledger", "nurture", "missed", "intake", "afterhours", "cash", "mlott"];
