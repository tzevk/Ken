"use client";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import type { GoalOption } from "@/lib/types/finance";

const FEASIBILITY_STYLE: Record<GoalOption["feasibility"], string> = {
  conservative: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  balanced: "bg-accent-soft text-accent border-accent/30",
  ambitious: "bg-amber-50 text-amber border-amber/30 dark:bg-amber-950",
};

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default function GoalsPanel({
  goals,
  selectedGoalIds,
  onTogglePin,
}: {
  goals: GoalOption[];
  selectedGoalIds: string[];
  onTogglePin: (id: string) => void;
}) {
  const sorted = [...goals].sort((a, b) => {
    const aPinned = selectedGoalIds.includes(a.id) ? 0 : 1;
    const bPinned = selectedGoalIds.includes(b.id) ? 0 : 1;
    return aPinned - bPinned;
  });

  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">Realistic future goals</h2>
        <span className="text-xs text-foreground/50">Pin the ones you actually want to track</span>
      </div>
      <LayoutGroup>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <AnimatePresence>
            {sorted.map((g) => {
              const pinned = selectedGoalIds.includes(g.id);
              return (
                <motion.div
                  layout
                  key={g.id}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative rounded-xl border p-4 transition-colors ${
                    pinned ? "border-accent bg-accent-soft/40" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${FEASIBILITY_STYLE[g.feasibility]}`}>
                      {g.feasibility}
                    </span>
                    <motion.button
                      onClick={() => onTogglePin(g.id)}
                      whileTap={{ scale: 0.8 }}
                      animate={pinned ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                      transition={{ duration: 0.35 }}
                      className={`shrink-0 rounded-full p-1 text-sm transition-colors ${
                        pinned ? "text-accent" : "text-foreground/30 hover:text-foreground/60"
                      }`}
                      aria-label={pinned ? `Unpin ${g.title}` : `Pin ${g.title}`}
                      aria-pressed={pinned}
                      title={pinned ? "Pinned, click to unpin" : "Pin this goal"}
                    >
                      {pinned ? "★" : "☆"}
                    </motion.button>
                  </div>
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}
