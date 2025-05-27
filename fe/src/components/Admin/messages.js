import { memo, useState, useEffect} from "react";
import "./messages.scss";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../utils/router.js";
import axios from "axios";

const Messages = () => {
  return (
    <div className="messages-page">
      <h2>Messages Overview</h2>
      <p>This is your messages information.</p>
    </div>
  );
};

export default Messages;

