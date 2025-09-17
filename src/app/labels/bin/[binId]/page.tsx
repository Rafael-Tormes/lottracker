import { notFound } from "next/navigation";

export default async function BinLabelPage({
  params,
}: {
  params: Promise<{ binId: string }>;
}) {
  const { binId } = await params; // ← await the params

  // Use relative URL so it works locally and in CI
  const res = await fetch(`/api/labels/bin/${binId}`, { cache: "no-store" });

  if (!res.ok) return notFound();

  const data = await res.json();

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Bin Label</h1>
      <div className="bg-gray-100 rounded-lg p-4 w-fit">
        <p>
          <strong>Bin ID:</strong> {data.binId}
        </p>
        <p>
          <strong>Lot ID:</strong> {data.lotId}
        </p>
        <p>
          <strong>Description:</strong> {data.description}
        </p>
        <p>
          <strong>Estimated Qty:</strong> {data.estimatedQty}
        </p>
        <p>
          <strong>Status:</strong> {data.status}
        </p>
        <p>
          <strong>Batch Number:</strong> {data.batchNumber ?? "--"}
        </p>
      </div>
    </div>
  );
}
