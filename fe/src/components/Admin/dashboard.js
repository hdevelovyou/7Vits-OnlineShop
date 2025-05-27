import { memo, useState, useEffect, use} from "react";
import "./dashboard.scss";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../utils/router.js";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [userData, setUserData] = useState([]);
  const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
  ];
  const maxValue = Math.max(...revenueData.map(d => d.revenue));
  const step = Math.ceil(maxValue / 5 / 1000000) * 1000000; 
  const ticks = Array.from({ length: 6 }, (_, i) => i * step);


  useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (error) {
                console.error("Lỗi khi tải dashboard:", error);
            }
        };

        fetchStats();
    }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/revenue-monthly`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const data = res.data.map(item => ({
        month: monthNames[item.month - 1],
        revenue: Number(item.revenue)
      }));
      setRevenueData(data);
    });

    axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/users-monthly`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const data = res.data.map(item => ({
        month: monthNames[item.month - 1],
        users: Number(item.users)
      }));
      setUserData(data);
    });
  }, []);

  if (!stats) {
    return <div className="loading">Stats loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <h2>System Statistics</h2>
      <div className="cards">
        <div className="card"><h3>Users</h3><p>{stats.totalUsers}</p></div>
        <div className="card"><h3>Products</h3><p>{stats.totalProducts}</p></div>
        <div className="card"><h3>Orders</h3><p>{stats.totalOrders}</p></div>
        <div className="card"><h3>Pending</h3><p>{stats.pendingOrders}</p></div>
        <div className="card"><h3>Revenue</h3><p>{stats.totalRevenue.toLocaleString()} vnđ</p></div>
      </div>
      <div className="charts">
        <div className="chart-box">
          <h2>Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: "#fff", fontSize: 14, fontFamily: "Audiowide" }}/>
              <YAxis tick={{ fill: "#fff", fontSize: 14, fontFamily: "Audiowide" }}
                      domain={[0, 'dataMax']}
                      allowDecimals={false} 
                      ticks={ticks}/>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontFamily: "Audiowide", fontSize: 14}} />
              <Bar dataKey="revenue" fill="#00d4ff" isAnimationActive={false} activeShape={null} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-box">
          <h2>Monthly Registration User</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: "#fff", fontSize: 14, fontFamily: "Audiowide" }}/>
              <YAxis tick={{ fill: "#fff", fontSize: 14, fontFamily: "Audiowide" }}/>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontFamily: "Audiowide", fontSize: 14}} />
              <Line type="monotone" dataKey="users" stroke="#00d4ff" isAnimationActive={false} activeDot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
    </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: "#111",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ff0000",
        color: "#00d4ff",
        fontFamily: "Audiowide",
        fontSize: 14
      }}>
        <p style={{ margin: 0 }}>{label}</p>
        <p style={{ margin: 0 }}>
          {payload[0].name}: {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};


export default Dashboard;

