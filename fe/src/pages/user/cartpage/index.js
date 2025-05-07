import { useState, useEffect } from "react";
import "./style.scss";
import axios from "axios";
import Modal from "react-modal";

// Set the app element for accessibility
Modal.setAppElement("#root");

const CartPage = ({ cart, setCart }) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscountPrice, setTotalDiscountPrice] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch product details including notes for each item in the cart
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn cần đăng nhập để mua hàng");
        setIsLoading(false);
        return;
      }

      const productIds = cart.map(item => item.id);
      const productDetails = [];

      // Fetch detailed product information including notes
      for (const id of productIds) {
        try {
          const response = await axios.get(`/api/products/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          // Find the cart item to get the quantity
          const cartItem = cart.find(item => item.id === id);
          productDetails.push({
            ...response.data,
            purchasedQuantity: cartItem.amount
          });
        } catch (error) {
          console.error(`Error fetching product ${id}:`, error);
        }
      }

      setPurchasedItems(productDetails);
      setShowPurchaseModal(true);
      
      // Clear the cart after purchase
      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowPurchaseModal(false);
    setPurchasedItems([]);
  };

  const customModalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #444',
      padding: '20px',
      maxWidth: '800px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)'
    }
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
              <button 
                className="checkout-btn col-sm-12"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Mua Ngay"}
              </button>
            </div>
          
          </div>

          {/* Purchase Confirmation Modal */}
          <Modal
            isOpen={showPurchaseModal}
            onRequestClose={closeModal}
            style={customModalStyles}
            contentLabel="Purchase Confirmation"
          >
            <div className="purchase-modal">
              <h2>Mua hàng thành công!</h2>
              <p>Cảm ơn bạn đã mua sản phẩm. Dưới đây là thông tin chi tiết:</p>
              
              <div className="purchased-items">
                {purchasedItems.map(item => (
                  <div key={item.id} className="purchased-item">
                    <h3>{item.name}</h3>
                    <p className="purchase-info">Số lượng: {item.purchasedQuantity}</p>
                    <p className="purchase-info">Giá: {formatPrice(item.price)} / sản phẩm</p>
                    <p className="purchase-info">Tổng: {formatPrice(item.price * item.purchasedQuantity)}</p>
                    
                    {item.notes && (
                      <div className="product-notes">
                        <h4>Thông tin sản phẩm:</h4>
                        <pre>{item.notes}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <button onClick={closeModal} className="close-modal-btn">Đóng</button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default CartPage;
