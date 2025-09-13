import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(
  _req: NextRequest,
  { params }: { params: { binId: string } }
) {
  const binId = params.binId;

  const { data, error } = await supabaseServer
    .from("bins")
    .select(
      "bin_id, lot_id, category_id, description, estimated_qty, status, batch_id, batches(batch_number)"
    )
    .eq("bin_id", binId)
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Bin not found" }, { status: 404 });

  const batchNumber = (data as any).batches?.batch_number ?? null;

  return NextResponse.json({
    binId: data.bin_id,
    lotId: data.lot_id,
    categoryId: data.category_id,
    description: data.description,
    estimatedQty: data.estimated_qty,
    status: data.status,
    batchNumber,
  });
}
