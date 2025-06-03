import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import "./transactions.scss";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../utils/router.js";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios
      .get("/api/admin/transactions")
      .then((res) => setTransactions(res.data))
      .catch(() => setTransactions([]));
  }, []);

  return (
    <div className="admin-transactions">
      <h2>Transactions list</h2>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>No</th>
            <th>User</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, idx) => (
            <tr key={transaction.transaction_id}>
              <td>{idx + 1}</td>
              <td>{transaction.user_name}</td>
              <td>{Number(transaction.amount).toLocaleString()}</td>
              <td>{transaction.transaction_type} </td>
              <td>{transaction.status}</td>
              <td>{new Date(transaction.created_at).toLocaleString()}</td>
              <td>
                <button 
                  onClick={async e => {
                        e.stopPropagation();
                        if (window.confirm("Are you sure you want to delete this transaction?")) {
                          await axios.delete(`api/admin/transactions/${transaction.transaction_id}`);
                          const res = await axios.get("/api/admin/transactions");
                          setTransactions(res.data); 
                        }
                      }}
                    >
                      Delete transaction
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default memo(Transactions);

