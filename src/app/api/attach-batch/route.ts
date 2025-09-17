import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();

  const { lotId, binId, batchId } = await req.json();

  if (!batchId || (!lotId && !binId)) {
    return NextResponse.json(
      { error: "batchId and (lotId|binId) required" },
      { status: 400 }
    );
  }

  if (lotId) {
    const { error } = await supabase
      .from("lots")
      .update({ batch_id: batchId })
      .eq("lot_id", lotId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (binId) {
    // NOTE: if your PK column is actually "id" for bins, change this eq() to .eq("id", binId)
    const { error } = await supabase
      .from("bins")
      .update({ batch_id: batchId })
      .eq("bin_id", binId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
