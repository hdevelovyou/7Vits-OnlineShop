import { memo, useState, useEffect} from "react";
import "./orders.scss";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../utils/router.js";
import axios from "axios";

const Orders = () => {
  return (
    <div className="orders-page">
      <h2>Orders Overview</h2>
      <p>This is your orders information.</p>
    </div>
  );
};

export default Orders;

