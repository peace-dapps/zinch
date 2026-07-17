import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { privyId } = await req.json();
    if (!privyId) {
      return NextResponse.json({ error: "Missing privyId" }, { status: 400 });
    }

    // Get user's wallet to clean wallet_emails too
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("wallet_address")
      .eq("privy_id", privyId)
      .maybeSingle();

    if (user?.wallet_address) {
      await supabaseAdmin
        .from("wallet_emails")
        .delete()
        .eq("wallet_address", user.wallet_address);
    }

    const { error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("privy_id", privyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}