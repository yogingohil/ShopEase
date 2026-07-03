import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAnim } from "../context/AnimationContext";
import api from "../api/axios";
import { formatMoney } from "../components/PriceTag";

export default function Checkout() {
  const { items, subtotal, refreshCart } = useCart();
  const navigate = useNavigate();
  const anim = useAnim();

  const [address, setAddress] = useState({ line1: "", city: "", state: "", postalCode: "", country: "India" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [savedAmount, setSavedAmount] = useState(0);

  const couponBtnRef = useRef(null);
  const placeOrderBtnRef = useRef(null);

  // Auto-apply pre-negotiated bargain coupon from Gupta Ji
  useEffect(() => {
    const savedCoupon = sessionStorage.getItem("bargain_coupon");
    if (savedCoupon && subtotal > 0) {
      setCouponCode(savedCoupon);
      // Validate automatically
      api.post("/coupons/validate", { code: savedCoupon, orderValue: subtotal })
        .then(({ data }) => {
          setCouponResult(data);
          setSavedAmount(data.discount);
          sessionStorage.removeItem("bargain_coupon"); // clean up
          anim.moneyRain(30);
        })
        .catch((err) => {
          console.warn("Auto-applying bargain coupon failed:", err);
        });
    }
  }, [subtotal, anim]);


  const discount = couponResult?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  // 🏷️ Coupon applied: ticket animation + money rain
  async function applyCoupon() {
    setCouponError("");
    setCouponResult(null);
    if (!couponCode.trim()) return;
    try {
      const { data } = await api.post("/coupons/validate", { code: couponCode, orderValue: subtotal });
      setCouponResult(data);
      setSavedAmount(data.discount);
      // 💸 Money rain when coupon succeeds!
      anim.moneyRain(35);
      setTimeout(() => anim.sparkleFrom(couponBtnRef.current, 16), 300);
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid coupon.");
    }
  }

  // ✅ Order placed: fireworks + confetti + success overlay
  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", {
        shippingAddress: address,
        paymentMethod,
        couponCode: couponResult ? couponResult.code : undefined,
      });

      // 🎆 MEGA CELEBRATION
      anim.fireworks(8);
      setTimeout(() => anim.confetti(150), 300);
      setTimeout(() => anim.moneyRain(25), 600);
      setTimeout(() => anim.fireworks(6), 1200);

      setShowOrderSuccess(true);

      await refreshCart();

      // Navigate after 3.5s
      setTimeout(() => {
        navigate("/orders", { state: { placedOrderId: data.order._id } });
      }, 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order.");
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty" style={{ marginTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
          <h3>Nothing to check out</h3>
          <p>Your cart is empty right now.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Browse products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: 60 }}>

      {/* 🎉 Order Success Overlay */}
      {showOrderSuccess && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 8000,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(8,11,20,0.92)", backdropFilter: "blur(16px)",
          }}
        >
          <div
            style={{
              textAlign: "center", padding: "48px 56px",
              background: "rgba(13,17,23,0.95)",
              border: "1px solid rgba(124,58,237,0.4)",
              borderRadius: 28,
              boxShadow: "0 0 80px rgba(124,58,237,0.3), 0 0 40px rgba(6,182,212,0.2)",
              animation: "celebrationPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            <div style={{ fontSize: 72, marginBottom: 16, animation: "orderSuccessBounce 0.6s ease infinite alternate" }}>🎉</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, background: "linear-gradient(135deg, #fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 12 }}>
              Order Placed!
            </h1>
            <p style={{ color: "rgba(240,244,255,0.7)", fontSize: 16, marginBottom: 8 }}>
              Shukriya! Aapka order confirm ho gaya 🚀
            </p>
            {discount > 0 && (
              <p style={{ color: "#6ee7b7", fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700 }}>
                Aapne ₹{savedAmount.toLocaleString("en-IN")} bachaye! 💰
              </p>
            )}
            <p style={{ color: "var(--color-muted)", fontSize: 13, marginTop: 16 }}>
              Orders page pe redirect ho raha hai…
            </p>
          </div>
        </div>
      )}

      <section className="page-head">
        <h1>🛒 Checkout</h1>
        <p>Confirm your delivery details and payment method.</p>
      </section>

      <form className="cart-layout" onSubmit={handlePlaceOrder}>
        <div>
          {/* Shipping */}
          <div className="panel">
            <h3 style={{ marginBottom: 14 }}>📍 Shipping Address</h3>
            <div className="form-group">
              <label htmlFor="line1">Address line</label>
              <input id="line1" className="form-input" required value={address.line1}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input id="city" className="form-input" required value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input id="state" className="form-input" required value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="postalCode">Postal code</label>
                <input id="postalCode" className="form-input" required value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input id="country" className="form-input" required value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="panel" style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 8 }}>💳 Payment Method</h3>
            <p style={{ fontSize: 12.5, color: "var(--color-muted)", marginBottom: 14 }}>
              Demo checkout — no real charge is made.
            </p>
            {[
              { id: "cod", label: "💵 Cash on Delivery", icon: "" },
              { id: "card", label: "💳 Card (simulated)", icon: "" },
              { id: "upi", label: "📱 UPI (simulated)", icon: "" },
            ].map((option) => (
              <label
                key={option.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12, marginBottom: 12,
                  fontSize: 14, cursor: "pointer", padding: "10px 14px",
                  borderRadius: "var(--radius-sm)", border: "1px solid",
                  borderColor: paymentMethod === option.id ? "var(--color-primary)" : "var(--color-border)",
                  background: paymentMethod === option.id ? "var(--color-primary-tint)" : "transparent",
                  transition: "all 0.15s",
                  color: paymentMethod === option.id ? "var(--color-primary-light)" : "var(--color-ink-soft)",
                }}
              >
                <input type="radio" name="paymentMethod" checked={paymentMethod === option.id}
                  onChange={() => setPaymentMethod(option.id)} style={{ accentColor: "var(--color-primary)" }} />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="panel">
          <h3 style={{ marginBottom: 14 }}>🧾 Order Summary</h3>
          {items.map(({ product, quantity }) => (
            <div className="summary-row" key={product._id}>
              <span style={{ color: "var(--color-ink-soft)" }}>{product.name} × {quantity}</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{formatMoney(product.price * quantity)}</span>
            </div>
          ))}

          {/* Coupon */}
          <div className="coupon-row">
            <input
              type="text" className="form-input"
              placeholder="🏷️ Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            <button ref={couponBtnRef} type="button" className="btn btn-secondary btn-sm" onClick={applyCoupon}>
              Apply
            </button>
          </div>
          {couponError && <div className="form-error">{couponError}</div>}
          {couponResult && (
            <div className="form-success" style={{ animation: "couponSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
              🎟️ <strong>{couponResult.code}</strong> applied — saved {formatMoney(couponResult.discount)}! 🎉
            </div>
          )}

          <div className="summary-row"><span>Subtotal</span><span style={{ fontFamily: "var(--font-mono)" }}>{formatMoney(subtotal)}</span></div>
          {discount > 0 && (
            <div className="summary-row" style={{ color: "var(--color-success)" }}>
              <span>Discount 🏷️</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>−{formatMoney(discount)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total payable</span>
            <span style={{ background: "linear-gradient(135deg, #fff, var(--color-accent-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {formatMoney(total)}
            </span>
          </div>

          {error && <div className="form-error" style={{ marginTop: 12 }}>{error}</div>}

          <button
            ref={placeOrderBtnRef}
            className="btn btn-primary btn-block"
            style={{ marginTop: 16, padding: "16px", fontSize: 16, letterSpacing: "0.02em" }}
            disabled={placing}
          >
            {placing ? "🚀 Placing Order…" : "🚀 Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
