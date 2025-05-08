const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { verifyToken } = require('../middleware/authMiddleware');

// Get user wallet
router.get('/balance', verifyToken, walletController.getUserWallet);

// Get transaction history
router.get('/transactions', verifyToken, walletController.getTransactionHistory);

// Create deposit request
router.post('/deposit', verifyToken, walletController.createDepositRequest);

// Process VNPay return (frontend will call this)
router.get('/vnpay-return', walletController.processVnpayReturn);

// VNPay IPN (VNPay server will call this)
router.get('/vnpay-ipn', walletController.processVnpayIpn);

module.exports = router; 