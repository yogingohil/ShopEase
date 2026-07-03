import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import api from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar";
import Loader from "../../components/Loader";
import { formatMoney } from "../../components/PriceTag";

const STAT_CONFIGS = [
  { key: "revenue", label: "Total Revenue", icon: "💰", glow: "rgba(6,182,212,0.3)", format: (v) => formatMoney(v) },
  { key: "orders", label: "Total Orders", icon: "📦", glow: "rgba(124,58,237,0.3)", format: (v) => v },
  { key: "products", label: "Active Products", icon: "🛍️", glow: "rgba(16,185,129,0.3)", format: (v) => v },
  { key: "customers", label: "Customers", icon: "👥", glow: "rgba(244,63,94,0.3)", format: (v) => v },
];

const TOOLTIP_STYLE = {
  background: "rgba(13,17,23,0.95)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#f0f4ff",
  fontSize: 13,
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then(({ data }) => setData(data));
  }, []);

  return (
    <div className="container" style={{ paddingBottom: 80 }}>
      <section className="page-head">
        <h1>📊 Admin Dashboard</h1>
        <p>Sales performance, inventory health, and recent activity at a glance.</p>
      </section>

      <div className="admin-shell">
        <AdminSidebar />
        <div>
          {!data ? (
            <Loader />
          ) : (
            <>
              {/* Stat Cards */}
              <div className="stat-grid">
                {STAT_CONFIGS.map((cfg) => (
                  <div
                    key={cfg.key}
                    className="stat-card"
                    style={{ "--stat-glow": cfg.glow }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{cfg.icon}</div>
                    <div className="label">{cfg.label}</div>
                    <div className="value">{cfg.format(data.totals[cfg.key])}</div>
                  </div>
                ))}
              </div>

              {/* Charts Row 1 */}
              <div className="dashboard-grid">
                <div className="panel">
                  <h3 style={{ marginBottom: 16, fontSize: 16 }}>📈 Revenue — Last 7 Days</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={data.dailyRevenue}>
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="_id" fontSize={11} tick={{ fill: "rgba(240,244,255,0.5)" }} />
                      <YAxis fontSize={11} tick={{ fill: "rgba(240,244,255,0.5)" }} />
                      <Tooltip
                        formatter={(value) => formatMoney(value)}
                        contentStyle={TOOLTIP_STYLE}
                        labelStyle={{ color: "#a78bfa" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="url(#lineGrad)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#7c3aed", strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: "#a78bfa" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="panel">
                  <h3 style={{ marginBottom: 16, fontSize: 16 }}>🔢 Orders by Status</h3>
                  {Object.entries(data.statusCounts).map(([status, count]) => (
                    <div key={status} className="low-stock-row">
                      <span className={`badge badge-${status}`}>{status}</span>
                      <strong style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
                        {count}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="dashboard-grid" style={{ marginTop: 20 }}>
                <div className="panel">
                  <h3 style={{ marginBottom: 16, fontSize: 16 }}>🏆 Top Selling Products</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.topProducts} layout="vertical" margin={{ left: 40 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                      <XAxis type="number" fontSize={11} tick={{ fill: "rgba(240,244,255,0.5)" }} />
                      <YAxis dataKey="_id" type="category" fontSize={11} width={120} tick={{ fill: "rgba(240,244,255,0.5)" }} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#a78bfa" }} />
                      <Bar dataKey="unitsSold" fill="url(#barGrad)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="panel">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>⚠️ Low Stock Alerts</h3>
                    <Link to="/admin/products" className="btn btn-ghost btn-sm">Manage →</Link>
                  </div>
                  {data.lowStock.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "var(--color-muted)" }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                      <p style={{ margin: 0, fontSize: 13.5 }}>Everything is well stocked!</p>
                    </div>
                  ) : (
                    data.lowStock.map((p) => (
                      <div key={p._id} className="low-stock-row">
                        <span style={{ color: "var(--color-ink-soft)", fontSize: 13.5 }}>{p.name}</span>
                        <span className="stock-badge low">⚠️ {p.stock} left</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="panel" style={{ marginTop: 20 }}>
                <h3 style={{ marginBottom: 16, fontSize: 16 }}>🧾 Recent Orders</h3>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentOrders.map((o) => (
                        <tr key={o._id}>
                          <td style={{ color: "var(--color-ink)" }}>{o.customerName}</td>
                          <td style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-light)" }}>
                            {formatMoney(o.total)}
                          </td>
                          <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                          <td>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
