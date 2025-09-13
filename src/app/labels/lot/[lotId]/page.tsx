import { notFound } from "next/navigation";
import { headers } from "next/headers";

export default async function LotLabelPage({
  params,
}: {
  params: { lotId: string };
}) {
  // Build absolute URL
  const host = headers().get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/labels/lot/${params.lotId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return notFound();
  }

  const data = await res.json();

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Lot Label</h1>
      <div className="bg-white text-black rounded-lg p-4 w-fit space-y-2 shadow-md">
        <p>
          <strong>Lot ID:</strong> {data.lotId}
        </p>
        <p>
          <strong>Supplier:</strong> {data.supplier}
        </p>
        <p>
          <strong>Date Received:</strong> {data.dateReceived}
        </p>
        <p>
          <strong>Cost Total:</strong> {data.costTotal}
        </p>
        <p>
          <strong>Notes:</strong> {data.notes}
        </p>
        <p>
          <strong>Batch Number:</strong> {data.batchNumber ?? "—"}
        </p>
      </div>
    </div>
  );
}
