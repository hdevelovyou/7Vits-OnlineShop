const express = require("express");
const router = express.Router();
const db = require('../config/connectDB');

// Lấy bình luận theo product_id
router.get('/:productId', (req, res) => {
    const { productId } = req.params;
    db.query(
        'SELECT comments.*, users.userName FROM comments JOIN users ON comments.user_id = users.id WHERE product_id = ? ORDER BY created_at DESC',
        [productId],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        }
    );
});

// Thêm bình luận
router.post('/', (req, res) => {
    const { userId: user_id, productId: product_id, content } = req.body;

    db.query(
        'INSERT INTO comments (user_id, product_id, content) VALUES (?, ?, ?)',
        [user_id, product_id, content],
        (err, result) => {
            if (err) {
                console.error('❌ Lỗi SQL:', err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Đã thêm bình luận!', commentId: result.insertId });
        }
    );
});

module.exports = router;
