import type { BudgetAlert, ExpenseCategory, Transaction, UserProfile } from "@/lib/types/finance";
import { EXPENSE_CATEGORIES } from "@/lib/types/finance";
import { categorySpend } from "@/lib/finance/calculators";

/** Rough monthly budget per category, derived from the user's stated expenses + benchmark medians. */
function categoryBudget(profile: UserProfile, category: ExpenseCategory, medianSharePercent: number): number {
  const income = profile.income.personalIncome + profile.income.familyIncome;
  return (income * medianSharePercent) / 100;
}

/**
 * STEP 6 — live feedback while making a transaction, based on budgets.
 * Given a new transaction and the last 30 days of history, decides
 * whether to nudge, warn, or praise, and returns a contextual message.
 */
export function evaluateTransaction(
  profile: UserProfile,
  newTxn: Transaction,
  history: Transaction[],
  categoryMedianShare: Record<string, number> | null,
): BudgetAlert | null {
  if (!(EXPENSE_CATEGORIES as readonly string[]).includes(newTxn.category)) return null;
  const category = newTxn.category as ExpenseCategory;

  const spentSoFar = categorySpend([...history, newTxn], category, 30);
  const medianShare = categoryMedianShare?.[category] ?? 8;
  const budget = categoryBudget(profile, category, medianShare);

  if (budget <= 0) return null;
  const utilization = spentSoFar / budget;

  if (utilization >= 1.15) {
    return {
      id: `alert-${newTxn.id}`,
      transactionId: newTxn.id,
      category,
      tone: "warning",
      message: `This ₹${newTxn.amount.toLocaleString("en-IN")} at ${newTxn.merchant} pushes ${category.replace("_", " ")} to ${Math.round(utilization * 100)}% of your usual monthly budget, with days still left in the month.`,
      suggestedAction: "Consider pausing discretionary spend in this category, or reallocating from a category running under budget this month.",
    };
  }
  if (utilization >= 0.9) {
    return {
      id: `alert-${newTxn.id}`,
      transactionId: newTxn.id,
      category,
      tone: "nudge",
      message: `Heads up, ${category.replace("_", " ")} is at ${Math.round(utilization * 100)}% of its typical monthly budget after this ₹${newTxn.amount.toLocaleString("en-IN")} transaction.`,
    };
  }
  if (utilization <= 0.5 && ["Eating_Out", "Entertainment", "Miscellaneous"].includes(category) && spentSoFar > 0) {
    return {
      id: `alert-${newTxn.id}`,
      transactionId: newTxn.id,
      category,
      tone: "praise",
      message: `Nice, ${category.replace("_", " ")} is still well within budget this month. Room to redirect some of this toward your goals if you want.`,
    };
  }
  return null;
}
