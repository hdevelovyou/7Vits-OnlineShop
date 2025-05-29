import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderItemCard.scss';
import Rating from '../../components/rating/rating'
import placeholderImg from '../../assets/images/placeholder.png';

const OrderItemCard = ({ item, orderStatus }) => {
  const [userRating, setUserRating] = useState(0);
  const [ratingSent, setRatingSent] = useState(false);

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleVoteProduct = async (sellerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/sellers/${sellerId}/rating`,
        { rating: userRating },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert('Cảm ơn bạn đã đánh giá!');
      setRatingSent(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi gửi đánh giá');
    }
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

  const showActionButtons = (status) => {
    return status === 'pending' || status === 'processing';
  };

  if (!item || !item.order_items || item.order_items.length === 0) {
    return null;
  }

  const totalAmount = item.order_items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  return (
    <div className="order-item-card">
      <div className="order-header">
        <div className="order-info">
          <span className="order-id">Đơn hàng #{item.order_id}</span>
          <span className="order-date">{new Date(item.order_date).toLocaleDateString('vi-VN')}</span>
        </div>
        <div className="order-status">
          <span className={`status-badge ${item.order_status}`}>
            {item.order_status === 'pending' ? 'Chờ xác nhận' :
             item.order_status === 'completed' ? 'Đã hoàn thành' :
             item.order_status === 'cancelled' ? 'Đã hủy' : item.order_status}
          </span>
        </div>
      </div>

      <div className="items-list">
        {item.order_items.map((orderItem, index) => (
          <div key={index} className="item-row">
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
          </div>
        ))}
      </div>

      <div className="order-footer">
        <div className="total-amount">
          <span className="label">Tổng tiền:</span>
          <span className="amount">{formatCurrency(totalAmount)}</span>
        </div>

        {!ratingSent && item.order_status === 'completed' && (
          <div className="rating-product">
            <p>Đánh giá người bán:</p>
            {Array.from({ length: 5 }).map((_, index) => (
              <i
                key={index}
                className={index < userRating ? 'fa-solid fa-star active' : 'fa-regular fa-star'}
                style={{ cursor: 'pointer', color: '#fbc02d', fontSize: '18px', marginRight: 4 }}
                onClick={() => setUserRating(index + 1)}
              />
            ))}
            <button
              onClick={() => handleVoteProduct(item.order_items[0].seller_id)}
              disabled={userRating === 0}
              style={{ marginLeft: 8, padding: '4px 10px' }}
            >
              Gửi
            </button>
          </div>
        )}

        {showActionButtons(item.order_status) && (
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
    </div>
  );
};

export default OrderItemCard; 