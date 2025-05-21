const express = require('express');
const { register, login } = require('../controllers/authController');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/connectDB');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', (req, res) => res.json({ message: 'Logout successful' }));

// Add a new route to get wallet balance
router.get('/wallet-balance', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const [walletResult] = await db.query(
      'SELECT balance FROM user_wallets WHERE user_id = ?',
      [userId]
    );
    
    if (walletResult.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    res.json({ balance: walletResult[0].balance });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const { authMiddleware } = require('../controllers/authController');

// Route xác minh user dựa trên JWT
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;