"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PencilLine } from "lucide-react";
import { EASE } from "@/components/ui/motion";
import { Field, NumberInput, Select, TextArea, TextInput } from "@/components/ui/fields";
import { EXPENSE_CATEGORIES } from "@/lib/types/finance";
import type {
  AspirationProfile,
  CityTier,
  DataSourceMode,
  ExpenseProfile,
  IncomeProfile,
  Occupation,
  UserProfile,
} from "@/lib/types/finance";
import { useAgentStore, useAgentStoreHydrated } from "@/lib/store/agentStore";

type WizardStep = "basics" | "income" | "expenses" | "aspirations" | "data" | "submitting";

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
};

const defaultIncome: IncomeProfile = {
  familyIncome: 0,
  personalIncome: 50000,
  currentSavings: 100000,
  inheritance: 0,
  personalInvestments: 50000,
};

const defaultExpenses: ExpenseProfile = {
  familyExpenses: 0,
  insurance: 2000,
  loanEmis: 0,
  monthlyRecurringExpenses: 20000,
};

const defaultAspirations: AspirationProfile = {
  futurePlansNote: "",
  currentMindset: "unsure",
  familyPlanning: "not-applicable",
  housePlanning: "not-a-priority",
  carPlanning: "none",
  otherAspirations: "",
};

/**
 * Waits for the persisted store to hydrate before mounting the actual form.
 * Editing an existing profile then becomes a one-time lazy `useState`
 * initializer keyed off props — no effect-driven setState needed, so the
 * form can never flash empty defaults before snapping to the real values.
 */
export default function OnboardWizard() {
  const existingProfile = useAgentStore((s) => s.state?.profile ?? null);
  const existingDataMode = useAgentStore((s) => s.state?.linkedData?.mode ?? null);
  const hydrated = useAgentStoreHydrated();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="card h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <OnboardForm
      key={existingProfile ? existingProfile.createdAt : "new"}
      initialProfile={existingProfile}
      initialDataMode={existingDataMode}
    />
  );
}

function OnboardForm({
  initialProfile,
  initialDataMode,
}: {
  initialProfile: UserProfile | null;
  initialDataMode: DataSourceMode | null;
}) {
  const router = useRouter();
  const setAgentState = useAgentStore((s) => s.setState);
  const isEditing = !!initialProfile;

  const [step, setStep] = useState<WizardStep>("basics");
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState<string | null>(null);

  function goNext(next: WizardStep) {
    setDirection(1);
    setStep(next);
  }
  function goBack(prev: WizardStep) {
    setDirection(-1);
    setStep(prev);
  }

  const [name, setName] = useState(initialProfile?.name ?? "");
  const [age, setAge] = useState(initialProfile?.age ?? 28);
  const [dependents, setDependents] = useState(initialProfile?.dependents ?? 0);
  const [occupation, setOccupation] = useState<Occupation>(initialProfile?.occupation ?? "Salaried");
  const [cityTier, setCityTier] = useState<CityTier>(initialProfile?.cityTier ?? "Tier_1");

  const [income, setIncome] = useState<IncomeProfile>(initialProfile?.income ?? defaultIncome);
  const [expenses, setExpenses] = useState<ExpenseProfile>(initialProfile?.expenses ?? defaultExpenses);
  const [aspirations, setAspirations] = useState<AspirationProfile>(initialProfile?.aspirations ?? defaultAspirations);

  const [dataMode, setDataMode] = useState<DataSourceMode>(initialDataMode ?? "linked");
  const [manualCategories, setManualCategories] = useState<Record<string, number>>(
    (initialProfile?.expenses.categoryBreakdown as Record<string, number> | undefined) ?? {},
  );

  async function handleSubmit() {
    setStep("submitting");
    setError(null);
    const profile: UserProfile = {
      name: name || "You",
      age,
      dependents,
      occupation,
      cityTier,
      income,
      expenses:
        dataMode === "manual"
          ? { ...expenses, categoryBreakdown: manualCategories as ExpenseProfile["categoryBreakdown"] }
          : expenses,
      aspirations,
      createdAt: new Date().toISOString(),
    };

    const manualTransactions =
      dataMode === "manual"
        ? Object.entries(manualCategories)
            .filter(([, v]) => v > 0)
            .map(([category, amount]) => ({
              id: `manual-${category}`,
              date: new Date().toISOString(),
              category: category as never,
              merchant: "Manual entry",
              amount,
              source: "manual" as const,
            }))
        : [];

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, dataMode, manualTransactions }),
      });
      if (!res.ok) throw new Error("Agent pipeline failed");
      const state = await res.json();
      setAgentState(state);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong running the agent. Please try again.");
      setStep("data");
    }
  }

  return (
    <div className="page-enter mx-auto max-w-2xl px-6 py-16">
      {isEditing && step !== "submitting" && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent-soft px-4 py-2.5 text-sm text-accent">
          <PencilLine size={16} strokeWidth={2} className="shrink-0" aria-hidden />
          Editing your existing profile. Everything below is pre-filled, so just change what&apos;s different.
        </div>
      )}
      <WizardProgress step={step} />

      <AnimatePresence mode="wait" custom={direction} initial={false}>
      {step === "basics" && (
        <motion.div key="basics" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: EASE }}>
        <StepCard
          title="Let's start with the basics"
          subtitle="Step 1, part 1 of 3. Who is this for?"
          onNext={() => goNext("income")}
          nextLabel="Continue to income"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Tanvi" />
            </Field>
            <Field label="Age">
              <NumberInput value={age} onChange={(e) => setAge(Number(e.target.value))} min={16} max={90} />
            </Field>
            <Field label="Dependents" hint="People financially reliant on your income: children, a spouse, or parents you support">
              <NumberInput value={dependents} onChange={(e) => setDependents(Number(e.target.value))} min={0} max={10} />
            </Field>
            <Field label="Occupation">
              <Select value={occupation} onChange={(e) => setOccupation(e.target.value as Occupation)}>
                {["Salaried", "Self-Employed", "Business Owner", "Freelancer", "Student", "Retired"].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="City tier" hint="Roughly: Tier 1 = metro, Tier 3 = smaller town">
              <Select value={cityTier} onChange={(e) => setCityTier(e.target.value as CityTier)}>
                <option value="Tier_1">Tier 1 (metro)</option>
                <option value="Tier_2">Tier 2</option>
                <option value="Tier_3">Tier 3</option>
              </Select>
            </Field>
          </div>
        </StepCard>
        </motion.div>
      )}

      {step === "income" && (
        <motion.div key="income" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: EASE }}>
        <StepCard
          title="Income"
          subtitle="Step 1, part 1: family income, savings, inheritance, personal income and investments"
          onBack={() => goBack("basics")}
          onNext={() => goNext("expenses")}
          nextLabel="Continue to expenses"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Personal monthly income (₹)">
              <NumberInput
                value={income.personalIncome}
                onChange={(e) => setIncome({ ...income, personalIncome: Number(e.target.value) })}
              />
            </Field>
            <Field label="Family monthly income (₹)" hint="Household income beyond your own, if shared">
              <NumberInput
                value={income.familyIncome}
                onChange={(e) => setIncome({ ...income, familyIncome: Number(e.target.value) })}
              />
            </Field>
            <Field label="Current savings (₹)" hint="Personal + family, liquid">
              <NumberInput
                value={income.currentSavings}
                onChange={(e) => setIncome({ ...income, currentSavings: Number(e.target.value) })}
              />
            </Field>
            <Field label="Inheritance / windfall (₹)">
              <NumberInput
                value={income.inheritance}
                onChange={(e) => setIncome({ ...income, inheritance: Number(e.target.value) })}
              />
            </Field>
            <Field label="Personal investments (₹)" hint="Stocks, mutual funds, FDs, etc.">
              <NumberInput
                value={income.personalInvestments}
                onChange={(e) => setIncome({ ...income, personalInvestments: Number(e.target.value) })}
              />
            </Field>
          </div>
        </StepCard>
        </motion.div>
      )}

      {step === "expenses" && (
        <motion.div key="expenses" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: EASE }}>
        <StepCard
          title="Expenses"
          subtitle="Step 1, part 2: family expenses, insurance, loans, recurring costs"
          onBack={() => goBack("income")}
          onNext={() => goNext("aspirations")}
          nextLabel="Continue to your plans"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Family monthly expenses (₹)">
              <NumberInput
                value={expenses.familyExpenses}
                onChange={(e) => setExpenses({ ...expenses, familyExpenses: Number(e.target.value) })}
              />
            </Field>
            <Field label="Insurance premiums (₹/month)">
              <NumberInput
                value={expenses.insurance}
                onChange={(e) => setExpenses({ ...expenses, insurance: Number(e.target.value) })}
              />
            </Field>
            <Field label="Loan EMIs (₹/month)">
              <NumberInput
                value={expenses.loanEmis}
                onChange={(e) => setExpenses({ ...expenses, loanEmis: Number(e.target.value) })}
              />
            </Field>
            <Field label="Other monthly recurring expenses (₹)">
              <NumberInput
                value={expenses.monthlyRecurringExpenses}
                onChange={(e) => setExpenses({ ...expenses, monthlyRecurringExpenses: Number(e.target.value) })}
              />
            </Field>
          </div>
        </StepCard>
        </motion.div>
      )}

      {step === "aspirations" && (
        <motion.div key="aspirations" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: EASE }}>
        <StepCard
          title="Instead of another number, tell us about your life"
          subtitle="Step 1, part 3. Most finance apps skip this, and it changes the advice"
          onBack={() => goBack("expenses")}
          onNext={() => goNext("data")}
          nextLabel="Continue to connect data"
        >
          <div className="grid gap-4">
            <Field label="What's on your mind about the future?" hint="Free text: a home, a business, a career change, anything">
              <TextArea
                value={aspirations.futurePlansNote}
                onChange={(e) => setAspirations({ ...aspirations, futurePlansNote: e.target.value })}
                placeholder="e.g. Thinking about starting a small business in the next couple of years..."
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Current mindset around money">
                <Select
                  value={aspirations.currentMindset}
                  onChange={(e) => setAspirations({ ...aspirations, currentMindset: e.target.value as AspirationProfile["currentMindset"] })}
                >
                  <option value="cautious-saver">Cautious saver</option>
                  <option value="balanced">Balanced</option>
                  <option value="growth-seeking">Growth-seeking</option>
                  <option value="avoidant">I avoid thinking about it</option>
                  <option value="unsure">Not sure</option>
                </Select>
              </Field>
              <Field label="Family planning">
                <Select
                  value={aspirations.familyPlanning}
                  onChange={(e) => setAspirations({ ...aspirations, familyPlanning: e.target.value as AspirationProfile["familyPlanning"] })}
                >
                  <option value="not-applicable">Not applicable</option>
                  <option value="planning-soon">Planning soon</option>
                  <option value="planning-later">Planning later</option>
                  <option value="have-dependents">Already have dependents</option>
                </Select>
              </Field>
              <Field label="House planning">
                <Select
                  value={aspirations.housePlanning}
                  onChange={(e) => setAspirations({ ...aspirations, housePlanning: e.target.value as AspirationProfile["housePlanning"] })}
                >
                  <option value="own-no-plans">Own, no plans to move</option>
                  <option value="renting-plan-to-buy">Renting, planning to buy</option>
                  <option value="own-and-upgrading">Own, planning to upgrade</option>
                  <option value="not-a-priority">Not a priority right now</option>
                </Select>
              </Field>
              <Field label="Car planning">
                <Select
                  value={aspirations.carPlanning}
                  onChange={(e) => setAspirations({ ...aspirations, carPlanning: e.target.value as AspirationProfile["carPlanning"] })}
                >
                  <option value="none">No plans</option>
                  <option value="planning-to-buy">Planning to buy</option>
                  <option value="planning-to-upgrade">Planning to upgrade</option>
                  <option value="own-outright">Own outright already</option>
                </Select>
              </Field>
            </div>
            <Field label="Anything else on your mind?">
              <TextArea
                value={aspirations.otherAspirations}
                onChange={(e) => setAspirations({ ...aspirations, otherAspirations: e.target.value })}
              />
            </Field>
          </div>
        </StepCard>
        </motion.div>
      )}

      {step === "data" && (
        <motion.div key="data" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: EASE }}>
        <StepCard
          title="Connect your financial data"
          subtitle="Step 2, this lets the agent check what you told us against what actually happened"
          onBack={() => goBack("aspirations")}
          onNext={handleSubmit}
          nextLabel={isEditing ? "Update my profile" : "Run the agent"}
        >
          <div className="space-y-3">
            {(
              [
                { id: "linked", label: "Link bank & card accounts", desc: "Simulated for this demo via peer-matched transaction patterns from our dataset. No real credentials needed." },
                { id: "manual", label: "I'll enter my expenses manually", desc: "Enter a rough monthly split by category below." },
                { id: "skipped", label: "Not comfortable sharing data yet", desc: "We'll work from what you told us above, nothing more." },
              ] as const
            ).map((opt) => (
              <label
                key={opt.id}
                className={`block cursor-pointer rounded-xl border p-4 transition ${
                  dataMode === opt.id ? "border-accent bg-accent-soft" : "border-border bg-panel-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="dataMode"
                    checked={dataMode === opt.id}
                    onChange={() => setDataMode(opt.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p className="mt-0.5 text-xs text-foreground/60">{opt.desc}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {dataMode === "manual" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <Field key={cat} label={cat.replace("_", " ")}>
                  <NumberInput
                    value={manualCategories[cat] ?? ""}
                    onChange={(e) => setManualCategories({ ...manualCategories, [cat]: Number(e.target.value) })}
                    placeholder="₹/month"
                  />
                </Field>
              ))}
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </StepCard>
        </motion.div>
      )}

      {step === "submitting" && (
        <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <div className="card flex flex-col items-center gap-4 p-12 text-center">
            <motion.div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-accent"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </motion.div>
            <p className="text-sm text-foreground/70">
              Loading your data, projecting goals, and benchmarking against peers…
            </p>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

function WizardProgress({ step }: { step: WizardStep }) {
  const order: WizardStep[] = ["basics", "income", "expenses", "aspirations", "data"];
  const idx = order.indexOf(step);
  const pct = step === "submitting" ? 100 : ((idx + 1) / order.length) * 100;
  return (
    <div className="mb-8">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StepCard({
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextLabel,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="card p-8">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-foreground/60">{subtitle}</p>
      <div className="mt-6">{children}</div>
      <div className="mt-8 flex items-center justify-between">
        {onBack ? (
          <button onClick={onBack} className="text-sm font-medium text-foreground/60 hover:text-foreground">
            Back
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={onNext}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-contrast transition hover:opacity-90"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
