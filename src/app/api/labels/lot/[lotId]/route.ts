import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(
  _req: NextRequest,
  { params }: { params: { lotId: string } }
) {
  const lotId = params.lotId;

  const { data, error } = await supabaseServer
    .from("lots")
    .select(
      "lot_id, supplier, date_received, cost_total, notes, batch_id, batches(batch_number)"
    )
    .eq("lot_id", lotId)
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Lot not found" }, { status: 404 });

  const batchNumber = (data as any).batches?.batch_number ?? null;

  return NextResponse.json({
    lotId: data.lot_id,
    supplier: data.supplier,
    dateReceived: data.date_received,
    costTotal: data.cost_total,
    notes: data.notes,
    batchNumber,
  });
}
