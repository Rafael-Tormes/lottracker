import { notFound } from "next/navigation";

type LotData = {
  lotId: string;
  supplier: string;
  dateReceived: string;
  costTotal: number;
  notes: string | null;
  batchNumber?: string | null;
};

export default async function LotLabelPage({
  params,
}: {
  params: { lotId: string };
}) {
  // Relative URL works in dev/prod and avoids headers() entirely
  const res = await fetch(`/api/labels/lot/${params.lotId}`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();

  const data = (await res.json()) as LotData;

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4 text-black">Lot Label</h1>
      <div className="bg-gray-100 rounded-lg p-4 w-fit text-black">
        <p className="mb-2">
          <strong>Lot ID:</strong> {data.lotId}
        </p>
        <p className="mb-2">
          <strong>Supplier:</strong> {data.supplier}
        </p>
        <p className="mb-2">
          <strong>Date Received:</strong> {data.dateReceived}
        </p>
        <p className="mb-2">
          <strong>Cost Total:</strong> {data.costTotal}
        </p>
        <p className="mb-2">
          <strong>Notes:</strong> {data.notes ?? ""}
        </p>
        <p className="mb-2">
          <strong>Batch Number:</strong> {data.batchNumber ?? "—"}
        </p>
      </div>
    </div>
  );
}
