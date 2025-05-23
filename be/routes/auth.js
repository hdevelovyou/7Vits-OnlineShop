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

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login`,
    session: false
  }),
  (req, res) => {
    try {
      // Authentication successful, redirect to frontend with token
      const { user, token } = req.user;
      
      // Redirect to frontend with token and user data
      const userDataParam = encodeURIComponent(JSON.stringify({
        id: user.id,
        userName: user.userName || user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        token: token
      }));
      
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/social?userData=${userDataParam}`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  }
);

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