import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { handle, excludePrivyId } = await req.json();

    if (!handle) {
      return NextResponse.json({ error: "Missing handle" }, { status: 400 });
    }

    const normalized = handle.toLowerCase().trim();

    // Validate handle format
    if (!/^[a-z0-9_-]{3,30}$/.test(normalized)) {
      return NextResponse.json({
        available: false,
        reason:
          "Handle must be 3-30 characters and contain only lowercase letters, numbers, dashes, or underscores.",
      });
    }

    const RESERVED = ["admin", "root", "zinch", "api", "docs", "legal", "new", "dashboard", "settings", "d", "r", "u"];
    if (RESERVED.includes(normalized)) {
      return NextResponse.json({
        available: false,
        reason: "That handle is reserved.",
      });
    }

    let query = supabaseAdmin
      .from("users")
      .select("privy_id")
      .eq("handle", normalized);

    if (excludePrivyId) {
      query = query.neq("privy_id", excludePrivyId);
    }

    const { data } = await query.maybeSingle();

    return NextResponse.json({
      available: !data,
      reason: data ? "Already taken." : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}