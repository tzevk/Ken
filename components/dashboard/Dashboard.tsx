"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAgentStore, useAgentStoreHydrated } from "@/lib/store/agentStore";
import AgentFeed from "@/components/dashboard/AgentFeed";
import GoalsPanel from "@/components/dashboard/GoalsPanel";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import ProjectionChart from "@/components/dashboard/ProjectionChart";
import BenchmarkPanel from "@/components/dashboard/BenchmarkPanel";
import TransactionSimulator from "@/components/dashboard/TransactionSimulator";
import AgentChat from "@/components/dashboard/AgentChat";

export default function Dashboard() {
  const router = useRouter();
  const state = useAgentStore((s) => s.state);
  const reset = useAgentStore((s) => s.reset);
  const hydrated = useAgentStoreHydrated();

  useEffect(() => {
    if (hydrated && !state?.profile) router.replace("/onboard");
  }, [hydrated, state, router]);

  if (!hydrated || !state?.profile) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const { profile } = state;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
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
        <button
          onClick={() => {
            reset();
            router.push("/onboard");
          }}
          className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground/60 transition hover:bg-accent-soft"
        >
          Start over
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <GoalsPanel goals={state.goals} />
          <ProjectionChart projections={state.projections} milestones={state.milestones} />
          <div className="grid gap-6 sm:grid-cols-2">
            <InsightsPanel insights={state.insights} />
            <BenchmarkPanel benchmark={state.benchmark} />
          </div>
          <TransactionSimulator state={state} />
        </div>
        <div className="space-y-6">
          <AgentFeed messages={state.messages} />
          <AgentChat state={state} />
        </div>
      </div>

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
