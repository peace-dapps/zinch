import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Cache for 60 seconds to avoid overloading DB on public traffic
export const revalidate = 60;

export async function GET() {
  try {
    const now = new Date();
    const day30Ago = new Date(now.getTime() - 30 * 86400000).toISOString();

    const { data: deals } = await supabaseAdmin
      .from("deals")
      .select("state, amount_lamports, created_at, completed_at");

    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, created_at");

    const allDeals = deals || [];
    const allUsers = users || [];

    let totalVolumeCompleted = 0;
    let totalFeesEarned = 0;
    let disputedCount = 0;
    let refundedCount = 0;
    let completedCount = 0;
    let inFlight = 0;

    for (const d of allDeals) {
      if (d.state === "completed") {
        completedCount++;
        totalVolumeCompleted += d.amount_lamports || 0;
        totalFeesEarned += Math.floor(((d.amount_lamports || 0) * 150) / 10_000);
      }
      if (d.state === "refunded") refundedCount++;
      if (d.state === "disputed") disputedCount++;
      if (["funded", "submitted", "disputed"].includes(d.state)) inFlight++;
    }

    const totalDeals = allDeals.length;
    const dealsLast30d = allDeals.filter(
      (d) => d.created_at >= day30Ago
    ).length;

    const totalUsers = allUsers.length;
    const usersLast30d = allUsers.filter(
      (u) => u.created_at >= day30Ago
    ).length;

    // Success rate = completed / (completed + refunded), excluding not-yet-settled
    const settled = completedCount + refundedCount;
    const successRate = settled > 0 ? Math.round((completedCount / settled) * 100) : 100;

    return NextResponse.json({
      totalDeals,
      dealsLast30d,
      completedCount,
      refundedCount,
      disputedCount,
      inFlight,
      totalUsers,
      usersLast30d,
      totalVolumeCompletedLamports: totalVolumeCompleted,
      totalFeesEarnedLamports: totalFeesEarned,
      successRate,
      lastUpdated: now.toISOString(),
    });
  } catch (err) {
    console.error("Public stats error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}