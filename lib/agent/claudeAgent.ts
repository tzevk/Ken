import Anthropic from "@anthropic-ai/sdk";
import type { AgentState } from "@/lib/types/finance";
import { AGENT_TOOL_DEFINITIONS, executeAgentTool } from "@/lib/agent/tools";

const MODEL = "claude-sonnet-4-5";

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `You are an agentic personal-finance co-pilot. Your product philosophy: financial advice should adapt to the life behind the numbers, not just the numbers, and your job is to make the user financially smarter and more independent, never dependent on you. You have tools to look up the user's real financial snapshot, budgets, goals, insights, peer benchmarks, and projections. Always call a relevant tool before answering a question with numbers in it, never guess or invent a figure. Answer in 2-5 sentences, direct and warm, using periods and commas rather than em dashes, no headers, bullet lists, or emoji. If the user asks something no tool can answer (e.g. "should I get married for tax benefits"), say plainly that this is a decision the agent should never make for them.`;

export interface AgentChatTurn {
  reply: string;
  toolCalls: { name: string; input: Record<string, unknown>; result: unknown }[];
  usedLLM: boolean;
}

/**
 * Genuine tool-use agentic loop: Claude decides which of the agent's
 * tools (see lib/agent/tools.ts) to call, we execute them against the
 * current AgentState, feed results back, and loop until Claude produces
 * a final natural-language answer. Falls back to a small deterministic
 * intent router when no ANTHROPIC_API_KEY is configured, so the product
 * still functions end-to-end in a demo/deployment with no secrets set.
 */
export async function runAgentChat(userMessage: string, state: AgentState): Promise<AgentChatTurn> {
  const c = getClient();
  if (!c) return deterministicChat(userMessage, state);

  const toolCalls: AgentChatTurn["toolCalls"] = [];
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }];

  for (let iteration = 0; iteration < 4; iteration++) {
    let resp;
    try {
      resp = await c.messages.create({
        model: MODEL,
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        tools: AGENT_TOOL_DEFINITIONS as unknown as Anthropic.Tool[],
        messages,
      });
    } catch {
      return deterministicChat(userMessage, state);
    }

    const toolUseBlocks = resp.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (toolUseBlocks.length === 0) {
      const textBlock = resp.content.find((b) => b.type === "text");
      return {
        reply: textBlock && textBlock.type === "text" ? textBlock.text.trim() : "I wasn't able to form a response. Try rephrasing?",
        toolCalls,
        usedLLM: true,
      };
    }

    messages.push({ role: "assistant", content: resp.content });
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const result = executeAgentTool(block.name, block.input as Record<string, unknown>, state);
      toolCalls.push({ name: block.name, input: block.input as Record<string, unknown>, result });
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  return { reply: "I looked into this from a few angles but couldn't settle on a clean answer. Could you narrow the question?", toolCalls, usedLLM: true };
}

/** Deterministic fallback: simple keyword routing to the same tool functions, templated output. */
function deterministicChat(userMessage: string, state: AgentState): AgentChatTurn {
  const q = userMessage.toLowerCase();
  const toolCalls: AgentChatTurn["toolCalls"] = [];

  const call = (name: string, input: Record<string, unknown> = {}) => {
    const result = executeAgentTool(name, input, state);
    toolCalls.push({ name, input, result });
    return result;
  };

  if (/(goal|save for|target|plan for)/.test(q)) {
    const goals = call("get_goals") as { title: string; monthlyCommitment: number; horizonMonths: number }[];
    const top = goals[0];
    return {
      reply: top
        ? `Your top suggested goal is "${top.title}" at ₹${top.monthlyCommitment.toLocaleString("en-IN")}/month, reachable in about ${Math.round(top.horizonMonths / 12)} years. There are ${goals.length} options total on your dashboard, sized to what your surplus can actually support.`
        : "I don't have enough profile data yet to suggest goals. Complete the intake first.",
      toolCalls,
      usedLLM: false,
    };
  }
  if (/(budget|spend|spending|overspend|eating out|groceries|transport|entertainment|utilities|healthcare|rent|emi|how am i doing|doing on)/.test(q)) {
    const snapshot = call("get_financial_snapshot") as { monthlySurplus: number; savingsRatePercent: number };
    return {
      reply: `Your monthly surplus is roughly ₹${snapshot.monthlySurplus?.toLocaleString?.("en-IN") ?? "0"} (${snapshot.savingsRatePercent}% savings rate). Check the budget panel for a category-by-category breakdown against your peer median.`,
      toolCalls,
      usedLLM: false,
    };
  }
  if (/(compare|peer|other|percentile|benchmark)/.test(q)) {
    const bench = call("get_benchmark") as { percentileEstimate?: number; peerCount?: number } | null;
    return {
      reply: bench?.percentileEstimate
        ? `You're saving more than roughly ${bench.percentileEstimate}% of ${bench.peerCount} peers with a similar income and city tier.`
        : "I don't have a peer benchmark yet. This needs your income and city tier from onboarding.",
      toolCalls,
      usedLLM: false,
    };
  }
  if (/(net worth|future|project|independence|freedom)/.test(q)) {
    const projection = call("get_projection", { months: 24 }) as { netWorth: number }[];
    const last = projection[projection.length - 1];
    return {
      reply: last
        ? `At your current surplus, projected net worth in 24 months is roughly ₹${last.netWorth.toLocaleString("en-IN")}. This assumes no major life changes, so revisit it whenever your income or goals shift.`
        : "I need your profile first to project anything.",
      toolCalls,
      usedLLM: false,
    };
  }

  call("get_financial_snapshot");
  return {
    reply:
      "I can answer questions about your budget, goals, peer comparisons, and future projections. Try asking something like \"how am I doing on eating out this month?\" or \"when can I afford a house down payment?\"",
    toolCalls,
    usedLLM: false,
  };
}
