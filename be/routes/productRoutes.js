const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware } = require('../controllers/authController');

// Public routes
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.get('/products/seller/:sellerId', productController.getProductsBySeller);

// Protected routes - require authentication
router.post('/products', authMiddleware, productController.createProduct);
router.put('/products/:id', authMiddleware, productController.updateProduct);
router.delete('/products/:id', authMiddleware, productController.deleteProduct);
router.get('/my-products', authMiddleware, productController.getMyProducts);

module.exports = router;