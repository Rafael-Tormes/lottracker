import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

type ShipmentRow = {
  shipment_id: string;
  buyer_handle: string;
  status: string;
  channel: string;
  external_order_id: string | null;
};

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServer();
  const url = new URL(req.url);

  const sessionId = url.searchParams.get("sessionId"); // for WhatNot
  const channel = url.searchParams.get("channel"); // for Store/eBay
  const externalOrderId = url.searchParams.get("externalOrderId");

  if (!sessionId && !(channel && externalOrderId)) {
    return NextResponse.json(
      { error: "provide sessionId OR (channel & externalOrderId)" },
      { status: 400 }
    );
  }

  const filter = sessionId
    ? { column: "session_id", value: sessionId }
    : { column: "external_order_id", value: externalOrderId! };

  const { data: shipments, error } = await supabase
    .from("shipments")
    .select("shipment_id, buyer_handle, status, channel, external_order_id")
    .eq(filter.column, filter.value);

  if (error || !shipments) {
    return NextResponse.json(
      { error: error?.message ?? "fetch_failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ shipments: shipments as ShipmentRow[] });
}
