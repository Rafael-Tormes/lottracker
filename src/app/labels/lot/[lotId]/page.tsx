import { notFound } from "next/navigation";

export default async function LotLabelPage({
  params,
}: {
  params: Promise<{ lotId: string }>;
}) {
  const { lotId } = await params; // ← await the params

  const res = await fetch(`/api/labels/lot/${lotId}`, { cache: "no-store" });

  if (!res.ok) return notFound();

  const data = await res.json();

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Lot Label</h1>
      <div className="bg-gray-100 rounded-lg p-4 w-fit">
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
          <strong>Batch Number:</strong> {data.batchNumber ?? "--"}
        </p>
      </div>
    </div>
  );
}
