// routes/auctionRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/connectDB');
const { body, validationResult } = require('express-validator');
router.get('/finished', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, u.userName AS winner_name
      FROM auctions a
      LEFT JOIN users u ON a.winner_id = u.id
      WHERE a.status = 'finished'
      ORDER BY a.end_time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách auctions đã kết thúc:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

/**
 * 1) GET /api/auctions
 *    Trả về danh sách các phiên đấu giá (public).
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         id, 
         item_name, 
         description, 
         starting_price, 
         current_bid, 
         start_time, 
         end_time, 
         status, 
         seller_id 
       FROM auctions
       ORDER BY end_time ASC`
    );
    return res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách phiên đấu giá:', err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
});

/**
 * 2) GET /api/auctions/:id
 *    Trả về chi tiết một phiên đấu giá (public).
 */
router.get('/:id', async (req, res) => {
  try {
    const auctionId = req.params.id;
    const [rows] = await db.query(`
      SELECT a.*, u.userName AS winner_name
      FROM auctions a
      LEFT JOIN users u ON a.winner_id = u.id
      WHERE a.id = ?
    `, [auctionId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy auction.' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error('Lỗi khi lấy auction theo id:', error);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
});
// GET /api/auctions/finished


router.post(
  '/',
  [
    body('item_name').notEmpty().withMessage('Tên sản phẩm không được để trống.'),
    body('description').optional().isString(),
    body('starting_price').isFloat({ gt: 0 }).withMessage('Giá khởi điểm phải lớn hơn 0.'),
    body('end_time').isISO8601().withMessage('end_time phải là định dạng ISO8601.'),
    body('sellerId').notEmpty().withMessage('sellerId (userId) phải được cung cấp.'),

  ],
  async (req, res) => {
    // 1) Kiểm validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 2) Lấy dữ liệu từ body
    const { item_name, description, starting_price, end_time, sellerId} = req.body;

    // 3) Kiểm thời gian hợp lệ
    const now = new Date();
    const endTimeObj = new Date(end_time);
    if (endTimeObj <= now) {
      return res.status(400).json({ message: 'Thời gian kết thúc phải lớn hơn thời gian hiện tại.' });
    }

    try {
      // 4) Chèn vào bảng auctions (không có image_url)
      const [result] = await db.query(
        `INSERT INTO auctions 
         (item_name, description, starting_price, current_bid, start_time, end_time, status, seller_id) 
         VALUES (?, ?, ?, ?, ?, ?, 'ongoing', ?)`,
        [
          item_name,
          description || null,
          starting_price,
          starting_price,   // current_bid = starting_price
          now,
          end_time,
          sellerId
        ]
      );

      const newAuctionId = result.insertId;

      // 5) Trả về chi tiết phiên vừa tạo
      const [rows] = await db.query('SELECT * FROM auctions WHERE id = ?', [newAuctionId]);
      return res.status(201).json({ auction: rows[0] });
    } catch (err) {
      console.error('❌ Lỗi khi tạo auction:', err);
      return res.status(500).json({ message: 'Lỗi server. Vui lòng thử lại sau.' });
    }
  }
);

/**
 * 4) GET /api/auctions/:id/bids
 *    Lấy lịch sử bid (public).
 */
router.get('/:id/bids', async (req, res) => {
  try {
    const auctionId = req.params.id;
    const [rows] = await db.query(
      `SELECT b.id, b.auction_id, b.bidder_id, b.amount, b.timestamp, u.userName
       FROM bids b
       LEFT JOIN users u ON b.bidder_id = u.id
       WHERE b.auction_id = ?
       ORDER BY b.amount DESC`,
      [auctionId]
    );
    return res.json(rows);
  } catch (error) {
    console.error('❌ Lỗi khi lấy lịch sử bid:', error);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
});

module.exports = router;
