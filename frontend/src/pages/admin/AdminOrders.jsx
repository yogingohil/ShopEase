import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar";
import Loader from "../../components/Loader";
import { formatMoney } from "../../components/PriceTag";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  async function load(status = "") {
    const { data } = await api.get("/orders", { params: status ? { status } : {} });
    setOrders(data.orders);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(order, status) {
    setError("");
    try {
      const { data } = await api.patch(`/orders/${order._id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === order._id ? data.order : o)));
    } catch (err) {
      setError(err.response?.data?.message || "Could not update order status.");
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <section className="page-head">
        <h1>Orders</h1>
        <p>View orders and update fulfillment status.</p>
      </section>

      <div className="admin-shell">
        <AdminSidebar />
        <div>
          <div className="toolbar">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                load(e.target.value);
              }}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {error && <div className="form-error">{error}</div>}

          {!orders ? (
            <Loader />
          ) : orders.length === 0 ? (
            <div className="empty"><h3>No orders found</h3></div>
          ) : (
            <div className="panel table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td>#{o._id.slice(-8)}</td>
                      <td>
                        {o.customerName}
                        <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{o.customerEmail}</div>
                      </td>
                      <td>{o.items.length} item{o.items.length > 1 ? "s" : ""}</td>
                      <td>{formatMoney(o.total)}</td>
                      <td>
                        <select
                          className="form-select"
                          value={o.status}
                          onChange={(e) => handleStatusChange(o, e.target.value)}
                          style={{ padding: "6px 8px", fontSize: 13 }}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
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
