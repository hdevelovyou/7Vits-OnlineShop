import React from 'react';
import axios from 'axios';
import './OrderItemCard.scss';
import placeholderImg from '../../assets/images/placeholder.png';

const OrderItemCard = ({ item, orderStatus }) => {
  // Lấy thông tin sản phẩm từ order_items array
  const orderItem = item.order_items && item.order_items[0];

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders/reject/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        alert('Đã từ chối đơn hàng thành công');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối đơn hàng');
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders/confirm/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        alert('Đã xác nhận đơn hàng thành công');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận đơn hàng');
    }
  };

  if (!item || !orderItem) {
    return null;
  }

  return (
    <div className="order-item-card">
      <div className="item-image">
        <img 
          src={orderItem.image_url || placeholderImg} 
          alt={orderItem.product_name || 'Sản phẩm'} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholderImg;
          }}
        />
      </div>
      
      <div className="item-details">
        <h3 className="item-name">{orderItem.product_name}</h3>
        <div className="item-info">
          <div className="price-info">
            <div className="item-price">
              <span className="label">Đơn giá:</span>
              <span className="price">{formatCurrency(orderItem.price)}</span>
            </div>
            <div className="item-quantity">
              <span className="label">Số lượng:</span>
              <span className="quantity">{orderItem.quantity || 1}</span>
            </div>
          </div>
          <div className="item-total">
            <span className="label">Thành tiền:</span>
            <span className="total">
              {formatCurrency(orderItem.price * (orderItem.quantity || 1))}
            </span>
          </div>
        </div>
      </div>

      {orderStatus === 'pending' && (
        <div className="item-actions">
          <button 
            className="reject-btn"
            onClick={() => handleRejectOrder(item.order_id)}
          >
            Từ chối
          </button>
          <button 
            className="confirm-btn"
            onClick={() => handleConfirmOrder(item.order_id)}
          >
            Xác nhận
          </button> 
        </div>
      )}
    </div>
  );
};

export default OrderItemCard; 