import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminWallet } from "@/lib/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminWallet = searchParams.get("adminWallet");

    if (!isAdminWallet(adminWallet)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const sort = searchParams.get("sort") || "created_at";
    const q = searchParams.get("q")?.toLowerCase() || "";

    const query = supabaseAdmin
      .from("users")
      .select("id, privy_id, email, google_email, handle, display_name, wallet_address, created_at, telegram_username, banned")
      .order(sort, { ascending: false });

    const { data: users } = await query;
    let filteredUsers = users || [];

    if (q) {
      filteredUsers = filteredUsers.filter(
        (u) =>
          (u.email || "").toLowerCase().includes(q) ||
          (u.google_email || "").toLowerCase().includes(q) ||
          (u.handle || "").toLowerCase().includes(q) ||
          (u.wallet_address || "").toLowerCase().includes(q) ||
          (u.display_name || "").toLowerCase().includes(q)
      );
    }

    const wallets = filteredUsers.map((u) => u.wallet_address).filter(Boolean);
    const orFilter = wallets.length
      ? wallets.map((w) => `worker_wallet.eq.${w},client_wallet.eq.${w}`).join(",")
      : "worker_wallet.eq.null";

    const { data: deals } = await supabaseAdmin
      .from("deals")
      .select("worker_wallet, client_wallet, state, amount_lamports")
      .or(orFilter);

    const dealStatsByWallet: Record<string, { total: number; completed: number; volume: number }> = {};

    for (const d of deals || []) {
      const parties = [d.worker_wallet, d.client_wallet];
      for (const wallet of parties) {
        if (!wallet) continue;
        if (!dealStatsByWallet[wallet]) {
          dealStatsByWallet[wallet] = { total: 0, completed: 0, volume: 0 };
        }
        dealStatsByWallet[wallet].total += 1;
        if (d.state === "completed") {
          dealStatsByWallet[wallet].completed += 1;
          dealStatsByWallet[wallet].volume += d.amount_lamports || 0;
        }
      }
    }

    const enriched = filteredUsers.map((u) => ({
      ...u,
      stats: dealStatsByWallet[u.wallet_address || ""] || {
        total: 0,
        completed: 0,
        volume: 0,
      },
    }));

    return NextResponse.json({ users: enriched });
  } catch (err) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}