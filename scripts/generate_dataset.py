#!/usr/bin/env python3
"""
Synthetic personal-finance dataset generator.

Data provenance
----------------
This generator recreates the SCHEMA of Kaggle's public dataset
"Indian Personal Finance and Spending Habits" (shriyashjagtap,
https://www.kaggle.com/datasets/shriyashjagtap/indian-personal-finance-and-spending-habits)
-- 20,000 synthetic Indian household financial profiles with income,
demographics, category-wise monthly expenses, desired savings and
disposable income.

The build sandbox this project was generated in has no network route to
kaggle.com or its CDN (egress is allow-listed and Kaggle is not on the
list; api.github.com and raw.githubusercontent.com mirrors of the
dataset only ship the analysis notebook, not the underlying CSV). Rather
than ship no data at all, this script regenerates a statistically
realistic dataset in the SAME schema and value ranges the original
Kaggle dataset documents (income bands, occupation mix, city tiers,
expense-category shares), using seeded pseudo-random sampling. Swap this
file's output for the real Kaggle CSV (`kaggle datasets download -d
shriyashjagtap/indian-personal-finance-and-spending-habits`) with zero
code changes elsewhere -- app/lib/finance/dataset.ts only cares about the
column names below.
"""
import csv
import json
import random
import statistics
from pathlib import Path

random.seed(42)

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)

N = 4000

OCCUPATIONS = ["Salaried", "Self-Employed", "Business Owner", "Freelancer", "Student", "Retired"]
OCCUPATION_WEIGHTS = [0.46, 0.16, 0.14, 0.10, 0.09, 0.05]

CITY_TIERS = ["Tier_1", "Tier_2", "Tier_3"]
CITY_WEIGHTS = [0.42, 0.35, 0.23]

# base monthly income (INR) by occupation, as (mean, stdev) lognormal-ish via gauss+floor
INCOME_PARAMS = {
    "Salaried": (68000, 32000),
    "Self-Employed": (72000, 45000),
    "Business Owner": (95000, 70000),
    "Freelancer": (48000, 30000),
    "Student": (12000, 8000),
    "Retired": (38000, 20000),
}

CITY_MULTIPLIER = {"Tier_1": 1.35, "Tier_2": 1.0, "Tier_3": 0.75}

EXPENSE_CATEGORIES = [
    "Rent", "Loan_Repayment", "Insurance", "Groceries", "Transport",
    "Eating_Out", "Entertainment", "Utilities", "Healthcare", "Education", "Miscellaneous",
]

# share-of-income bands (min, max) per category, adjusted later by tier/dependents/occupation
BASE_SHARE = {
    "Rent": (0.12, 0.30),
    "Loan_Repayment": (0.00, 0.22),
    "Insurance": (0.01, 0.05),
    "Groceries": (0.06, 0.14),
    "Transport": (0.03, 0.09),
    "Eating_Out": (0.02, 0.09),
    "Entertainment": (0.01, 0.05),
    "Utilities": (0.02, 0.06),
    "Healthcare": (0.01, 0.06),
    "Education": (0.00, 0.12),
    "Miscellaneous": (0.02, 0.06),
}

def clamp(v, lo, hi):
    return max(lo, min(hi, v))

rows = []
for i in range(N):
    occupation = random.choices(OCCUPATIONS, OCCUPATION_WEIGHTS)[0]
    city_tier = random.choices(CITY_TIERS, CITY_WEIGHTS)[0]
    age = clamp(int(random.gauss(34, 10)), 19, 68)
    if occupation == "Student":
        age = clamp(int(random.gauss(21, 2)), 18, 27)
    if occupation == "Retired":
        age = clamp(int(random.gauss(63, 5)), 55, 78)

    dependents = clamp(int(random.gauss(1.6, 1.3)), 0, 6)
    if occupation == "Student":
        dependents = 0

    mean, sd = INCOME_PARAMS[occupation]
    income = clamp(random.gauss(mean, sd), 6000, 900000) * CITY_MULTIPLIER[city_tier]
    income = round(income, -2)  # round to nearest 100

    has_loan = random.random() < (0.55 if occupation != "Student" else 0.15)
    has_kids_in_school = dependents > 0 and age > 28 and random.random() < 0.6

    expenses = {}
    for cat, (lo, hi) in BASE_SHARE.items():
        share = random.uniform(lo, hi)
        if cat == "Loan_Repayment" and not has_loan:
            share = 0.0
        if cat == "Education" and not has_kids_in_school:
            share *= 0.15
        if cat == "Rent" and city_tier == "Tier_1":
            share *= 1.15
        if cat in ("Groceries", "Utilities", "Healthcare") and dependents > 0:
            share *= (1 + 0.08 * dependents)
        if cat == "Eating_Out" and occupation in ("Business Owner", "Self-Employed"):
            share *= 1.2
        expenses[cat] = round(income * share, -1)

    total_expenses = sum(expenses.values())
    disposable_income = round(income - total_expenses, -1)
    desired_savings_pct = clamp(round(random.uniform(8, 35), 1), 5, 45)
    desired_savings = round(income * desired_savings_pct / 100, -1)

    potential_savings = {}
    for cat, amt in expenses.items():
        # "avoidable" fraction of discretionary categories -> potential savings signal
        discretionary = {"Eating_Out": 0.35, "Entertainment": 0.30, "Miscellaneous": 0.25, "Transport": 0.10}
        frac = discretionary.get(cat, 0.03)
        potential_savings[f"Potential_Savings_{cat}"] = round(amt * frac, -1)

    row = {
        "id": i + 1,
        "Income": int(income),
        "Age": age,
        "Dependents": dependents,
        "Occupation": occupation,
        "City_Tier": city_tier,
        **{k: int(v) for k, v in expenses.items()},
        "Total_Expenses": int(total_expenses),
        "Desired_Savings_Percentage": desired_savings_pct,
        "Desired_Savings": int(desired_savings),
        "Disposable_Income": int(disposable_income),
        **{k: int(v) for k, v in potential_savings.items()},
    }
    rows.append(row)

# ---- write CSV ----
fieldnames = list(rows[0].keys())
csv_path = DATA_DIR / "indian_personal_finance_synthetic.csv"
with csv_path.open("w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

# ---- write trimmed JSON pool used at runtime for peer-matching (Step 2 simulation) ----
sample = random.sample(rows, 600)
with (DATA_DIR / "sample_profiles.json").open("w") as f:
    json.dump(sample, f)

# ---- precompute benchmark aggregates for Step 5 (peer benchmarking) ----
def percentile(sorted_vals, p):
    if not sorted_vals:
        return 0
    k = (len(sorted_vals) - 1) * p
    f, c = int(k), min(int(k) + 1, len(sorted_vals) - 1)
    if f == c:
        return sorted_vals[f]
    return sorted_vals[f] + (sorted_vals[c] - sorted_vals[f]) * (k - f)

def bucket_for(income):
    if income < 30000:
        return "under_30k"
    if income < 60000:
        return "30k_60k"
    if income < 100000:
        return "60k_100k"
    if income < 200000:
        return "100k_200k"
    return "200k_plus"

benchmarks = {}
buckets = {}
for r in rows:
    key = (bucket_for(r["Income"]), r["City_Tier"])
    buckets.setdefault(key, []).append(r)

for (income_bucket, tier), group in buckets.items():
    savings_rate = sorted([
        (g["Income"] - g["Total_Expenses"]) / g["Income"] for g in group if g["Income"] > 0
    ])
    entry = {
        "n": len(group),
        "savings_rate_p25": round(percentile(savings_rate, 0.25) * 100, 1),
        "savings_rate_median": round(percentile(savings_rate, 0.5) * 100, 1),
        "savings_rate_p75": round(percentile(savings_rate, 0.75) * 100, 1),
        "category_median_share": {},
    }
    for cat in EXPENSE_CATEGORIES:
        shares = sorted([g[cat] / g["Income"] for g in group if g["Income"] > 0])
        entry["category_median_share"][cat] = round(percentile(shares, 0.5) * 100, 2)
    benchmarks[f"{income_bucket}|{tier}"] = entry

with (DATA_DIR / "benchmarks.json").open("w") as f:
    json.dump({
        "generated_from": "synthetic (Kaggle 'Indian Personal Finance and Spending Habits' schema)",
        "n_total": N,
        "buckets": benchmarks,
    }, f, indent=2)

print(f"Wrote {len(rows)} rows -> {csv_path}")
print(f"Wrote 600-row sample pool -> data/sample_profiles.json")
print(f"Wrote benchmark aggregates -> data/benchmarks.json ({len(benchmarks)} buckets)")
