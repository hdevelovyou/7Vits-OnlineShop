const express = require('express');
const router = express.Router();
const db = require('../config/connectDB');
const authmiddleware=require('../middleware/authMiddleware');
async function getRatingStats(productId) {
  const sql = `
    SELECT
      AVG(rating) AS average,
      COUNT(*) AS count
    FROM ratings
    WHERE product_id = ?
  `;

  try {
    const [result] = await db.query(sql, [productId]);
    const row = result[0] || {};
    const rawAverage = row.average;
    const average = rawAverage !== null ? parseFloat(rawAverage).toFixed(1) : 0;

    return {
      average: Number(average),
      count: row.count || 0
    };
  } catch (err) {
    throw err;
  }
}

router.post('/:productId/rating', authmiddleware, 
    async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { rating } = req.body;

  if (!productId || isNaN(productId)) {
    return res.status(400).json({ error: 'productId không hợp lệ.' });
  }
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating (1–5) là bắt buộc.' });
  }

  try {
    const sql = `
      INSERT INTO ratings (product_id, user_id, rating)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        updated_at = CURRENT_TIMESTAMP
    `;
   const [results] = await db.query(sql, [productId, userId, rating]);

    // Lấy thống kê
    const stats = await getRatingStats(productId);

    return res.json({
      success: true,
      ...stats
    });
  } catch (err) {
    console.error('❌ Lỗi trong try/catch:', err);
    return res.status(500).json({ error: 'Lỗi khi lưu đánh giá.' });
  }
});

// GET trung bình và số lượng rating cho 1 product
router.get('/:productId/rating', async (req, res) => {
  const { productId } = req.params;
  const productIdNum = Number(productId);

  if (!productId || isNaN(productIdNum)) {
    return res.status(400).json({ error: 'productId không hợp lệ.' });
  }

  try {
    const sql = `
      SELECT
        AVG(rating) AS average,
        COUNT(*) AS count
      FROM ratings
      WHERE product_id = ?
    `;
    const [results] = await db.query(sql, [productIdNum]);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Không có đánh giá nào.' });
    }

    const row = results[0];
    res.json({
      average: row.average !== null ? parseFloat(row.average).toFixed(1) : 0,
      count: row.count || 0
    });
  } catch (err) {
    console.error('Lỗi khi lấy đánh giá:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});



module.exports = router;
