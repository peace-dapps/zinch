import { NextResponse } from "next/server";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { supabaseAdmin } from "@/lib/supabase";
import {
  buildAutoReleaseInstruction,
  getDealPDAFromHex,
  getConnection,
  FEE_RECIPIENT,
} from "@/lib/anchor";

export async function POST(req: Request) {
  try {
    // In production, require a secret (from CRON_SECRET env var)
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    
    // Load the server-side keypair
    const keypairJson = process.env.ZINCH_AUTO_RELEASE_KEYPAIR;
    if (!keypairJson) {
      return NextResponse.json(
        { error: "Server keypair not configured" },
        { status: 500 }
      );
    }

    const keypairBytes = JSON.parse(keypairJson);
    const signerKeypair = Keypair.fromSecretKey(new Uint8Array(keypairBytes));
    console.log("Auto-release signer:", signerKeypair.publicKey.toBase58());

    // Find deals that are submitted and past their auto-release timer
    const now = new Date();
    const { data: submittedDeals, error: fetchError } = await supabaseAdmin
      .from("deals")
      .select("*")
      .eq("state", "submitted");

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const eligibleDeals = (submittedDeals || []).filter((deal) => {
      if (!deal.submitted_at) return false;
      const submittedAt = new Date(deal.submitted_at);
      const timerExpiresAt = new Date(
        submittedAt.getTime() + deal.auto_release_seconds * 1000
      );
      return timerExpiresAt <= now;
    });

    console.log(
      `Found ${eligibleDeals.length} deals eligible for auto-release`
    );

    if (eligibleDeals.length === 0) {
      return NextResponse.json({
        message: "No deals eligible for auto-release",
        checked: submittedDeals?.length || 0,
      });
    }

    const connection = getConnection();
    const results: any[] = [];

    for (const deal of eligibleDeals) {
      try {
        const [dealPDA] = getDealPDAFromHex(deal.deal_id);

        const instruction = await buildAutoReleaseInstruction({
          signerPubkey: signerKeypair.publicKey,
          dealPDA,
          workerPubkey: new PublicKey(deal.worker_wallet),
          feeRecipient: FEE_RECIPIENT,
        });

        const { blockhash } = await connection.getLatestBlockhash();
        const transaction = new Transaction({
          recentBlockhash: blockhash,
          feePayer: signerKeypair.publicKey,
        });
        transaction.add(instruction);

        // Simulate first
        const sim = await connection.simulateTransaction(transaction);
        if (sim.value.err) {
          console.error(
            `Simulation failed for deal ${deal.deal_id}:`,
            sim.value.err,
            sim.value.logs
          );
          results.push({
            deal_id: deal.deal_id,
            success: false,
            error: JSON.stringify(sim.value.err),
            logs: sim.value.logs,
          });
          continue;
        }

        // Sign and send
        transaction.sign(signerKeypair);
        const signature = await connection.sendRawTransaction(
          transaction.serialize()
        );
        await connection.confirmTransaction(signature, "confirmed");

        console.log(`Auto-released deal ${deal.deal_id}: ${signature}`);

        // Update Supabase
        await supabaseAdmin
          .from("deals")
          .update({
            state: "completed",
            completed_at: new Date().toISOString(),
            release_tx_signature: signature,
            updated_at: new Date().toISOString(),
          })
          .eq("deal_id", deal.deal_id);

        results.push({
          deal_id: deal.deal_id,
          success: true,
          signature,
        });
      } catch (err: any) {
        console.error(`Failed to auto-release deal ${deal.deal_id}:`, err);
        results.push({
          deal_id: deal.deal_id,
          success: false,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      processed: eligibleDeals.length,
      results,
    });
  } catch (err: any) {
    console.error("Auto-release endpoint error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}

// Also support GET for easy manual testing in browser
export async function GET(req: Request) {
  return POST(req);
}