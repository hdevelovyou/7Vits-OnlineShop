import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './vnpay_Topup.scss';

const VnpayTopup = () => {
    const [amount, setAmount] = useState('');
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Kiểm tra và xử lý VNPay params trong URL khi component mount
    useEffect(() => {
        // Tách xử lý VNPay redirect thành một hàm riêng
        const handleVnpayRedirect = () => {
            const urlParams = new URLSearchParams(window.location.search);
            // Nếu URL có chứa VNPay params, chuyển hướng đến trang return
            if (urlParams.has('vnp_ResponseCode')) {
                console.log('Detected VNPay params, redirecting to result page...');
                // Xóa flag thanh toán vì trình duyệt đang trong quá trình xử lý kết quả
                localStorage.removeItem('vnpay_payment_timestamp');
                window.location.replace('/payment/vnpay_return' + window.location.search);
                return true;
            }
            return false;
        };

        // Xử lý khi component mount
        if (!handleVnpayRedirect()) {
            // Lấy thông tin user nếu không phải là redirect từ VNPay
            loadUserInfo();
            
            // Kiểm tra xem có phải là refresh sau khi thanh toán không
            const paymentTimestamp = localStorage.getItem('vnpay_payment_timestamp');
            if (paymentTimestamp) {
                const currentTime = new Date().getTime();
                const timeSincePayment = currentTime - parseInt(paymentTimestamp);
                
                // Nếu đã quá 5 phút (300000ms), xóa flag thanh toán
                if (timeSincePayment > 300000) {
                    localStorage.removeItem('vnpay_payment_timestamp');
                } 
                // Nếu trong vòng 5 phút, có thể là refresh trang sau khi thanh toán
                else {
                    console.log('Payment in progress detected, preventing new payment requests');
                }
            }
        }
    }, []);
    
    // Tách việc load thông tin user thành hàm riêng
    const loadUserInfo = () => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const userData = JSON.parse(userString);
                if (userData && userData.id) {
                    setUserId(userData.id.toString());
                }
                if (userData && userData.userName) {
                    setUserName(userData.userName);
                } else if (userData && userData.firstName) {
                    setUserName(`${userData.firstName} ${userData.lastName || ''}`);
                }
            }
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
        }
    };

    const handleAmountSelect = (value) => {
        setAmount(value);
    };
    
    const handlePayment = async () => {
        // Kiểm tra xem có đang trong quá trình thanh toán không
        const paymentTimestamp = localStorage.getItem('vnpay_payment_timestamp');
        if (paymentTimestamp) {
            const currentTime = new Date().getTime();
            const timeSincePayment = currentTime - parseInt(paymentTimestamp);
            
            // Nếu chưa quá 5 phút, ngăn yêu cầu thanh toán mới
            if (timeSincePayment < 300000) {
                alert('Đã có yêu cầu thanh toán đang xử lý. Vui lòng đợi hoặc làm mới trang sau 5 phút.');
                return;
            }
        }

        // Check if userId exists in state or try to get it from localStorage again
        let currentUserId = userId;
        if (!currentUserId || currentUserId.trim() === '') {
            try {
                const userString = localStorage.getItem('user');
                if (userString) {
                    const userData = JSON.parse(userString);
                    if (userData && userData.id) {
                        currentUserId = userData.id.toString();
                        setUserId(currentUserId);
                    }
                }
            } catch (error) {
                console.error('Error getting user ID:', error);
            }
            
            if (!currentUserId || currentUserId.trim() === '') {
                alert('Không tìm thấy ID người dùng. Vui lòng đăng nhập trước khi thanh toán.');
                return;
            }
        }
    
        try {
          setLoading(true);
          
          // Đánh dấu thời điểm bắt đầu thanh toán
          const currentTime = new Date().getTime();
          localStorage.setItem('vnpay_payment_timestamp', currentTime.toString());
          
          console.log('💰 Sending payment request with userId:', currentUserId, 'amount:', amount);
          
          const returnUrl = window.location.origin + '/payment/vnpay_return';
          console.log('📍 Return URL:', returnUrl);
          
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/topup/create_payment_url`, {
            amount: amount,
            userId: currentUserId,
            orderInfo: 'Nạp tiền vào ví',
            orderType: 'billpayment',
            locale: 'vn',
            bankCode: '',
            returnUrl: returnUrl
          });
          
          console.log('✅ Payment URL created:', response.data);
    
          if (response.data.vnpUrl) {
            console.log('🔄 Redirecting to payment page...');
            // Sử dụng window.location.replace thay vì href để tránh lịch sử trình duyệt
            window.location.replace(response.data.vnpUrl);
          }
        } catch (error) {
          console.error('❌ Payment error:', error);
          alert('Có lỗi xảy ra khi tạo thanh toán: ' + (error.response?.data?.message || error.message));
          // Xóa flag thanh toán nếu có lỗi
          localStorage.removeItem('vnpay_payment_timestamp');
        } finally {
          setLoading(false);
        }
    };

    return(
        <div className='topup-container'>
            <div className="payment-container">
                <h1>Nạp tiền vào ví</h1>
                {userName && <p className="user-greeting">Xin chào, {userName}!</p>}
                <div className="payment-form">
                   <div className="amount-options">
                       <h2>Chọn số tiền cần nạp:</h2>
                       <div className="amount-buttons">
                           <button onClick={() => handleAmountSelect(50000)}>50.000đ</button>
                           <button onClick={() => handleAmountSelect(100000)}>100.000đ</button>
                           <button onClick={() => handleAmountSelect(200000)}>200.000đ</button>
                           <button onClick={() => handleAmountSelect(500000)}>500.000đ</button>
                       </div>
                       <div className="selected-amount">
                           {amount ? `Số tiền đã chọn: ${amount.toLocaleString()}đ` : 'Vui lòng chọn số tiền'}
                       </div>
                       <button 
                           className="pay-button"
                           onClick={handlePayment}
                           disabled={loading || !amount || localStorage.getItem('vnpay_payment_timestamp')}
                       >
                           {loading ? 'Đang xử lý...' : 
                            localStorage.getItem('vnpay_payment_timestamp') ? 'Đang xử lý thanh toán...' : 
                            'Thanh toán ngay'}
                       </button>
                   </div>
                </div>
             </div>
        </div>
      );
};

export default VnpayTopup;