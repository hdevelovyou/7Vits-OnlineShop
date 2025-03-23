import { memo } from "react";

const Homepage = () => {
    return (
        <div id="content">
            <div className="content-section">
                <div id="banner">
                    <div id="section-1">
                        <div className="introduce">
                            <h1 className="text-introduce">
                                YOUR SATISFACTION OUR Priority
                            </h1>
                            <p className="text-title">We are committed to delivering top</p>
                            <a href="#" className="btn-shop">SHOP NOW</a>
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
                        <img
                            src="/nhan/Muadidoichi/asset/img/cr7.png"
                            alt="Cristiano Ronaldo"
                            className="cr7"
                        />
                    </div>
                </div>

                <div className="grid">
                    <div className="logo">
                        <img src="/nhan/Muadidoichi/asset/img/Adobe-logo.png" alt="Adobe Logo" className="section-logo" />
                        <img src="/nhan/Muadidoichi/asset/img/League_of_Legends_2019_vector.svg.png" alt="League of Legends" className="section-logo" />
                        <img src="/nhan/Muadidoichi/asset/img/logofc.png" alt="Football Club Logo" className="section-logo" />
                        <img src="/nhan/Muadidoichi/asset/img/steam_logo.png" alt="Steam Logo" className="section-logo" />
                    </div>
                </div>
            </div>

            <div className="content_product">
                <div className="grid">
                    <div className="grid_row">
                        <div className="grid_row-12">
                            <div className="product">
                                {/* Thêm sản phẩm tại đây */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(Homepage);
