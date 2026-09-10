"use client";

import { motion } from "framer-motion";
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
      <motion.ol
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
        className="mt-4 space-y-4"
      >
        {messages.map((m) => (
          <motion.li
            key={m.id}
            variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-3"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
              {m.step}
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/45">{STEP_LABELS[m.step]}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-foreground/85">{m.text}</p>
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </div>
  );
}
