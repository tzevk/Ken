import { NextRequest, NextResponse } from "next/server";
import { runAgentChat } from "@/lib/agent/claudeAgent";
import type { AgentState } from "@/lib/types/finance";

export const runtime = "nodejs";

interface ChatRequestBody {
  message: string;
  state: AgentState;
}

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.message || !body?.state) {
    return NextResponse.json({ error: "message and state are required" }, { status: 400 });
  }

  const turn = await runAgentChat(body.message, body.state);
  return NextResponse.json(turn);
}
