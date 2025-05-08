import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletAPI } from '../../../utils/axiosConfig';
import './style.scss';

const DepositPage = () => {
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const predefinedAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

    const handleAmountChange = (e) => {
        const value = e.target.value;
        // Remove non-numeric characters and leading zeros
        const cleanValue = value.replace(/[^0-9]/g, '').replace(/^0+/, '') || '';
        setAmount(cleanValue);
    };

    const handlePredefinedAmount = (value) => {
        setAmount(value.toString());
    };

    const formatAmount = (value) => {
        return Number(value).toLocaleString('vi-VN') + ' VNĐ';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate amount
        if (!amount || parseInt(amount) < 10000) {
            setError('Số tiền nạp tối thiểu là 10,000 VNĐ');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            
            const response = await walletAPI.createDeposit(parseInt(amount));
            
            if (response.data && response.data.success && response.data.data.paymentUrl) {
                // Redirect to VNPay payment URL
                window.location.href = response.data.data.paymentUrl;
            } else {
                setError('Có lỗi xảy ra khi tạo giao dịch. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error creating deposit:', error);
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi kết nối đến cổng thanh toán. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/vi-tien');
    };

    return (
        <div className="deposit-page">
            <div className="deposit-container">
                <h1>Nạp Tiền Vào Ví</h1>
                
                <div className="deposit-methods">
                    <div className="payment-method active">
                        <img 
                            src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png" 
                            alt="VNPay" 
                        />
                        <p>Thanh toán qua VNPay</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="deposit-form">
                    <div className="form-group">
                        <label htmlFor="amount">Số tiền nạp:</label>
                        <div className="amount-input">
                            <input
                                type="text"
                                id="amount"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="Nhập số tiền"
                                disabled={isSubmitting}
                            />
                            <span className="currency">VNĐ</span>
                        </div>
                        {amount && (
                            <div className="amount-display">
                                {formatAmount(amount)}
                            </div>
                        )}
                    </div>

                    <div className="predefined-amounts">
                        <p>Chọn nhanh:</p>
                        <div className="amount-buttons">
                            {predefinedAmounts.map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={amount === value.toString() ? 'active' : ''}
                                    onClick={() => handlePredefinedAmount(value)}
                                    disabled={isSubmitting}
                                >
                                    {formatAmount(value)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={!amount || isSubmitting}
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Tiếp tục'}
                        </button>
                    </div>
                </form>

                <div className="deposit-info">
                    <h3>Lưu ý:</h3>
                    <ul>
                        <li>Số tiền nạp tối thiểu là 10,000 VNĐ.</li>
                        <li>Giao dịch sẽ được xử lý tự động và số dư của bạn sẽ được cập nhật ngay sau khi thanh toán thành công.</li>
                        <li>Nếu gặp vấn đề trong quá trình nạp tiền, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DepositPage; 