import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// shape we expect back from our SELECT
type BatchRef = { batch_number: string | null };
type BinRow = {
  bin_id: string;
  lot_id: string | null;
  category_id: number | null;
  description: string | null;
  estimated_qty: number | null;
  status: string | null; // enum comes back as string
  batches?: BatchRef[] | null;
};

// public response contract
type BinLabelResponse = {
  binId: string;
  lotId: string | null;
  categoryId: number | null;
  description: string | null;
  estimatedQty: number | null;
  status: string | null;
  batchNumber: string | null;
};

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
        bin_id,
        lot_id,
        category_id,
        description,
        estimated_qty,
        status,
        batches ( batch_number )
      `
    )
    .eq("bin_id", binId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const row = data as BinRow;
  const batchNumber = row.batches?.[0]?.batch_number ?? null;

  const res: BinLabelResponse = {
    binId: row.bin_id,
    lotId: row.lot_id,
    categoryId: row.category_id,
    description: row.description,
    estimatedQty: row.estimated_qty,
    status: row.status,
    batchNumber,
  };

  return NextResponse.json(res);
}
