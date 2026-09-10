"use client";

import { useState } from "react";
import type { AgentState } from "@/lib/types/finance";

interface ChatEntry {
  role: "user" | "agent";
  text: string;
  usedLLM?: boolean;
  toolCalls?: { name: string }[];
}

const SUGGESTIONS = [
  "How am I doing on eating out this month?",
  "When can I afford a house down payment?",
  "How do I compare to people like me?",
  "Should I get married for the tax benefits?",
];

export default function AgentChat({ state }: { state: AgentState }) {
  const [entries, setEntries] = useState<ChatEntry[]>([
    { role: "agent", text: "Ask me anything about your budget, goals, or how you compare to peers — I'll pull real numbers before I answer." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(message: string) {
    if (!message.trim() || loading) return;
    setEntries((e) => [...e, { role: "user", text: message }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, state }),
      });
      const data = await res.json();
      setEntries((e) => [...e, { role: "agent", text: data.reply, usedLLM: data.usedLLM, toolCalls: data.toolCalls }]);
    } catch {
      setEntries((e) => [...e, { role: "agent", text: "Something went wrong reaching the agent — please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card flex flex-col p-6">
      <h2 className="font-semibold">Ask the agent</h2>
      <p className="mt-1 text-xs text-foreground/55">
        A genuine tool-use loop — the agent calls the same budget/goal/benchmark tools shown elsewhere on this page.
      </p>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto" style={{ maxHeight: 320 }}>
        {entries.map((e, i) => (
          <div key={i} className={`flex ${e.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                e.role === "user" ? "bg-accent text-white" : "bg-background/70 text-foreground/85"
              }`}
            >
              {e.text}
              {e.role === "agent" && e.toolCalls && e.toolCalls.length > 0 && (
                <p className="mt-1 text-[10px] uppercase tracking-wide opacity-50">
                  tools: {e.toolCalls.map((t) => t.name).join(", ")}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-foreground/40">Agent is thinking…</div>}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="rounded-full border border-border px-2.5 py-1 text-[11px] text-foreground/60 transition hover:bg-accent-soft"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
