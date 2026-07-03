import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-dot" />
          ShopEase
        </Link>

        <nav className="nav-links">
          {user?.role === "admin" && (
            <>
              <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                📊 Dashboard
              </NavLink>
              <NavLink to="/admin/products" className={({ isActive }) => (isActive ? "active" : "")}>
                📦 Products
              </NavLink>
              <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? "active" : "")}>
                🧾 Orders
              </NavLink>
              <NavLink to="/admin/coupons" className={({ isActive }) => (isActive ? "active" : "")}>
                🏷️ Coupons
              </NavLink>
              <NavLink to="/admin/customers" className={({ isActive }) => (isActive ? "active" : "")}>
                👥 Customers
              </NavLink>
            </>
          )}
          {user?.role === "client" && (
            <>
              <NavLink to="/products" className={({ isActive }) => (isActive ? "active" : "")}>
                🛍️ Products
              </NavLink>
              <NavLink to="/wishlist" className={({ isActive }) => (isActive ? "active" : "")}>
                ♥ Wishlist
              </NavLink>
              <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
                📦 My Orders
              </NavLink>
            </>
          )}
          {!user && (
            <NavLink to="/products" className={({ isActive }) => (isActive ? "active" : "")}>
              🛍️ Products
            </NavLink>
          )}
        </nav>

        <div className="nav-right">
          {user?.role === "client" && (
            <Link
              to="/cart"
              className="btn btn-ghost btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              🛒 Cart
              {count > 0 && <span className="nav-cart-badge">{count}</span>}
            </Link>
          )}
          {!user && (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
          {user && (
            <>
              <span className="nav-user">Hi, {user.name.split(" ")[0]} 👋</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
