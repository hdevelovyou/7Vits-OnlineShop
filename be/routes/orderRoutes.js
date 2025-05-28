const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../controllers/authController');
const { orderController } = require('../controllers/orderController');

// Đặt lại tên các route cho thống nhất
router.post('/create', authMiddleware, orderController.createOrder);
router.post('/confirm/:orderId', authMiddleware, orderController.confirmOrder);
router.post('/reject/:orderId', authMiddleware, orderController.rejectOrder);
router.get('/:orderId/detail', authMiddleware, orderController.getOrderDetails);
router.get('/getOrderHistory', authMiddleware, orderController.getOrderHistory);
router.get('/wallet-balance', authMiddleware, orderController.getWalletBalance);
router.get('/wallet-locked-balance', authMiddleware, orderController.getWalletLockedBalance);
module.exports = router; 