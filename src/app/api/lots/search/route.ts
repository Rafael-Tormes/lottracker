import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100);

    const supabase = getSupabaseServer();

    let query = supabase
      .from("lots")
      .select("lot_id, supplier, notes, date_received, batch_id")
      .order("date_received", { ascending: false })
      .limit(limit);

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (q) {
      if (uuidRegex.test(q)) {
        query = query.eq("lot_id", q);
      } else {
        query = query.or(`supplier.ilike.*${q}*,notes.ilike.*${q}*`);
      }
    }

    const { data, error } = await query;
    if (error)
      return NextResponse.json(
        { error: error.message, data: [] },
        { status: 500 }
      );
    return NextResponse.json({ data: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg, data: [] }, { status: 500 });
  }
}
