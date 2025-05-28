import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingBag, FaSync } from 'react-icons/fa';
import OrderItemCard from '../../../components/OrderItemCard/OrderItemCard';
import './OrderHistoryPage.scss';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const statusFilters = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'cancelled', label: 'Đã hủy' }
  ];

  const fetchOrders = async (page = 1, status = selectedStatus) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders/getOrderHistory`, {
        params: {
          page,
          limit: pagination.itemsPerPage,
          status: status === 'confirmed' ? ['confirmed', 'completed'] : 
                 status !== 'all' ? status : undefined
        }
      });

      const processedOrders = response.data.orders.map(order => ({
        ...order,
        order_status: order.order_status === 'completed' ? 'confirmed' : order.order_status
      }));

      setOrders(processedOrders);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        totalItems: response.data.pagination.totalItems,
        itemsPerPage: response.data.pagination.itemsPerPage
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Có lỗi xảy ra khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, selectedStatus);
  }, [selectedStatus]);

  const handlePageChange = (newPage) => {
    fetchOrders(newPage, selectedStatus);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const handleRetry = () => {
    setError(null);
    fetchOrders(1, selectedStatus);
  };

  if (loading) {
    return (
      <div className="order-history-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-page">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={handleRetry}>
            <FaSync /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="page-header">
        <h1>Lịch sử đơn hàng</h1>
        <div className="status-filters">
          {statusFilters.map(filter => (
            <button
              key={filter.value}
              className={selectedStatus === filter.value ? 'active' : ''}
              onClick={() => handleStatusChange(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="orders-container">
        {orders.length === 0 ? (
          <div className="no-orders">
            <FaShoppingBag className="empty-icon" />
            <p>Bạn chưa có đơn hàng nào</p>
          </div>
        ) : (
          orders.map(order => (
            <OrderItemCard
              key={order.order_id}
              item={order}
              orderStatus={order.order_status}
            />
          ))
        )}
      </div>

      {orders.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Trước
          </button>

          <span className="page-info">
            Trang {pagination.currentPage} / {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage; 