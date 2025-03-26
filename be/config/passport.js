const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./connectDB');
const env = require('./enviroment');

// Initialize passport
const setupPassport = () => {
  // Check if Google OAuth credentials are available
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    console.log("Setting up Google OAuth strategy with credentials");
    
    // Set up Google OAuth strategy
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
          scope: ['profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists
            const sql = `SELECT * FROM users WHERE email = ? OR googleId = ?`;
            
            db.query(sql, [profile.emails[0].value, profile.id], async (err, results) => {
              if (err) {
                console.error("Database error during authentication:", err);
                return done(err);
              }
              
              if (results.length > 0) {
                // User exists
                const user = results[0];
                // Make sure user object is valid
                if (!user || typeof user !== 'object') {
                  return done(new Error('Invalid user object'));
                }
                return done(null, user);
              } else {
                // Create a new user
                const names = profile.displayName.split(' ');
                const firstName = names[0];
                const lastName = names.length > 1 ? names[names.length - 1] : '';
                const userName = profile.emails[0].value.split('@')[0] + Math.floor(Math.random() * 1000);
                
                const sql = `INSERT INTO users 
                  (firstName, lastName, userName, email, googleId) 
                  VALUES (?, ?, ?, ?, ?)`;
                
                db.query(
                  sql,
                  [
                    firstName,
                    lastName,
                    userName,
                    profile.emails[0].value,
                    profile.id
                  ],
                  (err, result) => {
                    if (err) {
                      console.error("Error creating new user:", err);
                      return done(err);
                    }
                    
                    // Get the created user
                    db.query(
                      'SELECT * FROM users WHERE id = ?',
                      [result.insertId],
                      (err, userRows) => {
                        if (err) {
                          console.error("Error retrieving created user:", err);
                          return done(err);
                        }
                        
                        if (!userRows || userRows.length === 0) {
                          return done(new Error('User was created but could not be retrieved'));
                        }
                        
                        return done(null, userRows[0]);
                      }
                    );
                  }
                );
              }
            });
          } catch (err) {
            console.error("Unexpected error during authentication:", err);
            return done(err);
          }
        }
      )
    );
  } else {
    console.log("Google OAuth credentials not found in environment configuration");
    console.log("Google OAuth authentication will be disabled");
  }

  // User serialization and deserialization for sessions
  passport.serializeUser((user, done) => {
    if (!user) {
      console.error('Cannot serialize undefined or null user');
      return done(new Error('User object is undefined or null'));
    }
    
    // Sử dụng user.id hoặc user.Id nếu user.id không tồn tại
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