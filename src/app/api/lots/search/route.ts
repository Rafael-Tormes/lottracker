import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100);

  // Base select tuned to your schema
  let query = supabaseServer
    .from("lots")
    .select("lot_id, supplier, notes, date_received, batch_id")
    .order("date_received", { ascending: false })
    .limit(limit);

  // If looks like a UUID, try exact match first
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (q) {
    if (uuidRegex.test(q)) {
      query = query.eq("lot_id", q);
    } else {
      // Search by supplier or notes (you don't have a title/description on lots)
      query = query.or(`supplier.ilike.%${q}%,notes.ilike.%${q}%`);
    }
  }

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
