import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

function getEventType(p: unknown): string | null {
  if (typeof p === "object" && p !== null && "type" in p) {
    const t = (p as Record<string, unknown>).type;
    return typeof t === "string" ? t : null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();

    // Try to parse JSON; otherwise keep raw string
    let payload: unknown = raw;
    try {
      payload = JSON.parse(raw);
    } catch {
      /* keep raw string */
    }

    const eventType = getEventType(payload);

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("whatnot_events")
      .insert([{ event_type: eventType, payload }]);

    if (error) {
      console.error("whatnot webhook insert error:", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    // Respond quickly so senders don’t retry
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("whatnot webhook POST error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("whatnot_events")
      .select("*")
      .order("received_at", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    console.error("whatnot webhook GET error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
