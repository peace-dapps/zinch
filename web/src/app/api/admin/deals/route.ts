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

    const stateFilter = searchParams.get("state");
    const q = searchParams.get("q")?.toLowerCase() || "";

    let query = supabaseAdmin
      .from("deals")
      .select("*")
      .order("created_at", { ascending: false });

    if (stateFilter && stateFilter !== "all") {
      query = query.eq("state", stateFilter);
    }

    const { data: deals } = await query;
    let filtered = deals || [];

    if (q) {
      filtered = filtered.filter(
        (d) =>
          d.deal_id.toLowerCase().includes(q) ||
          (d.title || "").toLowerCase().includes(q) ||
          (d.worker_wallet || "").toLowerCase().includes(q) ||
          (d.client_wallet || "").toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ deals: filtered });
  } catch (err: any) {
    console.error("Admin deals error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}