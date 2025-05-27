import { memo, useState, useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../utils/router.js";
import axios from "axios";;

const HomeAdminPage = () => {
    const [userName, setUserName] = useState("Admin");
    useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser?.userName) {
        setUserName(parsedUser.userName);
      }
    }
  }, [])
  return (
    <div className="HomeAdmin-page">
        <h1>Welcome, {userName}! You're on 7VITS as administrator!!</h1>
        <p>Stats, charts, and controls go here...</p>
    </div>
  );
};

export default HomeAdminPage;

