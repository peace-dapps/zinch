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

    const days = parseInt(searchParams.get("days") || "30");
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();

    // Fetch completed deals within window
    const { data: completedDeals } = await supabaseAdmin
      .from("deals")
      .select("amount_lamports, completed_at, worker_wallet, client_wallet")
      .eq("state", "completed")
      .gte("completed_at", cutoff);

    // Fetch all users signed up in window
    const { data: newUsers } = await supabaseAdmin
      .from("users")
      .select("id, created_at")
      .gte("created_at", cutoff);

    // Fetch all deals in window (for volume, not just completed)
    const { data: allDeals } = await supabaseAdmin
      .from("deals")
      .select("amount_lamports, created_at, state")
      .gte("created_at", cutoff);

    // Bucket by day
    const buckets: Record<string, { fees: number; volume: number; deals: number; signups: number }> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { fees: 0, volume: 0, deals: 0, signups: 0 };
    }

    for (const d of completedDeals || []) {
      if (!d.completed_at) continue;
      const key = d.completed_at.slice(0, 10);
      if (!buckets[key]) buckets[key] = { fees: 0, volume: 0, deals: 0, signups: 0 };
      const fee = Math.floor((d.amount_lamports * 150) / 10_000);
      buckets[key].fees += fee;
      buckets[key].volume += d.amount_lamports;
    }

    for (const d of allDeals || []) {
      const key = d.created_at.slice(0, 10);
      if (!buckets[key]) buckets[key] = { fees: 0, volume: 0, deals: 0, signups: 0 };
      buckets[key].deals += 1;
    }

    for (const u of newUsers || []) {
      const key = u.created_at.slice(0, 10);
      if (!buckets[key]) buckets[key] = { fees: 0, volume: 0, deals: 0, signups: 0 };
      buckets[key].signups += 1;
    }

    // Sort by date ascending
    const series = Object.keys(buckets)
      .sort()
      .map((date) => ({
        date,
        fees: buckets[date].fees,
        volume: buckets[date].volume,
        deals: buckets[date].deals,
        signups: buckets[date].signups,
      }));

    // Totals
    const totalFees = series.reduce((s, x) => s + x.fees, 0);
    const totalVolume = series.reduce((s, x) => s + x.volume, 0);
    const totalDeals = series.reduce((s, x) => s + x.deals, 0);
    const totalSignups = series.reduce((s, x) => s + x.signups, 0);

    return NextResponse.json({
      series,
      totals: {
        fees: totalFees,
        volume: totalVolume,
        deals: totalDeals,
        signups: totalSignups,
      },
      days,
    });
  } catch (err) {
    console.error("Admin revenue error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}