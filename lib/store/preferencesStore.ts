"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const ACCENT_THEMES = [
  { id: "forest", label: "Forest", swatch: "#14532d" },
  { id: "midnight", label: "Midnight", swatch: "#1e3a6b" },
  { id: "plum", label: "Plum", swatch: "#6b1d3e" },
  { id: "clay", label: "Clay", swatch: "#9a3412" },
] as const;

export type AccentTheme = (typeof ACCENT_THEMES)[number]["id"];
export type ColorMode = "system" | "light" | "dark";

export const DASHBOARD_PANELS = [
  { id: "goals", label: "Goals" },
  { id: "projection", label: "Net worth projection" },
  { id: "insights", label: "Insights" },
  { id: "benchmark", label: "Peer benchmark" },
  { id: "simulator", label: "Transaction simulator" },
  { id: "feed", label: "Agent feed" },
  { id: "chat", label: "Ask the agent" },
] as const;

export type DashboardPanelId = (typeof DASHBOARD_PANELS)[number]["id"];

interface PreferencesStore {
  accent: AccentTheme;
  colorMode: ColorMode;
  hiddenPanels: DashboardPanelId[];
  compact: boolean;
  setAccent: (a: AccentTheme) => void;
  setColorMode: (m: ColorMode) => void;
  togglePanel: (id: DashboardPanelId) => void;
  setCompact: (v: boolean) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      accent: "forest",
      colorMode: "system",
      hiddenPanels: [],
      compact: false,
      setAccent: (a) => set({ accent: a }),
      setColorMode: (m) => set({ colorMode: m }),
      togglePanel: (id) => {
        const current = get().hiddenPanels;
        set({
          hiddenPanels: current.includes(id) ? current.filter((p) => p !== id) : [...current, id],
        });
      },
      setCompact: (v) => set({ compact: v }),
    }),
    { name: "ken-finance-agent-preferences" },
  ),
);
