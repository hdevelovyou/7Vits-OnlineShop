const express = require('express');
const { register, login } = require('../controllers/authController');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const env = require('../config/enviroment'); // Import environment
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', (req, res) => res.json({ message: 'Logout successful' }));

// Google OAuth routes - only set up if credentials exist
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Generate JWT token for the user
      const token = jwt.sign(
        { id: req.user.id, userName: req.user.userName },
        env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
      );

      // For development: redirect to frontend with token as query param
      res.redirect(`http://localhost:3000/oauth-callback?token=${token}&user=${JSON.stringify(req.user)}`);
    }
  );
}

module.exports = router;