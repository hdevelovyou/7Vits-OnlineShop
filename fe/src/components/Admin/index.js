import { memo, useState, useEffect} from "react";
import "./style.scss";
import { Link, useNavigate, Outlet } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../utils/router.js";
import axios from "axios";

const AdminPage = () => {
    const [isAdmin, setIsAdmin] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/admin`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            // Chỉ cần tới được đây là đã là admin do middleware đã kiểm tra
            setIsAdmin(true);
        })
        .catch(error => {
            setIsAdmin(false);
        });
    }, [navigate]);

    useEffect(() => {
        if (isAdmin === false) {
            navigate('/');
        }
    }, [isAdmin, navigate]);
    
    const [showDropdown, setShowDropdown] = useState(false);
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    }

    const handleSwitchRole = () => {
        window.location.replace("/");
    }

    const handleLogOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    }

    if (isAdmin === null)
        return <div>Đang kiểm tra quyền truy cập...</div>;
    if (isAdmin === false)
        return null;

    return (
        <div className="admin-layout">
            <div className="header-main">
                      <div className="container">
                        <div className="row">
                          <div className="col-lg-3 col-sm-6">
                            <div className="header-logo">
                              <Link to="/admin" onClick={() => window.scrollTo(0, 0)} style={{
                                  textDecoration: "none" ,
                                  display: "flex",
                                  alignItems: "center",
                              }}>
                                <img src={logo} alt="7vits-logo" />
                               <h1>7VITS</h1>
                              </Link>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        <div className="admin-body">
            <aside className="sidebar">
            <ul>
                <li><Link to="/admin/dashboard">Dashboard</Link></li>
                <li><Link to="/admin/users">Users</Link></li>
                <li><Link to="/admin/products">Products</Link></li>
                <li><Link to="/admin/orders">Orders</Link></li>
                <li><Link to="/admin/transactions">Transactions</Link></li>
                <li><Link to="/admin/events">Events</Link></li>
                <li className="dropdown" onClick={toggleDropdown}>
                    <label className="dropdown">Settings</label>
            {showDropdown && (
              <ul className="dropdown-menu">
                <li onClick={handleSwitchRole}><label>Switch Role</label></li>
                <li onClick={handleLogOut}><label>Log out</label></li>
              </ul>
            )}
          </li>
            </ul>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    </div>

    );
};

export default AdminPage;
