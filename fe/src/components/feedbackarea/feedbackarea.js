// FeedbackArea.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FeedbackForm from '../feedback/feedback';
import FeedbackSlider from '../showfeeback/showfeedback';
import socket from '../../socket'
export default function FeedbackArea({ productId = null }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) Fetch feedbacks lần đầu hoặc khi productId thay đổi
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        let url = `${process.env.REACT_APP_API_URL}/api/feedback`;
        if (productId) {
          url = `${process.env.REACT_APP_API_URL}/api/feedbacks/product/${productId}`;
        }
        const res = await axios.get(url, { withCredentials: true });
        setFeedbacks(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy feedbacks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [productId]);
useEffect(() => {
    // Khi server emit, cập nhật state
    socket.on('new_feedback', (newFeedback) => {
      // Nếu productId xác định, chỉ thêm khi đúng product (nếu có trường productId)
      // Giả sử newFeedback.product_id người ta trả về
      if (!productId || newFeedback.product_id === productId) {
        setFeedbacks(prev => [newFeedback, ...prev]);
      }
    });
    return () => {
      socket.off('new_feedback');
    };
  }, [productId]);
  // 2) Hàm callback để thêm feedback mới vào đầu mảng
  const handleNewFeedback = (newFeedback) => {
    setFeedbacks(prev => [newFeedback, ...prev]);
  };

  return (
    <div>
      {/* Form sẽ gọi handleNewFeedback khi gửi thành công */}
      <FeedbackForm productId={productId} onFeedbackAdded={handleNewFeedback} />

      {/* Loader hoặc thông báo */}
      {loading ? (
        <p>Đang tải phản hồi...</p>
      ) : feedbacks.length === 0 ? (
        <p>Chưa có phản hồi nào.</p>
      ) : (
        <FeedbackSlider feedbacks={feedbacks} />
      )}
    </div>
  );
}
