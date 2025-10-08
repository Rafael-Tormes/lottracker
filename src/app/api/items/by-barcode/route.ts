import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const url = new URL(req.url);
    const barcode = (url.searchParams.get("barcode") || "").trim();

    if (!barcode) {
      return NextResponse.json(
        { error: "barcode_required", data: null },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("items")
      .select("item_id, barcode, lot_id, category_id, bin_id, qty, status")
      .eq("barcode", barcode)
      .single();

    if (error || !data)
      return NextResponse.json(
        { error: "not_found", data: null },
        { status: 404 }
      );
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg, data: null }, { status: 500 });
  }
}
