import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing deal ID" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("*")
      .eq("deal_id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json({ deal: data });
  } catch (err) {
    console.error("Fetch deal error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}