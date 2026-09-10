"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/lib/store/preferencesStore";

/** Keeps <html data-accent data-theme> in sync with the preferences store after mount. */
export default function ThemeSync() {
  const accent = usePreferencesStore((s) => s.accent);
  const colorMode = usePreferencesStore((s) => s.colorMode);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    function apply() {
      const resolved = colorMode === "system" ? (mql.matches ? "dark" : "light") : colorMode;
      root.setAttribute("data-theme", resolved);
    }
    apply();

    if (colorMode === "system") {
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
  }, [colorMode]);

  return null;
}
