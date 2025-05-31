import { useState, useEffect, useRef } from "react";
import "./style.scss";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../utils/router";
import CreateOrderButton from "../../../components/CreateOrder";

// Set the app element for accessibility
Modal.setAppElement("#root");

const CartPage = ({ cart, setCart }) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscountPrice, setTotalDiscountPrice] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const navigate = useNavigate();
  
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    // Lấy số dư ví khi trang được tải
    fetchWalletBalance();
  }, []);

  useEffect(() => {
    calculateTotalPrice();
  }, [cart]);

  const calculateTotalPrice = () => {
    const total = cart.reduce((sum, item) => {
      const itemPrice = Number(item.price) || 0;
      return sum + itemPrice;
    }, 0);
    setTotalPrice(total);
  };
  
  useEffect(() => {
    calculateTotaldiscountPrice();
  }, [cart]);
  
  const calculateTotaldiscountPrice = () => {
    const total = cart.reduce((sum, item) => {
      const itemPrice = Number(item.price) || 0;
      const originalPrice = Number(item.originalPrice) || itemPrice * 1.2;
      return sum + (originalPrice - itemPrice);
    }, 0);
    setTotalDiscountPrice(total);
  };

  // Lấy số dư ví người dùng
  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("/api/orders/wallet-balance", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setWalletBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const handleRemoveItem = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return '0';
    }
    return Number(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  // Xử lý khi đặt hàng thành công
  const handleOrderSuccess = (response) => {
    console.log("Đặt hàng thành công:", response);
    
    // Cập nhật số dư ví
    const numericTotalPrice = parseFloat(parseFloat(totalPrice).toFixed(2));
    setWalletBalance(prev => prev - numericTotalPrice);
    
    // Xóa giỏ hàng
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
    
    // Chuyển đến trang thành công
    navigate(ROUTES.USER.PAYMENT_SUCCESS, {
      state: {
        orderData: response,
        purchasedItems: cart
      }
    });
  };
  
  // Xử lý khi đặt hàng thất bại
  const handleOrderError = (error, message) => {
    console.error("Đặt hàng thất bại:", error);
    
    // Xử lý các trường hợp lỗi đặc biệt
    if (message.includes('số dư')) {
      alert(message);
      navigate('/topup');
    } else if (message.includes('không còn khả dụng')) {
      alert(message);
      window.location.reload();
    } else {
      alert(message);
    }
  };

  // Các hàm xử lý modal (giữ lại để tương thích nhưng không còn sử dụng)
  const closeModal = () => {
    setShowPurchaseModal(false);
    setPurchasedItems([]);
  };

  const handleNavigateToOrders = () => {
    closeModal();
    navigate("/user/orders");
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
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                    {formatPrice(item.price)}
                  </td>

                  {/* Cột: Số Lượng */}
                  <td className="quantity-control">
                    <span className="quantity">1</span>
                  </td>

                  {/* Cột: Số Tiền */}
                  <td className="price">{formatPrice(item.price)}</td>

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
                    <span className="quantity">1</span>
                  </div>
                  <button className="cart-remove" onClick={() => handleRemoveItem(item.id)}>Xóa</button>
                </div>
              </div>
            ))}
          </div>

          {/* Khu vực tính tiền */}
          <div className="cart-summary">
            <div className="summary-info col-sm-12">
              {/* Hiển thị số dư ví */}
              <div className="wallet-balance">
                <span className="balance-label">Số dư ví:</span>
                <span className="balance-amount">{formatPrice(walletBalance)}</span>
                {walletBalance < totalPrice && (
                  <button 
                    className="topup-btn"
                    onClick={() => navigate('/topup')}
                  >
                    Nạp thêm tiền
                  </button>
                )}
              </div>
              
              {/* Chọn phương thức thanh toán */}
              <div className="payment-methods">
                <div className="payment-method-option">
                  <input
                    type="radio"
                    id="wallet-payment"
                    name="payment-method"
                    checked={paymentMethod === "wallet"}
                    onChange={() => setPaymentMethod("wallet")}
                  />
                  <label htmlFor="wallet-payment">Thanh toán bằng ví</label>
                </div>
              </div>
              
              <span className="summary-title">
                Tổng Thanh Toán ({cart.length} Sản Phẩm):
                <span className="summary-total">{formatPrice(totalPrice)}</span>
              </span>
          
              <div className="saving">
                <span style={{ opacity: 0.5 }}>Tiết kiệm </span>
                <span className="summary-distotal">{formatPrice(totalDiscountPrice)}</span>
              </div>
              
              {/* Thay thế nút thanh toán cũ bằng component CreateOrderButton */}
              <div className="checkout-button-container">
                {walletBalance < totalPrice ? (
                  <button 
                    className="checkout-btn col-sm-12"
                    onClick={() => navigate('/topup')}
                    style={{ backgroundColor: '#cccccc', cursor: 'not-allowed' }}
                  >
                    Số dư không đủ
                  </button>
                ) : (
                  <CreateOrderButton
                    items={cart.map(item => ({ productId: parseInt(item.id, 10) }))}
                    totalAmount={parseFloat(parseFloat(totalPrice).toFixed(2))}
                    onSuccess={handleOrderSuccess}
                    onError={handleOrderError}
                    buttonText="Mua Ngay"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Giữ lại Modal nhưng không còn sử dụng (để khả năng tương thích) */}
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
                    <p className="purchase-info">Số lượng: 1</p>
                    <p className="purchase-info">Giá: {formatPrice(item.price)} / sản phẩm</p>
                    <p className="purchase-info">Tổng: {formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>
              
              <div className="payment-summary">
                <p className="wallet-transaction">
                  Đã thanh toán từ ví: {formatPrice(totalPrice)}
                </p>
                <p className="wallet-balance">
                  Số dư ví còn lại: {formatPrice(walletBalance)}
                </p>
              </div>
              
              <div className="modal-actions">
                <button onClick={handleNavigateToOrders} className="view-orders-btn">
                  Xem đơn hàng
                </button>
                <button onClick={closeModal} className="close-modal-btn">
                  Đóng
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default CartPage;
