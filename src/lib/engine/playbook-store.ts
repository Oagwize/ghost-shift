import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlaybookAnswers } from "./playbook";
import { INBOUND_ANSWERS, SEED_PLAYBOOK_ID } from "./playbook";

export type SavedPlaybook = {
  id: string;
  createdAt: string;
  answers: PlaybookAnswers;
  reviewedAt?: string;
  phrasing?: {
    opportunities: string[];
    roadmapLead: string;
    at: string;
  };
};

type PlaybookState = {
  items: SavedPlaybook[];
  hydrated: boolean;
  save: (row: SavedPlaybook) => void;
  setPhrasing: (id: string, phrasing: NonNullable<SavedPlaybook["phrasing"]>) => void;
  markReviewed: (id: string) => void;
  ensureSeed: () => void;
  get: (id: string) => SavedPlaybook | undefined;
};

export const usePlaybooks = create<PlaybookState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      save: (row) => {
        const existing = get().items.find((x) => x.id === row.id);
        const rest = get().items.filter((x) => x.id !== row.id);
        set({
          items: [
            {
              ...row,
              phrasing: row.phrasing ?? existing?.phrasing,
              reviewedAt: row.reviewedAt ?? existing?.reviewedAt,
            },
            ...rest,
          ].slice(0, 20),
        });
      },
      setPhrasing: (id, phrasing) => {
        set({
          items: get().items.map((x) => (x.id === id ? { ...x, phrasing } : x)),
        });
      },
      markReviewed: (id) => {
        set({
          items: get().items.map((x) => (x.id === id ? { ...x, reviewedAt: new Date().toISOString() } : x)),
        });
      },
      ensureSeed: () => {
        if (get().items.some((x) => x.id === SEED_PLAYBOOK_ID)) return;
        const createdAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        set({
          items: [
            { id: SEED_PLAYBOOK_ID, createdAt, answers: INBOUND_ANSWERS },
            ...get().items,
          ].slice(0, 20),
        });
      },
      get: (id) => get().items.find((x) => x.id === id),
    }),
    {
      name: "ghost-shift-playbook-v1",
      skipHydration: true,
      partialize: (s) => ({ items: s.items }),
    },
  ),
);
