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
                        - Đây là gói 1 thiết bị. Tài khoản share ổn định và riêng tư, vui lòng chỉ dùng trên một thiết bị duy nhất.
                    </p>
                    <div className="quantity-container">
                        <button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>-</button>
                        <span>{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)}>+</button>
                    </div>
                    <div className="button-group">
                        <button className="add-to-cart">🛒 Thêm Vào Giỏ Hàng</button>
                        <button className="buy-now">Mua Ngay</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(ProductPage);
