import { useState, useEffect, useRef } from "react";
import "./style.scss";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../utils/router";

// Set the app element for accessibility
Modal.setAppElement("#root");

const CartPage = ({ cart, setCart }) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscountPrice, setTotalDiscountPrice] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [orderSuccess, setOrderSuccess] = useState(null);
  const navigate = useNavigate();
  
  // Thêm ref để tracking request hiện tại
  const currentRequestRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastClickTimeRef = useRef(0);
  
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
  
  // Cleanup effect để hủy requests khi component unmount
  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
    };
  }, []);
  
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

  // Reset states về trạng thái ban đầu
  const resetCheckoutStates = () => {
    console.log("Reset checkout states");
    setIsLoading(false);
    isProcessingRef.current = false;
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
      currentRequestRef.current = null;
    }
  };

  const handleCheckout = async () => {
    // Kiểm tra click quá nhanh
    const now = Date.now();
    if (now - lastClickTimeRef.current < 500) {
        console.log("Click quá nhanh, bỏ qua");
        return;
    }
    lastClickTimeRef.current = now;
    
    // Kiểm tra đang xử lý
    if (isProcessingRef.current) {
        console.log("Request đang được xử lý, bỏ qua request mới");
        return;
    }

    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    // Đánh dấu đang xử lý
    isProcessingRef.current = true;
    setIsLoading(true);

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Bạn cần đăng nhập để mua hàng");
            resetCheckoutStates();
            return;
        }

        if (paymentMethod === "wallet") {
            // Kiểm tra số dư ví
            if (walletBalance < totalPrice) {
                alert("Số dư ví không đủ. Vui lòng nạp thêm tiền vào ví.");
                resetCheckoutStates();
                navigate('/topup'); // Chuyển đến trang nạp tiền
                return;
            }
            
            // Chuẩn bị dữ liệu thanh toán
            const orderData = {
                items: cart.map(item => ({
                    productId: item.id
                })),
                totalAmount: totalPrice
            };
            
            // Gọi API tạo đơn hàng với timeout 30s
            const response = await axios.post("/api/orders/create", orderData, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 30000
            });
            
            if (response.data.success) {
                console.log("Checkout thành công!");
                setOrderSuccess(response.data);
                setWalletBalance(prev => prev - totalPrice);
                setCart([]);
                localStorage.setItem("cart", JSON.stringify([]));
                resetCheckoutStates();
                
                navigate(ROUTES.USER.PAYMENT_SUCCESS, { 
                    state: { 
                        orderData: response.data,
                        purchasedItems: cart
                    }
                });
            }
        } else {
            resetCheckoutStates();
            alert("Phương thức thanh toán này chưa được hỗ trợ");
        }
    } catch (error) {
        console.error("Checkout error:", error);
        
        // Xử lý các loại lỗi
        if (error.response?.data?.message?.includes('số dư')) {
            alert("Số dư không đủ. Vui lòng nạp thêm tiền.");
            navigate('/topup');
        } else if (error.response?.data?.message?.includes('không còn khả dụng')) {
            alert("Sản phẩm không còn khả dụng. Vui lòng làm mới trang và thử lại.");
            window.location.reload();
        } else {
            alert(error.response?.data?.message || "Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại sau.");
        }
        
        resetCheckoutStates();
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
              <button 
                className={`checkout-btn col-sm-12 ${isLoading ? 'loading' : ''}`}
                onClick={() => handleCheckout()}
                disabled={isLoading || walletBalance < totalPrice}
                style={{
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? (
                  <span>
                    {" Đang xử lý..."}
                  </span>
                ) : walletBalance < totalPrice ? (
                  "Số dư không đủ"
                ) : (
                  "Mua Ngay"
                )}
              </button>
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
