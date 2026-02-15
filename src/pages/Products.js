import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { productsAPI, categoriesAPI } from "../services/api";
import Navbar from "../components/Navbar";

export default function Products() {
  const [searchParams] = useSearchParams();
  const showLowStock = searchParams.get("lowStock") === "true";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", category: "", price: "", quantity: "0", sku: "", description: "", reorderLevel: "10" });
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let res;
      if (showLowStock) {
        res = await productsAPI.getLowStock();
        setProducts(res.data.data || []);
        setTotalPages(1);
      } else {
        res = await productsAPI.getAll({ page, limit: 10, search: search || undefined, category: category || undefined });
        setProducts(res.data.data || []);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, showLowStock, search, category]);

  useEffect(() => {
    categoriesAPI.getAll().then((res) => {
      if (res.data.success) setCategories(res.data.data || []);
    });
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", category: "", price: "", quantity: "0", sku: "", description: "", reorderLevel: "10" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category?._id || p.category || "",
      price: p.price?.toString() || "",
      quantity: p.quantity?.toString() || "0",
      sku: p.sku || "",
      description: p.description || "",
      reorderLevel: p.reorderLevel?.toString() || "10",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity) || 0,
        sku: form.sku || undefined,
        description: form.description || undefined,
        reorderLevel: parseInt(form.reorderLevel) || 10,
      };
      if (editing) {
        await productsAPI.update(editing._id, payload);
      } else {
        await productsAPI.create(payload);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await productsAPI.delete(id);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1>{showLowStock ? "Low Stock Products" : "Products"}</h1>
          <div className="page-header-actions">
            {showLowStock ? (
              <Link to="/products" className="btn">View All Products</Link>
            ) : (
              <Link to="/products?lowStock=true" className="btn">View Low Stock</Link>
            )}
            <button className="btn btn-primary" onClick={openAdd}>
              Add Product
            </button>
          </div>
        </div>

        {!showLowStock && (
          <div className="filters">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input"
            />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="select"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Reorder</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className={p.quantity <= (p.reorderLevel || 10) ? "low-stock-row" : ""}>
                    <td>{p.name}</td>
                    <td>{p.sku || "-"}</td>
                    <td>{p.category?.name || "-"}</td>
                    <td>${p.price?.toFixed(2)}</td>
                    <td>{p.quantity}</td>
                    <td>{p.reorderLevel || 10}</td>
                    <td>
                      <button className="btn btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!showLowStock && totalPages > 1 && (
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
            <h2>{editing ? "Edit Product" : "Add Product"}</h2>
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
                <label>Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                  className="select"
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    value={form.reorderLevel}
                    onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input"
                  rows="2"
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
