import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { formatMoney } from "../components/PriceTag";
import Loader from "../components/Loader";

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get("/orders/my").then(({ data }) => setOrders(data.orders));
  }, []);

  if (!orders) return <Loader />;

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <section className="page-head">
        <h1>My orders</h1>
        <p>Track your order status and past purchases.</p>
      </section>

      {orders.length === 0 ? (
        <div className="empty">
          <h3>No orders yet</h3>
          <p>Orders you place will show up here.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Start shopping</Link>
        </div>
      ) : (
        orders.map((order) => (
          <div className="panel" key={order._id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <strong>Order #{order._id.slice(-8)}</strong>
                <div style={{ fontSize: 12.5, color: "var(--color-muted)" }}>
                  Placed {new Date(order.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
              <span className={`badge badge-${order.status}`}>{order.status}</span>
            </div>
            <div style={{ marginTop: 12 }}>
              {order.items.map((item, idx) => (
                <div className="summary-row" key={idx}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatMoney(item.price * item.quantity)}</span>
                </div>
              ))}
              {order.discount > 0 && (
                <div className="summary-row" style={{ color: "var(--color-primary-dark)" }}>
                  <span>Discount ({order.couponCode})</span>
                  <span>−{formatMoney(order.discount)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
