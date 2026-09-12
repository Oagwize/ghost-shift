import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GapAudit } from "./gap-audit";

type AuditState = {
  items: GapAudit[];
  hydrated: boolean;
  save: (row: GapAudit) => void;
  markReviewed: (id: string) => void;
  reviewed: Record<string, string>;
  get: (id: string) => GapAudit | undefined;
};

export const useAudits = create<AuditState>()(
  persist(
    (set, get) => ({
      items: [],
      reviewed: {},
      hydrated: false,
      save: (row) => {
        const rest = get().items.filter((x) => x.id !== row.id);
        set({ items: [row, ...rest].slice(0, 20) });
      },
      markReviewed: (id) => {
        set({ reviewed: { ...get().reviewed, [id]: new Date().toISOString() } });
      },
      get: (id) => get().items.find((x) => x.id === id),
    }),
    {
      name: "ghost-shift-audit-v1",
      skipHydration: true,
      partialize: (s) => ({ items: s.items, reviewed: s.reviewed }),
    },
  ),
);
