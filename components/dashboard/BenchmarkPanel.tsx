"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BenchmarkResult } from "@/lib/types/finance";
import { DATASET_SIZE } from "@/lib/finance/dataset";

export default function BenchmarkPanel({ benchmark }: { benchmark: BenchmarkResult | null }) {
  if (!benchmark) {
    return (
      <div className="card p-6">
        <h2 className="font-semibold">Peer benchmark</h2>
        <p className="mt-2 text-sm text-foreground/60">
          Not enough data to place you against peers yet. This needs your income and city tier.
        </p>
      </div>
    );
  }

  const chartData = benchmark.categoryComparison.map((c) => ({
    category: c.category.replace("_", " "),
    You: c.userSharePercent,
    Peers: c.peerMedianSharePercent,
  }));

  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">How you compare</h2>
        <span className="text-xs text-foreground/50">vs. {benchmark.peerCount.toLocaleString("en-IN")} similar profiles</span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent-soft">
          <span className="text-lg font-bold text-accent">{benchmark.percentileEstimate}th</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/70">
          percentile for savings rate. You save <strong>{benchmark.userSavingsRate}%</strong> of income; the peer
          median is {benchmark.peerSavingsRateMedian}% (P25 {benchmark.peerSavingsRateP25}% – P75{" "}
          {benchmark.peerSavingsRateP75}%).
        </p>
      </div>
      {chartData.length > 0 && (
        <div className="mt-6 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3ddc9" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#12231d99" }} tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#12231d99" }} tickLine={false} axisLine={false} width={40} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, border: "1px solid #e3ddc9", fontSize: 12 }} />
              <Bar dataKey="You" fill="#14532d" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Peers" fill="#b45309" radius={[3, 3, 0, 0]} opacity={0.55} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-3 text-[11px] text-foreground/40">
        Peer distribution drawn from a {DATASET_SIZE.toLocaleString("en-IN")}-profile synthetic dataset modeled on
        Kaggle&apos;s Indian Personal Finance and Spending Habits schema.
      </p>
    </div>
  );
}
