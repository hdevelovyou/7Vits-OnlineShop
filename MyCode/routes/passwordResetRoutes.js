const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordResetController');

// Route for requesting a password reset
router.post('/forgot-password', passwordController.requestReset);

// Route for resetting password with token
router.post('/reset-password/:resetString', passwordController.resetPassword);

module.exports = router;