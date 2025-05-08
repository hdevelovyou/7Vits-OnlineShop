import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.scss';

const VNPayReturnPage = () => {
    const [status, setStatus] = useState('loading');
    const [paymentResult, setPaymentResult] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        processPaymentReturn(queryParams);
    }, [location]);

    const processPaymentReturn = async (queryParams) => {
        try {
            // Make the API call to process the VNPay response
            const response = await axios.get(`/api/wallet/vnpay-return${location.search}`);

            if (response.data && response.data.success) {
                setStatus('success');
                setPaymentResult(response.data.data);
            } else {
                setStatus('failed');
                setPaymentResult({
                    message: response.data?.message || 'Giao dịch không thành công.',
                    paymentStatus: 'failed'
                });
            }
        } catch (error) {
            console.error('Error processing VNPay return:', error);
            setStatus('failed');
            setPaymentResult({
                message: error.response?.data?.message || 'Có lỗi xảy ra khi xử lý kết quả thanh toán.',
                paymentStatus: 'failed'
            });
        }
    };

    const handleBackToWallet = () => {
        navigate('/vi-tien');
    };

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang xử lý kết quả thanh toán...</p>
                    </div>
                );

            case 'success':
                return (
                    <div className="success-state">
                        <div className="icon-container">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h2>Thanh Toán Thành Công!</h2>
                        <p className="message">{paymentResult.message || 'Giao dịch đã được xử lý thành công.'}</p>
                        
                        {paymentResult.transaction && (
                            <div className="transaction-details">
                                <div className="detail-item">
                                    <span className="label">Số tiền:</span>
                                    <span className="value">{paymentResult.transaction.amount.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Mã giao dịch:</span>
                                    <span className="value">{paymentResult.transaction.id}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Thời gian:</span>
                                    <span className="value">
                                        {new Date(paymentResult.transaction.created_at).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        <button onClick={handleBackToWallet} className="action-button success">
                            Quay Lại Ví
                        </button>
                    </div>
                );

            case 'failed':
                return (
                    <div className="failed-state">
                        <div className="icon-container">
                            <i className="fas fa-times-circle"></i>
                        </div>
                        <h2>Thanh Toán Không Thành Công</h2>
                        <p className="message">{paymentResult?.message || 'Giao dịch không thành công.'}</p>
                        
                        <div className="action-buttons">
                            <button onClick={() => navigate('/nap-tien')} className="action-button retry">
                                Thử Lại
                            </button>
                            <button onClick={handleBackToWallet} className="action-button secondary">
                                Quay Lại Ví
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="vnpay-return-page">
            <div className="return-container">
                {renderContent()}
            </div>
        </div>
    );
};

export default VNPayReturnPage; 