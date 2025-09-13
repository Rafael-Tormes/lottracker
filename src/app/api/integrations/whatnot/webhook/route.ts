import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

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

    // Parse if JSON, otherwise keep as string
    let payload: unknown = raw;
    try {
      payload = JSON.parse(raw);
    } catch {
      // keep raw string in payload
    }

    const eventType = getEventType(payload);

    const { error } = await supabaseServer
      .from("whatnot_events")
      .insert([{ event_type: eventType, payload }]);

    if (error) {
      console.error("insert error:", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    // Respond quickly so senders don't retry
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("whatnot_events")
      .select("*")
      .order("received_at", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
