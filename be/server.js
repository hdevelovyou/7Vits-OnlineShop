const express = require('express');
const session = require('express-session');
const cors = require('cors');
const env = require('./config/enviroment'); // Use the environment config
const passport = require('./config/passport');
const db = require('./config/connectDB');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // For development (use true in production with HTTPS)
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth'));
// Other routes...

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', env: env.GOOGLE_CLIENT_ID ? 'OAuth configured' : 'OAuth not configured' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});