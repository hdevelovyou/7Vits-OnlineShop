import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderItemCard.scss';
import Rating from '../../components/rating/rating'
import placeholderImg from '../../assets/images/placeholder.png';

const OrderItemCard = ({ item, orderStatus }) => {
  const [userRating, setUserRating] = useState(0);
  const [ratingSent, setRatingSent] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

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
  const handleVoteProduct = async () => {
    try {
      console.log('orderItem:', orderItem);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/sellers/${orderItem.seller_id}/rating`,
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
        {orderItem.notes && (
          <div className="item-notes">
            <span className="notes-label">Thông tin sản phẩm:</span>
           
            <button 
              className="view-details-btn"
              onClick={() => setShowNotesModal(true)}
            >
              Xem chi tiết
            </button>
          </div>
        )}
        <div className="item-info">
          <div className="item-total">
            <span className="label">Thành tiền:</span>
            <span className="total">
              {formatCurrency(orderItem.price * (orderItem.quantity || 1))}
            </span>
          </div>
        </div>
      </div>
      { !ratingSent && (
        <div className="rating-product">
          <p>Đánh giá sản phẩm:</p>
          {Array.from({ length: 5 }).map((_, index) => (
            <i
              key={index}
              className={index < userRating ? 'fa-solid fa-star active' : 'fa-regular fa-star'}
              style={{ cursor: 'pointer', color: '#fbc02d', fontSize: '18px', marginRight: 4 }}
              onClick={() => setUserRating(index + 1)}
            />
          ))}
          <button
            onClick={handleVoteProduct}
            disabled={userRating === 0}
            style={{ marginLeft: 8, padding: '4px 10px' }}
          >
            Gửi
          </button>
        </div>
      )}

      {showActionButtons(orderStatus) && (
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

      {showNotesModal && (
        <div className="notes-modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="notes-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết sản phẩm</h3>
              <button className="close-btn" onClick={() => setShowNotesModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>{orderItem.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItemCard; 