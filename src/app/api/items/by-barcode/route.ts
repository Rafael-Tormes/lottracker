import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

type ItemSelect = {
  item_id: string;
  barcode: string;
  lot_id: string;
  category_id: number;
  bin_id: string | null;
  qty: number;
  status: string;
};

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServer();
  const url = new URL(req.url);
  const barcode = (url.searchParams.get("barcode") || "").trim();

  if (!barcode) {
    return NextResponse.json({ error: "barcode_required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("items")
    .select("item_id, barcode, lot_id, category_id, bin_id, qty, status")
    .eq("barcode", barcode)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const row = data as ItemSelect;
  return NextResponse.json({
    itemId: row.item_id,
    barcode: row.barcode,
    lotId: row.lot_id,
    categoryId: row.category_id,
    binId: row.bin_id,
    qty: row.qty,
    status: row.status,
  });
}
