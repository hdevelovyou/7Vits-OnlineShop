import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './style.module.scss'; // Sử dụng CSS module hoặc .scss thông thường
import socket from '../socket'
export default function FeedbackSlider({ productId = null }) {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const sliderRef = useRef(null);
    useEffect(() => {
  socket.on('new_feedback', (feedback) => {
    setFeedbacks(prev => [feedback, ...prev]);
  });
  return () => socket.off('new_feedback');
}, []);
   
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

    if (loading) {
        return <p>Đang tải phản hồi...</p>;
    }
    if (!feedbacks.length) {
        return <p>Chưa có phản hồi nào.</p>;
    }

    // Nhân đôi mảng để animation loop mượt mà
    const extendedFeedbacks = [...feedbacks, ...feedbacks];

    return (
        <div className={styles.sliderWrapper}>
            <div className={styles.sliderContainer} ref={sliderRef}>
                {extendedFeedbacks.map((fb, idx) => (
                    <div key={`${fb.id}-${idx}`} className={styles.feedbackCard}>
                        <p className={styles.userName}>
                            {fb.user_name || 'Ẩn danh'}
                            {fb.rating ? ` – ${fb.rating} sao` : ''}
                        </p>
                        <p className={styles.message}>"{fb.message}"</p>
                        <small className={styles.createdAt}>
                            {new Date(fb.created_at).toLocaleString()}
                        </small>
                    </div>
                ))}
            </div>
        </div>
    );
}
