import { memo, useState, useEffect} from "react";
import "./events.scss";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../utils/router.js";
import axios from "axios";

const Events = () => {
  return (
    <div className="events-page">
      <h2>Events Overview</h2>
      <p>This is your events information.</p>
    </div>
  );
};

export default Events;

