import React, { useEffect, useState } from 'react';
import axios from 'axios';


const SellerRatingDisplay = ({ sellerId }) => {
  const [rating, setRating] = useState({ average: 0, count: 0 });

  useEffect(() => {
    if (!sellerId) return;
    axios.get(`/api/sellers/${sellerId}/rating`)
      .then(res => setRating(res.data))
      .catch(err => {
        console.error(`Lỗi lấy rating seller ${sellerId}:`, err);
        setRating({ average: 0, count: 0 });
      });
  }, [sellerId]);

  return (
    <div className="seller-rating-display">
      {rating.count > 0 ? (
        <>
          {Array.from({ length: 5 }).map((_, index) => {
            const starValue = index + 1;
            if (starValue <= Math.floor(rating.average)) {
              return <span key={index} className="star full">★</span>;
            } else if (
              starValue === Math.ceil(rating.average) &&
              rating.average % 1 !== 0
            ) {
              return <span key={index} className="star half">★</span>;
            } else {
              return <span key={index} className="star empty">★</span>;
            }
          })}
          <span className="rating-number">({Number(rating.average).toFixed(1)})</span>
        </>
      ) : (
        <span className="no-rating">Chưa có đánh giá</span>
      )}
    </div>
  );
};

export default SellerRatingDisplay;
