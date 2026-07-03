import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar";
import Loader from "../../components/Loader";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState(null);

  useEffect(() => {
    api.get("/admin/customers").then(({ data }) => setCustomers(data.customers));
  }, []);

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <section className="page-head">
        <h1>Customers</h1>
        <p>Everyone who has registered a client account.</p>
      </section>

      <div className="admin-shell">
        <AdminSidebar />
        <div>
          {!customers ? (
            <Loader />
          ) : (
            <div className="panel table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c._id}>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone || "—"}</td>
                      <td>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
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
