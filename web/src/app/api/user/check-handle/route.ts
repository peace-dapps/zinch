import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit({
      key: `check-handle:${ip}`,
      limit: 30,
      windowMs: 60 * 1000, // 30 per minute per IP
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again shortly." },
        { status: 429 }
      );
    }
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