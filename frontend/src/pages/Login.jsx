import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/products", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div style={{ fontSize: 40, marginBottom: 12, textAlign: "center" }}>🛍️</div>
        <h1 style={{ textAlign: "center" }}>Welcome back</h1>
        <p className="subtitle" style={{ textAlign: "center" }}>
          Log in to shop, track orders, and manage your wishlist.
        </p>

        {error && <div className="form-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">📧 Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">🔑 Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button
            className="btn btn-primary btn-block"
            disabled={submitting}
            style={{ marginTop: 8 }}
          >
            {submitting ? "Logging in…" : "Log In →"}
          </button>
        </form>

        <p className="auth-switch">
          New to ShopEase? <Link to="/register">Create an account ✨</Link>
        </p>
        <p className="auth-switch" style={{ marginTop: 8 }}>
          <Link to="/admin/login" style={{ color: "var(--color-muted)", fontSize: 12 }}>
            Admin login →
          </Link>
        </p>
      </div>
    </div>
  );
}
