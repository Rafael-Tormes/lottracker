import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

/**
 * Minimal scan → attach batch to a lot or bin.
 * Body: { batchId: string, lotId?: string, binId?: string, barcode?: string }
 * barcode is optional; we don't persist it.
 */
export async function POST(req: NextRequest) {
  const { batchId, lotId, binId } = await req.json();
  if (!batchId || (!lotId && !binId)) {
    return NextResponse.json(
      { error: "batchId and (lotId|binId) required" },
      { status: 400 }
    );
  }

  if (lotId) {
    const { error } = await supabaseServer
      .from("lots")
      .update({ batch_id: batchId })
      .eq("id", lotId);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (binId) {
    const { error } = await supabaseServer
      .from("bins")
      .update({ batch_id: batchId })
      .eq("id", binId);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
