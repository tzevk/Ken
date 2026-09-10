"use client";

import { useState } from "react";
import { Field, NumberInput, Select, TextInput } from "@/components/ui/fields";
import { EXPENSE_CATEGORIES } from "@/lib/types/finance";
import type { AgentState, BudgetAlert, ExpenseCategory, Transaction } from "@/lib/types/finance";
import { useAgentStore } from "@/lib/store/agentStore";

const TONE_STYLE: Record<BudgetAlert["tone"], string> = {
  warning: "border-red-300 bg-red-50 text-red-800",
  nudge: "border-amber-300 bg-amber-50 text-amber-800",
  praise: "border-emerald-300 bg-emerald-50 text-emerald-800",
};

export default function TransactionSimulator({ state }: { state: AgentState }) {
  const addTransaction = useAgentStore((s) => s.addTransaction);
  const [category, setCategory] = useState<ExpenseCategory>("Eating_Out");
  const [merchant, setMerchant] = useState("Swiggy");
  const [amount, setAmount] = useState(600);
  const [loading, setLoading] = useState(false);
  const [lastAlert, setLastAlert] = useState<BudgetAlert | null | "none">(null);

  async function handleSpend() {
    setLoading(true);
    setLastAlert(null);
    try {
      const res = await fetch("/api/agent/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          transaction: { category, merchant, amount, date: new Date().toISOString() },
        }),
      });
      const data = await res.json();
      const txn = data.transaction as Transaction;
      const alert = (data.alert as BudgetAlert | null) ?? null;
      addTransaction(txn, alert);
      setLastAlert(alert ?? "none");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">Simulate a transaction</h2>
        <span className="text-xs text-foreground/50">Step 6 — live feedback while you spend</span>
      </div>
      <p className="mt-1 text-xs text-foreground/55">
        Log a purchase the way it would arrive from a linked card, and see the agent react in real time against
        your budget.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Field label="Category">
          <Select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Merchant">
          <TextInput value={merchant} onChange={(e) => setMerchant(e.target.value)} />
        </Field>
        <Field label="Amount (₹)">
          <NumberInput value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={1} />
        </Field>
      </div>
      <button
        onClick={handleSpend}
        disabled={loading}
        className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Checking…" : "Make this transaction"}
      </button>

      {lastAlert && lastAlert !== "none" && (
        <div className={`mt-4 rounded-lg border p-3 text-sm ${TONE_STYLE[lastAlert.tone]}`}>
          <p className="font-medium">{lastAlert.message}</p>
          {lastAlert.suggestedAction && <p className="mt-1 text-xs opacity-80">{lastAlert.suggestedAction}</p>}
        </div>
      )}
      {lastAlert === "none" && (
        <div className="mt-4 rounded-lg border border-border bg-background/60 p-3 text-sm text-foreground/60">
          Logged — nothing worth flagging here. The agent stays quiet unless it&apos;s useful.
        </div>
      )}

      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground/45">Recent activity</p>
        <ul className="mt-2 space-y-1.5">
          {state.transactions.slice(0, 6).map((t) => (
            <li key={t.id} className="flex items-center justify-between text-xs">
              <span className="text-foreground/70">
                {t.merchant} · {t.category.replace("_", " ")}
              </span>
              <span className="font-medium">₹{t.amount.toLocaleString("en-IN")}</span>
            </li>
          ))}
          {state.transactions.length === 0 && <li className="text-xs text-foreground/40">No transactions yet.</li>}
        </ul>
      </div>
    </div>
  );
}
