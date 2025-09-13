import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ binId: string }> }
) {
  const { binId } = await ctx.params;

  const { data, error } = await supabaseServer
    .from("bins")
    .select(
      `
      id,
      lot_id,
      category_id,
      description,
      estimated_qty,
      status,
      batches ( batch_number )
    `
    )
    .eq("id", binId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const batchNumber =
    Array.isArray(
      (data as unknown as { batches?: { batch_number?: string }[] }).batches
    ) &&
    (data as unknown as { batches: { batch_number?: string }[] }).batches[0]
      ?.batch_number
      ? (data as unknown as { batches: { batch_number?: string }[] }).batches[0]
          .batch_number
      : null;

  return NextResponse.json({
    binId: data.id,
    lotId: data.lot_id,
    categoryId: data.category_id,
    description: data.description,
    estimatedQty: data.estimated_qty,
    status: data.status,
    batchNumber,
  });
}
