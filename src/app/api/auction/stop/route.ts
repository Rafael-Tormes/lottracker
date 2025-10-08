import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

type StopBody = { sessionId: string };

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const { sessionId }: StopBody = await req.json();
    if (!sessionId)
      return NextResponse.json(
        { error: "sessionId_required" },
        { status: 400 }
      );

    const { error } = await supabase
      .from("auction_sessions")
      .update({ ended_at: new Date().toISOString() })
      .eq("session_id", sessionId);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
