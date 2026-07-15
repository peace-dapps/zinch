import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const VALID_STATES = [
  "created",
  "accepted",
  "funded",
  "submitted",
  "completed",
  "refunded",
  "cancelled",
  "disputed",
  "expired",
];

const VALID_TRANSITIONS: Record<string, string[]> = {
  created: ["accepted", "cancelled", "expired"],
  accepted: ["funded", "cancelled"],
  funded: ["submitted", "refunded", "disputed"],
  submitted: ["completed", "refunded", "disputed"],
  disputed: ["completed", "refunded", "disputed"],
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { newState, txSignature } = body;

    if (!VALID_STATES.includes(newState)) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    const { data: deal, error: fetchError } = await supabaseAdmin
      .from("deals")
      .select("*")
      .eq("deal_id", id)
      .single();

    if (fetchError || !deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const allowedNext = VALID_TRANSITIONS[deal.state] || [];
    if (!allowedNext.includes(newState)) {
      return NextResponse.json(
        { error: `Cannot transition from ${deal.state} to ${newState}` },
        { status: 400 }
      );
    }

    const updates: any = {
      state: newState,
      updated_at: new Date().toISOString(),
    };

    if (newState === "accepted") {
      updates.accepted_at = new Date().toISOString();
    } else if (newState === "funded") {
      updates.funded_at = new Date().toISOString();
      if (txSignature) updates.fund_tx_signature = txSignature;
    } else if (newState === "submitted") {
      updates.submitted_at = new Date().toISOString();
    } else if (newState === "completed") {
      updates.completed_at = new Date().toISOString();
      if (txSignature) updates.release_tx_signature = txSignature;
      // If coming from dispute, record resolution
      if (deal.state === "disputed") {
        updates.resolved_at = new Date().toISOString();
        if (txSignature) updates.resolution_tx_signature = txSignature;
      }
    } else if (newState === "disputed") {
      updates.disputed_at = new Date().toISOString();
      if (txSignature) updates.dispute_tx_signature = txSignature;
    }

    // Handle propose_resolution (state stays disputed but proposed amounts change)
    if (body.proposedWorkerAmount !== undefined) {
      updates.proposed_worker_amount = body.proposedWorkerAmount;
      updates.proposed_client_amount = body.proposedClientAmount;
      updates.proposed_by = body.proposedBy;
      // Don't change state since propose is state-neutral within disputed
      if (deal.state === "disputed" && newState === "disputed") {
        delete updates.disputed_at; // Don't overwrite the original dispute time
      }
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("deals")
      .update(updates)
      .eq("deal_id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ deal: updated });
  } catch (err) {
    console.error("Update deal state error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}