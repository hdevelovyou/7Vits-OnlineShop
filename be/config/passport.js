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
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
      
      if (!email) {
        return done(new Error('Không thể lấy email từ tài khoản Google'), null);
      }

      // First, check if user already exists by email (regardless of authentication method)
      const [existingEmailUsers] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      let user;
      let needsUsername = false;
      
      if (existingEmailUsers.length > 0) {
        // Email already exists in database
        user = existingEmailUsers[0];
        
        // If user doesn't have googleId, add it to their account
        if (!user.googleId) {
          await db.query(
            'UPDATE users SET googleId = ?, displayName = ?, avatarUrl = ? WHERE id = ?',
            [profile.id, profile.displayName || '', 
             profile.photos && profile.photos[0] ? profile.photos[0].value : '', 
             user.id]
          );
          
          // Refresh user data after update
          const [updatedUsers] = await db.query('SELECT * FROM users WHERE id = ?', [user.id]);
          user = updatedUsers[0];
        }
        
        // Check if username exists
        if (!user.userName) {
          needsUsername = true;
        }
      } else {
        // Check if user exists by googleId only (edge case for data migration)
        const [existingGoogleUsers] = await db.query(
          'SELECT * FROM users WHERE googleId = ?',
          [profile.id]
        );
        
        if (existingGoogleUsers.length > 0) {
          // User exists with Google ID but different email (unlikely but possible)
          user = existingGoogleUsers[0];
          
          // Update the email to match Google profile
          await db.query(
            'UPDATE users SET email = ? WHERE id = ?',
            [email, user.id]
          );
          
          // Refresh user data after update
          const [updatedUsers] = await db.query('SELECT * FROM users WHERE id = ?', [user.id]);
          user = updatedUsers[0];
          
          if (!user.userName) {
            needsUsername = true;
          }
        } else {
          // User doesn't exist, create a new user with Google data
          const displayName = profile.displayName || '';
          // Split displayName into firstName and lastName (best effort)
          const nameParts = displayName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
          
          // Insert new user without username
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
          needsUsername = true; // New users always need to set up username
        }
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, userName: user.userName || user.displayName },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '24h' }
      );
      
      // Pass token, user and needsUsername flag to done callback
      done(null, { user, token, needsUsername });
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
