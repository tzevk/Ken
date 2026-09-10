"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAgentStore, useAgentStoreHydrated } from "@/lib/store/agentStore";
import { usePreferencesStore, type DashboardPanelId } from "@/lib/store/preferencesStore";
import { Stagger, StaggerItem, fadeUp } from "@/components/ui/motion";
import AgentFeed from "@/components/dashboard/AgentFeed";
import GoalsPanel from "@/components/dashboard/GoalsPanel";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import ProjectionChart from "@/components/dashboard/ProjectionChart";
import BenchmarkPanel from "@/components/dashboard/BenchmarkPanel";
import TransactionSimulator from "@/components/dashboard/TransactionSimulator";
import WhatIfSimulator from "@/components/dashboard/WhatIfSimulator";
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
    if (window.confirm("Start over? This clears your profile and everything you've simulated.")) {
      reset();
      router.push("/onboard");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="flex flex-wrap items-center justify-between gap-4"
      >
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
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/onboard"
              className="inline-block rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast transition hover:opacity-90"
            >
              Edit profile
            </Link>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartOver}
            className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground/60 transition hover:bg-accent-soft"
          >
            Start over
          </motion.button>
        </div>
      </motion.div>

      <Stagger className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {isVisible("goals") && (
            <StaggerItem>
              <GoalsPanel goals={state.goals} selectedGoalIds={state.selectedGoalIds} onTogglePin={toggleGoalSelection} />
            </StaggerItem>
          )}
          {isVisible("whatIf") && (
            <StaggerItem>
              <WhatIfSimulator profile={profile} />
            </StaggerItem>
          )}
          {isVisible("projection") && (
            <StaggerItem>
              <ProjectionChart projections={state.projections} milestones={state.milestones} />
            </StaggerItem>
          )}
          {(isVisible("insights") || isVisible("benchmark")) && (
            <StaggerItem className="grid gap-6 sm:grid-cols-2">
              {isVisible("insights") && <InsightsPanel insights={state.insights} />}
              {isVisible("benchmark") && <BenchmarkPanel benchmark={state.benchmark} />}
            </StaggerItem>
          )}
          {isVisible("simulator") && (
            <StaggerItem>
              <TransactionSimulator state={state} />
            </StaggerItem>
          )}
        </div>
        <div className="space-y-6">
          {isVisible("feed") && (
            <StaggerItem>
              <AgentFeed messages={state.messages} />
            </StaggerItem>
          )}
          {isVisible("chat") && (
            <StaggerItem>
              <AgentChat state={state} />
            </StaggerItem>
          )}
        </div>
      </Stagger>

      {hiddenPanels.length > 0 && (
        <p className="mt-6 text-center text-xs text-foreground/40">
          {hiddenPanels.length} panel{hiddenPanels.length > 1 ? "s" : ""} hidden. Toggle them back on from Customize.
        </p>
      )}

      <p className="mt-10 text-center text-xs text-foreground/40">
        Every figure here is computed deterministically from your inputs and a synthetic peer dataset, nothing is
        fabricated by a language model.
      </p>
    </main>
  );
}
