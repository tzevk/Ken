import Anthropic from "@anthropic-ai/sdk";
import type {
  BenchmarkResult,
  GoalOption,
  Insight,
  LinkedDataResult,
  Milestone,
  ProjectionPoint,
  UserProfile,
} from "@/lib/types/finance";

const MODEL = "claude-sonnet-4-5";

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `You are the narration layer of a personal-finance agent built around one thesis: financial advice should adapt to the life behind the numbers, not just the numbers. You never invent figures; you're always given the exact computed numbers and must weave them into 2-4 sentences of warm, direct, non-patronizing prose for the user. Write the way a sharp friend would talk, not a report. Use periods and commas, not em dashes. No bullet points, no headers, no emoji. Reference the person's actual stated life stage or aspirations when relevant instead of generic advice. Keep it tight.`;

async function callClaude(userPrompt: string): Promise<string | null> {
  const c = getClient();
  if (!c) return null;
  try {
    const resp = await c.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = resp.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text.trim() : null;
  } catch {
    return null; // fall back to template on any API error (rate limit, network, etc.)
  }
}

type StepPayload =
  | { linkedData: LinkedDataResult }
  | { goals: GoalOption[] }
  | { insights: Insight[] }
  | { benchmark: BenchmarkResult | null; milestones: Milestone[]; projections: ProjectionPoint[] };

export async function narrateStep(step: 2 | 3 | 4 | 5, profile: UserProfile, payload: StepPayload): Promise<string> {
  const template = templateFor(step, profile, payload);
  const c = getClient();
  if (!c) return template;

  const prompt = `User profile: ${profile.name}, age ${profile.age}, ${profile.occupation}, ${profile.cityTier.replace("_", " ")}, ${profile.dependents} dependents. Aspirations: mindset=${profile.aspirations.currentMindset}, family planning=${profile.aspirations.familyPlanning}, house=${profile.aspirations.housePlanning}, car=${profile.aspirations.carPlanning}. Notes: "${profile.aspirations.futurePlansNote}"

Step ${step} computed data (ground truth, do not alter numbers): ${JSON.stringify(payload)}

Write the narration for this step now.`;

  const result = await callClaude(prompt);
  return result ?? template;
}

function templateFor(step: 2 | 3 | 4 | 5, profile: UserProfile, payload: StepPayload): string {
  switch (step) {
    case 2: {
      const { linkedData } = payload as { linkedData: LinkedDataResult };
      if (linkedData.mode === "skipped") {
        return "No problem, we'll work from what you told us. You can connect data anytime and we'll sharpen everything against it.";
      }
      const { statedMonthlyExpenses, observedMonthlyExpenses, note } = linkedData.reconciliation;
      return `${linkedData.mode === "linked" ? "Linked your accounts" : "Logged your manual entries"}: ₹${observedMonthlyExpenses.toLocaleString("en-IN")}/month in spend vs. the ₹${statedMonthlyExpenses.toLocaleString("en-IN")} you estimated. ${note}`;
    }
    case 3: {
      const { goals } = payload as { goals: GoalOption[] };
      const top = goals[0];
      return `Based on your actual surplus rather than a wishlist, I've laid out ${goals.length} realistic paths forward, starting with ${top?.title.toLowerCase()}, reachable in about ${top ? Math.round(top.horizonMonths / 12) : "?"} years at ₹${top?.monthlyCommitment.toLocaleString("en-IN")}/month. Pick what fits. These aren't ranked by ambition, they're ranked by what your numbers can actually support.`;
    }
    case 4: {
      const { insights } = payload as { insights: Insight[] };
      const alertCount = insights.filter((i) => i.severity === "alert").length;
      const headline = insights[0]?.headline ?? "Here's what your data shows.";
      return `${headline}${alertCount ? ` I found ${alertCount} thing${alertCount > 1 ? "s" : ""} worth your attention below.` : " Nothing urgent stands out beyond what's below."}`;
    }
    case 5: {
      const { benchmark, milestones } = payload as {
        benchmark: BenchmarkResult | null;
        milestones: Milestone[];
        projections: ProjectionPoint[];
      };
      const firstMilestone = milestones[0];
      const horizonPhrase = firstMilestone?.beyondHorizon
        ? "more than 40 years out at your current surplus"
        : `about ${firstMilestone ? Math.round(firstMilestone.targetMonthIndex / 12) : "several"} years out`;
      const peerLine = benchmark
        ? ` That puts you ahead of roughly ${benchmark.percentileEstimate}% of people with a similar income and city tier.`
        : "";
      return `If your current surplus holds, ${firstMilestone?.label.toLowerCase() ?? "your first milestone"} is ${horizonPhrase}.${peerLine} These are projections, not promises. They update every time your numbers do.`;
    }
  }
}
