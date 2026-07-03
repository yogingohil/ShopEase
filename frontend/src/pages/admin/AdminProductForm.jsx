import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar";

const emptyForm = {
  name: "",
  category: "Grocery",
  price: "",
  compareAtPrice: "",
  stock: "",
  lowStockThreshold: 5,
  imageUrl: "",
  description: ""
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/products/categories").then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then(({ data }) => {
        const p = data.product;
        setForm({
          name: p.name,
          category: p.category,
          price: p.price,
          compareAtPrice: p.compareAtPrice || "",
          stock: p.stock,
          lowStockThreshold: p.lowStockThreshold,
          imageUrl: p.imageUrl,
          description: p.description
        });
      });
    }
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold) || 5,
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined
    };
    try {
      if (isEdit) await api.put(`/products/${id}`, payload);
      else await api.post("/products", payload);
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <section className="page-head">
        <h1>{isEdit ? "Edit product" : "Add product"}</h1>
        <p>{isEdit ? "Update product details and inventory." : "Add a new product to the catalog."}</p>
      </section>

      <div className="admin-shell">
        <AdminSidebar />
        <div className="panel" style={{ maxWidth: 640 }}>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Product name</label>
              <input
                id="name"
                className="form-input"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="imageUrl">Image URL</label>
                <input
                  id="imageUrl"
                  className="form-input"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (Rs.)</label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="compareAtPrice">Compare-at price (optional)</label>
                <input
                  id="compareAtPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock">Stock quantity</label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  className="form-input"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lowStockThreshold">Low stock alert threshold</label>
                <input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  className="form-input"
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="form-textarea"
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Add product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
