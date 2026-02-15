import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { productsAPI, salesAPI } from "../services/api";

export default function Dashboard() {
  const [report, setReport] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [reportRes, lowStockRes] = await Promise.all([
          salesAPI.getReport(),
          productsAPI.getLowStock(),
        ]);
        if (reportRes.data.success) setReport(reportRes.data.data);
        if (lowStockRes.data.success) setLowStock(lowStockRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page">
          <div className="loading">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <h1>Dashboard</h1>

        <div className="dashboard-cards">
          <div className="stat-card">
            <h3>Total Sales</h3>
            <p className="stat-value">{report?.totalSales ?? 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">${(report?.totalAmount ?? 0).toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Average Sale</h3>
            <p className="stat-value">${(report?.averageSale ?? 0).toFixed(2)}</p>
          </div>
        </div>

        {lowStock.length > 0 && (
          <div className="dashboard-section">
            <h2>Low Stock Alert</h2>
            <div className="alert-box">
              <p>{lowStock.length} product(s) below reorder level</p>
              <Link to="/products?lowStock=true" className="btn btn-primary">
                View Products
              </Link>
            </div>
            <div className="low-stock-list">
              {lowStock.slice(0, 5).map((p) => (
                <div key={p._id} className="low-stock-item">
                  <span>{p.name}</span>
                  <span>Qty: {p.quantity} / Reorder: {p.reorderLevel}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
