import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { privyId, ...updates } = body;

    if (!privyId) {
      return NextResponse.json({ error: "Missing privyId" }, { status: 400 });
    }

    // Whitelist of updatable fields
    const allowed = [
      "display_name",
      "handle",
      "bio",
      "notify_accepted",
      "notify_funded",
      "notify_submitted",
      "notify_completed",
      "notify_refunded",
      "notify_disputed",
    ];

    const clean: any = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        clean[key] = updates[key];
      }
    }

    // Handle validation if provided
    if (clean.handle) {
      const normalized = clean.handle.toLowerCase().trim();
      if (!/^[a-z0-9_-]{3,30}$/.test(normalized)) {
        return NextResponse.json(
          {
            error:
              "Handle must be 3-30 characters, lowercase letters/numbers/dashes/underscores only.",
          },
          { status: 400 }
        );
      }
      clean.handle = normalized;

      // Check uniqueness (exclude current user)
      const { data: conflict } = await supabaseAdmin
        .from("users")
        .select("privy_id")
        .eq("handle", normalized)
        .neq("privy_id", privyId)
        .maybeSingle();

      if (conflict) {
        return NextResponse.json(
          { error: "Handle already taken." },
          { status: 409 }
        );
      }
    }

    if (clean.bio && clean.bio.length > 160) {
      return NextResponse.json(
        { error: "Bio must be 160 characters or less." },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabaseAdmin
      .from("users")
      .update(clean)
      .eq("privy_id", privyId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}