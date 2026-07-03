import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

export default function Wishlist() {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState(null);
  const [toast, setToast] = useState("");

  async function load() {
    const { data } = await api.get("/wishlist");
    setWishlist(data.wishlist);
  }

  useEffect(() => {
    load();
  }, []);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  }

  async function handleRemove(product) {
    await api.delete(`/wishlist/${product._id}`);
    setWishlist((prev) => prev.filter((p) => p._id !== product._id));
  }

  async function handleAddToCart(product) {
    try {
      await addToCart(product._id, 1);
      showToast(`Added "${product.name}" to cart.`);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add to cart.");
    }
  }

  if (!wishlist) return <Loader />;

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <section className="page-head">
        <h1>Your wishlist</h1>
        <p>Products you've saved for later.</p>
      </section>

      {toast && <div className="form-success">{toast}</div>}

      {wishlist.length === 0 ? (
        <div className="empty">
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart icon on any product to save it here.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Browse products</Link>
        </div>
      ) : (
        <div className="product-grid">
          {wishlist.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isClient
              isWishlisted
              onToggleWishlist={handleRemove}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
