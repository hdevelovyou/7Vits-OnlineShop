// src/pages/AuctionsPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./style.scss";

const AuctionsPage = () => {
  const navigate = useNavigate();

  // State để lưu list auction
  const [auctions, setAuctions] = useState([]);

  // State cho form tạo auction mới
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [finishedAuctions, setFinishedAuctions] = useState([]);
  const [gameKey, setGameKey] = useState('');
  const [imageFile, setImageFile] = useState('');
  const [imageBase64, setImageBase64] = useState('');

  // Lấy userId từ localStorage (sau khi login)
  const userId = localStorage.getItem('userId');

  // Fetch danh sách auctions khi component mount
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/auctions/finished`, { withCredentials: true })
      .then(res => {
        setFinishedAuctions(res.data);
      })
      .catch(err => console.error("Lỗi khi lấy phiên đã kết thúc:", err));

    axios.get(`${process.env.REACT_APP_API_URL}/api/auctions`, {
      withCredentials: true
    })
      .then(res => {
        const now = new Date();
        // Lọc những phiên chưa kết thúc (status = 'ongoing')
        const active = res.data.filter(a => new Date(a.end_time) > now && a.status === 'ongoing');
        setAuctions(active);
      })
      .catch(err => {
        console.error("Lỗi khi lấy danh sách phiên:", err);
        // Nếu được backend trả 401 (nếu có yêu cầu auth), redirect về login
        if (err.response?.status === 401) {
          navigate('/login?expired=true');
        }
      });
  }, [navigate]);
  function formatDateToMySQL(datetimeLocalString) {
    const date = new Date(datetimeLocalString);
    const pad = (n) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Tháng bắt đầu từ 0
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImageBase64('');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };
  // Hàm xử lý form tạo auction mới
  const handleCreateAuction = async (e) => {
    e.preventDefault();

    // 1) Kiểm xem đã login chưa
    if (!userId) {
      alert('Vui lòng đăng nhập để tạo phiên đấu giá.');
      return navigate('/login');
    }

    // 2) Validate dữ liệu client
    if (!itemName.trim() || !startingPrice || !endTime) {
      alert('Vui lòng điền đầy đủ: Tên sản phẩm, Giá khởi điểm và Thời gian kết thúc.');
      return;
    }

    // 3) Tạo payload JSON (chỉ text fields + sellerId)
    const payload = {
      item_name: itemName,
      description: description,
      starting_price: parseFloat(startingPrice),
      end_time: formatDateToMySQL(endTime),
      sellerId: userId,
      imageData:imageBase64,
      notes: gameKey
    }
    try {
      // 4) Gửi request POST /api/auctions
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auctions`,
        payload,
        { withCredentials: true }
      );
      const newAuction = res.data.auction;
      alert('Tạo phiên đấu giá thành công!');
      navigate(`/auction/${newAuction.id
        }`);
    } catch (err) {
      console.error('Lỗi khi tạo phiên đấu giá:', err);
      if (err.response) {
        // Nếu backend trả mảng validation errors
        if (err.response.data.errors) {
          const messages = err.response.data.errors.map(e => e.msg).join('\n');
          alert(`Tạo phiên thất bại: \n${messages}`);
        } else {
          alert(err.response.data.message || 'Tạo phiên thất bại.');
        }
      } else {
        alert('Không thể kết nối server.');
      }
    }
  };
  const inputStyle = {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  };
  return (
    <div className="auctions-container" style={{ padding: '200px 18px' }}>
      {/* Form tạo auction mới */}
      <div className="create-auction-form" style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        maxWidth: '600px',
        margin: '0 auto 40px auto',
        backgroundColor: '#fafafa'
      }}>
        <h2 style={{ marginBottom: '12px' }}>➕ Tạo phiên đấu giá mới</h2>
        <form onSubmit={handleCreateAuction}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>
              Tên sản phẩm:
            </label>
            <input
              type="text"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                color: '#000'
              }}
              placeholder="Ví dụ: Bức tranh quý"
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>
              Mô tả:
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                color: '#000'
              }}
              rows={3}
              placeholder="Mô tả sản phẩm (tuỳ chọn)"
            />
          </div>
         <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>
              Ảnh sản phẩm (từ file):
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={inputStyle}
            />
            {imageBase64 && (
              <div style={{ marginTop: '8px' }}>
                <p>Ảnh đã chọn:</p>
                <img
                  src={imageBase64}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>
              Key game (tuỳ chọn):
            </label>
            <input
              type="text"
              value={gameKey}
              onChange={e => setGameKey(e.target.value)}
              style={inputStyle}
              placeholder="XXXX-YYYY-ZZZZ"
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>
              Giá khởi điểm (VND):
            </label>
            <input
              type="number"
              step="1000"
              value={startingPrice}
              onChange={e => setStartingPrice(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                color: '#000'
              }}
              placeholder="Ví dụ: 100000"
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>
              Thời gian kết thúc:
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                color: '#000'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tạo phiên đấu giá
          </button>
        </form>
      </div>

      {/* Danh sách auctions */}
      <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>🔥 Các phiên đấu giá đang diễn ra</h2>
      <ul className="auctions-list" style={{ listStyle: 'none', padding: 0, maxWidth: '600px', margin: '0 auto' }}>
        {auctions.length === 0 ? (
          <p className="no-auctions" style={{ textAlign: 'center' }}>
            Không có phiên đấu giá nào đang diễn ra.
          </p>
        ) : (
          auctions.map(auction => (
            <li
              key={auction.id}
              className="auction-item"
              style={{
                border: '1px solid #ccc',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '12px'
              }}
            >
              <Link to={`/auction/${auction.id} `} className="auction-link" style={{ textDecoration: 'none', color: '#333' }}>
                <h4 style={{ margin: '0 0 8px 0' }}>{auction.item_name}</h4>
                <p style={{ margin: '4px 0' }}>
                  <strong>Giá hiện tại:</strong> {auction.current_bid.toLocaleString()} VND
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Kết thúc:</strong> {new Date(auction.end_time).toLocaleString()}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>

      <h2 style={{ textAlign: 'center', margin: '40px 0 16px' }}>✅ Các phiên đã kết thúc</h2>
      <ul style={{ listStyle: 'none', padding: 0, maxWidth: '600px', margin: '0 auto' }}>
        {finishedAuctions.length === 0 ? (
          <p style={{ textAlign: 'center' }}>Chưa có phiên nào kết thúc.</p>
        ) : (
          finishedAuctions.map(auction => (
            <li
              key={auction.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '12px',

              }}
            >
              <h4>{auction.item_name}</h4>
              <p><strong>Giá chốt:</strong> {auction.current_bid.toLocaleString()} VND</p>
              <p><strong>Kết thúc lúc:</strong> {new Date(auction.end_time).toLocaleString()}</p>
              <p><strong>Người chiến thắng:</strong> {auction.winner_name || 'Không có ai tham gia'}</p>
            </li>
          ))
        )}
      </ul>

    </div>
  );
};

export default AuctionsPage;
