"use client";

import { useEffect, useState } from "react";
import { Typeahead, type TypeaheadItem } from "../components/Typeahead"; // NOTE: relative path

type Batch = {
  id: string;
  batch_number: string;
  source: string | null;
  external_id: string | null;
  created_at: string;
};

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchNumber, setBatchNumber] = useState("");

  const [attachLotId, setAttachLotId] = useState("");
  const [attachBinId, setAttachBinId] = useState("");
  const [attachBatchId, setAttachBatchId] = useState("");

  async function load() {
    const r = await fetch("/api/batches", { cache: "no-store" });
    const j = await r.json();
    setBatches(j.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function createBatch(e: React.FormEvent) {
    e.preventDefault();
    if (!batchNumber.trim()) return;
    const r = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchNumber }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error || "Failed to create batch");
    setBatchNumber("");
    load();
  }

  async function attach(e: React.FormEvent) {
    e.preventDefault();
    if (!attachBatchId || (!attachLotId && !attachBinId)) return;
    const r = await fetch("/api/attach-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lotId: attachLotId || undefined,
        binId: attachBinId || undefined,
        batchId: attachBatchId,
      }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error || "Attach failed");
    setAttachLotId("");
    setAttachBinId("");
    setAttachBatchId("");
  }

  return (
    <div className="p-6 space-y-8 text-gray-900 dark:text-gray-100">
      {/* Create Batch */}
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Batches</h1>
        <form onSubmit={createBatch} className="flex gap-2">
          <input
            className="border p-2 rounded w-72 bg-white text-black placeholder-gray-500"
            placeholder="Batch number (e.g. WN-23-041)"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
          />
          <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Create
          </button>
        </form>

        <div className="border rounded bg-white text-black shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200 text-gray-900">
                <th className="p-2 text-left">Batch #</th>
                <th className="p-2 text-left">Source</th>
                <th className="p-2 text-left">External</th>
                <th className="p-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">{b.batch_number}</td>
                  <td className="p-2">{b.source ?? "—"}</td>
                  <td className="p-2">{b.external_id ?? "—"}</td>
                  <td className="p-2">
                    {b.created_at
                      ? new Date(b.created_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-700" colSpan={4}>
                    No batches yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Attach Batch → Lot or Bin */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Attach Batch → Lot or Bin</h2>
        <form onSubmit={attach} className="flex flex-wrap gap-2">
          <Typeahead
            placeholder="Search lots (supplier/notes/UUID)…"
            searchPath="/api/lots/search"
            onSelect={(item: TypeaheadItem) => setAttachLotId(item.id)}
          />

          <input
            className="border p-2 rounded w-64 bg-white text-black placeholder-gray-500"
            placeholder="Bin ID (optional)"
            value={attachBinId}
            onChange={(e) => setAttachBinId(e.target.value)}
          />
          <input
            className="border p-2 rounded w-64 bg-white text-black placeholder-gray-500"
            placeholder="Batch ID"
            value={attachBatchId}
            onChange={(e) => setAttachBatchId(e.target.value)}
          />
          <button className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
            Attach
          </button>
        </form>
      </section>
    </div>
  );
}
