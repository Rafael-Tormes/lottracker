import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

type StartBody = { externalId?: string | null };

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const { externalId = null }: StartBody = await req.json();

    const { data, error } = await supabase
      .from("auction_sessions")
      .insert({ external_id: externalId, started_at: new Date().toISOString() })
      .select("session_id, external_id, started_at")
      .single();

    if (error || !data)
      return NextResponse.json(
        { error: error?.message ?? "create_failed" },
        { status: 500 }
      );
    return NextResponse.json({
      sessionId: data.session_id,
      externalId: data.external_id,
      startedAt: data.started_at,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
