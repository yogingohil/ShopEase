import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user || user.role !== "client") {
      setItems([]);
      setSubtotal(0);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setItems(data.items);
      setSubtotal(data.subtotal);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addToCart(productId, quantity = 1) {
    const { data } = await api.post("/cart/items", { productId, quantity });
    setItems(data.items);
    setSubtotal(data.subtotal);
  }

  async function updateQuantity(productId, quantity) {
    const { data } = await api.patch(`/cart/items/${productId}`, { quantity });
    setItems(data.items);
    setSubtotal(data.subtotal);
  }

  async function removeItem(productId) {
    const { data } = await api.delete(`/cart/items/${productId}`);
    setItems(data.items);
    setSubtotal(data.subtotal);
  }

  async function clearCart() {
    await api.delete("/cart");
    setItems([]);
    setSubtotal(0);
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = { items, subtotal, count, loading, refreshCart, addToCart, updateQuantity, removeItem, clearCart };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
