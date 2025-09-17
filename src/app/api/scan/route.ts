import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

/**
 * Minimal scan → attach batch to a lot or bin.
 * Body: { batchId: string, lotId?: string, binId?: string, barcode?: string }
 */
export async function POST(req: NextRequest) {
  const { batchId, lotId, binId } = await req.json();

  if (!batchId || (!lotId && !binId)) {
    return NextResponse.json(
      { error: "batchId and (lotId|binId) required" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServer();

  if (lotId) {
    const { error } = await supabase
      .from("lots")
      .update({ batch_id: batchId })
      .eq("lot_id", lotId); // ← use "id" here if your column is id
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (binId) {
    const { error } = await supabase
      .from("bins")
      .update({ batch_id: batchId })
      .eq("bin_id", binId); // ← use "id" here if your column is id
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
