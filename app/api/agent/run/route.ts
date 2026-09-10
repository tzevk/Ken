import { NextRequest, NextResponse } from "next/server";
import { runAgentPipeline } from "@/lib/agent/orchestrator";
import type { DataSourceMode, Transaction, UserProfile } from "@/lib/types/finance";

export const runtime = "nodejs";

interface RunRequestBody {
  profile: UserProfile;
  dataMode: DataSourceMode;
  manualTransactions?: Transaction[];
}

export async function POST(req: NextRequest) {
  let body: RunRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.profile || !body.profile.name) {
    return NextResponse.json({ error: "profile is required" }, { status: 400 });
  }

  const state = await runAgentPipeline(body.profile, body.dataMode ?? "skipped", body.manualTransactions ?? []);
  return NextResponse.json(state);
}
