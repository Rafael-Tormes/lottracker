import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// Next.js 15 route handlers: params is a Promise
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ lotId: string }> }
) {
  const supabase = getSupabaseServer();

  const { lotId } = await ctx.params;

  const { data, error } = await supabase
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
    lotId: (data as any).lot_id,
    supplier: (data as any).supplier,
    dateReceived: (data as any).date_received,
    costTotal: (data as any).cost_total,
    notes: (data as any).notes,
    batchNumber,
  });
}
