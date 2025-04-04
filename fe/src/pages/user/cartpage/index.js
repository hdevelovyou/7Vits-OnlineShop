import { useState, useEffect } from "react";
import "./style.scss";

const CartPage = ({cart,setCart}) => {
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    calculateTotalPrice();
  }, [cart]);

  const calculateTotalPrice = () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.amount, 0);
    setTotalPrice(total);
  };

  const handleUpdateAmount = (id, newAmount) => {
    if (newAmount < 1) return; // Không cho phép số lượng < 1

    const updatedCart = cart.map(item =>
      item.id === id ? { ...item, amount: newAmount } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  return (
    <div className="cart-page container">
      <h1 className="cart-title">Giỏ Hàng</h1>
      {cart.length === 0 ? (
        <p className="empty-cart">Giỏ hàng trống</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Sản Phẩm</th>
                <th>Đơn Giá</th>
                <th>Số Lượng</th>
                <th>Số Tiền</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  {/* Cột: Sản Phẩm */}
                  <td className="product-info">
                    <img
                      src={`https://www.divineshop.vn${item.image}`}
                      alt={item.name}
                      className="product-img"
                    />
                    <span className="product-name">{item.name}</span>
                  </td>

                  {/* Cột: Đơn Giá */}
                  <td className="price">{formatPrice(item.price)}</td>

                  {/* Cột: Số Lượng */}
                  <td className="quantity-control">
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
                  </td>

                  {/* Cột: Số Tiền */}
                  <td className="price">{formatPrice(item.price * item.amount)}</td>

                  {/* Cột: Thao Tác */}
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Khu vực tính tiền */}
          <div className="cart-summary">
            <div className="summary-info">
              <span className="summary-title">
                Tổng Thanh Toán ({cart.length} Sản Phẩm):
              </span>
              <span className="summary-total">{formatPrice(totalPrice)}</span>
              {/* Ví dụ tạm: Tiết kiệm 375.000đ, bạn có thể tính toán tuỳ ý */}
              <p className="saving">Tiết Kiệm: 375.000 đ</p>
            </div>
            <button className="checkout-btn">Mua Ngay</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
