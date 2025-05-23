const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./connectDB');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists in database
      const [existingUsers] = await db.query(
        'SELECT * FROM users WHERE googleId = ?',
        [profile.id]
      );
      
      let user;
      
      if (existingUsers.length > 0) {
        // User already exists, return the user
        user = existingUsers[0];
      } else {
        // User doesn't exist, create a new user
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        const displayName = profile.displayName || '';
        // Split displayName into firstName and lastName (best effort)
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
        
        // Insert new user
        const [result] = await db.query(
          'INSERT INTO users (googleId, email, firstName, lastName, displayName, avatarUrl) VALUES (?, ?, ?, ?, ?, ?)',
          [profile.id, email, firstName, lastName, displayName, avatarUrl]
        );
        
        const userId = result.insertId;
        
        // Create wallet for new user
        await db.query(
          'INSERT INTO user_wallets (user_id, balance) VALUES (?, 0)',
          [userId]
        );
        
        // Get the newly created user
        const [newUsers] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        user = newUsers[0];
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, userName: user.userName || user.displayName },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '24h' }
      );
      
      // Pass token and user to done callback
      done(null, { user, token });
    } catch (err) {
      console.error('Error in Google auth strategy:', err);
      done(err, null);
    }
  }
));

passport.serializeUser((userObject, done) => {
  done(null, userObject);
});

passport.deserializeUser((userObject, done) => {
  done(null, userObject);
});

module.exports = passport;
