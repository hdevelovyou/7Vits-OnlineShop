const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const db = require('../config/connectDB');
const messageController = require('../controllers/messageController');
const getMessagesBetweenUsers = require('../controllers/messageController');

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

router.get("/users", async (req, res) => {
  const [rows] = await db.query("SELECT id, userName, email, firstName, lastName, role, createdAt FROM users");
  res.json(rows);
});
router.get("/users/:id", async (req, res) => {
  const [rows] = await db.query("SELECT userName, firstName, lastName, email, createdAt FROM users WHERE id = ?", [req.params.id]);
  res.json(rows[0]);
});
router.get("/users/:id/products", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM products WHERE seller_id = ?", [req.params.id]);
  res.json(rows);
});
router.get("/users/:id/comments", async (req, res) => {
  const [rows] = await db.query(`
    SELECT 
      comments.id, comments.user_id, comments.product_id, comments.content, comments.created_at,
      products.name AS productName,
      users.userName AS sellerName
    FROM comments
    JOIN products ON comments.product_id = products.id
    JOIN users ON products.seller_id = users.id
    WHERE comments.user_id = ?
    ORDER BY comments.created_at DESC
  `, [req.params.id]);
  console.log(rows);
  res.json(rows);
});
router.delete("/users/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

//Ban/Unban
router.patch("/users/:id/ban", async (req, res) => {
  try {
    await db.query("UPDATE users SET role = 'banned' WHERE role != 'admin' AND id = ? ", [req.params.id]);
    const io = req.app.get('io');
    io.to(`user_${req.params.id}`).emit('force logout', {reason: 'banned'});
    res.json({success: true, message: "This user has been banned."})
  } catch (err) {
    res.status(500).json({error: "Failed to ban user"});
  }
})
router.patch("/users/:id/unban", async (req, res) => {
  try {
    await db.query("UPDATE users SET role = 'user' WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "User has been unbanned." });
  } catch (err) {
    res.status(500).json({ error: "Failed to unban user" });
  }
});

router.get("/users/:id/conversations", messageController.getConversationsOfUser);
router.get("/users/:id/messages/:otherId", messageController.getMessagesBetweenUsers);
router.delete("/users/:id/conversations/:otherId", messageController.deleteConversation);

router.get("/orders", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        o.id AS order_id,
        buyer.userName AS buyer_name,
        seller.userName AS seller_name,
        o.total_amount,
        o.created_at
      FROM orders o
      JOIN users buyer ON o.user_id = buyer.id
      JOIN users seller ON o.seller_id = seller.id
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});
router.delete("/orders/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM orders WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.id AS transaction_id,
        users.userName AS user_name,
        t.amount, t.transaction_type, t.status,
        t.created_at
      FROM transactions t
      JOIN users ON t.user_id = users.id
      ORDER BY t.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});
router.delete("/transactions/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM transactions WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        products.id,
        products.name,
        products.price,
        products.category,
        products.status,
        users.userName AS sellerName
      FROM products
      JOIN users ON products.seller_id = users.id
      ORDER BY products.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
router.delete("/products/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;