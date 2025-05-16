import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './vnpay_Topup.css';

const VnpayTopup = () => {
    const [amount, setAmount] = useState('');
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Get user object from localStorage and extract ID and name
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
                    // Fallback to firstName + lastName if userName is not available
                    setUserName(`${userData.firstName} ${userData.lastName || ''}`);
                }
            }
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
        }
    }, []);

    const handleAmountSelect = (value) => {
        setAmount(value);
    };
    
    const handlePayment = async () => {
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
          console.log('💰 Sending payment request with userId:', currentUserId, 'amount:', amount);
          
          const returnUrl = window.location.origin + '/payment/vnpay_return';
          console.log('📍 Return URL:', returnUrl);
          
          const response = await axios.post('http://localhost:5000/api/topup/create_payment_url', {
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
            window.location.href = response.data.vnpUrl;
          }
        } catch (error) {
          console.error('❌ Payment error:', error);
          alert('Có lỗi xảy ra khi tạo thanh toán: ' + (error.response?.data?.message || error.message));
        } finally {
          setLoading(false);
        }
      };

      return(
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
                        disabled={loading || !amount}
                    >
                        {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
                    </button>
                </div>
             </div>
          </div>
       );
};

export default VnpayTopup;