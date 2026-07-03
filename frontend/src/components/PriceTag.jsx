export function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function PriceTag({ price, compareAtPrice, size = "md" }) {
  return (
    <span className="price-tag" style={{ fontSize: size === "lg" ? "20px" : undefined }}>
      <span className="price-main">{formatMoney(price)}</span>
      {compareAtPrice > price && <span className="price-compare">{formatMoney(compareAtPrice)}</span>}
    </span>
  );
}
