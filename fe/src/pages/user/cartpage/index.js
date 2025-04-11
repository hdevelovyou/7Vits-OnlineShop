import { useState, useEffect } from "react";
import "./style.scss";


const CartPage = ({ cart, setCart }) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscountPrice, setTotalDiscountPrice] = useState(0);
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
  useEffect(() => {
    calculateTotaldiscountPrice();
  }, [cart]);
  const calculateTotaldiscountPrice = () => {
    const total = cart.reduce((sum, item) => sum + ((item.originalPrice || item.price * 1.2) - item.price) * item.amount, 0);
    setTotalDiscountPrice(total);
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
    if (price === undefined || price === null) {
      return '0 ₫';
    }
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
                      src={item.image || 'https://via.placeholder.com/100x100?text=No+Image'}
                      alt={item.name}
                      className="product-img"
                    />
                    <span className="product-name">{item.name}</span>
                  </td>

                  {/* Cột: Đơn Giá */}
                  <td className="price">
                    {item.originalPrice && (
                      <span className="original-price">
                        <s>{formatPrice(item.originalPrice)}</s>
                      </span>
                    )}
                    {formatPrice(item.price)}
                  </td>

                  {/* Cột: Số Lượng */}
                  <td className="quantity-control">
                    <button
                      className="quantity-btn"
                      onClick={() => handleUpdateAmount(item.id, (item.amount || 1) - 1)}
                    >
                      -
                    </button>
                    <span className="quantity">{item.amount || 1}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleUpdateAmount(item.id, (item.amount || 1) + 1)}
                    >
                      +
                    </button>
                  </td>

                  {/* Cột: Số Tiền */}
                  <td className="price">{formatPrice(item.price * (item.amount || 1))}</td>

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

          <div className="cart-mobile">
            {cart.map((item) => (
              <div key={item.id} className="cart-item-mobile">
                <div className="cart-item-details">
                  <img 
                    src={item.image || 'https://via.placeholder.com/50x50?text=No+Image'} 
                    alt={item.name}
                    className="product-img-mobile" 
                  />
                  <div className="cart-item">
                    <h5>{item.name}</h5>
                    <p>{item.price ? item.price.toLocaleString() : '0'} đ</p>
                  </div>
                </div>
                <div className="cart-state">
                  <div className="cart-state-mobile">
                  <button
                      className="quantity-btn"
                      onClick={() => handleUpdateAmount(item.id, (item.amount || 1) - 1)}
                    >
                      -
                    </button>
                    <span className="quantity">{item.amount || 1}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleUpdateAmount(item.id, (item.amount || 1) + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button className="cart-remove" onClick={() => handleRemoveItem(item.id)}>Xóa</button>
                </div>
              </div>
            ))}
          </div>

          {/* Khu vực tính tiền */}
          <div className="cart-summary">
            <div className="summary-info col-sm-12">
              <span className="summary-title">
                Tổng Thanh Toán ({cart.length} Sản Phẩm):
                <span className="summary-total">{formatPrice(totalPrice)}</span>
              </span>
          
              <div className="saving">
                <span style={{ opacity: 0.5 }}>Tiết kiệm </span>
                <span className="summary-distotal">{formatPrice(totalDiscountPrice)}</span>
               
              </div>
              <button className="checkout-btn  col-sm-12 ">Mua Ngay</button>
            </div>
          
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
