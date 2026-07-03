import { useRef } from "react";
import { Link } from "react-router-dom";
import PriceTag from "./PriceTag";
import StarRating from "./StarRating";

export default function ProductCard({ product, isClient, isWishlisted, onToggleWishlist, onAddToCart }) {
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= (product.lowStockThreshold ?? 5);
  const cardRef = useRef(null);
  const wishlistBtnRef = useRef(null);

  return (
    <div className="product-card" ref={cardRef}>
      {isClient && (
        <button
          type="button"
          ref={wishlistBtnRef}
          className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
          onClick={() => onToggleWishlist(product, wishlistBtnRef.current)}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
        >
          {isWishlisted ? "♥" : "♡"}
        </button>
      )}

      <Link to={`/products/${product._id}`} className="product-thumb">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
      </Link>

      <div className="product-body">
        <span className="product-category">{product.category}</span>

        <Link to={`/products/${product._id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>

        <StarRating rating={product.rating} count={product.numReviews} />

        <div className="price-row">
          <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} />
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {outOfStock && <span className="stock-badge out">Out of stock</span>}
            {lowStock && <span className="stock-badge low">Only {product.stock} left</span>}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="discount-badge">
                -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
              </span>
            )}
          </div>
        </div>

        {isClient && (
          <div className="product-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm btn-block"
              disabled={outOfStock}
              onClick={() => onAddToCart(product, cardRef.current)}
            >
              {outOfStock ? "Out of stock" : "🛒 Add to cart"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
