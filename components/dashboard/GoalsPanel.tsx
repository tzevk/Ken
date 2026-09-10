"use client";

import type { GoalOption } from "@/lib/types/finance";

const FEASIBILITY_STYLE: Record<GoalOption["feasibility"], string> = {
  conservative: "bg-blue-50 text-blue-700 border-blue-200",
  balanced: "bg-accent-soft text-accent border-accent/30",
  ambitious: "bg-amber-50 text-amber border-amber/30",
};

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default function GoalsPanel({ goals }: { goals: GoalOption[] }) {
  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">Realistic future goals</h2>
        <span className="text-xs text-foreground/50">Multiple options, sized to your actual surplus</span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {goals.map((g) => (
          <div key={g.id} className="rounded-xl border border-border p-4">
            <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${FEASIBILITY_STYLE[g.feasibility]}`}>
              {g.feasibility}
            </span>
            <h3 className="mt-2 text-sm font-semibold">{g.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-foreground/65">{g.description}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-foreground/45">Target</dt>
                <dd className="font-semibold">{inr(g.targetAmount)}</dd>
              </div>
              <div>
                <dt className="text-foreground/45">Monthly</dt>
                <dd className="font-semibold">{inr(g.monthlyCommitment)}</dd>
              </div>
              <div>
                <dt className="text-foreground/45">Horizon</dt>
                <dd className="font-semibold">
                  {g.horizonMonths >= 12 ? `${(g.horizonMonths / 12).toFixed(1)} yrs` : `${g.horizonMonths} mo`}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] italic text-foreground/40">Based on: {g.basedOn}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
