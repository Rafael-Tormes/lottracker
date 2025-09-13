"use client";

import { useState } from "react";

export default function ScanPage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    // For now we just echo. Later we’ll call /api/scan with this code.
    setStatus(`Scanned: ${code}`);
    setCode("");
  }

  return (
    <div className="p-6 font-sans text-gray-800 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Scan</h1>

      <form onSubmit={submit} className="flex gap-2 items-center">
        <input
          className="border p-2 rounded w-80 text-gray-900"
          placeholder="Scan or type a barcode..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
        />
        <button className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800">
          Submit
        </button>
      </form>

      {status && <div className="text-sm text-gray-900">{status}</div>}

      <p className="text-sm text-gray-700">
        This is the UI screen at <code>/scan</code>. We’ll wire it to the API (
        <code>/api/scan</code>) when we decide what a scan should do (e.g.,
        lookup a lot/bin, create a bin, attach to a batch, etc.).
      </p>
    </div>
  );
}
