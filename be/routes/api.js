const express = require('express');
const router = express.Router();

// Tạo router cho orders
router.use('/orders', require('./orderRoutes'));

module.exports = router;