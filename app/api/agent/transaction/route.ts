import { NextRequest, NextResponse } from "next/server";
import type { AgentState, Transaction } from "@/lib/types/finance";
import { evaluateTransaction } from "@/lib/finance/alerts";
import { getBenchmarkBucket } from "@/lib/finance/dataset";

export const runtime = "nodejs";

interface TxnRequestBody {
  state: AgentState;
  transaction: Omit<Transaction, "id" | "source"> & { id?: string };
}

/** STEP 6 — live feedback while making a transaction. */
export async function POST(req: NextRequest) {
  let body: TxnRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { state, transaction } = body;
  if (!state?.profile || !transaction) {
    return NextResponse.json({ error: "state.profile and transaction are required" }, { status: 400 });
  }

  const newTxn: Transaction = {
    id: transaction.id ?? `manual-${Date.now()}`,
    date: transaction.date ?? new Date().toISOString(),
    category: transaction.category,
    merchant: transaction.merchant,
    amount: transaction.amount,
    source: "simulated",
  };

  const bucket = getBenchmarkBucket(
    state.profile.income.personalIncome + state.profile.income.familyIncome,
    state.profile.cityTier,
  );
  const alert = evaluateTransaction(state.profile, newTxn, state.transactions, bucket?.bucket.category_median_share ?? null);

  return NextResponse.json({ transaction: newTxn, alert });
}
