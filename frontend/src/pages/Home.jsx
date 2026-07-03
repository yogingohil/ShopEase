import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const CATEGORY_EMOJIS = {
  "Grocery": "🥦",
  "Clothes": "👗",
  "Electronic Gadgets": "💻",
  "Footwear": "👟",
  "Home Appliances": "🏠",
  "Beauty": "💄",
  "Books": "📚",
  "Sports": "⚽",
};

export default function Home() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    api.get("/products/categories").then(({ data }) => setCategories(data.categories));
    api.get("/products", { params: { sort: "rating", limit: 8 } }).then(({ data }) => setFeatured(data.products));
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section className="container hero">
        <div>
          <span className="eyebrow">✦ AI-Powered · 8 Categories · Next-Gen Commerce</span>
          <h1>
            Shop smarter with{" "}
            <span className="highlight">AI by your side.</span>
          </h1>
          <p className="lede">
            ShopEase brings groceries, fashion, electronics, and more into one blazing fast storefront —
            with real reviews, wishlists, order tracking, and AI that negotiates prices{" "}
            <em>for you</em>.
          </p>
          <div className="hero-actions">
            <Link
              to={user?.role === "admin" ? "/admin/dashboard" : "/products"}
              className="btn btn-primary"
            >
              {user?.role === "admin" ? "📊 Open Dashboard" : "🛍️ Start Shopping"}
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-ghost">
                Create Account →
              </Link>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><b>8</b><span>Categories</span></div>
            <div className="hero-stat"><b>24+</b><span>Live products</span></div>
            <div className="hero-stat"><b>AI</b><span>Price Negotiator</span></div>
            <div className="hero-stat"><b>24/7</b><span>Order tracking</span></div>
          </div>
        </div>

        {/* Animated visual panel */}
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />

          <div className="price-chip chip-1">
            <span className="swatch" /> ₹ 2,499 · In stock
          </div>
          <div className="price-chip chip-2">
            <span className="swatch swatch-green" /> ★ 4.8 · Top rated
          </div>
          <div className="price-chip chip-3">
            🤖 AI saved you ₹400!
          </div>

          {/* Decorative grid lines */}
          <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07 }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </section>

      {/* ── Category strip ── */}
      <section className="container">
        <div className="category-strip">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${encodeURIComponent(cat)}`}
              className="category-pill"
            >
              {CATEGORY_EMOJIS[cat] || "✦"} {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="section-title">
          <h2>✨ Top Rated Right Now</h2>
          <Link to="/products" className="btn btn-ghost btn-sm">
            View all →
          </Link>
        </div>

        {!featured ? (
          <Loader />
        ) : (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} isClient={false} />
            ))}
          </div>
        )}
      </section>

      {/* ── Value Props ── */}
      <section className="container" style={{ paddingBottom: 80 }}>
        <hr className="glow-divider" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {[
            { icon: "🤖", title: "AI Price Negotiator", desc: "Haggle with our AI store manager and get real discounts — just like the local market." },
            { icon: "🎯", title: "Smart Combo Planner", desc: "Tell us your goal, we build the perfect product bundle and add it to your cart." },
            { icon: "🔒", title: "Secure by Design", desc: "JWT auth, bcrypt passwords, helmet headers, and rate limiting on every endpoint." },
            { icon: "📦", title: "Real Order Tracking", desc: "Live order status from pending to delivered, with cancellation support." },
          ].map((f) => (
            <div key={f.title} className="panel" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "var(--color-ink-soft)", fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
