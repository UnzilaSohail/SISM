import { useEffect, useState } from "react";
import { salesAPI, customersAPI, productsAPI } from "../services/api";
import Navbar from "../components/Navbar";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [report, setReport] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tab, setTab] = useState("list"); // list | create | report
  const [form, setForm] = useState({
    customer: "",
    items: [{ product: "", quantity: 1 }],
    tax: 0,
    discount: 0,
    paymentMethod: "cash",
    notes: "",
  });
  const [reportFilters, setReportFilters] = useState({ startDate: "", endDate: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await salesAPI.getAll({ page, limit: 10 });
      if (res.data.success) {
        setSales(res.data.data || []);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    try {
      const res = await salesAPI.getReport(reportFilters);
      if (res.data.success) setReport(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
    }
  };

  useEffect(() => {
    if (tab === "list") fetchSales();
  }, [tab, page]);

  useEffect(() => {
    if (tab === "report") fetchReport();
  }, [tab, reportFilters.startDate, reportFilters.endDate]);

  useEffect(() => {
    customersAPI.getAll({ limit: 100 }).then((res) => {
      if (res.data.success) setCustomers(res.data.data || []);
    });
    productsAPI.getAll({ limit: 100 }).then((res) => {
      if (res.data.success) setProducts(res.data.data || []);
    });
  }, []);

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product: "", quantity: 1 }] });
  };

  const removeItem = (idx) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const validItems = form.items.filter((i) => i.product && i.quantity > 0);
    if (!form.customer || validItems.length === 0) {
      setError("Select customer and add at least one product");
      return;
    }
    try {
      await salesAPI.create({
        customer: form.customer,
        items: validItems.map((i) => ({ product: i.product, quantity: parseInt(i.quantity) })),
        tax: parseFloat(form.tax) || 0,
        discount: parseFloat(form.discount) || 0,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      });
      setSuccess("Sale created successfully");
      setForm({ customer: "", items: [{ product: "", quantity: 1 }], tax: 0, discount: 0, paymentMethod: "cash", notes: "" });
      fetchSales();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create sale");
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1>Sales</h1>
        </div>

        <div className="tabs">
          <button className={tab === "list" ? "tab active" : "tab"} onClick={() => setTab("list")}>
            Sales List
          </button>
          <button className={tab === "create" ? "tab active" : "tab"} onClick={() => setTab("create")}>
            New Sale
          </button>
          <button className={tab === "report" ? "tab active" : "tab"} onClick={() => setTab("report")}>
            Report
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        {tab === "list" && (
          <>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((s) => (
                        <tr key={s._id}>
                          <td>{s.invoiceNumber}</td>
                          <td>{s.customer?.name}</td>
                          <td>${s.totalAmount?.toFixed(2)}</td>
                          <td>{s.paymentMethod}</td>
                          <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                          <td>{new Date(s.createdAt).toLocaleDateString()}</td>
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

        {tab === "create" && (
          <div className="card">
            <form onSubmit={handleCreateSale}>
              <div className="form-group">
                <label>Customer *</label>
                <select
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  required
                  className="select"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Items</label>
                {form.items.map((item, idx) => (
                  <div key={idx} className="sale-item-row">
                    <select
                      value={item.product}
                      onChange={(e) => updateItem(idx, "product", e.target.value)}
                      className="select"
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} - ${p.price?.toFixed(2)} (Qty: {p.quantity})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                      className="input"
                      style={{ width: 80 }}
                    />
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(idx)}>Remove</button>
                  </div>
                ))}
                <button type="button" className="btn btn-sm" onClick={addItem}>+ Add Item</button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tax %</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.tax}
                    onChange={(e) => setForm({ ...form, tax: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label>Discount $</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="select"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="check">Check</option>
                    <option value="online">Online</option>
                  </select>
                </div>
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

              <button type="submit" className="btn btn-primary">Create Sale</button>
            </form>
          </div>
        )}

        {tab === "report" && (
          <div className="card">
            <div className="filters">
              <input
                type="date"
                value={reportFilters.startDate}
                onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                className="input"
              />
              <input
                type="date"
                value={reportFilters.endDate}
                onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                className="input"
              />
            </div>
            {report && (
              <div className="report-cards">
                <div className="stat-card">
                  <h3>Total Sales</h3>
                  <p className="stat-value">{report.totalSales}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">${report.totalAmount?.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Average Sale</h3>
                  <p className="stat-value">${report.averageSale?.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Tax</h3>
                  <p className="stat-value">${report.totalTax?.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
