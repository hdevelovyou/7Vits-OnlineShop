const express = require('express');
const router = express.Router();ire('../controllers/authController');
const passwordController = require('../controllers/passwordResetController');

// Route for requesting a password reset
router.post('/forgot-password', passwordController.requestReset);
router.post('/logout', (req, res) => res.json({ message: 'Logout successful' }));
// Route for resetting password with token
router.post('/reset-password/:resetString', passwordController.resetPassword);module.exports = router;

// Add to your app.js or index.js file
const passwordRoutes = require('./routes/passwordRoutes');

// ...existing code...

app.use('/api', passwordRoutes);