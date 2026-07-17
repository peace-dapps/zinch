import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    if (!handle) {
      return NextResponse.json({ error: "Missing handle" }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select(
        "id, handle, display_name, bio, wallet_address, created_at"
      )
      .eq("handle", handle.toLowerCase())
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch stats: deals where user is worker or client
    const { data: deals } = await supabaseAdmin
      .from("deals")
      .select("state, amount_lamports, worker_wallet, client_wallet, completed_at, title, deal_id, currency")
      .or(
        `worker_wallet.eq.${user.wallet_address},client_wallet.eq.${user.wallet_address}`
      )
      .order("completed_at", { ascending: false, nullsFirst: false });

    let dealsCompleted = 0;
    let volumeAsWorker = 0;
    let volumeAsClient = 0;
    let dealsAsWorker = 0;
    let dealsAsClient = 0;

    for (const d of deals || []) {
      const isWorker = d.worker_wallet === user.wallet_address;
      if (isWorker) dealsAsWorker++;
      else dealsAsClient++;

      if (d.state === "completed") {
        dealsCompleted++;
        if (isWorker) volumeAsWorker += d.amount_lamports || 0;
        else volumeAsClient += d.amount_lamports || 0;
      }
    }

    const recentCompleted = (deals || [])
      .filter((d) => d.state === "completed")
      .slice(0, 5);

    return NextResponse.json({
      user,
      stats: {
        dealsCompleted,
        dealsAsWorker,
        dealsAsClient,
        volumeAsWorker,
        volumeAsClient,
        successRate:
          dealsAsWorker + dealsAsClient > 0
            ? Math.round(
                (dealsCompleted / (dealsAsWorker + dealsAsClient)) * 100
              )
            : 100,
      },
      recentDeals: recentCompleted,
    });
  } catch (err: any) {
    console.error("Fetch user error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}