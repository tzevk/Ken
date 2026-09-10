"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAgentStore, useAgentStoreHydrated } from "@/lib/store/agentStore";
import CustomizePanel from "@/components/layout/CustomizePanel";

export default function Header() {
  const pathname = usePathname();
  const hydrated = useAgentStoreHydrated();
  const hasProfile = useAgentStore((s) => !!s.state?.profile);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-xs font-bold text-accent-contrast">
              V
            </span>
            Vantage
          </Link>

          <nav className="flex items-center gap-2">
            {hydrated && hasProfile && pathname !== "/dashboard" && (
              <Link
                href="/dashboard"
                className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-foreground/70 transition hover:bg-accent-soft sm:inline-block"
              >
                Dashboard
              </Link>
            )}
            {pathname === "/" && (
              <Link
                href="/onboard"
                className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-contrast transition hover:opacity-90"
              >
                {hydrated && hasProfile ? "Resume" : "Get started"}
              </Link>
            )}
            <button
              onClick={() => setCustomizeOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground/60 transition hover:bg-accent-soft hover:text-foreground"
              aria-label="Customize appearance"
              title="Customize"
            >
              <GearIcon />
            </button>
          </nav>
        </div>
      </header>
      <CustomizePanel open={customizeOpen} onClose={() => setCustomizeOpen(false)} />
    </>
  );
}

function GearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
