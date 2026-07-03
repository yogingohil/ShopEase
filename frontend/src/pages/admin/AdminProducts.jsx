import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar";
import Loader from "../../components/Loader";
import { formatMoney } from "../../components/PriceTag";

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  async function load(query = "") {
    const { data } = await api.get("/products", { params: { q: query, limit: 48, sort: "name" } });
    setProducts(data.products);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setError("");
    try {
      await api.delete(`/products/${product._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete product.");
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <section className="page-head">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1>Products</h1>
            <p>Add, edit, and remove products from the catalog.</p>
          </div>
          <Link to="/admin/products/new" className="btn btn-primary">+ Add product</Link>
        </div>
      </section>

      <div className="admin-shell">
        <AdminSidebar />
        <div>
          <div className="toolbar">
            <input
              type="text"
              placeholder="Search products…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(q)}
            />
            <button className="btn btn-ghost btn-sm" onClick={() => load(q)}>Search</button>
          </div>

          {error && <div className="form-error">{error}</div>}

          {!products ? (
            <Loader />
          ) : (
            <div className="panel table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th></th></tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <img src={p.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
                        {p.name}
                      </td>
                      <td>{p.category}</td>
                      <td>{formatMoney(p.price)}</td>
                      <td>
                        {p.stock}
                        {p.stock <= p.lowStockThreshold && <span className="stock-badge low" style={{ marginLeft: 8 }}>Low</span>}
                      </td>
                      <td>{p.rating ? p.rating.toFixed(1) : "—"}</td>
                      <td style={{ display: "flex", gap: 8 }}>
                        <Link to={`/admin/products/${p._id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Delete</button>
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
