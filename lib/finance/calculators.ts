import type {
  UserProfile,
  ProjectionPoint,
  Milestone,
  GoalOption,
  BenchmarkResult,
  Transaction,
  ExpenseCategory,
} from "@/lib/types/finance";
import { EXPENSE_CATEGORIES } from "@/lib/types/finance";
import { getBenchmarkBucket } from "@/lib/finance/dataset";

export function totalMonthlyIncome(p: UserProfile): number {
  return p.income.personalIncome + p.income.familyIncome / 3; // family income only partially attributable
}

export function totalMonthlyExpenses(p: UserProfile): number {
  return (
    p.expenses.familyExpenses +
    p.expenses.insurance +
    p.expenses.loanEmis +
    p.expenses.monthlyRecurringExpenses
  );
}

export function currentNetWorth(p: UserProfile): number {
  return p.income.currentSavings + p.income.inheritance + p.income.personalInvestments;
}

export function monthlySurplus(p: UserProfile): number {
  return totalMonthlyIncome(p) - totalMonthlyExpenses(p);
}

export function savingsRate(p: UserProfile): number {
  const income = totalMonthlyIncome(p);
  if (income <= 0) return 0;
  return (monthlySurplus(p) / income) * 100;
}

/** Standard EMI formula. */
export function emi(principal: number, annualRatePercent: number, months: number): number {
  const r = annualRatePercent / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/** Months needed to reach a target amount given a starting pool and monthly contribution, with growth. */
export function monthsToTarget(
  target: number,
  startingAmount: number,
  monthlyContribution: number,
  annualGrowthPercent = 8,
): number {
  const r = annualGrowthPercent / 12 / 100;
  let balance = startingAmount;
  let months = 0;
  const maxMonths = 600;
  while (balance < target && months < maxMonths) {
    balance = balance * (1 + r) + monthlyContribution;
    months++;
  }
  return months;
}

export function projectNetWorth(
  startingAmount: number,
  monthlyContribution: number,
  months: number,
  annualGrowthPercent = 8,
): ProjectionPoint[] {
  const r = annualGrowthPercent / 12 / 100;
  const points: ProjectionPoint[] = [];
  let balance = startingAmount;
  let cumulativeSavings = 0;
  for (let m = 0; m <= months; m++) {
    if (m > 0) {
      balance = balance * (1 + r) + monthlyContribution;
      cumulativeSavings += monthlyContribution;
    }
    const date = new Date();
    date.setMonth(date.getMonth() + m);
    points.push({
      monthIndex: m,
      label: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      netWorth: Math.round(balance),
      savings: Math.round(cumulativeSavings),
    });
  }
  return points;
}

/** STEP 3 — realistic, multi-option future goal suggestions grounded in the user's actual surplus. */
export function suggestGoals(p: UserProfile): GoalOption[] {
  const surplus = Math.max(monthlySurplus(p), 0);
  const netWorth = currentNetWorth(p);
  const goals: GoalOption[] = [];

  // Conservative: emergency fund first (6x expenses), regardless of aspirations
  const emergencyTarget = totalMonthlyExpenses(p) * 6;
  const emergencyCommit = Math.max(Math.round(surplus * 0.35), 1000);
  goals.push({
    id: "emergency-fund",
    title: "6-month emergency fund",
    description:
      "Before anything else, a liquid cushion covering half a year of expenses protects every other goal from a bad month.",
    monthlyCommitment: emergencyCommit,
    horizonMonths: monthsToTarget(emergencyTarget, netWorth * 0.3, emergencyCommit, 6),
    targetAmount: Math.round(emergencyTarget),
    feasibility: "conservative",
    basedOn: "6x your stated monthly recurring + family expenses",
  });

  // Balanced: tied to stated aspiration (house/car/family planning)
  if (p.aspirations.housePlanning === "renting-plan-to-buy") {
    const downPayment = totalMonthlyIncome(p) * 12 * 0.9; // rough 90% of annual income as down payment proxy
    const commit = Math.max(Math.round(surplus * 0.4), 2000);
    goals.push({
      id: "house-downpayment",
      title: "Home down payment fund",
      description:
        "You told us you're renting but planning to buy. This tracks a down-payment target sized to your income band, not a generic number.",
      monthlyCommitment: commit,
      horizonMonths: monthsToTarget(downPayment, netWorth * 0.2, commit, 9),
      targetAmount: Math.round(downPayment),
      feasibility: "balanced",
      basedOn: "aspirations: house planning = renting, plan to buy",
    });
  }
  if (p.aspirations.carPlanning === "planning-to-buy" || p.aspirations.carPlanning === "planning-to-upgrade") {
    const carTarget = totalMonthlyIncome(p) * 5;
    const commit = Math.max(Math.round(surplus * 0.25), 1500);
    goals.push({
      id: "car-fund",
      title: p.aspirations.carPlanning === "planning-to-buy" ? "First car fund" : "Car upgrade fund",
      description: "Sized against your income so the EMI afterwards stays under 15% of take-home pay.",
      monthlyCommitment: commit,
      horizonMonths: monthsToTarget(carTarget, netWorth * 0.1, commit, 6),
      targetAmount: Math.round(carTarget),
      feasibility: "balanced",
      basedOn: "aspirations: car planning",
    });
  }
  if (p.aspirations.familyPlanning === "planning-soon" || p.aspirations.familyPlanning === "planning-later") {
    const familyTarget = totalMonthlyExpenses(p) * 10;
    const commit = Math.max(Math.round(surplus * 0.3), 1500);
    goals.push({
      id: "family-planning-fund",
      title: "Family planning buffer",
      description: "Covers a income gap + medical costs around the life stage you flagged, without derailing other goals.",
      monthlyCommitment: commit,
      horizonMonths: monthsToTarget(familyTarget, netWorth * 0.15, commit, 6),
      targetAmount: Math.round(familyTarget),
      feasibility: "balanced",
      basedOn: "aspirations: family planning",
    });
  }

  // Ambitious: long-term wealth building using full surplus
  const wealthTarget = totalMonthlyIncome(p) * 12 * 15;
  const wealthCommit = Math.max(Math.round(surplus * 0.6), 2000);
  goals.push({
    id: "long-term-wealth",
    title: "Financial independence corpus",
    description:
      "If you committed most of your current surplus to long-term, diversified investing, here is a realistic (not aspirational) horizon.",
    monthlyCommitment: wealthCommit,
    horizonMonths: monthsToTarget(wealthTarget, netWorth, wealthCommit, 11),
    targetAmount: Math.round(wealthTarget),
    feasibility: "ambitious",
    basedOn: "full income/expense picture + long-term market growth assumption",
  });

  return goals;
}

/**
 * Milestones are evaluated against a long-horizon projection (up to 40
 * years) separate from whatever shorter window the chart displays, so a
 * distant goal doesn't silently collapse onto the chart's last visible
 * point. `beyondHorizon` flags a milestone that isn't reached even in 40
 * years, so the UI can say so honestly instead of showing a fake date.
 */
export function computeMilestones(p: UserProfile): Milestone[] {
  const surplus = Math.max(monthlySurplus(p), 0);
  const longProjection = projectNetWorth(currentNetWorth(p), surplus, 480);
  const milestones: Milestone[] = [
    { fraction: 0.25, label: "25% of the way to financial independence" },
    { fraction: 0.5, label: "Halfway to financial independence" },
    { fraction: 1.0, label: "Financial independence corpus reached" },
  ].map(({ fraction, label }, idx) => {
    const target = totalMonthlyIncome(p) * 12 * 15 * fraction;
    const point = longProjection.find((pt) => pt.netWorth >= target);
    const beyondHorizon = !point;
    return {
      id: `milestone-${idx}`,
      label,
      targetMonthIndex: point ? point.monthIndex : longProjection[longProjection.length - 1]?.monthIndex ?? 0,
      targetAmount: Math.round(target),
      status: surplus <= 0 ? "behind" : beyondHorizon ? "behind" : "on-track",
      beyondHorizon,
    } as Milestone;
  });
  return milestones;
}

export function benchmarkAgainstPeers(p: UserProfile): BenchmarkResult | null {
  const income = totalMonthlyIncome(p);
  const found = getBenchmarkBucket(income, p.cityTier);
  if (!found) return null;
  const { key, bucket } = found;
  const userRate = savingsRate(p);

  // crude percentile estimate via linear interpolation across p25/median/p75
  let percentile = 50;
  if (userRate <= bucket.savings_rate_p25) percentile = 25 * (userRate / Math.max(bucket.savings_rate_p25, 0.01));
  else if (userRate <= bucket.savings_rate_median) {
    const span = bucket.savings_rate_median - bucket.savings_rate_p25 || 1;
    percentile = 25 + (25 * (userRate - bucket.savings_rate_p25)) / span;
  } else if (userRate <= bucket.savings_rate_p75) {
    const span = bucket.savings_rate_p75 - bucket.savings_rate_median || 1;
    percentile = 50 + (25 * (userRate - bucket.savings_rate_median)) / span;
  } else {
    percentile = 75 + Math.min(25, (userRate - bucket.savings_rate_p75) * 1.5);
  }
  percentile = Math.max(1, Math.min(99, Math.round(percentile)));

  const categoryComparison = EXPENSE_CATEGORIES.map((category) => {
    const userAmount = p.expenses.categoryBreakdown?.[category] ?? 0;
    const userShare = income > 0 ? (userAmount / income) * 100 : 0;
    return {
      category,
      userSharePercent: Math.round(userShare * 10) / 10,
      peerMedianSharePercent: bucket.category_median_share[category] ?? 0,
    };
  }).filter((c) => c.userSharePercent > 0);

  return {
    bucketKey: key,
    peerCount: bucket.n,
    userSavingsRate: Math.round(userRate * 10) / 10,
    peerSavingsRateMedian: bucket.savings_rate_median,
    peerSavingsRateP25: bucket.savings_rate_p25,
    peerSavingsRateP75: bucket.savings_rate_p75,
    percentileEstimate: percentile,
    categoryComparison,
  };
}

export function categorySpend(transactions: Transaction[], category: ExpenseCategory, sinceDays = 30): number {
  const cutoff = Date.now() - sinceDays * 24 * 60 * 60 * 1000;
  return transactions
    .filter((t) => t.category === category && t.amount > 0 && new Date(t.date).getTime() >= cutoff)
    .reduce((sum, t) => sum + t.amount, 0);
}
