import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useAnim } from "../context/AnimationContext";
import { useScrollReveal } from "../components/useScrollReveal";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";

const CATEGORY_EMOJIS = {
  "Grocery": "🥦", "Clothes": "👗", "Electronic Gadgets": "💻",
  "Footwear": "👟", "Home Appliances": "🏠", "Beauty": "💄",
  "Books": "📚", "Sports": "⚽",
};

export default function Products() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const anim = useAnim();
  const isClient = user?.role === "client";

  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");

  const gridRef = useRef(null);
  useScrollReveal(gridRef, [products]);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page") || 1);

  const loadProducts = useCallback(async () => {
    setProducts(null);
    const { data } = await api.get("/products", { params: { q, category, sort, page, limit: 12 } });
    setProducts(data.products);
    setPagination(data.pagination);
  }, [q, category, sort, page]);

  useEffect(() => {
    api.get("/products/categories").then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    if (isClient) {
      api.get("/wishlist").then(({ data }) => setWishlistIds(new Set(data.wishlist.map((p) => p._id))));
    }
  }, [isClient]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  }

  function showToast(message, type = "success") {
    setToast(message);
    setToastType(type);
    setTimeout(() => setToast(""), 2800);
  }

  // ── Add to Cart: fly product to cart badge ──────────────
  async function handleAddToCart(product, cardEl) {
    try {
      await addToCart(product._id, 1);
      showToast(`🛒 "${product.name}" added to cart!`, "success");

      // Find cart badge
      const cartEl = document.querySelector(".nav-cart-badge") || document.querySelector("[href='/cart']");
      anim.flyToCart(cardEl, product.imageUrl, cartEl);

      // Jiggle the badge
      setTimeout(() => {
        const badge = document.querySelector(".nav-cart-badge");
        if (badge) {
          badge.classList.remove("badge-jiggle");
          void badge.offsetWidth; // reflow
          badge.classList.add("badge-jiggle");
        }
      }, 500);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add to cart.", "error");
    }
  }

  // ── Wishlist: hearts burst ────────────────────────────
  async function handleToggleWishlist(product, btnEl) {
    const has = wishlistIds.has(product._id);
    try {
      if (has) {
        await api.delete(`/wishlist/${product._id}`);
        setWishlistIds((prev) => { const next = new Set(prev); next.delete(product._id); return next; });
        showToast("💔 Removed from wishlist");
      } else {
        await api.post("/wishlist", { productId: product._id });
        setWishlistIds((prev) => new Set(prev).add(product._id));
        showToast("♥ Saved to wishlist!");
        // ❤️ Hearts burst from wishlist button
        anim.heartsFrom(btnEl, 14);
      }
    } catch {
      showToast("Could not update wishlist.", "error");
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 80 }}>
      <section className="page-head">
        <h1>🛍️ Browse Products</h1>
        <p>Search, filter by category, and sort to find exactly what you need.</p>
      </section>

      {/* Category pills */}
      <div className="category-strip" style={{ paddingBottom: 16 }}>
        <button className={`category-pill ${!category ? "active" : ""}`} onClick={() => updateParam("category", "")}>
          ✦ All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${category === cat ? "active" : ""}`}
            onClick={() => updateParam("category", cat)}
          >
            {CATEGORY_EMOJIS[cat] || "✦"} {cat}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-input-wrap">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search by name, category, or description…"
            defaultValue={q}
            onKeyDown={(e) => { if (e.key === "Enter") updateParam("q", e.currentTarget.value); }}
            onBlur={(e) => updateParam("q", e.currentTarget.value)}
          />
        </div>
        <select className="form-select" value={sort} onChange={(e) => updateParam("sort", e.target.value)}>
          <option value="newest">🕐 Newest</option>
          <option value="price_asc">💰 Price: Low → High</option>
          <option value="price_desc">💎 Price: High → Low</option>
          <option value="rating">⭐ Top Rated</option>
          <option value="name">🔤 Name A–Z</option>
        </select>
      </div>

      {!products ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="empty">
          <div className="ghost-float" style={{ fontSize: 56, marginBottom: 12 }}>👻</div>
          <h3>No products found</h3>
          <p>Try a different search term or clear the category filter.</p>
        </div>
      ) : (
        <>
          {/* Scroll-reveal product grid */}
          <div className="product-grid" ref={gridRef}>
            {products.map((product) => (
              <div key={product._id} className="reveal">
                <ProductCard
                  product={product}
                  isClient={isClient}
                  isWishlisted={wishlistIds.has(product._id)}
                  onToggleWishlist={(p, btnEl) => handleToggleWishlist(p, btnEl)}
                  onAddToCart={(p, cardEl) => handleAddToCart(p, cardEl)}
                />
              </div>
            ))}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onChange={(n) => updateParam("page", String(n))} />
        </>
      )}

      {/* Premium animated toast */}
      {toast && (
        <div className="toast-container">
          <div
            className="toast"
            style={{
              borderLeftWidth: 3,
              borderLeftStyle: "solid",
              borderLeftColor: toastType === "error" ? "var(--color-hot)" : "var(--color-success)",
            }}
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
