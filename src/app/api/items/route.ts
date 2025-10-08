import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

type CreateItemBody = {
  barcode: string;
  lotId: string;
  categoryId: number;
  qty?: number;
  binId?: string | null;
};

type ItemRow = {
  item_id: string;
  barcode: string;
  lot_id: string;
  category_id: number;
  bin_id: string | null;
  qty: number;
  status: string;
  created_at: string;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();

    // Parse JSON safely
    let body: CreateItemBody;
    try {
      body = (await req.json()) as CreateItemBody;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const barcode = (body.barcode || "").trim();
    const lotId = body.lotId;
    const categoryId = body.categoryId;
    const qty = body.qty && body.qty > 0 ? body.qty : 1;
    const binId = body.binId ?? null;

    if (!barcode || !lotId || !categoryId) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("items")
      .insert({
        barcode,
        lot_id: lotId,
        category_id: categoryId,
        bin_id: binId,
        qty,
      })
      .select(
        "item_id, barcode, lot_id, category_id, bin_id, qty, status, created_at"
      )
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "insert_failed" },
        { status: 500 }
      );
    }

    const row = data as ItemRow;
    // Keep your existing response shape
    return NextResponse.json({
      itemId: row.item_id,
      barcode: row.barcode,
      lotId: row.lot_id,
      categoryId: row.category_id,
      binId: row.bin_id,
      qty: row.qty,
      status: row.status,
      createdAt: row.created_at,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
