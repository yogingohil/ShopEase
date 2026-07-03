export default function StarRating({ rating = 0, count }) {
  const rounded = Math.round(rating);
  const stars = "★★★★★".slice(0, rounded) + "☆☆☆☆☆".slice(0, 5 - rounded);
  return (
    <div className="rating-row">
      <span className="stars" aria-hidden="true">{stars}</span>
      <span>
        {rating > 0 ? rating.toFixed(1) : "No ratings"}
        {typeof count === "number" ? ` (${count})` : ""}
      </span>
    </div>
  );
}
