import { useState, useEffect } from "react";
import "./style.scss"

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        calculateTotalPrice(); // Cập nhật tổng tiền khi cart thay đổi
    }, [cart]);

    const calculateTotalPrice = () => {
        const total = cart.reduce((sum, item) => sum + item.price * item.amount, 0);
        setTotalPrice(total);
    };

    const handleUpdateAmount = (id, newAmount) => {
        if (newAmount < 1) return; // Không cho phép số lượng nhỏ hơn 1

        const updatedCart = cart.map(item =>
            item.id === id ? { ...item, amount: newAmount } : item
        );

        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        calculateTotalPrice();
    };

    const handleRemoveItem = (id) => {
        const updatedCart = cart.filter(item => item.id !== id);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        calculateTotalPrice();
    };

    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    return (
        <div className="cart-page container">
            <h1 className="cart-title">Giỏ hàng của bạn</h1>
            {cart.length === 0 ? (
                <p className="empty-cart">Giỏ hàng trống</p>
            ) : (
                <div className="cart-items">
                    {cart.map((item) => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-item-info">
                                <div className="product-image-container">
                                    <img src={`https://www.divineshop.vn${item.image}`} alt={item.imgae} className="product-img" />
                                    <h2 className="product-name">{item.name}</h2>
                                </div>
                                <p className="product-price">Giá mỗi sản phẩm: {formatPrice(item.price)}</p>

                                <div className="quantity-control">
                                    <button
                                        className="quantity-btn"
                                        onClick={() => handleUpdateAmount(item.id, item.amount - 1)}
                                    >
                                        -
                                    </button>
                                    <span className="quantity">{item.amount}</span>
                                    <button
                                        className="quantity-btn"
                                        onClick={() => handleUpdateAmount(item.id, item.amount + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="total-item-price">Tổng tiền sản phẩm: {formatPrice(item.price * item.amount)}</p>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveItem(item.id)}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                    <hr className="divider" />

                    <div className="payment-section">
                        <h2 className="total-payment">Tổng tiền cần thanh toán: {formatPrice(totalPrice)}</h2>
                        <button className="checkout-btn">Thanh Toán Ngay</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
