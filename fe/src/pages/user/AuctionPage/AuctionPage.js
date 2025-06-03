// AuctionPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../../../components/socket'; // Đường dẫn tới socket.js đã sửa
import axios from 'axios';
import './style.scss'; // Import SCSS file

export default function AuctionPage({ auctionId }) {
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // 1) Join room ngay khi component mount hoặc auctionId thay đổi
    //    (Không cần gọi socket.connect() vì chúng ta đã để autoConnect = true)


    // 2) Đăng ký listener bid_updated **ở ngay đầu** (để không bỏ lỡ event)
    const handleBidUpdated = (data) => {
      console.log('[Client] Received bid_updated:', data);
      // data = { auctionId, currentBid, bidderId }

      // **So sánh kiểu NUMBER/STRING sao cho luôn khớp**:
      // Chúng ta convert cả hai về String để so sánh, hoặc dùng == thay cho ===
      if (data.auctionId.toString() === auctionId.toString()) {
        setAuction(prev => {
          if (!prev) return prev;
          return { ...prev, current_bid: data.currentBid };
        });
      }
    };
    const handleAuctionClosed = async (data) => {
      console.log('[Client] auction_closed:', data);
      if (data.winner) {
        alert(`🎉 Phiên đấu giá kết thúc!\nNgười chiến thắng: ID ${data.winner.id}\nGiá: ${data.winner.amount.toLocaleString()} VND`);
      }

      if (data.winner.id.toString() === userId.toString()) {
        alert(
          `🎉 Phiên đấu giá kết thúc!\n` +
          `Bạn chính là người chiến thắng với giá: ${data.winner.amount.toLocaleString()} VND.`
        );
        const productId = data.productId;
        if (!productId) {
          alert('❌ Không tìm thấy thông tin sản phẩm để tạo đơn hàng.');
          return;
        }
        try {
          const payload = {
            items: [{ productId}], // tùy cấu trúc DB
            totalAmount: parseFloat(data.winner.amount),
          
            
          };
          const res = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/orders/create`,
            payload,
            { withCredentials: true }
          );
          alert('✅ Đơn hàng của bạn đã được tạo thành công!');
          // Chuyển qua trang danh sách đơn hàng (tùy bạn đặt route)
          navigate('/user/purchase-history');
        } catch (err) {
          console.error('Error creating order:', err);
          alert(err.response?.data?.message || 'Tạo đơn hàng thất bại.');
        }
      }
      else {
        alert('⛔ Phiên đấu giá kết thúc nhưng không có người tham gia.');
      }

      setAuction(prev => ({
        ...prev,
        status: 'finished'
      }));
    };
    // 3) (Optional) Lắng nghe event bid_failed để hiển thị alert khi bid lỗi
    const handleBidFailed = (err) => {
      console.log('[Client] Received bid_failed:', err);
      if (err && err.message) {
        alert(err.message);
      }
    };
    socket.on('bid_updated', handleBidUpdated);
    socket.on('bid_failed', handleBidFailed);
    socket.on('auction_closed', handleAuctionClosed);
    socket.emit('join_auction', auctionId);
    console.log(`[Client] emit join_auction: ${auctionId}`);
    // 4) Fetch chi tiết auction ban đầu (để hiển thị và tính timeLeft)
    axios.get(`${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}`, {
      withCredentials: true   // 🔥 BẮT BUỘC để gửi cookie session
    })
      .then(res => {
        setAuction(res.data);
        const end = new Date(res.data.end_time).getTime();
        setTimeLeft(end - Date.now());
      })
      .catch(err => {
        console.error('[Client] Lỗi khi GET auction:', err);
      });

    // 5) Cleanup khi component unmount hoặc auctionId thay đổi
    return () => {
      console.log(`[Client] emit leave_auction: ${auctionId}`);
      socket.emit('leave_auction', auctionId);
      socket.off('auction_closed', handleAuctionClosed);
      socket.off('bid_updated', handleBidUpdated);
      socket.off('bid_failed', handleBidFailed);
    };
  }, [auctionId]);

  // Đếm ngược thời gian, cứ mỗi giây setTimeLeft lại
  useEffect(() => {
    if (!auction) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [auction]);

  // Hàm xử lý khi người dùng bấm nút "Đặt giá"
  const handleBid = () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) {
      alert('Vui lòng nhập một số hợp lệ.');
      return;
    }
    if (!auction) {
      alert('Đang tải dữ liệu, vui lòng chờ.');
      return;
    }
    if (amount <= auction.current_bid) {
      alert(`Giá phải cao hơn giá hiện tại (${auction.current_bid.toLocaleString()} VND).`);
      return;
    }

    // Emit sự kiện place_bid lên server
    console.log('[Client] emit place_bid:', {
      auctionId: auction.id,
      bidderId: userId,
      amount
    });
    socket.emit('place_bid', {
      auctionId: auction.id,
      bidderId: userId,
      amount: amount,
    });

    // Reset input
    setBidAmount('');
  };

  if (!auction) {
    return (
      <div className="auction-container">
        <div className="loading">Đang tải phiên đấu giá...</div>
      </div>
    );
  }

  // Tính minutes và seconds từ timeLeft (ms)
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  // Determine auction status for styling
  const getAuctionStatusClass = () => {
    if (timeLeft <= 0) {
      return auction.status === 'finished' ? 'finished' : 'ended';
    }
    return '';
  };

  // Tính toán thời gian còn lại theo ngày, giờ, phút, giây
  const calculateTimeRemaining = () => {
    if (timeLeft <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const { days, hours, minutes: mins, seconds: secs } = calculateTimeRemaining();

  // Format time display
  const formatTimeDisplay = () => {
    const parts = [];
    if (days > 0) parts.push(`${days} ngày`);
    if (hours > 0) parts.push(`${hours} giờ`);
    if (mins > 0) parts.push(`${mins} phút`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} giây`);
    
    return parts.join(' ');
  };

  // Render individual time units for better styling
  const renderTimeUnits = () => {
    const units = [];
    
    if (days > 0) {
      units.push(
        <span key="days" className="time-unit">
          <span className="time-number">{days}</span>
          <span className="time-label">ngày</span>
        </span>
      );
    }
    
    if (hours > 0) {
      units.push(
        <span key="hours" className="time-unit">
          <span className="time-number">{hours}</span>
          <span className="time-label">giờ</span>
        </span>
      );
    }
    
    if (mins > 0) {
      units.push(
        <span key="minutes" className="time-unit">
          <span className="time-number">{mins}</span>
          <span className="time-label">phút</span>
        </span>
      );
    }
    
    if (secs > 0 || units.length === 0) {
      units.push(
        <span key="seconds" className="time-unit">
          <span className="time-number">{secs}</span>
          <span className="time-label">giây</span>
        </span>
      );
    }
    
    return units;
  };

  // Determine if time is urgent (less than 1 hour)
  const isUrgent = timeLeft > 0 && timeLeft < 3600000; // 1 hour in milliseconds

  return (
    <div className="auction-page">
      <div className="auction-container">
        {auction.image_url && (
          <div className="auction-image">
            <img src={auction.image_url} alt="Ảnh sản phẩm" />
          </div>
        )}
  
        <h2>
          <span className="emoji">🛒</span>
          {auction.item_name}
        </h2>
        
        <p>{auction.description}</p>
        
        {auction.game_key && (
          <p><strong>🎮 Key game:</strong> {auction.game_key}</p>
        )}
        
        <p>
          <strong>Giá hiện tại:</strong>{' '}
          <span className="current-bid">
            {auction.current_bid.toLocaleString()} VND
          </span>
        </p>
        
        <p>
          <strong>⏰ Còn lại:</strong>{' '}
          <span className={`time-remaining ${isUrgent ? 'urgent' : ''}`}>
            {renderTimeUnits()}
          </span>
        </p>
  
        {timeLeft > 0 ? (
          <div className="bid-section">
            <input
              type="number"
              placeholder="Nhập giá đấu (VND)"
              value={bidAmount}
              onChange={e => setBidAmount(e.target.value)}
              min={auction.current_bid + 1}
            />
            <button onClick={handleBid}>
              Đặt giá
            </button>
          </div>
        ) : (
          <div className={`auction-status ${getAuctionStatusClass()}`}>
            {auction.status === 'finished' ? (
              <>
                🎉 Phiên đấu giá đã kết thúc! <br />
                🏆 Người chiến thắng: {auction.winner_name ? auction.winner_name : 'Không có ai đấu giá'}
              </>
            ) : (
              <>⛔ Phiên đấu giá đã kết thúc</>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
