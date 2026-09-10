import type { AgentState, Transaction } from "@/lib/types/finance";
import {
  benchmarkAgainstPeers,
  currentNetWorth,
  monthlySurplus,
  projectNetWorth,
  savingsRate,
  suggestGoals,
  totalMonthlyExpenses,
  totalMonthlyIncome,
} from "@/lib/finance/calculators";
import { evaluateTransaction } from "@/lib/finance/alerts";
import { categorySpend } from "@/lib/finance/calculators";
import { getBenchmarkBucket } from "@/lib/finance/dataset";

/**
 * Tool surface the agent (Claude, in tool-use mode, or the deterministic
 * fallback planner) operates over. Every tool is a pure function reading
 * from AgentState — the LLM never computes financial figures itself, it
 * only decides which tool to call and how to phrase the result. This
 * keeps every number the user sees auditable and reproducible.
 */

export function toolGetFinancialSnapshot(state: AgentState) {
  const p = state.profile;
  if (!p) return { error: "No profile loaded yet." };
  return {
    monthlyIncome: Math.round(totalMonthlyIncome(p)),
    monthlyExpenses: Math.round(totalMonthlyExpenses(p)),
    monthlySurplus: Math.round(monthlySurplus(p)),
    savingsRatePercent: Math.round(savingsRate(p) * 10) / 10,
    currentNetWorth: Math.round(currentNetWorth(p)),
    dependents: p.dependents,
    occupation: p.occupation,
    cityTier: p.cityTier,
    aspirations: p.aspirations,
  };
}

export function toolGetBudgetStatus(state: AgentState, category?: string) {
  if (!state.profile) return { error: "No profile loaded yet." };
  const cats = category ? [category] : undefined;
  const bucket = getBenchmarkBucket(
    state.profile.income.personalIncome + state.profile.income.familyIncome,
    state.profile.cityTier,
  );
  const result: Record<string, { spentLast30d: number; peerMedianMonthly: number | null }> = {};
  const categories = cats ?? Object.keys(bucket?.bucket.category_median_share ?? {});
  for (const c of categories) {
    const spent = categorySpend(state.transactions, c as never, 30);
    const share = bucket?.bucket.category_median_share[c as never];
    const income = state.profile.income.personalIncome + state.profile.income.familyIncome;
    result[c] = {
      spentLast30d: Math.round(spent),
      peerMedianMonthly: share != null ? Math.round((income * share) / 100) : null,
    };
  }
  return result;
}

export function toolGetGoals(state: AgentState) {
  return state.goals.length ? state.goals : state.profile ? suggestGoals(state.profile) : [];
}

export function toolGetGoalProgress(state: AgentState, goalId: string) {
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) return { error: `No goal with id ${goalId}` };
  const netWorth = state.profile ? currentNetWorth(state.profile) : 0;
  const progressPercent = Math.min(100, Math.round((netWorth / goal.targetAmount) * 1000) / 10);
  return {
    goal,
    currentProgressPercent: progressPercent,
    monthsRemaining: goal.horizonMonths,
  };
}

export function toolGetInsights(state: AgentState) {
  return state.insights;
}

export function toolGetBenchmark(state: AgentState) {
  return state.benchmark ?? (state.profile ? benchmarkAgainstPeers(state.profile) : null);
}

export function toolGetProjection(state: AgentState, months = 24) {
  if (!state.profile) return { error: "No profile loaded yet." };
  const surplus = Math.max(monthlySurplus(state.profile), 0);
  return projectNetWorth(currentNetWorth(state.profile), surplus, months);
}

export function toolEvaluateTransaction(state: AgentState, txn: Transaction) {
  if (!state.profile) return { error: "No profile loaded yet." };
  const bucket = getBenchmarkBucket(
    state.profile.income.personalIncome + state.profile.income.familyIncome,
    state.profile.cityTier,
  );
  return evaluateTransaction(state.profile, txn, state.transactions, bucket?.bucket.category_median_share ?? null);
}

export function toolListRecentTransactions(state: AgentState, limit = 10) {
  return state.transactions.slice(0, limit);
}

/** Anthropic tool-use schema definitions mirroring the functions above. */
export const AGENT_TOOL_DEFINITIONS = [
  {
    name: "get_financial_snapshot",
    description:
      "Get the user's current income, expenses, surplus, savings rate, net worth, dependents, occupation, city tier, and stated life aspirations (Part 3 intake: family/house/car planning, mindset). Always call this first if unsure of the user's situation.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_budget_status",
    description:
      "Get last-30-day spend per category vs. the peer median monthly budget for that category, sized to the user's income and city tier.",
    input_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional single category to check, e.g. Eating_Out. Omit to get all categories.",
        },
      },
      required: [],
    },
  },
  {
    name: "get_goals",
    description: "Get the list of suggested future financial goals with target amounts, monthly commitments, and time horizons.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_goal_progress",
    description: "Get progress percentage and months remaining for a specific goal by id.",
    input_schema: {
      type: "object",
      properties: { goalId: { type: "string" } },
      required: ["goalId"],
    },
  },
  {
    name: "get_insights",
    description: "Get previously computed insights about the user's financial behaviour and patterns.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_benchmark",
    description: "Get how the user compares to synthetic peers with similar income/city tier: savings rate percentile and category-level comparison.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_projection",
    description: "Get a month-by-month net worth projection assuming current surplus continues, for N months (default 24).",
    input_schema: {
      type: "object",
      properties: { months: { type: "number" } },
      required: [],
    },
  },
  {
    name: "list_recent_transactions",
    description: "List the user's most recent linked/simulated transactions.",
    input_schema: {
      type: "object",
      properties: { limit: { type: "number" } },
      required: [],
    },
  },
] as const;

export function executeAgentTool(name: string, input: Record<string, unknown>, state: AgentState) {
  switch (name) {
    case "get_financial_snapshot":
      return toolGetFinancialSnapshot(state);
    case "get_budget_status":
      return toolGetBudgetStatus(state, input.category as string | undefined);
    case "get_goals":
      return toolGetGoals(state);
    case "get_goal_progress":
      return toolGetGoalProgress(state, input.goalId as string);
    case "get_insights":
      return toolGetInsights(state);
    case "get_benchmark":
      return toolGetBenchmark(state);
    case "get_projection":
      return toolGetProjection(state, (input.months as number) ?? 24);
    case "list_recent_transactions":
      return toolListRecentTransactions(state, (input.limit as number) ?? 10);
    default:
      return { error: `Unknown tool ${name}` };
  }
}
