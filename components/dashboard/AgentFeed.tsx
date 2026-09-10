"use client";

import type { AgentMessage } from "@/lib/types/finance";

const STEP_LABELS: Record<number, string> = {
  1: "Understanding you",
  2: "Loading your data",
  3: "Suggesting goals",
  4: "Surfacing insights",
  5: "Projecting your future",
  6: "Live feedback",
};

export default function AgentFeed({ messages }: { messages: AgentMessage[] }) {
  return (
    <div className="card p-6">
      <h2 className="font-semibold">The agent, step by step</h2>
      <ol className="mt-4 space-y-4">
        {messages.map((m) => (
          <li key={m.id} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
              {m.step}
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/45">{STEP_LABELS[m.step]}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-foreground/85">{m.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
