export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>LotTracker</h1>
      <p>Quick links:</p>
      <ul>
        <li>
          <a href="/batches">Batches</a>
        </li>
        <li>
          <a href="/api/batches" target="_blank" rel="noreferrer">
            /api/batches (JSON)
          </a>
        </li>
        <li>
          <a href="/scan">Scan demo</a>
        </li>
      </ul>
    </main>
  );
}
