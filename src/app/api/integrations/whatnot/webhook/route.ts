import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
// import crypto from "node:crypto"; // keep for later when we verify signatures

// --- Webhook receiver: store every delivery ---
export async function POST(req: NextRequest) {
  try {
    // In production add signature verification here (HMAC with WHATNOT_WEBHOOK_SECRET).
    const raw = await req.text();

    let payload: unknown = raw;
    try {
      payload = JSON.parse(raw);
    } catch {
      /* keep as string if not JSON */
    }

    const eventType =
      typeof payload === "object" && payload && "type" in payload
        ? (payload as any).type
        : null;

    const { error } = await supabaseServer.from("whatnot_events").insert({
      event_type: eventType,
      payload, // jsonb
    });

    if (error) {
      console.error("insert error:", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    // Respond quickly so the sender doesn’t retry
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// --- Convenience GET to inspect recent events (dev only) ---
export async function GET() {
  const { data, error } = await supabaseServer
    .from("whatnot_events")
    .select("*")
    .order("received_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
