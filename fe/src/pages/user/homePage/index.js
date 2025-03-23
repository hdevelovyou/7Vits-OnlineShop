import { memo } from "react";
import "./style.scss";
import cr7 from '../../../assets/images/cr7.png';
import adobe from '../../../assets/images/adobe.png';
import logofc from '../../../assets/images/logofc.png';
import League_of_Legends_2019_vector from '../../../assets/images/League_of_Legends_2019_vector.png';
import steam_logo from '../../../assets/images/steam_logo.png';

const products = [
    {
        id: 1,
        name: "Áo CR7",
        desc: "Áo đấu chính thức của Ronaldo.",
        price: "499,000 VND",
        image: cr7,
        rating: 5,
    },
    {
        id: 2,
        name: "Adobe License",
        desc: "Phần mềm bản quyền Adobe chính hãng.",
        price: "1,299,000 VND",
        image: adobe,
        rating: 4,
    },
    {
        id: 3,
        name: "League of Legends Skin",
        desc: "Trang phục độc quyền trong game.",
        price: "399,000 VND",
        image: League_of_Legends_2019_vector,
        rating: 5,
    },
    {
        id: 4,
        name: "Steam Gift Card",
        desc: "Thẻ nạp Steam dành cho game thủ.",
        price: "1,000,000 VND",
        image: steam_logo,
        rating: 4,
    },
];

const Homepage = () => {
    return (
        <div id="content">
            {/* Banner Section */}
            <div className="banner">
                <div id="section-1">
                    <div className="introduce">
                        <h1 className="text-introduce">YOUR SATISFACTION OUR Priority</h1>
                        <p className="text-title">We are committed to delivering top quality</p>
                        <a href="" className="btn-shop">SHOP NOW</a>
                        <div className="quality">
                            <div className="quality-item">
                                <h2 className="quality-count">200+</h2>
                                <p className="quality-text">International Brands</p>
                            </div>
                            <div className="quality-item">
                                <h2 className="quality-count">2,000+</h2>
                                <p className="quality-text">High-Quality Products</p>
                            </div>
                            <div className="quality-item">
                                <h2 className="quality-count">30,000+</h2>
                                <p className="quality-text">Happy Customers</p>
                            </div>
                        </div>
                    </div>
                    <img src={cr7} alt="" className="cr7" />
                </div>
            </div>

            {/* Logo Section */}
            <div className="logo">
                <img src={logofc} alt="" className="section-logo" />
                <img src={League_of_Legends_2019_vector} alt="" className="section-logo" />
                <img src={steam_logo} alt="" className="section-logo" />
                <img src={adobe} alt="" className="section-logo" />
            </div>

            {/* Products Section */}
            <div className="Products">
                <div className="grid">
                <div className="product-namename">
                        <h3>New Arrivals</h3>
                    <div className="grid__row">                 
                        <div className="grid__column-12">
                            <div className="home-product">
                                <div className="grid__row">
                                    {products.map((product) => (
                                        <div className="grid__column-3" key={product.id}>
                                            <div className="home-product-item">
                                                <div 
                                                    className="home-product-item_img" 
                                                    style={{ backgroundImage: `url(${product.image})` }}
                                                ></div>
                                                <div className="mota">
                                                <p className="mota-name home-product-item_name">{product.name}</p>
                                                <p className="mota-name home-product-item_desc">{product.desc}</p>
                                                <p className="mota-name home-product-item_price">{product.price}</p>
                                                <p className="mota-name home-product-item_rating">Rating: {product.rating}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>

                    <div className="product-namename">
                        <h3>New Arrivals</h3>
                    <div className="grid__row">                 
                        <div className="grid__column-12">
                            <div className="home-product">
                                <div className="grid__row">
                                    {products.map((product) => (
                                        <div className="grid__column-3" key={product.id}>
                                            <div className="home-product-item">
                                                <div 
                                                    className="home-product-item_img" 
                                                    style={{ backgroundImage: `url(${product.image})` }}
                                                ></div>
                                                <p className="home-product-item_name">{product.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                    <div className="product-namename">
                        <h3>New Arrivals</h3>
                    <div className="grid__row">                 
                        <div className="grid__column-12">
                            <div className="home-product">
                                <div className="grid__row">
                                    {products.map((product) => (
                                        <div className="grid__column-3" key={product.id}>
                                            <div className="home-product-item">
                                                <div 
                                                    className="home-product-item_img" 
                                                    style={{ backgroundImage: `url(${product.image})` }}
                                                ></div>
                                                <p className="home-product-item_name">{product.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Homepage);
