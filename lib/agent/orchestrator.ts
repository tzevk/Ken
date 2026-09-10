import type { AgentMessage, AgentState, DataSourceMode, UserProfile } from "@/lib/types/finance";
import {
  benchmarkAgainstPeers,
  currentNetWorth,
  monthlySurplus,
  projectNetWorth,
  suggestGoals,
} from "@/lib/finance/calculators";
import { buildInsights } from "@/lib/finance/insights";
import { simulateLinkedTransactions, categoryBreakdownFromTransactions } from "@/lib/finance/transactions";
import { computeMilestones } from "@/lib/finance/calculators";
import { narrateStep } from "@/lib/agent/narrate";

function msg(step: AgentMessage["step"], text: string): AgentMessage {
  return {
    id: `${step}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: "agent",
    step,
    text,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Runs the deterministic six-step pipeline end to end. This is the source
 * of truth for every number in the product: STEP 1 profile is taken as
 * given, STEP 2 loads/simulates transaction data, STEP 3 suggests goals,
 * STEP 4 derives insights, STEP 5 projects the future and benchmarks
 * milestones. STEP 6 (live transaction feedback) runs separately, per
 * transaction, via lib/agent/tools.ts + the /api/agent/feedback route.
 *
 * Narration text is produced by lib/agent/narrate.ts, which calls Claude
 * when ANTHROPIC_API_KEY is configured and otherwise falls back to
 * templated copy grounded in the same computed numbers — the agent's
 * *reasoning and tool use* never depends on the LLM being available, only
 * the richness of its phrasing does.
 */
export async function runAgentPipeline(
  profile: UserProfile,
  dataMode: DataSourceMode,
  manualTransactions: AgentState["transactions"] = [],
): Promise<AgentState> {
  const messages: AgentMessage[] = [];

  messages.push(msg(1, `Profile captured for ${profile.name}. Income, expenses, and life-stage aspirations are in hand — moving to data.`));

  // STEP 2
  const linkedData =
    dataMode === "linked"
      ? simulateLinkedTransactions(profile)
      : dataMode === "manual"
        ? {
            mode: "manual" as const,
            transactions: manualTransactions,
            reconciliation: {
              statedMonthlyExpenses: 0,
              observedMonthlyExpenses: manualTransactions.reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0),
              deltaPercent: 0,
              note: "Manually entered data — no automated reconciliation performed.",
            },
          }
        : {
            mode: "skipped" as const,
            transactions: [],
            reconciliation: {
              statedMonthlyExpenses: 0,
              observedMonthlyExpenses: 0,
              deltaPercent: 0,
              note: "No transaction data connected — insights are based on your stated numbers only.",
            },
          };

  const transactions = linkedData.transactions;
  if (transactions.length) {
    const breakdown = categoryBreakdownFromTransactions(transactions);
    profile = { ...profile, expenses: { ...profile.expenses, categoryBreakdown: breakdown } };
  }

  const step2Text = await narrateStep(2, profile, { linkedData });
  messages.push(msg(2, step2Text));

  // STEP 3 — goals (computed before insights/benchmark so Step 4 narration can reference them)
  const goals = suggestGoals(profile);
  const step3Text = await narrateStep(3, profile, { goals });
  messages.push(msg(3, step3Text));

  // STEP 5 numbers computed before Step 4 narration so insights can cross-reference benchmark
  const benchmark = benchmarkAgainstPeers(profile);
  const surplus = Math.max(monthlySurplus(profile), 0);
  const projections = projectNetWorth(currentNetWorth(profile), surplus, 60);
  const milestones = computeMilestones(profile);

  // STEP 4 — insights
  const insights = buildInsights(profile, linkedData, benchmark);
  const step4Text = await narrateStep(4, profile, { insights });
  messages.push(msg(4, step4Text));

  // STEP 5 — projections & benchmarking narration
  const step5Text = await narrateStep(5, profile, { benchmark, milestones, projections });
  messages.push(msg(5, step5Text));

  messages.push(
    msg(
      6,
      "From here, every transaction you log gets checked against your budget in real time — I'll nudge you only when it's useful, and stay quiet otherwise.",
    ),
  );

  return {
    profile,
    linkedData,
    goals,
    selectedGoalIds: [],
    insights,
    projections,
    milestones,
    benchmark,
    transactions,
    alerts: [],
    messages,
    currentStep: 6,
  };
}
