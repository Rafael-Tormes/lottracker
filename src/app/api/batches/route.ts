import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

type CreateBatchBody = {
  batchNumber: string;
  auctionId?: string | null;
  source?: string | null;
  externalId?: string | null;
};

export async function GET() {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("batches")
      .select("id, batch_number, source, external_id, auction_id, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { error: error.message, data: [] },
        { status: 500 }
      );
    }
    return NextResponse.json({ data: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg, data: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();

    // parse body safely
    let body: CreateBatchBody;
    try {
      body = (await req.json()) as CreateBatchBody;
    } catch {
      return NextResponse.json(
        { error: "invalid_json", data: null },
        { status: 400 }
      );
    }

    const batchNumber = (body.batchNumber || "").trim();
    const auctionId = body.auctionId ?? null;
    const source = (body.source || "manual").trim();
    const externalId = body.externalId ?? null;

    if (!batchNumber) {
      return NextResponse.json(
        { error: "batchNumber required", data: null },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("batches")
      .insert({
        batch_number: batchNumber,
        auction_id: auctionId,
        source,
        external_id: externalId,
      })
      .select("id, batch_number")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message, data: null },
        { status: 500 }
      );
    }
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg, data: null }, { status: 500 });
  }
}
