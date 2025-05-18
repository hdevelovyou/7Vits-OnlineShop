import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './vnpay_Return.css';

// Utility function to clean up old processed transactions (older than 30 days)
const cleanupOldTransactions = () => {
  try {
    const processedTxns = JSON.parse(localStorage.getItem('processed_transactions') || '{}');
    const now = new Date().getTime();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    let hasChanges = false;
    
    Object.keys(processedTxns).forEach(txnRef => {
      if (now - processedTxns[txnRef].timestamp > thirtyDaysInMs) {
        delete processedTxns[txnRef];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      localStorage.setItem('processed_transactions', JSON.stringify(processedTxns));
    }
  } catch (error) {
    console.error('Error cleaning up old transactions:', error);
  }
};

const VnpayReturn = () => {
  const [paymentResult, setPaymentResult] = useState({
    loading: true,
    success: false,
    message: '',
    transactionId: '',
    amount: '',
    orderInfo: '',
    paymentTime: '',
    transactionNo: '',
    alreadyProcessed: false
  });

  useEffect(() => {
    // Clean up old transactions data
    cleanupOldTransactions();
    
    const fetchPaymentStatus = async () => {
      try {
        console.log('Starting payment verification process...');
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        for (const [key, value] of urlParams.entries()) {
          params[key] = value;
        }

        console.log('Payment parameters:', params);

        // If no parameters, return
        if (Object.keys(params).length === 0) {
          console.error('No payment parameters found in URL');
          setPaymentResult({
            loading: false,
            success: false,
            message: 'Không tìm thấy thông tin thanh toán'
          });
          return;
        }

        // Check localStorage for this transaction
        const txnRef = params.vnp_TxnRef;
        const processedTxns = JSON.parse(localStorage.getItem('processed_transactions') || '{}');
        
        if (processedTxns[txnRef]) {
          console.log('Found locally cached transaction result:', processedTxns[txnRef]);
          // Use cached result and avoid calling API again
          const { vnp_ResponseCode, vnp_Amount, vnp_OrderInfo, vnp_PayDate, vnp_TransactionNo } = params;
          
          // Format payment time
          const paymentTime = vnp_PayDate 
            ? `${vnp_PayDate.substring(6, 8)}/${vnp_PayDate.substring(4, 6)}/${vnp_PayDate.substring(0, 4)} ${vnp_PayDate.substring(8, 10)}:${vnp_PayDate.substring(10, 12)}:${vnp_PayDate.substring(12, 14)}`
            : '';

          setPaymentResult({
            loading: false,
            success: vnp_ResponseCode === '00',
            message: vnp_ResponseCode === '00' ? 'Thanh toán thành công ' : 'Thanh toán thất bại ',
            transactionId: txnRef || '',
            amount: vnp_Amount ? (parseInt(vnp_Amount) / 100).toLocaleString('vi-VN') : '',
            orderInfo: vnp_OrderInfo || '',
            paymentTime: paymentTime,
            transactionNo: vnp_TransactionNo || '',
            alreadyProcessed: true
          });
          return;
        }

        // Verify payment with backend - with retry mechanism
        let retries = 0;
        let maxRetries = 3;
        let success = false;
        let response;

        while (retries < maxRetries && !success) {
          try {
            console.log(`Attempt ${retries + 1}/${maxRetries} to verify payment...`);
            response = await axios.get(`${process.env.REACT_APP_API_URL}/api/topup/vnpay_return`, { params });
            console.log('Payment verification response:', response.data);
            success = true;
          } catch (error) {
            console.error(`Attempt ${retries + 1} failed:`, error);
            retries++;
            if (retries < maxRetries) {
              // Wait before retrying (1 second)
              console.log('Waiting before retry...');
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              throw error; // Re-throw if all attempts fail
            }
          }
        }
        
        const { vnp_ResponseCode, vnp_TxnRef, vnp_Amount, vnp_OrderInfo, vnp_PayDate, vnp_TransactionNo } = params;
        
        // Format payment time
        const paymentTime = vnp_PayDate 
          ? `${vnp_PayDate.substring(6, 8)}/${vnp_PayDate.substring(4, 6)}/${vnp_PayDate.substring(0, 4)} ${vnp_PayDate.substring(8, 10)}:${vnp_PayDate.substring(10, 12)}:${vnp_PayDate.substring(12, 14)}`
          : '';

        // Store this transaction in localStorage to prevent duplicate processing on client side too
        if (txnRef) {
          processedTxns[txnRef] = {
            success: vnp_ResponseCode === '00',
            timestamp: new Date().getTime()
          };
          localStorage.setItem('processed_transactions', JSON.stringify(processedTxns));
        }

        // Check if backend indicated the transaction was already processed
        const alreadyProcessed = response?.data?.alreadyProcessed || false;
        const message = alreadyProcessed 
          ? (vnp_ResponseCode === '00' ? 'Thanh toán thành công ' : 'Thanh toán thất bại ')
          : (response?.data?.message || (vnp_ResponseCode === '00' ? 'Thanh toán thành công' : 'Thanh toán thất bại'));

        setPaymentResult({
          loading: false,
          success: vnp_ResponseCode === '00',
          message: message,
          transactionId: vnp_TxnRef || '',
          amount: vnp_Amount ? (parseInt(vnp_Amount) / 100).toLocaleString('vi-VN') : '',
          orderInfo: vnp_OrderInfo || '',
          paymentTime: paymentTime,
          transactionNo: vnp_TransactionNo || '',
          alreadyProcessed: alreadyProcessed
        });
      } catch (error) {
        console.error('Error processing payment return:', error);
        setPaymentResult({
          loading: false,
          success: false,
          message: 'Đã xảy ra lỗi khi xử lý kết quả thanh toán: ' + (error.response?.data?.message || error.message)
        });
      }
    };

    fetchPaymentStatus();
  }, []);

  const handleBackToPayment = () => {
    window.location.href = '/topup';
  };

  const handleBackToHome = () => {
    window.location.href = '/gio-hang';
  };

  if (paymentResult.loading) {
    return (
      <div className="loading-container">
        <div className="payment-loading">
          <div className="loading-spinner"></div>
          <p>Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='payment-return-container-main'>
      <div className={`payment-return-container ${paymentResult.success ? 'success' : 'failed'}`}>
        <div className="payment-status-icon">
          {paymentResult.success ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          )}
        </div>
        
        <h1 className="payment-status">{paymentResult.message}</h1>
        
        {paymentResult.success && paymentResult.transactionId && (
          <div className="payment-details">
            <div className="detail-item">
              <span className="detail-label">Mã giao dịch:</span>
              <span className="detail-value">{paymentResult.transactionId}</span>
            </div>
            
            {paymentResult.amount && (
              <div className="detail-item">
                <span className="detail-label">Số tiền:</span>
                <span className="detail-value">{paymentResult.amount} VNĐ</span>
              </div>
            )}
            
            {paymentResult.orderInfo && (
              <div className="detail-item">
                <span className="detail-label">Nội dung thanh toán:</span>
                <span className="detail-value">{paymentResult.orderInfo}</span>
              </div>
            )}
            
            {paymentResult.paymentTime && (
              <div className="detail-item">
                <span className="detail-label">Thời gian thanh toán:</span>
                <span className="detail-value">{paymentResult.paymentTime}</span>
              </div>
            )}
            
            {paymentResult.transactionNo && (
              <div className="detail-item">
                <span className="detail-label">Mã giao dịch VNPay:</span>
                <span className="detail-value">{paymentResult.transactionNo}</span>
              </div>
            )}
          </div>
        )}
        
      <div className='button-group'>
          <button className="continue-topup-button" onClick={handleBackToPayment}>
            Tiếp tục nạp tiền
          </button>
          <button className="back-button" onClick={handleBackToHome}>
            Quay lại trang mua hàng
          </button>
      </div>
  
      </div>
    </div>
  );
};

export default VnpayReturn;
