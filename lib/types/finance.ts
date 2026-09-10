// Core domain types for the agent. Mirrors the six-step flow from the
// founder's working notes: understand -> load data -> project goals ->
// surface insights -> benchmark milestones -> live nudge on transactions.

export type Occupation =
  | "Salaried"
  | "Self-Employed"
  | "Business Owner"
  | "Freelancer"
  | "Student"
  | "Retired";

export type CityTier = "Tier_1" | "Tier_2" | "Tier_3";

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Loan_Repayment",
  "Insurance",
  "Groceries",
  "Transport",
  "Eating_Out",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Education",
  "Miscellaneous",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

// ---- STEP 1: Understanding current financial level ----

/** Part 1 — Income */
export interface IncomeProfile {
  familyIncome: number;
  personalIncome: number;
  currentSavings: number;
  inheritance: number;
  personalInvestments: number;
}

/** Part 2 — Expenses */
export interface ExpenseProfile {
  familyExpenses: number;
  insurance: number;
  loanEmis: number;
  monthlyRecurringExpenses: number;
  categoryBreakdown?: Partial<Record<ExpenseCategory, number>>;
}

/** Part 3 — instead of asking for a number: mindset, plans, aspirations */
export interface AspirationProfile {
  futurePlansNote: string;
  currentMindset:
    | "cautious-saver"
    | "balanced"
    | "growth-seeking"
    | "avoidant"
    | "unsure";
  familyPlanning: "not-applicable" | "planning-soon" | "planning-later" | "have-dependents";
  housePlanning: "own-no-plans" | "renting-plan-to-buy" | "own-and-upgrading" | "not-a-priority";
  carPlanning: "none" | "planning-to-buy" | "planning-to-upgrade" | "own-outright";
  otherAspirations: string;
}

export interface UserProfile {
  name: string;
  age: number;
  dependents: number;
  occupation: Occupation;
  cityTier: CityTier;
  income: IncomeProfile;
  expenses: ExpenseProfile;
  aspirations: AspirationProfile;
  createdAt: string;
}

// ---- STEP 2: Loading financial data ----

export type DataSourceMode = "linked" | "manual" | "skipped";

export interface Transaction {
  id: string;
  date: string; // ISO date
  category: ExpenseCategory | "Income" | "Savings_Transfer";
  merchant: string;
  amount: number; // positive = outflow, negative = inflow, in INR
  source: "bank" | "card" | "manual" | "simulated";
}

export interface LinkedDataResult {
  mode: DataSourceMode;
  transactions: Transaction[];
  reconciliation: {
    statedMonthlyExpenses: number;
    observedMonthlyExpenses: number;
    deltaPercent: number;
    note: string;
  };
}

// ---- STEP 3: Goal suggestions ----

export interface GoalOption {
  id: string;
  title: string;
  description: string;
  monthlyCommitment: number;
  horizonMonths: number;
  targetAmount: number;
  feasibility: "conservative" | "balanced" | "ambitious";
  basedOn: string; // which data points drove this suggestion
}

// ---- STEP 4: Insights ----

export interface Insight {
  id: string;
  headline: string;
  detail: string;
  severity: "info" | "positive" | "watch" | "alert";
  metric?: { label: string; value: string };
}

// ---- STEP 5: Projections & benchmarking ----

export interface ProjectionPoint {
  monthIndex: number;
  label: string;
  netWorth: number;
  savings: number;
}

export interface Milestone {
  id: string;
  label: string;
  targetMonthIndex: number;
  targetAmount: number;
  peerMedianMonthIndex?: number;
  status: "ahead" | "on-track" | "behind";
  beyondHorizon?: boolean;
}

export interface BenchmarkResult {
  bucketKey: string;
  peerCount: number;
  userSavingsRate: number;
  peerSavingsRateMedian: number;
  peerSavingsRateP25: number;
  peerSavingsRateP75: number;
  percentileEstimate: number; // 0-100, user's approx percentile among peers
  categoryComparison: {
    category: ExpenseCategory;
    userSharePercent: number;
    peerMedianSharePercent: number;
  }[];
}

// ---- STEP 6: Live feedback ----

export interface BudgetAlert {
  id: string;
  transactionId: string;
  category: ExpenseCategory;
  message: string;
  tone: "nudge" | "warning" | "praise";
  suggestedAction?: string;
}

// ---- Agent messaging ----

export interface AgentMessage {
  id: string;
  role: "agent" | "user" | "system";
  step: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  createdAt: string;
}

export interface AgentState {
  profile: UserProfile | null;
  linkedData: LinkedDataResult | null;
  goals: GoalOption[];
  selectedGoalIds: string[];
  insights: Insight[];
  projections: ProjectionPoint[];
  milestones: Milestone[];
  benchmark: BenchmarkResult | null;
  transactions: Transaction[];
  alerts: BudgetAlert[];
  messages: AgentMessage[];
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
}
