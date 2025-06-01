import { memo, useEffect, useState } from "react";
import axios from "axios";
import "./style.scss";
import adobe from '../../../assets/images/adobe.png';
import SellerRatingDisplay from '../../../components/rating/rating';
import logofc from '../../../assets/images/logofc.png';
import League_of_Legends_2019_vector from '../../../assets/images/League_of_Legends_2019_vector.png';
import steam_logo from '../../../assets/images/steam_logo.png';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link } from "react-router-dom";
import { formatVND } from "../../../utils/formatprice";

const categories = ["Game Key", "App Key", "Tài khoản game"];

const Homepage = ({ user }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sellerRatings, setSellerRatings] = useState({});
    const [visibleCount, setVisibleCount] = useState(8); // hiển thị ban đầu 8 sản phẩm

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const res = await axios.get("/api/products");
                if (Array.isArray(res.data)) {
                    setProducts(res.data);
                    const sellerIds = [...new Set(res.data.map(p => p.seller_id))];
                    if (sellerIds.length > 0) {
                        const ratingRes = await axios.get(
                            `/api/sellers/ratings?ids=${sellerIds.join(',')}`
                        );
                        setSellerRatings(ratingRes.data);
                    }
                } else {
                    console.error("Dữ liệu không đúng định dạng:", res.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu sản phẩm hoặc đánh giá:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return "https://via.placeholder.com/300x300?text=No+Image";
        if (imageUrl.startsWith('data:image')) return imageUrl;
        if (/^https?:\/\//.test(imageUrl)) return imageUrl;
        return `${process.env.REACT_APP_API_URL}${imageUrl}`;
    };

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 8);
    };

    // Hàm để lọc sản phẩm theo category
    const getProductsByCategory = (category) => {
        return products.filter(product => product.category === category);
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
                        {[logofc, League_of_Legends_2019_vector, steam_logo, adobe].map((logo, idx) => (
                            <img key={idx} src={logo} alt="" className="section-logo col-sm-3" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="Products" id="Linkpro">
                <div className="container">
                    {categories.map((category, index) => {
                        const categoryProducts = getProductsByCategory(category);
                        return (
                            <div className="product-namename" key={index}>
                                <h3>{category}</h3>
                                <div className="home-product">
                                    <div className="grid__row">
                                        {loading ? (
                                            <div className="loading-container">
                                                <p>Đang tải sản phẩm...</p>
                                            </div>
                                        ) : categoryProducts.length === 0 ? (
                                            <div className="no-products">
                                                <p>Chưa có sản phẩm trong danh mục này</p>
                                            </div>
                                        ) : (
                                            categoryProducts.slice(0, visibleCount).map(product => (
                                                <div className="grid__column-3" key={product.id}>
                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        onClick={() => window.scrollTo(0, 0)}
                                                        className="home-product-item"
                                                        style={{ display: "block", textDecoration: "none" }}
                                                    >
                                                        <img
                                                            src={getImageUrl(product.image_url)}
                                                            alt={product.name}
                                                            className="home-product-item_img"
                                                            onError={e => { e.target.src = "https://via.placeholder.com/300x300?text=No+Image"; }}
                                                        />
                                                        <div className="mota">
                                                            <p className="mota-name home-product-item_name">{product.name}</p>
                                                            <p className="mota-name home-product-item_desc">
                                                                {product.description ? product.description.substring(0, 50) + "..." : ""}
                                                            </p>
                                                            <p className="mota-name home-product-item_seller">
                                                                <i className="fa-solid fa-store"></i> {product.seller_name || "Unknown Seller"}
                                                            </p>
                                                            <p className="mota-name home-product-item_rating">
                                                                <div className="seller-stars">
                                                                    {Array.from({ length: 5 }).map((_, idx) => {
                                                                        const avg = sellerRatings[product.seller_id]?.average || 0;
                                                                        const value = idx + 1;
                                                                        let className = "star empty";
                                                                        if (avg >= value) className = "star full";
                                                                        else if (avg >= value - 0.5) className = "star half";
                                                                        return <span key={idx} className={className}>★</span>;
                                                                    })}
                                                                    <p className="rating-number">({sellerRatings[product.seller_id]?.count || 0} reviews)</p>
                                                                </div>
                                                                <div className="home-product-item_price">
                                                                    <span className="mota-name home-product-item_price-new">
                                                                        {formatVND(product.price)}
                                                                    </span>
                                                                </div>
                                                            </p>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {/* Nút Hiển thị thêm cho từng category */}
                                    {!loading && visibleCount < categoryProducts.length && (
                                        <div className="show-more-container">
                                            <button className="btn-show-more" onClick={handleShowMore} >
                                                Hiển thị thêm {category}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default memo(Homepage);
