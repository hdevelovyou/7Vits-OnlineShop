import React from 'react';
import OrderItemCard from '../OrderItemCard/OrderItemCard';
import './OrderCard.scss';

const OrderCard = ({ order, onViewDetails }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-info">
          <span className="order-id">Đơn hàng #{order.order_id}</span>
          <span className="order-date">{formatDate(order.order_date)}</span>
          <span className={`order-status ${getStatusColor(order.order_status)}`}>
            {getStatusText(order.order_status)}
          </span>
        </div>
        <div className="seller-info">
          <span>Người bán: {order.seller_name}</span>
        </div>
      </div>

      <div className="order-items">
        {order.order_items.map((item, index) => (
          <OrderItemCard 
            key={`${order.order_id}-${index}`}
            item={item}
            orderStatus={order.order_status}
          />
        ))}
      </div>

      <div className="order-footer">
        <div className="order-total">
          <span>Tổng tiền:</span>
          <span className="total-amount">{formatCurrency(order.total_amount)}</span>
        </div>
        <button 
          className="view-details-btn"
          onClick={() => onViewDetails(order.order_id)}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default OrderCard; 