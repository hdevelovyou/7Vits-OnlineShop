const passport = require('passport');
const db = require('./connectDB');
require('dotenv').config();

// Initialize passport with only basic functionality
const setupPassport = () => {
  // User serialization and deserialization for sessions
  passport.serializeUser((user, done) => {
    if (!user) {
      console.error('Cannot serialize undefined or null user');
      return done(new Error('User object is undefined or null'));
    }
    
    // Use user.id or user.Id if user.id doesn't exist
    const userId = user.id || user.Id;
    if (userId === undefined) {
      console.error('User object is missing id property:', user);
      return done(new Error('User object is missing id property'));
    }
    
    done(null, userId);
  });
  
  passport.deserializeUser((id, done) => {
    if (id === undefined || id === null) {
      return done(new Error('Invalid user ID during deserialization'));
    }
    
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error("Error deserializing user:", err);
        return done(err);
      }
      
      if (!results || results.length === 0) {
        console.error("No user found with ID:", id);
        return done(null, false);
      }
      
      done(null, results[0]);
    });
  });

  return passport;
};

module.exports = setupPassport();