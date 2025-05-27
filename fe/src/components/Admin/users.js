import { memo, useState, useEffect} from "react";
import "./users.scss";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../utils/router.js";
import axios from "axios";

const Users = () => {
  return (
    <div className="users-page">
      <h2>Users Overview</h2>
      <p>This is your users information.</p>
    </div>
  );
};

export default Users;

