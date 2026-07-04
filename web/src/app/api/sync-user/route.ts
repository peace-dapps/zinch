import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { privyId, email, googleEmail, telegramUsername, walletAddress } =
      body;

    if (!privyId) {
      return NextResponse.json(
        { error: "Missing privyId" },
        { status: 400 }
      );
    }

    // Upsert: create user if doesn't exist, update if does
    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          privy_id: privyId,
          email: email || null,
          google_email: googleEmail || null,
          telegram_username: telegramUsername || null,
          wallet_address: walletAddress || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "privy_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("Sync user error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}