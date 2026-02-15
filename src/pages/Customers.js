import { useEffect, useState } from "react";
import { customersAPI } from "../services/api";
import Navbar from "../components/Navbar";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "" });
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customersAPI.getAll({ page, limit: 10, search: search || undefined });
      if (res.data.success) {
        setCustomers(res.data.data || []);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", address: "", city: "" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
      city: c.city || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await customersAPI.update(editing._id, form);
      } else {
        await customersAPI.create(form);
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await customersAPI.delete(id);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1>Customers</h1>
          <button className="btn btn-primary" onClick={openAdd}>
            Add Customer
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input"
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Purchases</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.email || "-"}</td>
                    <td>{c.city || "-"}</td>
                    <td>{c.totalPurchases ?? 0}</td>
                    <td>
                      <button className="btn btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit Customer" : "Add Customer"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="input"
                />
              </div>
              {error && <div className="error-msg">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
