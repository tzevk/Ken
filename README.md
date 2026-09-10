# Vantage — the agent behind the numbers

Built for **The Ken Case Competition 2026**. Live agentic personal-finance co-pilot: it understands the
person before it advises the numbers, then runs a six-step agent flow — intake, data loading, goal
suggestion, insight generation, projection/benchmarking, and live transaction feedback — over a real
tool-calling architecture.

> Most financial systems categorise people before serving them. This one starts by understanding the
> person — their family, income, savings, insurance, liabilities and future expectations — before it
> ever touches a transaction. The same income or investment portfolio requires completely different
> advice depending on the person living behind those numbers.

## Try it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, click **Talk to the agent**, complete the intake, and land on the dashboard.
No API keys or bank credentials are required — the app runs fully deterministically out of the box.

## The standout feature: "What if?"

Every finance app shows you where you are. None show you where a decision actually takes you. The
**What if? simulator** (front and center on the dashboard, teased on the landing page) lets a user tap a
scenario chip, "I have a baby," "I go freelance," "I move to a bigger city," "an unexpected expense hits,"
or drag an income slider, and instantly see their five-year net worth path redraw itself on top of where
they're headed today. No form submission, no page reload: it recomputes client-side against the exact same
pure calculators that power the rest of the dashboard (`lib/finance/whatIf.ts`,
`components/dashboard/WhatIfSimulator.tsx`), so the comparison is instant and the numbers are exactly as
trustworthy as everything else in the app. This is the product's answer to the case's own customer insight:
people don't lack data, they lack a way to rehearse a life decision before making it.

## Product experience

- **Installable web app** — a manifest, generated icons and theme-color metadata make it installable to a
  phone home screen or desktop (`public/manifest.webmanifest`, `app/icon.svg`).
- **Customizable, on-brand:** a Customize panel (gear icon, top right) lets each user pick a light/dark/
  system appearance and one of four accent hues (forest/midnight/plum/clay) — the layout, typography and
  paper-like background stay constant, only the accent identity color changes, and the choice persists
  across visits (`lib/store/preferencesStore.ts`, `app/globals.css`).
- **Dashboard panels are opt-in/out** from the same panel, so a user can hide what they don't care about
  (e.g. drop the chat or the peer benchmark) without losing any data.
- **Editable, not disposable:** "Edit profile" re-opens the intake wizard pre-filled with the existing
  profile instead of forcing a full re-onboarding for a one-field change; "Start over" (confirmed) is kept
  separate and clearly secondary.
- **Goal pinning:** star a suggested goal to keep it pinned to the top of the list — a lightweight way to
  say "this is the one I'm actually tracking."

## The six-step agent flow

Maps directly to the founder notes this project was scoped from:

| Step | What it does | Where |
|---|---|---|
| 1. Understand the person | 3-part intake: income (family/personal/savings/inheritance/investments), expenses (family/insurance/EMIs/recurring), and — instead of another number — mindset, family/house/car planning and free-text aspirations | `components/onboarding/OnboardWizard.tsx` |
| 2. Load financial data | Link accounts (simulated via peer-matched transaction generation), enter manually, or skip — either way the agent reconciles stated vs. observed spend | `lib/finance/transactions.ts`, `app/api/agent/run` |
| 3. Suggest realistic goals | Multiple goal options (conservative/balanced/ambitious), sized to actual monthly surplus and cross-referenced against stated aspirations — not a generic wishlist | `lib/finance/calculators.ts::suggestGoals` |
| 4. Surface insights | Self-estimate vs. actual reconciliation, peer-percentile standing, category outliers, life-stage mismatches (e.g. "planning a family soon" + low savings rate) | `lib/finance/insights.ts` |
| 5. Project & benchmark | Month-by-month net worth projection (compound growth on surplus) with milestones benchmarked against peer savings-rate percentiles | `lib/finance/calculators.ts`, `components/dashboard/ProjectionChart.tsx` |
| 6. Live feedback | Every simulated transaction is checked against a peer-informed category budget in real time — nudge, warn, or praise, never noise for its own sake | `lib/finance/alerts.ts`, `app/api/agent/transaction` |

## Agent architecture

The agent is **tool-augmented, not LLM-only**: every number on screen is computed by pure, auditable
TypeScript functions in `lib/finance/`. An LLM (Claude, via `@anthropic-ai/sdk`) is used only for two
things, both grounded in already-computed data so it can never fabricate a figure:

1. **Narration** (`lib/agent/narrate.ts`) — turns each step's structured output into 2-4 sentences of
   context-aware copy, referencing the user's stated life stage instead of generic advice.
2. **The chat interface** (`lib/agent/claudeAgent.ts`) — a genuine Anthropic tool-use loop. Claude is
   given a fixed tool surface (`lib/agent/tools.ts`: `get_financial_snapshot`, `get_budget_status`,
   `get_goals`, `get_goal_progress`, `get_insights`, `get_benchmark`, `get_projection`,
   `list_recent_transactions`), decides which to call for a free-text question, we execute them against
   the current session state, and the loop continues until Claude has enough grounded data to answer.

**No `ANTHROPIC_API_KEY` set?** Both layers fall back to deterministic logic — templated narration and a
keyword-routed version of the same tool calls — so the product is fully functional in a judged demo with
zero secrets configured. Set `ANTHROPIC_API_KEY` in the environment to switch on the live LLM narration
and tool-use loop; nothing else changes.

## Data: why synthetic, and how it maps to Kaggle

The brief asked for data imported from Kaggle. This build environment's network egress is allow-listed and
`kaggle.com` (and its CDN) is not reachable from it — confirmed by a direct `curl` to the Kaggle API
returning a proxy-level connection rejection, and by GitHub mirrors of the dataset shipping only the
analysis notebook, not the underlying CSV.

Rather than ship a demo with no data, `scripts/generate_dataset.py` **regenerates the schema** of Kaggle's
[Indian Personal Finance and Spending Habits](https://www.kaggle.com/datasets/shriyashjagtap/indian-personal-finance-and-spending-habits)
dataset (20k synthetic Indian financial profiles: income, age, dependents, occupation, city tier, and an
11-category expense breakdown with desired-savings and disposable-income fields) using seeded, statistically
realistic sampling — correlated income-by-occupation, city-tier cost-of-living multipliers, dependents
scaling grocery/utility/healthcare spend, and so on. Output:

- `data/indian_personal_finance_synthetic.csv` — 4,000 full synthetic records, same columns as the Kaggle
  original.
- `data/sample_profiles.json` — a 600-row runtime pool used to peer-match a user's profile and simulate an
  Account Aggregator-style transaction feed (Step 2).
- `data/benchmarks.json` — precomputed percentile aggregates (savings rate P25/median/P75, category median
  income-share) bucketed by income band × city tier, used for Step 4/5 peer benchmarking.

Swapping in the real Kaggle CSV (`kaggle datasets download -d shriyashjagtap/indian-personal-finance-and-spending-habits`)
requires no code changes elsewhere — regenerate `scripts/generate_dataset.py`'s outputs from the real file
and every downstream consumer (`lib/finance/dataset.ts`) keeps working, since it only depends on column
names. This is also thematically consistent with the case's own customer insight below: the data pipeline
was never the hard part.

## The customer insight this was built around

From the discovery interviews behind this project: *personal finance is not a problem of data and tech —
it's a problem of understanding, knowledge, and the practice of good decisions.* Multiple apps already
gather data and produce insights; the actual crux is human behaviour, spending mentality, and a person's
relationship with money. That's why Step 1 spends a full third of the intake on mindset and life
aspirations rather than more numbers, and why every downstream step (goals, insights, projections, live
feedback) is written to reference that context instead of treating the user as an income/expense vector.

## Rails

- **Payments (innovation rail):** transactions become a real-time intervention point (Step 6) instead of a
  historical record reviewed once a month.
- **Logistics (annexation rail):** the natural next use-case — tracking high-value assets (jewellery,
  electronics, vehicles) from purchase through resale/rental/disposal — is scoped in the product notes but
  not built in this MVP.
- **Voice (interface rail):** sensitive financial conversations belong in natural language, not a form; the
  chat tool-use interface (Step 6 + `AgentChat`) is the text analogue of that thesis.

## Tech stack

- **Next.js 16** (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4
- **Recharts** for the net worth projection and peer-comparison charts
- **Zustand** (with `persist`) for client-side session state — no database; every API route is stateless
  and computes from the payload it's given, which keeps this trivially deployable on Vercel's serverless
  runtime
- **`@anthropic-ai/sdk`** for the optional Claude narration and tool-use layers described above

## Project structure

```
app/
  page.tsx                 landing page
  onboard/                 Step 1 + Step 2 intake wizard
  dashboard/                Steps 3-6 dashboard
  api/agent/run/            runs the full deterministic pipeline (steps 1-5)
  api/agent/chat/           agentic tool-use chat endpoint
  api/agent/transaction/    Step 6 live transaction feedback
lib/
  types/finance.ts          domain types
  finance/                  pure calculators: net worth, goals, insights, benchmarking, alerts
  agent/                    orchestration, tool definitions, Claude narration/chat, deterministic fallback
  store/                    Zustand client store
data/                       synthetic Kaggle-schema dataset + precomputed benchmarks
scripts/generate_dataset.py the dataset generator (see "Data" above)
components/
  onboarding/, dashboard/, ui/
```

## Deploying

```bash
npm run build
```

Deployable to Vercel with zero configuration — set `ANTHROPIC_API_KEY` as an optional environment variable
to enable the live LLM layer.
