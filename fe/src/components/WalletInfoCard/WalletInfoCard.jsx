import React from 'react';
import './WalletInfoCard.scss';

const WalletInfoCard = ({ balance, lockedBalance }) => {
  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="wallet-info-card">
      <div className="balance-section">
        <div className="balance-item">
          <h3>Số dư khả dụng</h3>
          <p className="amount available">{formatCurrency(balance || 0)}</p>
        </div>
        <div className="balance-item">
          <h3>Số dư tạm khóa</h3>
          <p className="amount locked">{formatCurrency(lockedBalance || 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default WalletInfoCard; 