import React, { useState, useEffect } from 'react';
import './style.scss';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WithdrawPage = () => {
    const [walletBalance, setWalletBalance] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' hoặc 'error'
    
    const navigate = useNavigate();

    // Danh sách ngân hàng Việt Nam
    const vietnameseBanks = [
        // Ngân hàng thương mại nhà nước
        { code: 'AGRIBANK', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam (Agribank)' },
        { code: 'VIETINBANK', name: 'Ngân hàng Công Thương Việt Nam (VietinBank)' },
        { code: 'BIDV', name: 'Ngân hàng Đầu tư và Phát triển Việt Nam (BIDV)' },
        { code: 'VIETCOMBANK', name: 'Ngân hàng Ngoại thương Việt Nam (Vietcombank)' },
        
        // Ngân hàng thương mại cổ phần
        { code: 'TECHCOMBANK', name: 'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)' },
        { code: 'MBBANK', name: 'Ngân hàng TMCP Quân đội (MB Bank)' },
        { code: 'ACB', name: 'Ngân hàng TMCP Á Châu (ACB)' },
        { code: 'SACOMBANK', name: 'Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)' },
        { code: 'VPBANK', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)' },
        { code: 'SCB', name: 'Ngân hàng TMCP Sài Gòn (SCB)' },
        { code: 'DONGABANK', name: 'Ngân hàng TMCP Đông Á (DongA Bank)' },
        { code: 'TPBANK', name: 'Ngân hàng TMCP Tiên Phong (TPBank)' },
        { code: 'MSB', name: 'Ngân hàng TMCP Hàng Hải Việt Nam (MSB)' },
        { code: 'VIB', name: 'Ngân hàng TMCP Quốc tế Việt Nam (VIB)' },
        { code: 'NAMABANK', name: 'Ngân hàng TMCP Nam Á (Nam A Bank)' },
        { code: 'VIETCAPITALBANK', name: 'Ngân hàng TMCP Bản Việt (Viet Capital Bank)' },
        { code: 'BACABANK', name: 'Ngân hàng TMCP Bắc Á (Bac A Bank)' },
        { code: 'SHB', name: 'Ngân hàng TMCP Sài Gòn Hà Nội (SHB)' },
        { code: 'ABBANK', name: 'Ngân hàng TMCP An Bình (ABBANK)' },
        { code: 'OCB', name: 'Ngân hàng TMCP Phương Đông (OCB)' },
        { code: 'KIENLONGBANK', name: 'Ngân hàng TMCP Kiên Long (Kienlongbank)' },
        { code: 'BAOVIETBANK', name: 'Ngân hàng TMCP Bảo Việt (BaoViet Bank)' },
        { code: 'VIETABANK', name: 'Ngân hàng TMCP Việt Á (VietABank)' },
        { code: 'PGBANK', name: 'Ngân hàng TMCP Xăng dầu Petrolimex (PG Bank)' },
        
        // Ngân hàng 100% vốn nước ngoài
        { code: 'SHINHANBANK', name: 'Shinhan Bank (Hàn Quốc)' },
        { code: 'WOORIBANK', name: 'Woori Bank (Hàn Quốc)' },
        { code: 'HSBC', name: 'HSBC Vietnam (Anh)' },
        { code: 'STANDARD_CHARTERED', name: 'Standard Chartered Vietnam (Anh)' },
        { code: 'ANZ', name: 'ANZ Vietnam (Úc)' },
        { code: 'PUBLIC_BANK', name: 'Public Bank Vietnam (Malaysia)' },
        { code: 'HONG_LEONG', name: 'Hong Leong Bank Vietnam (Malaysia)' },
        { code: 'UOB', name: 'United Overseas Bank (UOB - Singapore)' },
        
        // Ngân hàng liên doanh
        { code: 'VRB', name: 'Ngân hàng Liên doanh Việt - Nga (VRB)' }
    ];

    // Format tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Lấy số dư ví
    const fetchWalletBalance = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders/wallet-balance`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setWalletBalance(response.data.balance);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            setMessage('Không thể lấy thông tin số dư ví');
            setMessageType('error');
        }
    };

    useEffect(() => {
        fetchWalletBalance();
    }, []);

    // Xử lý rút tiền
    const handleWithdraw = async (e) => {
        e.preventDefault();
        
        if (isLoading) return;

        // Validate form
        if (!withdrawAmount || !selectedBank || !accountNumber || !accountHolder) {
            setMessage('Vui lòng điền đầy đủ thông tin');
            setMessageType('error');
            return;
        }

        const amount = parseFloat(withdrawAmount);
        if (amount <= 0) {
            setMessage('Số tiền rút phải lớn hơn 0');
            setMessageType('error');
            return;
        }

        if (amount > walletBalance) {
            setMessage('Số tiền rút không được lớn hơn số dư trong ví');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const bankInfo = {
                bankName: vietnameseBanks.find(bank => bank.code === selectedBank)?.name,
                accountNumber: accountNumber,
                accountHolder: accountHolder
            };

            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/orders/withdraw`,
                {
                    amount: amount,
                    bankInfo: bankInfo
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setMessage(`Yêu cầu rút tiền ${formatCurrency(amount)} đã được gửi thành công! Số dư còn lại: ${formatCurrency(response.data.remainingBalance)}`);
                setMessageType('success');
                
                // Reset form
                setWithdrawAmount('');
                setSelectedBank('');
                setAccountNumber('');
                setAccountHolder('');
                
                // Cập nhật số dư
                fetchWalletBalance();
            }
        } catch (error) {
            console.error('Withdraw error:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi rút tiền';
            setMessage(errorMessage);
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="withdraw-page">
            <div className="container">
                <div className="withdraw-header">
                    <h1>Rút tiền từ ví</h1>
                    <div className="wallet-balance">
                        <span className="balance-label">Số dư khả dụng:</span>
                        <span className="balance-amount">{formatCurrency(walletBalance)}</span>
                    </div>
                </div>

                {message && (
                    <div className={`message ${messageType}`}>
                        {message}
                    </div>
                )}

                <form className="withdraw-form" onSubmit={handleWithdraw}>
                    <div className="form-group">
                        <label htmlFor="withdrawAmount">Số tiền muốn rút (VND)</label>
                        <input
                            type="number"
                            id="withdrawAmount"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="Nhập số tiền muốn rút"
                            min="1"
                            max={walletBalance}
                            disabled={isLoading}
                        />
                        {withdrawAmount && (
                            <small className="amount-preview">
                                {formatCurrency(parseFloat(withdrawAmount) || 0)}
                            </small>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="selectedBank">Chọn ngân hàng</label>
                        <select
                            id="selectedBank"
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">-- Chọn ngân hàng --</option>
                            <optgroup label="Ngân hàng thương mại nhà nước">
                                {vietnameseBanks.slice(0, 4).map(bank => (
                                    <option key={bank.code} value={bank.code}>
                                        {bank.name}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="Ngân hàng thương mại cổ phần">
                                {vietnameseBanks.slice(4, 24).map(bank => (
                                    <option key={bank.code} value={bank.code}>
                                        {bank.name}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="Ngân hàng 100% vốn nước ngoài">
                                {vietnameseBanks.slice(24, 32).map(bank => (
                                    <option key={bank.code} value={bank.code}>
                                        {bank.name}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="Ngân hàng liên doanh">
                                {vietnameseBanks.slice(32).map(bank => (
                                    <option key={bank.code} value={bank.code}>
                                        {bank.name}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="accountNumber">Số tài khoản</label>
                        <input
                            type="text"
                            id="accountNumber"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="Nhập số tài khoản ngân hàng"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="accountHolder">Tên chủ tài khoản</label>
                        <input
                            type="text"
                            id="accountHolder"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                            placeholder="Nhập tên chủ tài khoản (đúng như trên thẻ ATM)"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate(-1)}
                            disabled={isLoading}
                        >
                            Quay lại
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || !withdrawAmount || parseFloat(withdrawAmount) > walletBalance}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Rút tiền'}
                        </button>
                    </div>
                </form>

                <div className="withdraw-info">
                    <h3>Lưu ý quan trọng:</h3>
                    <ul>
                        <li>Phí giao dịch bằng với 5% số tiền rút</li>
                        <li>Thời gian xử lý: 1-3 ngày làm việc</li>
                        <li>Kiểm tra kỹ thông tin tài khoản trước khi gửi yêu cầu</li>
                        <li>Tên chủ tài khoản phải chính xác như trên thẻ ATM</li>
                        <li>Liên hệ hỗ trợ nếu có vấn đề với giao dịch</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default WithdrawPage; 