import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ binId: string }> }
) {
  const supabase = getSupabaseServer();

  const { binId } = await ctx.params;

  const { data, error } = await supabase
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
    // If your column is actually "bin_id", swap "id" -> "bin_id"
    .eq("bin_id", binId)
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
    binId: (data as any).id,
    lotId: (data as any).lot_id,
    categoryId: (data as any).category_id,
    description: (data as any).description,
    estimatedQty: (data as any).estimated_qty,
    status: (data as any).status,
    batchNumber,
  });
}
