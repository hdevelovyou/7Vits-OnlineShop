import { memo, useEffect, useState } from "react";
import axios from "axios";
import "./style.scss";
import adobe from '../../../assets/images/adobe.png';
import logofc from '../../../assets/images/logofc.png';
import League_of_Legends_2019_vector from '../../../assets/images/League_of_Legends_2019_vector.png';
import steam_logo from '../../../assets/images/steam_logo.png';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link } from "react-router-dom";

// Danh sách các danh mục
const categories = ["New Arrivals", "Best Sellers", "Discounted Items"];

const Homepage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get("/api/products");
                console.log("Dữ liệu API:", response.data); // Kiểm tra dữ liệu trả về từ API

                // Lấy dữ liệu từ API
                if (Array.isArray(response.data)) {
                    setProducts(response.data);
                    console.log("Đã lấy được", response.data.length, "sản phẩm");
                } else {
                    console.error("Dữ liệu không đúng định dạng:", response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Xử lý đường dẫn hình ảnh
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return "https://via.placeholder.com/300x300?text=No+Image";
        
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        return `http://localhost:5000${imageUrl}`;
    };

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
                        
                    </div>
                </div>
            </div>

            {/* Logo Section */}
            <div className="section-logo">
                <div className="container">
                    <div className="logo">
                        {[logofc, League_of_Legends_2019_vector, steam_logo, adobe].map((logo, index) => (
                            <img key={index} src={logo} alt="" className="section-logo col-sm-3" />
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
                                    {loading ? (
                                        <div className="loading-container">
                                            <p>Đang tải sản phẩm...</p>
                                        </div>
                                    ) : products.length === 0 ? (
                                        <div className="no-products">
                                            <p>Chưa có sản phẩm</p>
                                        </div>
                                    ) : (
                                        products.map((product) => (
                                            <div className="grid__column-3" key={product.id}>
                                                <Link
                                                    to={`/product/${product.id}`}
                                                    className="home-product-item"
                                                    style={{ display: "block", textDecoration: "none" }}
                                                >
                                                    <img 
                                                        src={getImageUrl(product.image_url)} 
                                                        alt={product.name} 
                                                        className="home-product-item_img" 
                                                        onError={(e) => {
                                                            console.log("Lỗi hình ảnh:", product.image_url);
                                                            e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                                                        }}
                                                    />
                                                    <div className="mota">
                                                        <p className="mota-name home-product-item_name">{product.name}</p>
                                                        <p className="mota-name home-product-item_desc">{product.description ? product.description.substring(0, 50) + "..." : ""}</p>
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
                                                                <s>{(product.price * 1.2).toLocaleString()}đ</s>
                                                            </span>
                                                            <span className="mota-name home-product-item_price-new">
                                                                {product.price.toLocaleString()}đ
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        ))
                                    )}
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