"use client";

import type { Insight } from "@/lib/types/finance";

const SEVERITY_STYLE: Record<Insight["severity"], string> = {
  positive: "border-l-emerald-500",
  info: "border-l-slate-300",
  watch: "border-l-amber-500",
  alert: "border-l-red-500",
};

export default function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="card p-6">
      <h2 className="font-semibold">Insights from your data</h2>
      <div className="mt-4 space-y-3">
        {insights.map((i) => (
          <div key={i.id} className={`border-l-4 ${SEVERITY_STYLE[i.severity]} rounded-r-lg bg-background/60 p-3`}>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold">{i.headline}</p>
              {i.metric && (
                <span className="shrink-0 text-xs font-medium text-foreground/50">
                  {i.metric.label}: {i.metric.value}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-foreground/65">{i.detail}</p>
          </div>
        ))}
        {insights.length === 0 && <p className="text-sm text-foreground/50">No insights yet.</p>}
      </div>
    </div>
  );
}
