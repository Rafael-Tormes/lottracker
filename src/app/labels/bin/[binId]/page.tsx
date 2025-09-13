import { notFound } from "next/navigation";

type BinData = {
  binId: string;
  lotId: string;
  categoryId: number;
  description: string | null;
  estimatedQty: number | null;
  status: string | null;
  batchNumber?: string | null;
};

export default async function BinLabelPage({
  params,
}: {
  params: { binId: string };
}) {
  // Relative URL; no headers() needed
  const res = await fetch(`/api/labels/bin/${params.binId}`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();

  const data = (await res.json()) as BinData;

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4 text-black">Bin Label</h1>
      <div className="bg-gray-100 rounded-lg p-4 w-fit text-black">
        <p className="mb-2">
          <strong>Bin ID:</strong> {data.binId}
        </p>
        <p className="mb-2">
          <strong>Lot ID:</strong> {data.lotId}
        </p>
        <p className="mb-2">
          <strong>Category ID:</strong> {data.categoryId}
        </p>
        <p className="mb-2">
          <strong>Description:</strong> {data.description ?? ""}
        </p>
        <p className="mb-2">
          <strong>Estimated Qty:</strong> {data.estimatedQty ?? 0}
        </p>
        <p className="mb-2">
          <strong>Status:</strong> {data.status ?? ""}
        </p>
        <p className="mb-2">
          <strong>Batch Number:</strong> {data.batchNumber ?? "—"}
        </p>
      </div>
    </div>
  );
}
