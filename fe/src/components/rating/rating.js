import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Rating = ({ productId, canVote }) => {
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  // Lấy rating trung bình và count ban đầu
  useEffect(() => {
    async function fetchRating() {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/${productId}/rating`);
        setAverage(response.data.average);
        setCount(response.data.count);
      } catch (error) {
        console.error('Error fetching rating:', error);
      }
    }
    fetchRating();
  }, [productId]);

  const handleStarClick = (star) => {
    if (!canVote) return;
    setRating(star);
  };

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      alert('Vui lòng chọn số sao từ 1 đến 5');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/products/${productId}/rating`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setAverage(response.data.average);
        setCount(response.data.count);
        alert('Cảm ơn bạn đã đánh giá!');
        setRating(0);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Có lỗi khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị sao (có thể click hoặc không)
  const renderStars = (value, clickable = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={() => clickable && handleStarClick(i)}
          style={{
            cursor: clickable ? 'pointer' : 'default',
            color: i <= value ? '#ffc107' : '#e4e5e9',
            fontSize: '24px',
            marginRight: 4,
            userSelect: 'none',
          }}
          aria-label={`${i} star`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div>
      <div>
        {renderStars(canVote ? rating : Math.round(average), canVote)}
        <span style={{ marginLeft: 8 }}>({count} đánh giá)</span>
      </div>
      {canVote && (
        <button onClick={handleSubmit} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      )}
    </div>
  );
};

export default Rating;
