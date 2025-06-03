import React, { useState, useRef } from 'react';
import { createOrder } from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const CreateOrderButton = ({ items, totalAmount, onSuccess, onError, buttonText = 'Thanh Toán' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const clickTimeRef = useRef(0);

  const handleCreateOrder = async () => {
    // Ngăn click nhiều lần
    const now = Date.now();
    if (now - clickTimeRef.current < 1000 || isLoading) return;
    clickTimeRef.current = now;
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Kiểm tra đầu vào
      if (!items || items.length === 0 || !totalAmount) {
        throw new Error('Thiếu thông tin sản phẩm hoặc tổng tiền');
      }
      
      // Log thông tin trước khi gọi API
      console.log('Creating order with data:', { items, totalAmount });
      
      // Gọi API tạo đơn hàng với retry tự động
      const response = await createOrder({ items, totalAmount });
      
      console.log('Order created successfully:', response);
      
      // Xử lý kết quả thành công
      if (onSuccess) {
        onSuccess(response);
      } else {
        // Hành động mặc định khi thành công là chuyển hướng đến trang chi tiết đơn hàng
        navigate(`/orders/${response.orderId}`);
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      
      // Xử lý các loại lỗi khác nhau
      let message = 'Đã có lỗi xảy ra khi tạo đơn hàng';
      
      if (error.response) {
        // Lỗi từ server
        if (error.response.status === 500) {
          console.error('Server error details:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
          
          // Xử lý chi tiết lỗi 500
          const serverMsg = error.response.data?.message || error.response.data?.error;
          if (serverMsg) {
            if (serverMsg.includes('lock') || serverMsg.includes('timeout') || serverMsg.includes('deadlock')) {
              message = 'Hệ thống đang bận, vui lòng thử lại sau';
            } else {
              message = serverMsg;
            }
          } else {
            message = 'Lỗi máy chủ, vui lòng thử lại sau';
          }
        } else {
          // Lỗi khác từ server
          message = error.response.data?.message || message;
        }
      } else if (error.code === 'ECONNABORTED') {
        // Lỗi timeout
        message = 'Thao tác mất quá nhiều thời gian, vui lòng thử lại sau';
      } else if (error.message) {
        // Lỗi chung có message
        message = error.message;
      }
      
      setErrorMessage(message);
      
      if (onError) {
        onError(error, message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-order-container">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <button
        className={`create-order-button ${isLoading ? 'loading' : ''}`}
        onClick={handleCreateOrder}
        disabled={isLoading}
      >
        {isLoading ? 'Đang xử lý...' : buttonText}
      </button>
    </div>
  );
};

export default CreateOrderButton; 