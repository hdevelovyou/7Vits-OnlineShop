import { memo } from "react";
import "./style.scss";
import cr7 from '../../../assets/images/cr7.png';
import adobe from '../../../assets/images/adobe.png';
import logofc from '../../../assets/images/logofc.png';
import League_of_Legends_2019_vector from '../../../assets/images/League_of_Legends_2019_vector.png';
import steam_logo from '../../../assets/images/steam_logo.png';
import yt from '../../../assets/images/yt.png'
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link } from "react-router-dom";
import lolskin from '../../../assets/images/lolskin.jpg';
import adobepd from '../../../assets/images/adobe-pd.jpg';
import steamgc from '../../../assets/images/Steam-Gift-card.jpg';
import chatgpt from '../../../assets/images/chatgpt.png';
const products = [
    { id: 1, name: "Tài khoản ChatGPT Plus", desc: "Tài khoản ChatGPT Plus chính hãng, đầy đủ tính năng GPT-4.", priceOld: "499,000đ", priceNew: "399,000đ", image: chatgpt, rating: 5 },
    { id: 2, name: "Adobe License", desc: "Phần mềm bản quyền Adobe chính hãng.", priceOld: "1,299,000đ", priceNew: "800,000đ", image: adobepd, rating: 4 },
    { id: 3, name: "League of Legends Skin", desc: "Trang phục độc quyền trong game.", priceOld: "399,000đ", priceNew: "299,000đ", image: lolskin, rating: 5 },
    { id: 4, name: "Steam Gift Card", desc: "Thẻ nạp Steam dành cho game thủ.", priceOld: "1,000,000đ", priceNew: "800,000đ", image: steamgc, rating: 4 },
    { id: 5, name: "Youtube 12 tháng", desc: "Thẻ nạp Netflix dành cho game thủ.", priceOld: "1,000,000đ", priceNew: "800,000đ", image: yt, rating: 4 },
    { id: 6, name: "Steam Gift Card", desc: "Thẻ nạp Steam dành cho game thủ.", priceOld: "1,000,000đ", priceNew: "800,000đ", image: steamgc, rating: 4 }
];

// Danh sách các danh mục
const categories = ["New Arrivals", "Best Sellers", "Discounted Items"];

const Homepage = () => {
    return (
        <div id="content">
            {/* Banner Section */}
            <div className="banner">
                <div id="section-1">
                    <div className="introduce">
                        <h1 className="text-introduce">YOUR SATISFACTION OUR Priority</h1>
                        <p className="text-title">We are committed to delivering top quality</p>
                        <a href="#Linkpro" className="btn-shop">SHOP NOW</a>
                        <div className="quality">
                            <div className="quality-item"><h2 className="quality-count">200+</h2><p className="quality-text">International Brands</p></div>
                            <div className="quality-item"><h2 className="quality-count">2,000+</h2><p className="quality-text">High-Quality Products</p></div>
                            <div className="quality-item"><h2 className="quality-count">30,000+</h2><p className="quality-text">Happy Customers</p></div>
                        </div>
                    </div>
                    <img src={cr7} alt="" className="cr7" />
                </div>
            </div>

            {/* Logo Section */}
            <div className="section-logo">

                <div className="grid">
                    <div className="logo">

                        {[logofc, League_of_Legends_2019_vector, steam_logo, adobe].map((logo, index) => (
                            <img key={index} src={logo} alt="" className="section-logo" />
                        ))}
                    </div>
                </div>
            </div>


            {/* Products Section */}
            <div className="Products" id="Linkpro">
                <div className="grid">
                    {categories.map((category, index) => (
                        <div className="product-namename" key={index}>
                            <h3>{category}</h3>
                            <div className="grid__row">
                                <div className="grid__column-12">
                                    <div className="home-product">
                                        <div className="grid__row">
                                            {products.map((product) => (
                                                <div className="grid__column-3" key={product.id}>
                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        className="home-product-item"
                                                        style={{ display: "block", textDecoration: "none" }}
                                                    >
                                                        <div
                                                            className="home-product-item_img"
                                                            style={{ backgroundImage: `url(${product.image})` }}
                                                        ></div>
                                                        <div className="mota">
                                                            <p className="mota-name home-product-item_name">{product.name}</p>
                                                            <p className="mota-name home-product-item_desc">{product.desc}</p>
                                                            <p className="mota-name home-product-item_rating">
                                                                {[...Array(5)].map((_, idx) => (
                                                                    <i key={idx} className={`fa-solid fa-star ${idx < product.rating ? 'active' : ''}`}></i>
                                                                ))}
                                                                <span className="rating-number">({product.rating})</span>
                                                            </p>
                                                            <div className="home-product-item_price">
                                                                <span className="mota-name home-product-item_price-old">
                                                                    <s>{product.priceOld}</s>
                                                                </span>
                                                                <span className="mota-name home-product-item_price-new">
                                                                    {product.priceNew}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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