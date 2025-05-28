import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderDetailModal.scss';

const OrderDetailModal = ({ orderId, onClose }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/detail`);
        setOrderDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Có lỗi xảy ra khi tải thông tin đơn hàng');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-content error">
          <p>{error}</p>
          <button onClick={onClose}>Đóng</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết đơn hàng #{orderDetails.order.id}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="order-info">
            <div className="info-group">
              <label>Ngày đặt hàng:</label>
              <span>{formatDate(orderDetails.order.created_at)}</span>
            </div>
            <div className="info-group">
              <label>Trạng thái:</label>
              <span className={`status ${orderDetails.order.status}`}>
                {orderDetails.order.status}
              </span>
            </div>
            <div className="info-group">
              <label>Tổng tiền:</label>
              <span className="total-amount">
                {formatCurrency(orderDetails.order.total_amount)}
              </span>
            </div>
          </div>

          <div className="items-list">
            <h3>Danh sách sản phẩm</h3>
            {orderDetails.items.map((item, index) => (
              <div key={index} className="item-detail">
                <div className="item-image">
                  <img src={item.image_url || '/placeholder.png'} alt={item.name} />
                </div>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p className="item-notes">{item.notes}</p>
                  <div className="item-price">
                    <span>Đơn giá: {formatCurrency(item.price)}</span>
                    <span>Số lượng: {item.quantity}</span>
                    <span>Thành tiền: {formatCurrency(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="close-btn" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal; 