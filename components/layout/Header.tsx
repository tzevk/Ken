"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { useAgentStore, useAgentStoreHydrated } from "@/lib/store/agentStore";
import CustomizePanel from "@/components/layout/CustomizePanel";
import { Logo } from "@/components/ui/Logo";

export default function Header() {
  const pathname = usePathname();
  const hydrated = useAgentStoreHydrated();
  const hasProfile = useAgentStore((s) => !!s.state?.profile);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" aria-label="Vantage, home">
            <Logo className="text-base" />
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
              <Settings size={15} strokeWidth={2} aria-hidden />
            </button>
          </nav>
        </div>
      </header>
      <CustomizePanel open={customizeOpen} onClose={() => setCustomizeOpen(false)} />
    </>
  );
}
