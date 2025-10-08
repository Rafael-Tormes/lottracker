"use client";

import { useState } from "react";

export default function ScanDemo() {
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup() {
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const r = await fetch(
        `/api/items/by-barcode?barcode=${encodeURIComponent(barcode)}`,
        { cache: "no-store" }
      );
      const text = await r.text();
      const json = text ? JSON.parse(text) : {};
      if (!r.ok) throw new Error(json.error || r.statusText);
      setResult(json.data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 640 }}>
      <h1>Scan Demo</h1>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Scan or type barcode…"
          style={{ flex: 1, padding: 8 }}
        />
        <button
          onClick={lookup}
          disabled={!barcode || loading}
          style={{ padding: "8px 12px" }}
        >
          {loading ? "Looking…" : "Lookup"}
        </button>
      </div>
      {err && <p style={{ color: "crimson", marginTop: 12 }}>Error: {err}</p>}
      {result && (
        <pre
          style={{
            marginTop: 12,
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 8,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
