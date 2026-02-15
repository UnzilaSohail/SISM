import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usersAPI } from "../services/api";
import Navbar from "../components/Navbar";

export default function Users() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "staff", isActive: true });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const res = await usersAPI.getAll();
      if (res.data.success) setUsers(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 403) {
        navigate("/");
      } else {
        setError(err.response?.data?.message || "Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      role: u.role || "staff",
      isActive: u.isActive !== false,
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await usersAPI.update(editing._id, {
        name: form.name,
        email: form.email,
        role: form.role,
        isActive: form.isActive,
      });
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await usersAPI.delete(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1>User Management</h1>
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
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                    <td>{u.isActive !== false ? "Active" : "Inactive"}</td>
                    <td>
                      <button className="btn btn-sm" onClick={() => openEdit(u)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u._id)}>Delete</button>
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
            <h2>Edit User</h2>
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
                <label>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="select"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  {" "}Active
                </label>
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
