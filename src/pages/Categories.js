import { useEffect, useState } from "react";
import { categoriesAPI } from "../services/api";
import Navbar from "../components/Navbar";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesAPI.getAll();
      if (res.data.success) setCategories(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || "" });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await categoriesAPI.update(editing._id, form);
      } else {
        await categoriesAPI.create(form);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await categoriesAPI.delete(id);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1>Categories</h1>
          <button className="btn btn-primary" onClick={openAdd}>
            Add Category
          </button>
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
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.description || "-"}</td>
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
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit Category" : "Add Category"}</h2>
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
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input"
                  rows="3"
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
