import React, { useState } from 'react';
import axios from 'axios';
import './feedback.scss';

export default function FeedbackForm({ productId,onFeedbackAdded }) {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!message.trim()) {
      setError('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    try {
      setSubmitting(true);
      // Gửi lên server
      const payload = { message};
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/feedback`,
        payload,
        { withCredentials: true }
      );
      const newFeedback = res.data.feedback;
       if (onFeedbackAdded && newFeedback) {
        onFeedbackAdded(newFeedback);
      }
      setSuccessMsg(res.data.message || 'Gửi phản hồi thành công!');
      setMessage('');
    } catch (err) {
      console.error('Lỗi khi gửi feedback:', err.response || err.message);
      const msg = err.response?.data?.errors
        ? err.response.data.errors.map((e) => e.msg).join('; ')
        : err.response?.data?.message || 'Có lỗi khi gửi phản hồi.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <h3>Gửi phản hồi</h3>
      {error && <p className="error-message">{error}</p>}
      {successMsg && <p className="success-message">{successMsg}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="feedback-message">Nội dung:</label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            style={{ width: '100%' ,color:'red'}}
          ></textarea>
        </div>
       
        <button type="submit" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
        </button>
      </form>
    </div>
  );
}
