import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/products", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div style={{ fontSize: 40, marginBottom: 12, textAlign: "center" }}>✨</div>
        <h1 style={{ textAlign: "center" }}>Create your account</h1>
        <p className="subtitle" style={{ textAlign: "center" }}>
          Join ShopEase and unlock AI-powered shopping features.
        </p>

        {error && <div className="form-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">👤 Full Name</label>
            <input
              id="name"
              className="form-input"
              placeholder="Priya Sharma"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
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
            <label htmlFor="phone">📱 Phone <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>(optional)</span></label>
            <input
              id="phone"
              className="form-input"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">🔑 Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button
            className="btn btn-primary btn-block"
            disabled={submitting}
            style={{ marginTop: 8 }}
          >
            {submitting ? "Creating account…" : "Create Account 🚀"}
          </button>
        </form>

        {/* Perks */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {["🤖 AI Negotiator", "♥ Wishlists", "📦 Order tracking"].map((f) => (
            <span
              key={f}
              style={{
                fontSize: 11.5,
                padding: "4px 10px",
                borderRadius: "999px",
                border: "1px solid var(--color-border-2)",
                color: "var(--color-ink-soft)",
                background: "var(--color-surface)",
              }}
            >
              {f}
            </span>
          ))}
        </div>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in →</Link>
        </p>
      </div>
    </div>
  );
}
