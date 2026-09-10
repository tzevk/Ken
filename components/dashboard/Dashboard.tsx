"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAgentStore, useAgentStoreHydrated } from "@/lib/store/agentStore";
import { usePreferencesStore, type DashboardPanelId } from "@/lib/store/preferencesStore";
import AgentFeed from "@/components/dashboard/AgentFeed";
import GoalsPanel from "@/components/dashboard/GoalsPanel";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import ProjectionChart from "@/components/dashboard/ProjectionChart";
import BenchmarkPanel from "@/components/dashboard/BenchmarkPanel";
import TransactionSimulator from "@/components/dashboard/TransactionSimulator";
import AgentChat from "@/components/dashboard/AgentChat";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function Dashboard() {
  const router = useRouter();
  const state = useAgentStore((s) => s.state);
  const reset = useAgentStore((s) => s.reset);
  const toggleGoalSelection = useAgentStore((s) => s.toggleGoalSelection);
  const hydrated = useAgentStoreHydrated();
  const hiddenPanels = usePreferencesStore((s) => s.hiddenPanels);

  useEffect(() => {
    if (hydrated && !state?.profile) router.replace("/onboard");
  }, [hydrated, state, router]);

  if (!hydrated || !state?.profile) {
    return <DashboardSkeleton />;
  }

  const { profile } = state;
  const isVisible = (id: DashboardPanelId) => !hiddenPanels.includes(id);

  function handleStartOver() {
    if (window.confirm("Start over? This clears your profile and all simulated activity.")) {
      reset();
      router.push("/onboard");
    }
  }

  return (
    <main className="page-enter mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-accent">Your agent</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {profile.name}&apos;s financial picture
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            {profile.occupation} · {profile.cityTier.replace("_", " ")} · {profile.dependents} dependents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/onboard"
            className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast transition hover:opacity-90"
          >
            Edit profile
          </Link>
          <button
            onClick={handleStartOver}
            className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground/60 transition hover:bg-accent-soft"
          >
            Start over
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {isVisible("goals") && (
            <GoalsPanel goals={state.goals} selectedGoalIds={state.selectedGoalIds} onTogglePin={toggleGoalSelection} />
          )}
          {isVisible("projection") && <ProjectionChart projections={state.projections} milestones={state.milestones} />}
          {(isVisible("insights") || isVisible("benchmark")) && (
            <div className="grid gap-6 sm:grid-cols-2">
              {isVisible("insights") && <InsightsPanel insights={state.insights} />}
              {isVisible("benchmark") && <BenchmarkPanel benchmark={state.benchmark} />}
            </div>
          )}
          {isVisible("simulator") && <TransactionSimulator state={state} />}
        </div>
        <div className="space-y-6">
          {isVisible("feed") && <AgentFeed messages={state.messages} />}
          {isVisible("chat") && <AgentChat state={state} />}
        </div>
      </div>

      {hiddenPanels.length > 0 && (
        <p className="mt-6 text-center text-xs text-foreground/40">
          {hiddenPanels.length} panel{hiddenPanels.length > 1 ? "s" : ""} hidden — toggle them back on from Customize.
        </p>
      )}

      <p className="mt-10 text-center text-xs text-foreground/40">
        Built for{" "}
        <Link href="/" className="underline underline-offset-2">
          The Ken Case Competition 2026
        </Link>
        . All figures are computed deterministically from your inputs and a synthetic peer dataset — nothing here
        is fabricated by a language model.
      </p>
    </main>
  );
}
