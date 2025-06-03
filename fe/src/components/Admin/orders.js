import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import "./orders.scss";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../utils/router.js";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios
      .get("/api/admin/orders")
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div className="admin-orders">
      <h2>Orders list</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Buyer</th>
            <th>Seller</th>
            <th>Total amount</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => (
            <tr key={order.order_id}>
              <td>{idx + 1}</td>
              <td>{order.buyer_name}</td>
              <td>{order.seller_name}</td>
              <td>{Number(order.total_amount).toLocaleString()} </td>
              <td>{new Date(order.created_at).toLocaleString()}</td>
              <td>
                <button 
                  onClick={async e => {
                        e.stopPropagation();
                        if (window.confirm("Are you sure you want to delete this order?")) {
                          await axios.delete(`api/admin/orders/${order.order_id}`);
                          const res = await axios.get("/api/admin/orders");
                          setOrders(res.data); 
                        }
                      }}
                    >
                      Delete order
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default memo(Orders);

