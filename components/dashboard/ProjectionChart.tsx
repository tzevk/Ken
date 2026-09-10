"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Milestone, ProjectionPoint } from "@/lib/types/finance";

function inrShort(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function ProjectionChart({
  projections,
  milestones,
}: {
  projections: ProjectionPoint[];
  milestones: Milestone[];
}) {
  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">Net worth projection</h2>
        <span className="text-xs text-foreground/50">5-year outlook at current surplus</span>
      </div>
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projections} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14532d" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#14532d" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3ddc9" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={Math.floor(projections.length / 6)}
              tick={{ fontSize: 11, fill: "#12231d99" }}
            />
            <YAxis tickFormatter={inrShort} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#12231d99" }} width={56} />
            <Tooltip
              formatter={(value) => [inrShort(Number(value)), "Net worth"]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e3ddc9", fontSize: 12 }}
            />
            <Area type="monotone" dataKey="netWorth" stroke="#14532d" strokeWidth={2} fill="url(#netWorthFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {milestones.map((m) => (
          <div key={m.id} className="rounded-lg bg-background/60 p-3 text-xs">
            <p className="font-semibold">{m.label}</p>
            <p className="mt-1 text-foreground/60">
              {m.beyondHorizon ? "40+ yrs at current surplus" : `~${Math.round(m.targetMonthIndex / 12)} yrs`} ·{" "}
              {inrShort(m.targetAmount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
