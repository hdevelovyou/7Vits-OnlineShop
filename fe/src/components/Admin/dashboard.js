import { memo, useState, useEffect} from "react";
import "./dashboard.scss";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../utils/router.js";
import axios from "axios";

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h2>Dashboard Overview</h2>
      <p>This is your dashboard stats and charts.</p>
    </div>
  );
};

export default Dashboard;

