const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

router.get('/admin', authenticateToken, isAdmin, (req, res) => {
    res.json({ 
        message: `Chào admin ${req.user.userName}`, 
        role: req.user.role 
    });
});


module.exports = router;