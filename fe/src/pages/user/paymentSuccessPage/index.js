import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaBoxOpen, FaListAlt } from 'react-icons/fa';
import './style.scss';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderData, purchasedItems } = location.state || {};

  useEffect(() => {
    // Nếu không có dữ liệu đơn hàng, chuyển hướng người dùng về trang chủ
    if (!orderData && !purchasedItems) {
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [navigate, orderData, purchasedItems]);

  const handleViewOrders = () => {
    navigate('/user/orders');
  };

  const handleBackToShopping = () => {
    navigate('/');
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return '0';
    }
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  return (
    <div className="payment-success-page">
      <div className="success-container">
        <div className="success-header">
          <FaCheckCircle className="success-icon" />
          <h1>Thanh toán thành công!</h1>
          <p>Cảm ơn bạn đã mua hàng tại 7Vits Shop</p>
        </div>

        {(purchasedItems && purchasedItems.length > 0) ? (
          <div className="order-details">
            <h2><FaBoxOpen /> Chi tiết đơn hàng</h2>
            
            <div className="purchased-items">
              {purchasedItems.map(item => (
                <div key={item.id} className="purchased-item">
                  <div className="item-image">
                    <img 
                      src={item.image || 'https://via.placeholder.com/80x80?text=No+Image'} 
                      alt={item.name} 
                    />
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p>Số lượng: {item.amount || 1}</p>
                    <p>Đơn giá: {formatPrice(item.price)}</p>
                    <p className="item-total">Tổng: {formatPrice(item.price * (item.amount || 1))}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-summary">
              <p className="total-items">Tổng số sản phẩm: {purchasedItems.reduce((total, item) => total + (item.amount || 1), 0)}</p>
              <p className="total-amount">Tổng thanh toán: {formatPrice(purchasedItems.reduce((sum, item) => sum + item.price * (item.amount || 1), 0))}</p>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>Không có thông tin đơn hàng</p>
          </div>
        )}

        <div className="success-actions">
          <button className="view-orders-btn" onClick={handleViewOrders}>
            <FaListAlt /> Xem đơn hàng của tôi
          </button>
          <button className="back-shopping-btn" onClick={handleBackToShopping}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 