import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const { lotId, binId, batchId } = await req.json();

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
      .eq("lot_id", lotId); // <-- fixed here
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (binId) {
    const { error } = await supabaseServer
      .from("bins")
      .update({ batch_id: batchId })
      .eq("bin_id", binId); // <-- double-check bins column too
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
