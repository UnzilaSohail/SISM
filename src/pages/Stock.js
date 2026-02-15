import { useEffect, useState } from "react";
import { stockAPI, productsAPI } from "../services/api";
import Navbar from "../components/Navbar";

export default function Stock() {
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("history"); // history | in | out
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({
    product: "",
    quantity: "",
    reason: "purchase",
    notes: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await stockAPI.getHistory({ page, limit: 20 });
      if (res.data.success) {
        setHistory(res.data.data || []);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "history") fetchHistory();
  }, [tab, page]);

  useEffect(() => {
    productsAPI.getAll({ limit: 100 }).then((res) => {
      if (res.data.success) setProducts(res.data.data || []);
    });
  }, []);

  useEffect(() => {
    if (tab === "in") setForm((f) => ({ ...f, product: "", quantity: "", reason: "purchase" }));
    if (tab === "out") setForm((f) => ({ ...f, product: "", quantity: "", reason: "sale" }));
  }, [tab]);

  const handleStockIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.product || !form.quantity || form.quantity <= 0) {
      setError("Select product and enter valid quantity");
      return;
    }
    try {
      await stockAPI.stockIn({
        product: form.product,
        quantity: parseInt(form.quantity),
        reason: form.reason,
        notes: form.notes,
      });
      setSuccess("Stock in recorded successfully");
      setForm({ product: "", quantity: "", reason: "purchase", notes: "" });
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record stock in");
    }
  };

  const handleStockOut = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.product || !form.quantity || form.quantity <= 0) {
      setError("Select product and enter valid quantity");
      return;
    }
    try {
      await stockAPI.stockOut({
        product: form.product,
        quantity: parseInt(form.quantity),
        reason: form.reason,
        notes: form.notes,
      });
      setSuccess("Stock out recorded successfully");
      setForm({ product: "", quantity: "", reason: "sale", notes: "" });
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record stock out");
    }
  };

  const stockInReasons = ["purchase", "return", "adjustment"];
  const stockOutReasons = ["sale", "damage", "loss", "adjustment"];

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1>Stock Management</h1>
        </div>

        <div className="tabs">
          <button className={tab === "history" ? "tab active" : "tab"} onClick={() => setTab("history")}>
            Audit History
          </button>
          <button className={tab === "in" ? "tab active" : "tab"} onClick={() => setTab("in")}>
            Stock In
          </button>
          <button className={tab === "out" ? "tab active" : "tab"} onClick={() => setTab("out")}>
            Stock Out
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        {tab === "history" && (
          <>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Reason</th>
                        <th>By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h._id}>
                          <td>{new Date(h.createdAt).toLocaleString()}</td>
                          <td>{h.product?.name}</td>
                          <td><span className={`badge badge-${h.type === 'adjustment' ? 'adjustment' : h.type}`}>{h.type}</span></td>
                          <td>{h.quantity}</td>
                          <td>{h.reason}</td>
                          <td>{h.createdBy?.name || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tab === "in" && (
          <div className="card">
            <form onSubmit={handleStockIn}>
              <div className="form-group">
                <label>Product *</label>
                <select
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  required
                  className="select"
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} (Current: {p.quantity})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <select
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="select"
                >
                  {stockInReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input"
                  rows="2"
                />
              </div>
              <button type="submit" className="btn btn-primary">Record Stock In</button>
            </form>
          </div>
        )}

        {tab === "out" && (
          <div className="card">
            <form onSubmit={handleStockOut}>
              <div className="form-group">
                <label>Product *</label>
                <select
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  required
                  className="select"
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} (Current: {p.quantity})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <select
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="select"
                >
                  {stockOutReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input"
                  rows="2"
                />
              </div>
              <button type="submit" className="btn btn-primary">Record Stock Out</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
