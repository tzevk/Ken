import type { UserProfile } from "@/lib/types/finance";

export type LifeScenarioIcon = "raise" | "baby" | "move" | "freelance" | "shock" | "trim";

export interface LifeScenario {
  id: string;
  icon: LifeScenarioIcon;
  label: string;
  blurb: string;
  apply: (p: UserProfile) => UserProfile;
}

/**
 * Each scenario is a pure transform on a profile. Nothing here calls an
 * LLM or a server: it runs entirely client-side against the same
 * calculators that power the real dashboard, so flipping between "today"
 * and "what if" is instant, not a network round trip.
 */
export const LIFE_SCENARIOS: LifeScenario[] = [
  {
    id: "raise",
    icon: "raise",
    label: "I get a 20% raise",
    blurb: "A meaningful promotion or job switch bumps your take-home pay.",
    apply: (p) => ({
      ...p,
      income: { ...p.income, personalIncome: Math.round(p.income.personalIncome * 1.2) },
    }),
  },
  {
    id: "baby",
    icon: "baby",
    label: "We have a baby",
    blurb: "One more dependent, plus the recurring costs that come with it.",
    apply: (p) => ({
      ...p,
      dependents: p.dependents + 1,
      expenses: {
        ...p.expenses,
        monthlyRecurringExpenses: p.expenses.monthlyRecurringExpenses + 9000,
        insurance: p.expenses.insurance + 800,
      },
    }),
  },
  {
    id: "move",
    icon: "move",
    label: "I move to a bigger city",
    blurb: "Higher pay, but rent and everyday costs climb too.",
    apply: (p) => ({
      ...p,
      cityTier: "Tier_1",
      income: { ...p.income, personalIncome: Math.round(p.income.personalIncome * 1.15) },
      expenses: {
        ...p.expenses,
        monthlyRecurringExpenses: Math.round(p.expenses.monthlyRecurringExpenses * 1.3),
      },
    }),
  },
  {
    id: "freelance",
    icon: "freelance",
    label: "I go freelance",
    blurb: "More freedom, less predictable income while you build a client base.",
    apply: (p) => ({
      ...p,
      occupation: "Freelancer",
      income: { ...p.income, personalIncome: Math.round(p.income.personalIncome * 0.8) },
    }),
  },
  {
    id: "shock",
    icon: "shock",
    label: "An unexpected expense hits",
    blurb: "A medical bill, a repair, a family emergency. Three months of expenses, gone at once.",
    apply: (p) => ({
      ...p,
      income: {
        ...p.income,
        currentSavings: Math.max(0, p.income.currentSavings - 3 * monthlyExpensesOf(p)),
      },
    }),
  },
  {
    id: "trim",
    icon: "trim",
    label: "I cut discretionary spending 20%",
    blurb: "Eating out, subscriptions, the small stuff, trimmed on purpose.",
    apply: (p) => ({
      ...p,
      expenses: {
        ...p.expenses,
        monthlyRecurringExpenses: Math.round(p.expenses.monthlyRecurringExpenses * 0.8),
      },
    }),
  },
];

function monthlyExpensesOf(p: UserProfile): number {
  return p.expenses.familyExpenses + p.expenses.insurance + p.expenses.loanEmis + p.expenses.monthlyRecurringExpenses;
}

/** A continuous income-adjustment slider, expressed the same way as a scenario. */
export function applyIncomeShift(p: UserProfile, percent: number): UserProfile {
  return {
    ...p,
    income: { ...p.income, personalIncome: Math.round(p.income.personalIncome * (1 + percent / 100)) },
  };
}
