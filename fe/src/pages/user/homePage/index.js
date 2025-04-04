import { memo, useEffect, useState } from "react";
import axios from "axios";
import "./style.scss";
import adobe from '../../../assets/images/adobe.png';
import logofc from '../../../assets/images/logofc.png';
import League_of_Legends_2019_vector from '../../../assets/images/League_of_Legends_2019_vector.png';
import steam_logo from '../../../assets/images/steam_logo.png';
import yt from '../../../assets/images/yt.png';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link } from "react-router-dom";

// Danh sách các danh mục
const categories = ["New Arrivals", "Best Sellers", "Discounted Items"];

const Homepage = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/products");
                console.log(response.data); // Kiểm tra dữ liệu trả về từ API

                // Lấy dữ liệu từ API - phải truy cập `list` thay vì `products`
                if (Array.isArray(response.data.list)) {
                    setProducts(response.data.list);
                } else {
                    console.error("Dữ liệu không đúng định dạng.");
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div id="content">
            {/* Banner Section */}
            <div className="banner">
                <div id="section-1">
                    <div className="introduce grid">
                        <div className="grid__column-6">
                            <h1 className="text-introduce">YOUR SATISFACTION OUR Priority</h1>
                            <p className="text-title">We are committed to delivering top quality</p>
                            <a href="#Linkpro" className="btn-shop">SHOP NOW</a>
                        </div>
                        <div className="quality">
                            <div className="quality-item"><h2 className="quality-count">200+</h2><p className="quality-text">International Brands</p></div>
                            <div className="quality-item"><h2 className="quality-count">2,000+</h2><p className="quality-text">High-Quality Products</p></div>
                            <div className="quality-item"><h2 className="quality-count">30,000+</h2><p className="quality-text">Happy Customers</p></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logo Section */}
            <div className="section-logo">
                <div className="container">
                    <div className="logo">
                        {[logofc, League_of_Legends_2019_vector, steam_logo, adobe].map((logo, index) => (
                            <img key={index} src={logo} alt="" className="section-logo" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="Products" id="Linkpro">
                <div className="container">
                    {categories.map((category, index) => (
                        <div className="product-namename" key={index}>
                            <h3>{category}</h3>
                                    <div className="home-product">
                                        <div className="grid__row">
                                            {products.map((product) => (
                                                <div className="grid__column-3" key={product.id}>
                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        className="home-product-item"
                                                        style={{ display: "block", textDecoration: "none" }}
                                                    >
                                                        <img src={`https://www.divineshop.vn${product.image}`} alt="" className="home-product-item_img" />
                                                        <div className="mota">
                                                            <p className="mota-name home-product-item_name">{product.name}</p>
                                                            <p className="mota-name home-product-item_desc">{product.slug}</p>
                                                            <p className="mota-name home-product-item_rating">
                                                                <i className="fa-solid fa-star active"></i>
                                                                <i className="fa-solid fa-star active"></i>
                                                                <i className="fa-solid fa-star active"></i>
                                                                <i className="fa-solid fa-star active"></i>
                                                                <i className="fa-solid fa-star"></i>
                                                                <span className="rating-number">(4)</span>
                                                            </p>
                                                            <div className="home-product-item_price">
                                                                <span className="mota-name home-product-item_price-old">
                                                                    <s>{product.originalPrice.toLocaleString()}đ</s>
                                                                </span>
                                                                <span className="mota-name home-product-item_price-new">
                                                                    {product.price.toLocaleString()}đ
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default memo(Homepage);
