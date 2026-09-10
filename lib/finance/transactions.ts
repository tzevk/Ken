import type { ExpenseCategory, LinkedDataResult, Transaction, UserProfile } from "@/lib/types/finance";
import { EXPENSE_CATEGORIES } from "@/lib/types/finance";
import { findNearestPeers, type SyntheticProfile } from "@/lib/finance/dataset";
import { totalMonthlyExpenses } from "@/lib/finance/calculators";

const MERCHANTS: Record<ExpenseCategory, string[]> = {
  Rent: ["NoBroker Rent Pay", "Landlord NEFT"],
  Loan_Repayment: ["HDFC Loan EMI", "Bajaj Finserv EMI"],
  Insurance: ["LIC Premium", "HDFC Ergo", "Star Health"],
  Groceries: ["BigBasket", "Zepto", "DMart", "Blinkit"],
  Transport: ["Uber", "Ola", "Rapido", "IOCL Petrol Pump", "Metro Card Recharge"],
  Eating_Out: ["Swiggy", "Zomato", "Starbucks", "Local Cafe"],
  Entertainment: ["Netflix", "BookMyShow", "Spotify", "PVR Cinemas"],
  Utilities: ["BESCOM Electricity", "Airtel Broadband", "Jio Recharge", "Water Board"],
  Healthcare: ["Apollo Pharmacy", "Practo Consult", "Diagnostics Lab"],
  Education: ["Byju's", "Udemy", "School Fee Payment"],
  Miscellaneous: ["Amazon", "Flipkart", "Myntra", "ATM Withdrawal"],
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * STEP 2 — simulates linking bank/card data. Rather than fabricating
 * arbitrary numbers, this samples the category-wise spend pattern of the
 * user's nearest peers in the synthetic Kaggle-schema dataset and
 * generates a 90-day transaction feed consistent with those ratios,
 * scaled to the user's own stated income. This mirrors what an Account
 * Aggregator (AA) pull would surface, without needing real bank
 * credentials for a demo/judging environment.
 */
export function simulateLinkedTransactions(profile: UserProfile): LinkedDataResult {
  const peers = findNearestPeers({
    income: profile.income.personalIncome + profile.income.familyIncome,
    occupation: profile.occupation,
    cityTier: profile.cityTier,
    count: 6,
  });

  const rand = seededRandom(profile.income.personalIncome + profile.age);
  const transactions: Transaction[] = [];
  const today = new Date();

  const avgCategoryShare: Record<string, number> = {};
  for (const cat of EXPENSE_CATEGORIES) {
    const shares = peers.map((p: SyntheticProfile) => Number(p[cat] ?? 0) / Math.max(Number(p.Income), 1));
    avgCategoryShare[cat] = shares.reduce((a, b) => a + b, 0) / Math.max(shares.length, 1);
  }
  // Peer averages are drawn from a small nearest-neighbour sample and can compound above
  // a realistic total expense-to-income ratio. Clamp the total (preserving each category's
  // relative weight) so the simulated feed stays plausible while still able to diverge from
  // the user's own estimate — that divergence is the point of the Step 2 reconciliation check.
  const totalShare = Object.values(avgCategoryShare).reduce((a, b) => a + b, 0);
  const maxPlausibleShare = 0.55 + rand() * 0.4; // 55%-95% of income
  if (totalShare > maxPlausibleShare) {
    const scale = maxPlausibleShare / totalShare;
    for (const cat of EXPENSE_CATEGORIES) avgCategoryShare[cat] *= scale;
  }

  const userMonthlyIncome = profile.income.personalIncome + profile.income.familyIncome;

  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    for (const category of EXPENSE_CATEGORIES) {
      const monthlyBudget = userMonthlyIncome * avgCategoryShare[category];
      if (monthlyBudget <= 0) continue;
      // Rent/EMI/Insurance: one transaction near month start. Others: several small transactions.
      const isFixed = category === "Rent" || category === "Loan_Repayment" || category === "Insurance";
      if (isFixed) {
        if (date.getDate() === 1) {
          const merchants = MERCHANTS[category];
          transactions.push({
            id: `${category}-${date.toISOString()}`,
            date: date.toISOString(),
            category,
            merchant: merchants[Math.floor(rand() * merchants.length)],
            amount: Math.round(monthlyBudget),
            source: "bank",
          });
        }
        continue;
      }
      const dailyChance = 0.18 + rand() * 0.12;
      if (rand() < dailyChance) {
        const merchants = MERCHANTS[category];
        const txnCountPerMonthApprox = 10;
        const amount = Math.max(50, Math.round((monthlyBudget / txnCountPerMonthApprox) * (0.4 + rand() * 1.4)));
        transactions.push({
          id: `${category}-${date.toISOString()}-${Math.floor(rand() * 1e6)}`,
          date: date.toISOString(),
          category,
          merchant: merchants[Math.floor(rand() * merchants.length)],
          amount,
          source: "card",
        });
      }
    }
  }

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const observedMonthly = transactions
    .filter((t) => new Date(t.date).getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000)
    .reduce((sum, t) => sum + t.amount, 0);
  const stated = totalMonthlyExpenses(profile);
  const deltaPercent = stated > 0 ? Math.round(((observedMonthly - stated) / stated) * 1000) / 10 : 0;

  return {
    mode: "linked",
    transactions,
    reconciliation: {
      statedMonthlyExpenses: Math.round(stated),
      observedMonthlyExpenses: Math.round(observedMonthly),
      deltaPercent,
      note:
        Math.abs(deltaPercent) < 8
          ? "What you told us roughly matches what your accounts show. Good self-awareness."
          : deltaPercent > 0
            ? "Your accounts show meaningfully more spending than you estimated. A common blind spot, not a judgment."
            : "Your accounts show less spending than you estimated. You may be over-budgeting out of caution.",
    },
  };
}

export function categoryBreakdownFromTransactions(transactions: Transaction[]): Partial<Record<ExpenseCategory, number>> {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const breakdown: Partial<Record<ExpenseCategory, number>> = {};
  for (const t of transactions) {
    if (new Date(t.date).getTime() < cutoff) continue;
    if (!(EXPENSE_CATEGORIES as readonly string[]).includes(t.category)) continue;
    const cat = t.category as ExpenseCategory;
    breakdown[cat] = (breakdown[cat] ?? 0) + t.amount;
  }
  return breakdown;
}
