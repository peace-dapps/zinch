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

    const { data: reports } = await supabaseAdmin
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    return NextResponse.json({ reports: reports || [] });
  } catch (err) {
    console.error("Admin reports error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}