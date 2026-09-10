"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentState, BudgetAlert, Transaction } from "@/lib/types/finance";

interface AgentStore {
  state: AgentState | null;
  setState: (s: AgentState) => void;
  addTransaction: (t: Transaction, alert: BudgetAlert | null) => void;
  toggleGoalSelection: (goalId: string) => void;
  reset: () => void;
}

const emptyState: AgentState = {
  profile: null,
  linkedData: null,
  goals: [],
  selectedGoalIds: [],
  insights: [],
  projections: [],
  milestones: [],
  benchmark: null,
  transactions: [],
  alerts: [],
  messages: [],
  currentStep: 1,
};

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      state: null,
      setState: (s) => set({ state: s }),
      addTransaction: (t, alert) => {
        const current = get().state ?? emptyState;
        set({
          state: {
            ...current,
            transactions: [t, ...current.transactions],
            alerts: alert ? [alert, ...current.alerts] : current.alerts,
          },
        });
      },
      toggleGoalSelection: (goalId) => {
        const current = get().state;
        if (!current) return;
        const selected = current.selectedGoalIds.includes(goalId)
          ? current.selectedGoalIds.filter((id) => id !== goalId)
          : [...current.selectedGoalIds, goalId];
        set({ state: { ...current, selectedGoalIds: selected } });
      },
      reset: () => set({ state: null }),
    }),
    { name: "ken-finance-agent-store" },
  ),
);

/** SSR-safe hydration flag for the persisted store, without setState-in-effect. */
export function useAgentStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const unsub = useAgentStore.persist.onFinishHydration(onChange);
      return unsub;
    },
    () => useAgentStore.persist.hasHydrated(),
    () => false,
  );
}
