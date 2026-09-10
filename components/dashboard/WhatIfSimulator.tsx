"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Baby, Building2, Laptop, Scissors, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import type { UserProfile } from "@/lib/types/finance";
import {
  computeMilestones,
  currentNetWorth,
  monthlySurplus,
  projectNetWorth,
} from "@/lib/finance/calculators";
import { LIFE_SCENARIOS, applyIncomeShift, type LifeScenarioIcon } from "@/lib/finance/whatIf";
import AnimatedNumber from "@/components/ui/AnimatedNumber";

const SCENARIO_ICONS: Record<LifeScenarioIcon, LucideIcon> = {
  raise: TrendingUp,
  baby: Baby,
  move: Building2,
  freelance: Laptop,
  shock: Zap,
  trim: Scissors,
};

function inrShort(n: number) {
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  if (v >= 10000000) return `${sign}₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `${sign}₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `${sign}₹${(v / 1000).toFixed(0)}K`;
  return `${sign}₹${v}`;
}

export default function WhatIfSimulator({ profile }: { profile: UserProfile }) {
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [incomeShift, setIncomeShift] = useState(0);

  const scenario = LIFE_SCENARIOS.find((s) => s.id === scenarioId) ?? null;

  const adjustedProfile = useMemo(() => {
    let p = scenario ? scenario.apply(profile) : profile;
    if (incomeShift !== 0) p = applyIncomeShift(p, incomeShift);
    return p;
  }, [profile, scenario, incomeShift]);

  const baseline = useMemo(() => {
    const surplus = Math.max(monthlySurplus(profile), 0);
    return {
      projection: projectNetWorth(currentNetWorth(profile), surplus, 60),
      milestone: computeMilestones(profile)[0],
    };
  }, [profile]);

  const scenarioResult = useMemo(() => {
    const surplus = Math.max(monthlySurplus(adjustedProfile), 0);
    return {
      projection: projectNetWorth(currentNetWorth(adjustedProfile), surplus, 60),
      milestone: computeMilestones(adjustedProfile)[0],
    };
  }, [adjustedProfile]);

  const isActive = !!scenario || incomeShift !== 0;

  const chartData = baseline.projection.map((pt, i) => ({
    label: pt.label,
    today: pt.netWorth,
    whatIf: scenarioResult.projection[i]?.netWorth ?? pt.netWorth,
  }));

  const finalToday = baseline.projection[baseline.projection.length - 1]?.netWorth ?? 0;
  const finalWhatIf = scenarioResult.projection[scenarioResult.projection.length - 1]?.netWorth ?? 0;
  const delta = finalWhatIf - finalToday;

  const take = isActive ? buildTake(scenario, incomeShift, delta) : null;

  return (
    <div className="card overflow-hidden p-6">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            What if?
            <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber">
              try it
            </span>
          </h2>
          <p className="mt-1 text-xs text-foreground/55">
            Rehearse a life decision before you make it. Pick one and watch your five-year path move, right now.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {LIFE_SCENARIOS.map((s) => {
          const Icon = SCENARIO_ICONS[s.icon];
          return (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => setScenarioId(scenarioId === s.id ? null : s.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                scenarioId === s.id
                  ? "border-accent bg-accent text-accent-contrast"
                  : "border-border bg-panel-muted text-foreground/70 hover:bg-accent-soft"
              }`}
              title={s.blurb}
            >
              <Icon size={14} strokeWidth={2} aria-hidden />
              {s.label}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-foreground/55">
          <span>Also adjust income</span>
          <span className="font-medium text-foreground">
            {incomeShift > 0 ? "+" : ""}
            {incomeShift}%
          </span>
        </div>
        <input
          type="range"
          min={-30}
          max={50}
          step={5}
          value={incomeShift}
          onChange={(e) => setIncomeShift(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--accent)]"
        />
      </div>

      <div className="mt-5 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="whatIfFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--amber)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--amber)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} interval={9} tick={{ fontSize: 11, fill: "var(--foreground)" }} />
            <YAxis tickFormatter={inrShort} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--foreground)" }} width={52} />
            <Tooltip
              formatter={(v, name) => [inrShort(Number(v)), name === "today" ? "Today's path" : "What if"]}
              contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, background: "var(--panel)" }}
            />
            <Line type="monotone" dataKey="today" stroke="var(--foreground)" strokeOpacity={0.35} strokeWidth={2} dot={false} isAnimationActive={false} />
            {isActive && (
              <Area
                type="monotone"
                dataKey="whatIf"
                stroke="var(--amber)"
                strokeWidth={2.5}
                fill="url(#whatIfFill)"
                animationDuration={500}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-panel-muted p-3">
                <p className="text-[11px] text-foreground/50">Net worth in 5 years</p>
                <p className="mt-0.5 text-sm font-semibold">
                  <AnimatedNumber value={finalWhatIf} format={(n) => inrShort(n)} />
                </p>
              </div>
              <div className="rounded-lg bg-panel-muted p-3">
                <p className="text-[11px] text-foreground/50">Vs. today&apos;s path</p>
                <p className={`mt-0.5 text-sm font-semibold ${delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {delta >= 0 ? "+" : ""}
                  <AnimatedNumber value={delta} format={(n) => inrShort(n)} />
                </p>
              </div>
              <div className="rounded-lg bg-panel-muted p-3">
                <p className="text-[11px] text-foreground/50">First milestone</p>
                <p className="mt-0.5 text-sm font-semibold">
                  ~{Math.round((scenarioResult.milestone?.targetMonthIndex ?? 0) / 12)} yrs
                </p>
              </div>
            </div>
            {take && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-3 text-sm leading-relaxed text-foreground/80"
              >
                {take}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function buildTake(scenario: { label: string; blurb: string } | null, incomeShift: number, deltaFiveYear: number): string {
  const direction = deltaFiveYear >= 0 ? "ahead of" : "behind";
  const magnitude = Math.abs(deltaFiveYear);
  const size = magnitude >= 500000 ? "noticeably" : magnitude >= 100000 ? "meaningfully" : "slightly";
  const base = scenario
    ? `${scenario.label}: ${scenario.blurb.toLowerCase()}`
    : `Shifting income by ${incomeShift > 0 ? "+" : ""}${incomeShift}%`;
  return `${base} That leaves you ${size} ${direction} where you'd otherwise be in five years. Nothing here is locked in, it's just the agent doing the arithmetic so you don't have to imagine it.`;
}
