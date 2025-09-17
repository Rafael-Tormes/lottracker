import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

type Body = {
  channel: "WhatNot" | "Store" | "eBay";
  barcode: string;
  qty?: number; // default 1
  price?: number | null;
  sessionId?: string | null; // WhatNot only
  auctionLotNumber?: number | null; // WhatNot only
  buyerHandle?: string | null; // WhatNot buyer; optional for others
  externalOrderId?: string | null; // Store/eBay
  binId?: string | null; // optional provenance
};

type ItemRow = { item_id: string; qty: number; status: string };

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  const b: Body = await req.json();

  const channel = b.channel;
  const barcode = (b.barcode || "").trim();
  const qtyToSell = b.qty && b.qty > 0 ? b.qty : 1;
  const price = b.price ?? null;
  const sessionId = b.sessionId ?? null;
  const lotNo = b.auctionLotNumber ?? null;
  const buyer = (b.buyerHandle ?? "").trim() || null;
  const externalOrderId = (b.externalOrderId ?? "").trim() || null;
  const binId = b.binId ?? null;

  if (!channel || !barcode) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  if (channel === "WhatNot" && (!sessionId || !buyer || !lotNo)) {
    return NextResponse.json(
      { error: "missing_auction_fields" },
      { status: 400 }
    );
  }
  if ((channel === "Store" || channel === "eBay") && !externalOrderId) {
    return NextResponse.json(
      { error: "external_order_required" },
      { status: 400 }
    );
  }

  // 1) Resolve item
  const { data: itemData, error: itemErr } = await supabase
    .from("items")
    .select("item_id, qty, status")
    .eq("barcode", barcode)
    .single();

  if (itemErr || !itemData) {
    return NextResponse.json({ error: "item_not_found" }, { status: 404 });
  }
  const item = itemData as ItemRow;

  if (item.status !== "ready") {
    return NextResponse.json({ error: "item_not_ready" }, { status: 409 });
  }
  if (qtyToSell > item.qty) {
    return NextResponse.json(
      { error: "qty_exceeds_available" },
      { status: 409 }
    );
  }

  // 2) Upsert shipment bucket
  let shipmentId: string | null = null;

  if (channel === "WhatNot") {
    const { data: shipment, error: shipErr } = await supabase
      .from("shipments")
      .upsert(
        [{ session_id: sessionId, buyer_handle: buyer!, channel: "WhatNot" }],
        { onConflict: "session_id,buyer_handle" }
      )
      .select("shipment_id")
      .single();

    if (shipErr || !shipment) {
      return NextResponse.json(
        { error: shipErr?.message ?? "shipment_upsert_failed" },
        { status: 500 }
      );
    }
    shipmentId = shipment.shipment_id;
  } else {
    const { data: shipment, error: shipErr } = await supabase
      .from("shipments")
      .upsert(
        [
          {
            session_id: null,
            buyer_handle: buyer ?? "",
            channel,
            external_order_id: externalOrderId,
          },
        ],
        { onConflict: "channel,external_order_id" }
      )
      .select("shipment_id")
      .single();

    if (shipErr || !shipment) {
      return NextResponse.json(
        { error: shipErr?.message ?? "shipment_upsert_failed" },
        { status: 500 }
      );
    }
    shipmentId = shipment.shipment_id;
  }

  // 3) Insert the sale row into your public.auctions table
  const now = new Date().toISOString();
  const { data: sale, error: saleErr } = await supabase
    .from("auctions")
    .insert({
      session_id: sessionId, // null for Store/eBay
      auction_no: lotNo, // null for Store/eBay
      channel, // must match your enum/text (e.g., 'WhatNot')
      bin_id: binId,
      price,
      buyer_name: buyer, // you can leave null for Store/eBay
      buyer_contact: null,
      occurred_at: now,
      item_id: item.item_id,
      external_order_id: externalOrderId, // set for Store/eBay
    })
    .select("sale_id")
    .single();

  if (saleErr || !sale) {
    return NextResponse.json(
      { error: saleErr?.message ?? "sale_insert_failed" },
      { status: 409 }
    );
  }

  // 4) Link sale to shipment
  const { error: linkErr } = await supabase
    .from("shipment_items")
    .insert({ shipment_id: shipmentId, sale_id: sale.sale_id });

  if (linkErr) {
    return NextResponse.json({ error: linkErr.message }, { status: 500 });
  }

  // 5) Decrement item qty; flip status when depleted
  const remaining = item.qty - qtyToSell;
  const nextStatus = remaining === 0 ? "sold" : "ready";

  const { error: updErr } = await supabase
    .from("items")
    .update({ qty: remaining, status: nextStatus })
    .eq("item_id", item.item_id);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, remainingQty: remaining, shipmentId });
}
