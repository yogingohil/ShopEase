export default function Loader() {
  return (
    <div className="spinner-wrap">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div className="spinner" role="status" aria-label="Loading" />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--color-muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Loading…
        </span>
      </div>
    </div>
  );
}
