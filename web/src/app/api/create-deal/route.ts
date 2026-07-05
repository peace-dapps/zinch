import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      dealId,
      creatorWallet,
      counterpartyWallet,
      workerWallet,
      clientWallet,
      title,
      description,
      amountLamports,
      amountDisplay,
      kind,
      autoReleaseSeconds,
      acceptanceDeadline,
      createTxSignature,
    } = body;

    if (!dealId || !creatorWallet || !title || !amountLamports) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Look up the creator user by wallet
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("wallet_address", creatorWallet)
      .single();

    const { data, error } = await supabaseAdmin
      .from("deals")
      .insert({
        deal_id: dealId,
        creator_id: userData?.id || null,
        creator_wallet: creatorWallet,
        counterparty_wallet: counterpartyWallet,
        worker_wallet: workerWallet,
        client_wallet: clientWallet,
        title,
        description,
        amount_lamports: amountLamports,
        amount_display: amountDisplay,
        currency: "SOL",
        kind,
        auto_release_seconds: autoReleaseSeconds,
        acceptance_deadline: acceptanceDeadline,
        state: "created",
        create_tx_signature: createTxSignature,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deal: data });
  } catch (err) {
    console.error("Create deal error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}