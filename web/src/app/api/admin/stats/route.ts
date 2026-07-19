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

    const now = new Date();
    const day7Ago = new Date(now.getTime() - 7 * 86400000).toISOString();
    const day30Ago = new Date(now.getTime() - 30 * 86400000).toISOString();

    // Fetch all deals (small dataset for now)
    const { data: deals } = await supabaseAdmin
      .from("deals")
      .select("state, amount_lamports, created_at, completed_at");

    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, created_at, wallet_address");

    const allDeals = deals || [];
    const allUsers = users || [];

    // Totals
    const totalDeals = allDeals.length;
    const dealsLast7d = allDeals.filter(
      (d) => d.created_at >= day7Ago
    ).length;
    const dealsLast30d = allDeals.filter(
      (d) => d.created_at >= day30Ago
    ).length;

    let volumeLocked = 0;
    let volumeCompleted = 0;
    let feesEarned = 0;

    for (const d of allDeals) {
      const amount = d.amount_lamports || 0;
      const fee = Math.floor((amount * 150) / 10_000);
      if (d.state === "funded" || d.state === "submitted" || d.state === "disputed") {
        volumeLocked += amount;
      }
      if (d.state === "completed") {
        volumeCompleted += amount;
        feesEarned += fee;
      }
    }

    // Active users (last 30d)
    const activeUserWallets = new Set<string>();
    for (const d of allDeals) {
      if (d.created_at >= day30Ago) {
        // any wallet involved counts
      }
    }
    const activeUsersLast30d = allUsers.filter(
      (u) => u.created_at >= day30Ago
    ).length;

    // Deal state breakdown
    const stateBreakdown: Record<string, number> = {};
    for (const d of allDeals) {
      stateBreakdown[d.state] = (stateBreakdown[d.state] || 0) + 1;
    }

    // Total users
    const totalUsers = allUsers.length;
    const usersLast7d = allUsers.filter((u) => u.created_at >= day7Ago).length;
    const usersLast30d = allUsers.filter((u) => u.created_at >= day30Ago).length;

    return NextResponse.json({
      overview: {
        totalDeals,
        dealsLast7d,
        dealsLast30d,
        volumeLocked,
        volumeCompleted,
        feesEarned,
        totalUsers,
        usersLast7d,
        usersLast30d,
        activeUsersLast30d,
      },
      stateBreakdown,
    });
  } catch (err: any) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}