import React, { useEffect, useState } from 'react';
import { walletAPI } from '../../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import './style.scss';

const WalletPage = () => {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const [balanceResponse, transactionsResponse] = await Promise.all([
                walletAPI.getBalance(),
                walletAPI.getTransactions()
            ]);

            setWallet(balanceResponse.data.data);
            setTransactions(transactionsResponse.data.data);
            setError(null);
        } catch (error) {
            console.error("Error fetching wallet data:", error);
            setError("Không thể tải thông tin ví. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = () => {
        navigate('/nap-tien');
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return <span className="status pending">Đang xử lý</span>;
            case 'completed':
                return <span className="status completed">Thành công</span>;
            case 'failed':
                return <span className="status failed">Thất bại</span>;
            case 'cancelled':
                return <span className="status cancelled">Đã hủy</span>;
            default:
                return <span className="status">{status}</span>;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'deposit':
                return 'Nạp tiền';
            case 'withdraw':
                return 'Rút tiền';
            case 'purchase':
                return 'Mua hàng';
            case 'refund':
                return 'Hoàn tiền';
            case 'sell':
                return 'Bán hàng';
            default:
                return type;
        }
    };

    if (loading) {
        return (
            <div className="wallet-page">
                <div className="loading">Đang tải thông tin ví...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="wallet-page">
                <div className="error-message">{error}</div>
                <button onClick={fetchWalletData} className="retry-button">
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="wallet-page">
            <div className="wallet-header">
                <h1>Ví Tiền Của Tôi</h1>
                <div className="wallet-balance">
                    <h2>Số dư hiện tại</h2>
                    <div className="balance-amount">
                        {wallet ? formatCurrency(wallet.balance) : '0 VNĐ'}
                    </div>
                    <button onClick={handleDeposit} className="deposit-button">
                        Nạp Tiền
                    </button>
                </div>
            </div>

            <div className="wallet-transactions">
                <h2>Lịch sử giao dịch</h2>
                {transactions.length === 0 ? (
                    <div className="no-transactions">
                        Bạn chưa có giao dịch nào. Hãy nạp tiền vào ví để bắt đầu mua sắm!
                    </div>
                ) : (
                    <div className="transactions-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ngày</th>
                                    <th>Loại</th>
                                    <th>Mô tả</th>
                                    <th>Số tiền</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>{formatDate(transaction.created_at)}</td>
                                        <td>{getTypeLabel(transaction.type)}</td>
                                        <td>{transaction.description}</td>
                                        <td className={transaction.type === 'deposit' || transaction.type === 'refund' || transaction.type === 'sell' ? 'amount-positive' : 'amount-negative'}>
                                            {transaction.type === 'deposit' || transaction.type === 'refund' || transaction.type === 'sell' 
                                                ? '+ ' + formatCurrency(transaction.amount)
                                                : '- ' + formatCurrency(transaction.amount)
                                            }
                                        </td>
                                        <td>{getStatusLabel(transaction.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WalletPage; 