import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Generate a handle from email/name
function generateHandleBase(input: string): string {
  return input
    .toLowerCase()
    .replace(/@.*$/, "") // strip email domain
    .replace(/[^a-z0-9_-]/g, "-") // only allow safe chars
    .replace(/-+/g, "-") // collapse dashes
    .replace(/^-|-$/g, "") // trim edge dashes
    .slice(0, 20);
}

async function findAvailableHandle(base: string): Promise<string> {
  const safeBase = base.length >= 3 ? base : `user-${base}`;

  // Try base first, then base-1, base-2, etc.
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? safeBase : `${safeBase}-${i}`;
    const { data } = await supabaseAdmin
      .from("users")
      .select("privy_id")
      .eq("handle", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }

  // Fallback: random suffix
  return `${safeBase}-${Math.floor(Math.random() * 10000)}`;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit({
      key: `sync-user:${ip}`,
      limit: 60,
      windowMs: 60 * 1000, // 60 per minute per IP
    });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const body = await req.json();
    const { privyId, email, googleEmail, telegramUsername, walletAddress } =
      body;

    if (!privyId) {
      return NextResponse.json({ error: "Missing privyId" }, { status: 400 });
    }

    // Check if user already exists
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("privy_id, handle")
      .eq("privy_id", privyId)
      .maybeSingle();

    // Generate handle only if new user
    let handle: string | undefined;
    if (!existing?.handle) {
      const source =
        telegramUsername || email || googleEmail || `user-${privyId.slice(-6)}`;
      const base = generateHandleBase(source);
      handle = await findAvailableHandle(base || "user");
    }

    const upsertPayload: any = {
      privy_id: privyId,
      email: email || null,
      google_email: googleEmail || null,
      telegram_username: telegramUsername || null,
      wallet_address: walletAddress || null,
      updated_at: new Date().toISOString(),
    };

    // Only set handle if it's a new user (don't overwrite chosen handles)
    if (handle) {
      upsertPayload.handle = handle;
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .upsert(upsertPayload, { onConflict: "privy_id" })
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also insert wallet_emails row for email notifications
    if (walletAddress && (email || googleEmail)) {
      const effectiveEmail = email || googleEmail;
      await supabaseAdmin
        .from("wallet_emails")
        .upsert(
          {
            wallet_address: walletAddress,
            email: effectiveEmail,
            privy_id: privyId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "wallet_address" }
        );
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Sync user error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}