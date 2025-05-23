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
      // Authentication successful
      const { user, token, needsUsername } = req.user;
      
      if (needsUsername) {
        // User needs to set up username and password
        // Create a temporary token for setup page
        const setupToken = jwt.sign(
          { id: user.id, googleId: user.googleId, needsSetup: true },
          process.env.JWT_SECRET || 'secretkey',
          { expiresIn: '1h' } // Short expiration time for setup
        );
        
        // Redirect to username setup page with setupToken
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/setup-account?token=${setupToken}`);
      } else {
        // User already has username, proceed with normal login
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
      }
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  }
);

// Setup account route for Google auth users
router.post('/setup-account', async (req, res) => {
  try {
    const { setupToken, userName, password } = req.body;
    
    if (!setupToken || !userName || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify setup token
    const decoded = jwt.verify(setupToken, process.env.JWT_SECRET || 'secretkey');
    
    if (!decoded.needsSetup) {
      return res.status(400).json({ error: 'Invalid setup token' });
    }
    
    // Check if username already exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE userName = ?',
      [userName]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Tên người dùng đã tồn tại' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user with username and password
    await db.query(
      'UPDATE users SET userName = ?, password = ? WHERE id = ?',
      [userName, hashedPassword, decoded.id]
    );
    
    // Get updated user info
    const [updatedUsers] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    
    if (updatedUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = updatedUsers[0];
    
    // Generate new token
    const token = jwt.sign(
      { id: user.id, userName: user.userName },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Account setup successful',
      user: {
        id: user.id,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
      },
      token
    });
  } catch (error) {
    console.error('Error in setup account:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

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