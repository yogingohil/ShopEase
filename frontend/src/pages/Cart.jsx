import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import PriceTag, { formatMoney } from "../components/PriceTag";
import BargainModal from "../components/BargainModal";

export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const [isBargaining, setIsBargaining] = useState(false);
  const navigate = useNavigate();

  const minBargainValue = 500;
  const canBargain = subtotal >= minBargainValue;

  return (
    <div className="container" style={{ paddingBottom: 80 }}>
      <section className="page-head">
        <h1>Your Cart</h1>
        <p>Review items before checkout.</p>
      </section>

      {items.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add products you like and they'll show up here.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Browse products</Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Item list */}
          <div className="panel">
            {items.map(({ product, quantity }) => (
              <div className="cart-item" key={product._id}>
                <img src={product.imageUrl} alt={product.name} />
                <div className="cart-item-info">
                  <Link to={`/products/${product._id}`} style={{ fontWeight: 600 }}>{product.name}</Link>
                  <div style={{ fontSize: 13, color: "var(--color-muted)" }}>{product.category}</div>
                  <PriceTag price={product.price} />
                </div>
                <div className="qty-control">
                  <button onClick={() => updateQuantity(product._id, quantity - 1)} aria-label="Decrease quantity">−</button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product._id, quantity + 1)}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => removeItem(product._id)}>Remove</button>
              </div>
            ))}
          </div>

          {/* Checkout summary */}
          <div className="panel">
            <h3 style={{ marginBottom: 14 }}>Order summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="summary-row" style={{ color: "var(--color-muted)" }}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="summary-row total">
              <span>Estimated total</span>
              <span>{formatMoney(subtotal)}</span>
            </div>

            {/* Bargain Bot CTA */}
            {canBargain ? (
              <button
                type="button"
                onClick={() => setIsBargaining(true)}
                className="btn btn-secondary btn-block"
                style={{
                  marginTop: 16,
                  borderColor: "rgba(6,182,212,0.4)",
                  background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(124,58,237,0.1))",
                  boxShadow: "0 0 16px rgba(6,182,212,0.15)",
                  animation: "pulseGlow 2s infinite alternate",
                }}
              >
                🤝 Bargain with Store Manager
              </button>
            ) : (
              <div
                style={{
                  marginTop: 16,
                  padding: "10px 12px",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border-2)",
                  borderRadius: 10,
                  fontSize: 12,
                  textAlign: "center",
                  color: "var(--color-muted)",
                }}
              >
                💡 Add ₹{minBargainValue - subtotal} more to bargain with Gupta Ji!
              </div>
            )}

            <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={() => navigate("/checkout")}>
              Proceed to checkout
            </button>
          </div>
        </div>
      )}

      {/* Bargain Drawer */}
      <BargainModal
        isOpen={isBargaining}
        onClose={() => setIsBargaining(false)}
        cartSubtotal={subtotal}
      />

      <style>{`
        @keyframes pulseGlow {
          from { box-shadow: 0 0 8px rgba(6,182,212,0.1); border-color: rgba(6,182,212,0.3); }
          to { box-shadow: 0 0 20px rgba(6,182,212,0.35); border-color: rgba(124,58,237,0.6); }
        }
      `}</style>
    </div>
  );
}
