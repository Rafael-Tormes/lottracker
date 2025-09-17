import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

type BatchRef = { batch_number: string | null };
type LotRow = {
  lot_id: string;
  supplier: string | null;
  date_received: string | null; // PostgREST returns date as string
  cost_total: string | number | null; // numeric may come back as string
  notes: string | null;
  batches?: BatchRef[] | null;
};

type LotLabelResponse = {
  lotId: string;
  supplier: string | null;
  dateReceived: string | null;
  costTotal: number | null;
  notes: string | null;
  batchNumber: string | null;
};

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

  const row = data as LotRow;
  const batchNumber = row.batches?.[0]?.batch_number ?? null;

  const costTotal =
    typeof row.cost_total === "string"
      ? parseFloat(row.cost_total)
      : row.cost_total;

  const res: LotLabelResponse = {
    lotId: row.lot_id,
    supplier: row.supplier,
    dateReceived: row.date_received,
    costTotal: Number.isNaN(costTotal as number) ? null : (costTotal as number),
    notes: row.notes,
    batchNumber,
  };

  return NextResponse.json(res);
}
