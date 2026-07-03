import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar";
import Loader from "../../components/Loader";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrderValue: "",
  maxDiscount: "",
  expiresAt: "",
  usageLimit: ""
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const { data } = await api.get("/coupons");
    setCoupons(data.coupons);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/coupons", {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
        expiresAt: form.expiresAt || undefined
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create coupon.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(coupon) {
    await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
    load();
  }

  async function handleDelete(coupon) {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    await api.delete(`/coupons/${coupon._id}`);
    load();
  }

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <section className="page-head">
        <h1>Coupons</h1>
        <p>Create discount codes customers can apply at checkout.</p>
      </section>

      <div className="admin-shell">
        <AdminSidebar />
        <div>
          <div className="panel" style={{ maxWidth: 560, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 14 }}>Create coupon</h3>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="code">Code</label>
                  <input
                    id="code"
                    className="form-input"
                    required
                    placeholder="SAVE20"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="discountType">Type</label>
                  <select
                    id="discountType"
                    className="form-select"
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat amount</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="discountValue">
                    Discount value {form.discountType === "percentage" ? "(%)" : "(Rs.)"}
                  </label>
                  <input
                    id="discountValue"
                    type="number"
                    min="0"
                    className="form-input"
                    required
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="minOrderValue">Min order value (Rs.)</label>
                  <input
                    id="minOrderValue"
                    type="number"
                    min="0"
                    className="form-input"
                    value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="maxDiscount">Max discount cap (optional)</label>
                  <input
                    id="maxDiscount"
                    type="number"
                    min="0"
                    className="form-input"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="usageLimit">Usage limit (0 = unlimited)</label>
                  <input
                    id="usageLimit"
                    type="number"
                    min="0"
                    className="form-input"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="expiresAt">Expires on (optional)</label>
                <input
                  id="expiresAt"
                  type="date"
                  className="form-input"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  id="description"
                  className="form-input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <button className="btn btn-primary" disabled={submitting}>
                {submitting ? "Creating…" : "Create coupon"}
              </button>
            </form>
          </div>

          {!coupons ? (
            <Loader />
          ) : (
            <div className="panel table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Code</th><th>Discount</th><th>Min order</th><th>Used</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c._id}>
                      <td><strong>{c.code}</strong><div style={{ fontSize: 12, color: "var(--color-muted)" }}>{c.description}</div></td>
                      <td>{c.discountType === "percentage" ? `${c.discountValue}%` : `Rs. ${c.discountValue}`}</td>
                      <td>Rs. {c.minOrderValue}</td>
                      <td>{c.timesUsed}{c.usageLimit > 0 ? ` / ${c.usageLimit}` : ""}</td>
                      <td>
                        <span className={`badge ${c.isActive ? "badge-delivered" : "badge-cancelled"}`}>
                          {c.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(c)}>
                          {c.isActive ? "Disable" : "Enable"}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
