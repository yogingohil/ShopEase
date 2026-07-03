import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useAnim } from "../context/AnimationContext";
import PriceTag from "../components/PriceTag";
import StarRating from "../components/StarRating";
import Loader from "../components/Loader";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const anim = useAnim();
  const isClient = user?.role === "client";

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Refs for animation targets
  const reviewFormRef = useRef(null);
  const addToCartBtnRef = useRef(null);
  const productImgRef = useRef(null);
  const cartIconRef = useRef(null);

  async function load() {
    const { data } = await api.get(`/products/${id}`);
    setProduct(data.product);
    setReviews(data.reviews);
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  // ── Add to Cart: product flies to cart icon ──────────────
  async function handleAddToCart() {
    setError(""); setMessage("");
    setAddingToCart(true);
    try {
      await addToCart(product._id, 1);
      setMessage("🛒 Added to your cart!");
      // Find cart badge in navbar
      const cartEl = document.querySelector(".nav-cart-badge") || document.querySelector("[href='/cart']");
      anim.flyToCart(productImgRef.current, product.imageUrl, cartEl);
      // Sparkles from button
      setTimeout(() => anim.sparkleFrom(addToCartBtnRef.current, 10), 300);
    } catch (err) {
      setError(err.response?.data?.message || "Could not add to cart.");
    } finally {
      setAddingToCart(false);
    }
  }

  // ── Review Submit: paper airplane ───────────────────────
  async function handleReviewSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/products/${id}/reviews`, reviewForm);
      setReviews(data.reviews);
      setReviewForm({ rating: 5, comment: "" });
      setHoveredStar(0);
      load();

      // 🛫 Paper airplane from review form
      anim.sendAirplane(reviewFormRef.current, () => {
        // After airplane arrives, show celebration msg
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      });

      // If 5 stars — extra hearts burst toward product image
      if (reviewForm.rating === 5) {
        setTimeout(() => anim.heartsFrom(productImgRef.current, 24), 400);
        setTimeout(() => anim.starsFrom(productImgRef.current, 16), 700);
        setTimeout(() => anim.confetti(80), 900);
      } else {
        setTimeout(() => anim.sparkleFrom(reviewFormRef.current, 14), 300);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  // ── Star hover: individual star pop animation ────────────
  function handleStarClick(n) {
    setReviewForm({ ...reviewForm, rating: n });
    const starEl = document.querySelector(`#star-${n}`);
    if (n === 5) {
      anim.starsFrom(starEl, 10);
      anim.heartsFrom(starEl, 8);
    } else {
      anim.sparkleFrom(starEl, 8);
    }
  }

  if (!product) return <Loader />;

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= (product.lowStockThreshold ?? 5);
  const savings = product.compareAtPrice && product.compareAtPrice > product.price
    ? product.compareAtPrice - product.price : null;

  return (
    <div className="container" style={{ paddingBottom: 80, position: "relative" }}>

      {/* Celebration overlay */}
      {showCelebration && (
        <div
          style={{
            position: "fixed",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9000,
            background: "rgba(13,17,23,0.92)",
            border: "1px solid rgba(124,58,237,0.5)",
            borderRadius: 24,
            padding: "32px 48px",
            textAlign: "center",
            backdropFilter: "blur(24px)",
            boxShadow: "0 0 60px rgba(124,58,237,0.4)",
            animation: "celebrationPop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontSize: 22, margin: "0 0 8px", color: "#fff" }}>Review Sent!</h2>
          <p style={{ color: "rgba(240,244,255,0.7)", margin: 0, fontSize: 14 }}>
            Shukriya! Tumhara review community tak pahunch gaya ✈️
          </p>
        </div>
      )}

      {/* Breadcrumb */}
      <p style={{ margin: "28px 0 0", fontSize: 13, color: "var(--color-muted)" }}>
        <Link to="/products" style={{ color: "var(--color-accent)", fontWeight: 600 }}>← Products</Link>
        {" · "}<span style={{ color: "var(--color-primary-light)" }}>{product.category}</span>
        {" · "}{product.name}
      </p>

      {/* Main Grid */}
      <div className="product-detail-grid">
        {/* Image */}
        <div className="product-detail-img" ref={productImgRef}>
          <img src={product.imageUrl} alt={product.name} />
          {savings && (
            <div style={{
              position: "absolute", top: 16, left: 16,
              background: "linear-gradient(135deg, var(--color-success), #059669)",
              color: "#fff", borderRadius: "999px", padding: "6px 14px",
              fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)",
              boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
            }}>
              SAVE ₹{savings.toLocaleString("en-IN")}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ paddingTop: 8 }}>
          <span className="product-category" style={{ fontSize: 12 }}>{product.category}</span>
          <h1 style={{
            fontSize: 34, fontWeight: 800, marginTop: 8, letterSpacing: "-0.02em", lineHeight: 1.15,
            background: "linear-gradient(135deg, #fff, rgba(240,244,255,0.7))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            {product.name}
          </h1>

          <StarRating rating={product.rating} count={product.numReviews} />

          {/* Price */}
          <div style={{
            margin: "20px 0", padding: "20px",
            background: "var(--color-surface)", border: "1px solid var(--color-border-2)",
            borderRadius: "var(--radius-md)", backdropFilter: "blur(16px)",
          }}>
            <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
            {savings && (
              <div style={{ marginTop: 8 }}>
                <span className="discount-badge">
                  You save ₹{savings.toLocaleString("en-IN")} ({Math.round((savings / product.compareAtPrice) * 100)}% off)
                </span>
              </div>
            )}
          </div>

          <p style={{ color: "var(--color-ink-soft)", lineHeight: 1.75, fontSize: 15 }}>
            {product.description}
          </p>

          {/* Stock */}
          <div style={{ margin: "16px 0" }}>
            {inStock ? (
              lowStock ? (
                <span className="stock-badge low">⚠️ Only {product.stock} left — order soon!</span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-success)", fontWeight: 600, fontSize: 14 }}>
                  ✅ In stock ({product.stock} available)
                </span>
              )
            ) : (
              <span className="stock-badge out">❌ Out of stock</span>
            )}
          </div>

          {error && <div className="form-error" style={{ marginBottom: 12 }}>⚠️ {error}</div>}
          {message && <div className="form-success" style={{ marginBottom: 12 }}>{message}</div>}

          {/* CTA */}
          {isClient ? (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                ref={addToCartBtnRef}
                className="btn btn-primary"
                style={{ flex: 1, minWidth: 160, fontSize: 15, padding: "14px 24px" }}
                disabled={!inStock || addingToCart}
                onClick={handleAddToCart}
              >
                {addingToCart ? "Adding…" : inStock ? "🛒 Add to Cart" : "Out of Stock"}
              </button>
              <Link to="/cart" className="btn btn-ghost" style={{ padding: "14px 24px" }}>
                View Cart →
              </Link>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: "14px 24px", fontSize: 15 }}>
              🔑 Log in to Purchase
            </Link>
          )}
        </div>
      </div>

      <hr className="glow-divider" />

      {/* Reviews */}
      <section style={{ maxWidth: 740 }}>
        <div className="section-title" style={{ marginBottom: 24 }}>
          <h2>⭐ Reviews <span style={{ color: "var(--color-muted)", fontWeight: 500, fontSize: 16 }}>({reviews.length})</span></h2>
        </div>

        {isClient && (
          <form ref={reviewFormRef} onSubmit={handleReviewSubmit} className="panel" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16, color: "var(--color-ink)" }}>✍️ Write a Review</h3>

            {/* Interactive Star Rating */}
            <div className="form-group">
              <label>⭐ Your Rating — click a star</label>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    id={`star-${n}`}
                    type="button"
                    onClick={() => handleStarClick(n)}
                    onMouseEnter={() => setHoveredStar(n)}
                    onMouseLeave={() => setHoveredStar(0)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 36,
                      lineHeight: 1,
                      transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                      transform: (hoveredStar >= n || reviewForm.rating >= n)
                        ? "scale(1.3) translateY(-4px)"
                        : "scale(1)",
                      filter: (hoveredStar >= n || reviewForm.rating >= n)
                        ? "drop-shadow(0 0 8px rgba(245,158,11,0.8))"
                        : "grayscale(1) opacity(0.4)",
                    }}
                  >
                    ★
                  </button>
                ))}
                <span style={{ alignSelf: "center", color: "var(--color-warn)", fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 14 }}>
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][reviewForm.rating]}
                  {reviewForm.rating === 5 && " 🔥"}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comment">💬 Comment <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>(optional)</span></label>
              <textarea
                id="comment"
                className="form-textarea"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share what you liked or didn't about this product…"
              />
            </div>
            <button className="btn btn-secondary btn-sm" disabled={submittingReview}>
              {submittingReview ? "Sending ✈️…" : "Submit Review ✈️"}
            </button>
            <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 8, marginBottom: 0 }}>
              Only customers who purchased this product can leave a review.
              {reviewForm.rating === 5 && <span style={{ color: "var(--color-warn)" }}> 5 stars? Prepare for 🎉</span>}
            </p>
          </form>
        )}

        {reviews.length === 0 ? (
          <div className="empty" style={{ padding: "40px 24px" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
            <h3>No reviews yet</h3>
            <p style={{ margin: 0 }}>Be the first to share your thoughts on this product.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-head">
                <strong style={{ color: "var(--color-ink)" }}>{review.userName}</strong>
                <span className="stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
              </div>
              {review.comment && (
                <p style={{ margin: "6px 0 0", color: "var(--color-ink-soft)", fontSize: 14 }}>
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
