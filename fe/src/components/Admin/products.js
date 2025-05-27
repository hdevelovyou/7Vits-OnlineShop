import { memo, useState, useEffect} from "react";
import "./products.scss";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../utils/router.js";
import axios from "axios";

const Products = () => {
  return (
    <div className="products-page">
      <h2>Products Overview</h2>
      <p>This is your products information.</p>
    </div>
  );
};

export default Products;

