const express = require('express');
const router = express.Router();
const db = require('../config/connectDB');
const authMiddleware = require('../middleware/authMiddleware');

async function getSellerRatingStats(sellerId) {
  const sql = `
    SELECT AVG(rating) AS average, COUNT(*) AS count
    FROM seller_ratings
    WHERE seller_id = ?
  `;
  const [rows] = await db.query(sql, [sellerId]);
  const row = rows[0] || {};
  const avg = row.average;
  const count = row.count || 0;

  const average = avg !== null && avg !== undefined ? Number(parseFloat(avg).toFixed(1)) : 0;

  return { average, count };
}
router.get('/ratings', async (req, res) => {
  const ids = req.query.ids?.split(',').map(Number).filter(id => !isNaN(id));
  if (!ids || ids.length === 0) {
    return res.status(400).json({ error: 'Danh sách sellerId không hợp lệ' });
  }

  const placeholders = ids.map(() => '?').join(',');
  const sql = `
    SELECT seller_id, AVG(rating) AS average, COUNT(*) AS count
    FROM seller_ratings
    WHERE seller_id IN (${placeholders})
    GROUP BY seller_id
  `;

  try {
    const [rows] = await db.query(sql, ids);
    const result = {};

    for (const row of rows) {
      result[row.seller_id] = {
        average: row.average !== null ? Number(parseFloat(row.average).toFixed(1)) : 0,
        count: row.count || 0
      };
    }

    // Bổ sung seller không có rating
    ids.forEach(id => {
      if (!result[id]) {
        result[id] = { average: 0, count: 0 };
      }
    });

    return res.json(result);
  } catch (err) {
    console.error('Lỗi khi lấy nhiều seller ratings:', err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/sellers/:sellerId/rating - người dùng đánh giá người bán
router.post('/:sellerId/rating', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { sellerId } = req.params;
  const { rating } = req.body;

  if (!sellerId || isNaN(sellerId)) {
    return res.status(400).json({ error: 'sellerId không hợp lệ.' });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating phải từ 1 đến 5.' });
  }

  try {
    const sql = `
      INSERT INTO seller_ratings (seller_id, user_id, rating)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        updated_at = CURRENT_TIMESTAMP
    `;
    await db.query(sql, [sellerId, userId, rating]);

    const stats = await getSellerRatingStats(sellerId);

    return res.json({ success: true, ...stats });
  } catch (err) {
    console.error('❌ Lỗi khi lưu đánh giá người bán:', err);
    return res.status(500).json({ error: 'Lỗi server khi đánh giá.' });
  }
});

// GET /api/sellers/:sellerId/rating - lấy điểm trung bình + lượt
router.get('/:sellerId/rating', async (req, res) => {
  const { sellerId } = req.params;

  if (!sellerId || isNaN(sellerId)) {
    return res.status(400).json({ error: 'sellerId không hợp lệ.' });
  }

  try {
    const stats = await getSellerRatingStats(sellerId);
    return res.json(stats);
  } catch (err) {
    console.error('❌ Lỗi khi lấy rating người bán:', err);
    return res.status(500).json({ error: 'Lỗi server.' });
  }
});

module.exports = router;
