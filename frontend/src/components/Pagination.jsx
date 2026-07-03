export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1
  );

  let last = 0;
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">‹</button>
      {nums.map((n) => {
        const gap = n - last > 1;
        last = n;
        return (
          <span key={n} style={{ display: "contents" }}>
            {gap && <span style={{ alignSelf: "center", color: "var(--color-muted)" }}>…</span>}
            <button className={n === page ? "active" : ""} onClick={() => onChange(n)}>
              {n}
            </button>
          </span>
        );
      })}
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">›</button>
    </div>
  );
}
