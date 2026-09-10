import type { BenchmarkResult, Insight, LinkedDataResult, UserProfile } from "@/lib/types/finance";
import { monthlySurplus, savingsRate, totalMonthlyIncome } from "@/lib/finance/calculators";

/** STEP 4 — insights from previous data (stated profile + observed transactions + peer benchmark). */
export function buildInsights(
  profile: UserProfile,
  linked: LinkedDataResult | null,
  benchmark: BenchmarkResult | null,
): Insight[] {
  const insights: Insight[] = [];
  const rate = savingsRate(profile);
  const surplus = monthlySurplus(profile);

  insights.push({
    id: "surplus-summary",
    headline:
      surplus >= 0
        ? `You have roughly ₹${Math.round(surplus).toLocaleString("en-IN")} of monthly surplus`
        : `You're running a monthly shortfall of ₹${Math.round(Math.abs(surplus)).toLocaleString("en-IN")}`,
    detail:
      surplus >= 0
        ? `That's a ${rate.toFixed(1)}% savings rate on ~₹${Math.round(totalMonthlyIncome(profile)).toLocaleString("en-IN")} of monthly income.`
        : "Expenses are currently outpacing income. This isn't a moral failure, it's the first thing to fix before any goal-setting.",
    severity: surplus >= 0 ? "positive" : "alert",
    metric: { label: "Savings rate", value: `${rate.toFixed(1)}%` },
  });

  if (linked) {
    const { statedMonthlyExpenses, observedMonthlyExpenses, deltaPercent } = linked.reconciliation;
    if (Math.abs(deltaPercent) >= 8) {
      insights.push({
        id: "reconciliation-gap",
        headline:
          deltaPercent > 0
            ? "Your accounts show more spending than you estimated"
            : "Your accounts show less spending than you estimated",
        detail: `You estimated ₹${statedMonthlyExpenses.toLocaleString("en-IN")}/month; linked data shows ₹${observedMonthlyExpenses.toLocaleString("en-IN")}/month (${deltaPercent > 0 ? "+" : ""}${deltaPercent}%). ${linked.reconciliation.note}`,
        severity: Math.abs(deltaPercent) > 20 ? "alert" : "watch",
      });
    } else {
      insights.push({
        id: "reconciliation-match",
        headline: "Your self-estimate closely matches your actual spending",
        detail: "That's a strong signal of financial self-awareness. Most people we've spoken to are off by 15-30%.",
        severity: "positive",
      });
    }
  }

  if (benchmark) {
    insights.push({
      id: "peer-position",
      headline: `You save more than roughly ${benchmark.percentileEstimate}% of similar earners`,
      detail: `Among ${benchmark.peerCount.toLocaleString("en-IN")} peers with a similar income and location profile, the median savings rate is ${benchmark.peerSavingsRateMedian}%. You're at ${benchmark.userSavingsRate}%.`,
      severity: benchmark.percentileEstimate >= 50 ? "positive" : "watch",
    });

    const worstCategory = [...benchmark.categoryComparison].sort(
      (a, b) => b.userSharePercent - b.peerMedianSharePercent - (a.userSharePercent - a.peerMedianSharePercent),
    )[0];
    if (worstCategory && worstCategory.userSharePercent > worstCategory.peerMedianSharePercent * 1.25) {
      insights.push({
        id: `category-overspend-${worstCategory.category}`,
        headline: `${worstCategory.category.replace("_", " ")} is your biggest outlier vs. peers`,
        detail: `You spend ${worstCategory.userSharePercent}% of income here vs. a peer median of ${worstCategory.peerMedianSharePercent}%.`,
        severity: "watch",
      });
    }
  }

  // Life-stage aware insight from Part 3 (aspirations) — the "understand the person" thesis.
  if (profile.aspirations.familyPlanning === "planning-soon" && rate < 15) {
    insights.push({
      id: "family-readiness",
      headline: "Your savings rate may be tight for the family plans you mentioned",
      detail:
        "You told us you're planning a family soon, but your current savings rate is under 15%. This is exactly the kind of mismatch between numbers and life stage that generic advice misses.",
      severity: "watch",
    });
  }

  if (profile.dependents > 0 && profile.expenses.insurance === 0) {
    insights.push({
      id: "insurance-gap",
      headline: "No insurance premium in your expense picture, despite dependents",
      detail: "With dependents relying on your income, even a basic term and health cover materially changes downside risk, independent of how much you save.",
      severity: "alert",
    });
  }

  return insights;
}
