"use client";
import { useEffect, useRef, useState } from "react";

export type TypeaheadItem = { id: string; label: string; meta?: string };

export function Typeahead({
  placeholder,
  searchPath,
  onSelect,
}: {
  placeholder: string;
  searchPath: string; // e.g. "/api/lots/search"
  onSelect: (item: TypeaheadItem) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<TypeaheadItem[]>([]);
  const debounce = useRef<number | null>(null);

  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(async () => {
      const url = q ? `${searchPath}?q=${encodeURIComponent(q)}` : searchPath;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();

      const mapped: TypeaheadItem[] = (json.data ?? []).map((row: any) => ({
        id: row.lot_id ?? row.id,
        label: row.supplier || row.notes || row.lot_id,
        meta: row.notes,
      }));
      setItems(mapped);
      setOpen(true);
    }, 200);

    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [q, searchPath]);

  return (
    <div className="relative w-72">
      <input
        className="border p-2 rounded w-full bg-white text-black placeholder-gray-500"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
      />
      {open && items.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow">
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              className="block w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => {
                onSelect(it);
                setQ(it.label);
                setOpen(false);
              }}
            >
              <div className="font-medium text-gray-900">{it.label}</div>
              {it.meta && (
                <div className="text-xs text-gray-500">{it.meta}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
