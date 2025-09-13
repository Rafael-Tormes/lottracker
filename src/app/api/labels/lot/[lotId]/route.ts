import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// Next.js 15 dynamic params are Promise-based in route handlers
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await ctx.params;

  const { data, error } = await supabaseServer
    .from("lots")
    .select(
      `
      lot_id,
      supplier,
      date_received,
      cost_total,
      notes,
      batches ( batch_number )
    `
    )
    .eq("lot_id", lotId)
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
    lotId: data.lot_id,
    supplier: data.supplier,
    dateReceived: data.date_received,
    costTotal: data.cost_total,
    notes: data.notes,
    batchNumber,
  });
}
