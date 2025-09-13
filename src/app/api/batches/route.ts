import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("batches")
    .select("id, batch_number, source, external_id, auction_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const {
    batchNumber,
    auctionId,
    source = "manual",
    externalId = null,
  } = await req.json();
  if (!batchNumber)
    return NextResponse.json(
      { error: "batchNumber required" },
      { status: 400 }
    );

  const { data, error } = await supabaseServer
    .from("batches")
    .insert({
      batch_number: batchNumber,
      auction_id: auctionId ?? null,
      source,
      external_id: externalId,
    })
    .select("id, batch_number")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
