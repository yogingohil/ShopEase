import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/products", label: "Products", icon: "📦" },
  { to: "/admin/orders", label: "Orders", icon: "🧾" },
  { to: "/admin/coupons", label: "Coupons", icon: "🏷️" },
  { to: "/admin/customers", label: "Customers", icon: "👥" },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-side">
      <div
        style={{
          padding: "12px 14px 8px",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: 6,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
        }}
      >
        ⚡ Admin Panel
      </div>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span>{link.icon}</span>
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}
