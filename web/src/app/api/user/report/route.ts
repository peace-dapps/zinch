import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit({ key: `report:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many reports. Try again later." }, { status: 429 });
    }

    const { reporterWallet, reportedWallet, reportedHandle, reason } = await req.json();

    if (!reporterWallet || !reportedWallet || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (reason.length > 500) {
      return NextResponse.json({ error: "Reason must be under 500 characters" }, { status: 400 });
    }

    if (reporterWallet === reportedWallet) {
      return NextResponse.json({ error: "You can't report yourself" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("reports")
      .insert({
        reporter_wallet: reporterWallet,
        reported_wallet: reportedWallet,
        reported_handle: reportedHandle || null,
        reason,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ report: data });
  } catch (err) {
    console.error("Report error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}