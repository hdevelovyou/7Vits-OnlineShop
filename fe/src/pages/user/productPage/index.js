import { useState, memo } from "react";
import "./style.scss";
import cr7 from "../../../assets/images/cr7.png"

    const ProductPage = () => {
    const [quantity, setQuantity] = useState(1);
    const priceOld = 120000;
    const priceNew = 100000;
    const discount = Math.round(((priceOld - priceNew) / priceOld) * 100);

    return (
        <div className="product-page">
            <div className="grid">
                <div className="product-container">
                    <img src={cr7} alt="Chat GPT Plus" className="product-image" />
                    <div className="product-info">
                        <h1 className="product-title">Tài Khoản Chat GPT 4 Plus (1 Tháng)</h1>
                        <div className="product-rating">
                            <span>⭐ 4.9</span>
                            <span className="sold">2410 Đã Bán</span>
                        </div>
                        <div className="product-price">
                            <span className="old-price">{priceOld.toLocaleString()} đ</span>
                            <span className="new-price">{priceNew.toLocaleString()} đ</span>
                            <span className="discount">{discount}% GIẢM</span>
                        </div>
                        <p className="product-description">
                            - áo cr7 đỉnh cao bán chạy nhất thị trường 
                        </p>
                        <div className="quantity-container">
                            <div className="soluong">
                                <p>số lượng </p>
                            </div>
                            <div className="quantity-container-input">
                                <button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                        </div>
                        <div className="button-group">
                            <button className="add-to-cart">🛒 Thêm Vào Giỏ Hàng</button>
                            <button className="buy-now">Mua Ngay</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(ProductPage);
