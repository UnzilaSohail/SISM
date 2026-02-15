import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">SISMS</Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Dashboard</Link>
        <Link to="/products" className="nav-link">Products</Link>
        <Link to="/categories" className="nav-link">Categories</Link>
        <Link to="/customers" className="nav-link">Customers</Link>
        <Link to="/sales" className="nav-link">Sales</Link>
        <Link to="/stock" className="nav-link">Stock</Link>
        {isAdmin && (
          <Link to="/users" className="nav-link">Users</Link>
        )}
      </div>
      <button onClick={logout} className="btn btn-outline nav-logout">
        Logout
      </button>
    </nav>
  );
}
