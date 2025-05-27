const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const db = require('../config/connectDB');

router.get('/admin', authenticateToken, isAdmin, (req, res) => {
    res.json({ 
        message: `Welcome ${req.user.userName}`, 
        role: req.user.role 
    });
});

router.get("/dashboard", authenticateToken, isAdmin, async (req, res) => {
    try {
        const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
        const [[{ totalOrders }]] = await db.query('SELECT COUNT(*) AS totalOrders FROM orders');
        const [[{ totalRevenue }]] = await db.query('SELECT IFNULL(SUM(total_amount),0) AS totalRevenue FROM orders WHERE status = "completed"');
        const [[{ totalProducts }]] = await db.query('SELECT COUNT(*) AS totalProducts FROM products');
        const [[{ pendingOrders }]] = await db.query('SELECT COUNT(*) AS pendingOrders FROM orders WHERE status = "pending"');

        res.json({
            totalUsers,
            totalOrders,
            totalRevenue,
            totalProducts,
            pendingOrders,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error!", error: err.message });
    }
});

router.get("/dashboard/revenue-monthly", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        MONTH(created_at) AS month,
        SUM(total_amount) AS revenue
      FROM orders
      WHERE status = 'completed'
      GROUP BY MONTH(created_at)
      ORDER BY MONTH(created_at)
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch revenue stats" });
  }
});

router.get("/dashboard/users-monthly", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        MONTH(createdAt) AS month,
        COUNT(*) AS users
      FROM users
      GROUP BY MONTH(createdAt)
      ORDER BY MONTH(createdAt)
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});



module.exports = router;