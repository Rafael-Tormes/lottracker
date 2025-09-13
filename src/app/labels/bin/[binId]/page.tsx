import { notFound } from "next/navigation";
import { headers } from "next/headers";

export default async function BinLabelPage({
  params,
}: {
  params: { binId: string };
}) {
  // Build absolute URL
  const host = headers().get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/labels/bin/${params.binId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return notFound();
  }

  const data = await res.json();

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Bin Label</h1>
      <div className="bg-white text-black rounded-lg p-4 w-fit space-y-2 shadow-md">
        <p>
          <strong>Bin ID:</strong> {data.binId}
        </p>
        <p>
          <strong>Lot ID:</strong> {data.lotId}
        </p>
        <p>
          <strong>Category ID:</strong> {data.categoryId}
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
          <strong>Batch Number:</strong> {data.batchNumber ?? "—"}
        </p>
      </div>
    </div>
  );
}
