import benchmarksData from "@/data/benchmarks.json";
import sampleProfiles from "@/data/sample_profiles.json";
import type { CityTier, ExpenseCategory } from "@/lib/types/finance";

export interface SyntheticProfile {
  id: number;
  Income: number;
  Age: number;
  Dependents: number;
  Occupation: string;
  City_Tier: CityTier;
  Total_Expenses: number;
  Desired_Savings_Percentage: number;
  Desired_Savings: number;
  Disposable_Income: number;
  [key: string]: number | string;
}

export interface BenchmarkBucket {
  n: number;
  savings_rate_p25: number;
  savings_rate_median: number;
  savings_rate_p75: number;
  category_median_share: Record<ExpenseCategory, number>;
}

const benchmarks = benchmarksData as unknown as {
  generated_from: string;
  n_total: number;
  buckets: Record<string, BenchmarkBucket>;
};

const profiles = sampleProfiles as unknown as SyntheticProfile[];

export const DATASET_PROVENANCE = benchmarks.generated_from;
export const DATASET_SIZE = benchmarks.n_total;

export function incomeBucket(income: number): string {
  if (income < 30000) return "under_30k";
  if (income < 60000) return "30k_60k";
  if (income < 100000) return "60k_100k";
  if (income < 200000) return "100k_200k";
  return "200k_plus";
}

export function getBenchmarkBucket(income: number, cityTier: CityTier): { key: string; bucket: BenchmarkBucket } | null {
  const key = `${incomeBucket(income)}|${cityTier}`;
  const bucket = benchmarks.buckets[key];
  if (!bucket) return null;
  return { key, bucket };
}

/**
 * Finds synthetic peer profiles nearest to the given income/occupation/city
 * tier. Used to simulate an Account Aggregator-style transaction feed when
 * the user links (or in this demo, "links") their bank/card data.
 */
export function findNearestPeers(params: {
  income: number;
  occupation: string;
  cityTier: CityTier;
  count?: number;
}): SyntheticProfile[] {
  const { income, occupation, cityTier, count = 8 } = params;
  const scored = profiles.map((p) => {
    const incomeDelta = Math.abs(p.Income - income) / Math.max(income, 1);
    const occupationMatch = p.Occupation === occupation ? 0 : 0.4;
    const tierMatch = p.City_Tier === cityTier ? 0 : 0.3;
    const score = incomeDelta + occupationMatch + tierMatch;
    return { p, score };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, count).map((s) => s.p);
}

export function allProfiles(): SyntheticProfile[] {
  return profiles;
}
