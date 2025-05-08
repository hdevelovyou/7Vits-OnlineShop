const Wallet = require('../models/wallet');
const VNPayUtil = require('../utils/vnpayUtil');
const jwt = require('jsonwebtoken');

// Get user wallet
exports.getUserWallet = async (req, res) => {
    try {
        const userId = req.user.id;
        const wallet = await Wallet.getUserWallet(userId);
        
        return res.status(200).json({
            success: true,
            data: wallet
        });
    } catch (error) {
        console.error('Error getting user wallet:', error);
        return res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi truy vấn ví. Vui lòng thử lại sau.'
        });
    }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Wallet.getUserTransactions(userId);
        
        return res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Error getting transaction history:', error);
        return res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi truy vấn lịch sử giao dịch. Vui lòng thử lại sau.'
        });
    }
};

// Create deposit request with VNPay
exports.createDepositRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;
        
        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền nạp không hợp lệ. Vui lòng nhập số tiền lớn hơn 0.'
            });
        }
        
        // Create transaction record
        const transaction = await Wallet.createTransaction({
            user_id: userId,
            amount: amount,
            type: 'deposit',
            status: 'pending',
            payment_method: 'vnpay',
            description: `Nạp tiền vào ví qua VNPay: ${amount.toLocaleString('vi-VN')} VNĐ`
        });
        
        // Create VNPay payment URL
        const paymentUrl = VNPayUtil.createPaymentUrl({
            amount: amount,
            orderInfo: `Nạp tiền vào ví 7VITS: ${amount.toLocaleString('vi-VN')} VNĐ`,
            orderType: '100000', // Top-up service code
            ipAddr: req.ip || '127.0.0.1',
            returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/wallet/vnpay-return?transactionId=${transaction.id}`
        });
        
        return res.status(200).json({
            success: true,
            data: {
                transaction,
                paymentUrl
            }
        });
    } catch (error) {
        console.error('Error creating deposit request:', error);
        return res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi tạo yêu cầu nạp tiền. Vui lòng thử lại sau.'
        });
    }
};

// Process VNPay return
exports.processVnpayReturn = async (req, res) => {
    try {
        const vnpParams = req.query;
        const transactionId = vnpParams.transactionId;
        
        // Verify VNPay return data
        const isValidSignature = VNPayUtil.verifyReturnUrl(vnpParams);
        
        if (!isValidSignature) {
            console.error('Invalid VNPay signature');
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ. Giao dịch có thể đã bị can thiệp.'
            });
        }
        
        // Check payment status
        const responseCode = vnpParams.vnp_ResponseCode;
        const transactionStatus = responseCode === '00' ? 'completed' : 'failed';
        
        // Update transaction status
        const transaction = await Wallet.updateTransactionStatus(transactionId, transactionStatus);
        
        // If payment successful, update wallet balance
        if (transactionStatus === 'completed') {
            await Wallet.updateWalletBalance(transaction.user_id, transaction.amount);
        }
        
        return res.status(200).json({
            success: true,
            data: {
                transaction,
                paymentStatus: transactionStatus === 'completed' ? 'success' : 'failed',
                message: transactionStatus === 'completed' 
                    ? 'Nạp tiền thành công! Số dư đã được cập nhật.' 
                    : 'Giao dịch thất bại hoặc bị hủy bởi người dùng.'
            }
        });
    } catch (error) {
        console.error('Error processing VNPay return:', error);
        return res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán. Vui lòng kiểm tra lại sau.'
        });
    }
};

// VNPay IPN (Instant Payment Notification)
exports.processVnpayIpn = async (req, res) => {
    try {
        const vnpParams = req.query;
        
        // Verify VNPay IPN data
        const isValidSignature = VNPayUtil.verifyReturnUrl(vnpParams);
        
        if (!isValidSignature) {
            console.error('Invalid VNPay IPN signature');
            return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
        }
        
        // Get transaction info from VNPay data
        const txnRef = vnpParams.vnp_TxnRef;
        const responseCode = vnpParams.vnp_ResponseCode;
        const transactionNo = vnpParams.vnp_TransactionNo;
        
        // Find the transaction in our database
        const [transactions] = await db.query(
            'SELECT * FROM transactions WHERE reference_id = ?',
            [txnRef]
        );
        
        if (transactions.length === 0) {
            return res.status(200).json({ RspCode: '01', Message: 'Transaction not found' });
        }
        
        const transaction = transactions[0];
        
        // Check if transaction already processed
        if (transaction.status !== 'pending') {
            return res.status(200).json({ RspCode: '02', Message: 'Transaction already processed' });
        }
        
        // Update transaction status based on VNPay response
        const transactionStatus = responseCode === '00' ? 'completed' : 'failed';
        
        // Update transaction status and reference
        await db.query(
            'UPDATE transactions SET status = ?, reference_id = ? WHERE id = ?',
            [transactionStatus, transactionNo, transaction.id]
        );
        
        // If payment successful, update wallet balance
        if (transactionStatus === 'completed') {
            await Wallet.updateWalletBalance(transaction.user_id, transaction.amount);
        }
        
        return res.status(200).json({ RspCode: '00', Message: 'Success' });
    } catch (error) {
        console.error('Error processing VNPay IPN:', error);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
}; 