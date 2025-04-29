const express = require("express");
const router = express.Router();
const db = require('../config/connectDB');

// Lấy bình luận theo product_id
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const sql = `
            SELECT c.*, u.userName 
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.product_id = ? 
            ORDER BY c.created_at ASC
        `;

        const [results] = await db.query(sql, [productId]);

        const commentMap = {};
        const rootComments = [];

        results.forEach(comment => {
            comment.replies = [];
            commentMap[comment.id] = comment;
        });

        results.forEach(comment => {
            if (comment.parent_id) {
                const parent = commentMap[comment.parent_id];
                if (parent) {
                    parent.replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        res.json(rootComments);
    } catch (err) {
        console.error('❌ Lỗi server:', err);
        res.status(500).json({ error: err.message });
    }
});

// Thêm bình luận
router.post('/', async (req, res) => {
    try {
        const { userId: user_id, productId: product_id, content } = req.body;

        const sql = 'INSERT INTO comments (user_id, product_id, content) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [user_id, product_id, content]);

        res.status(201).json({ message: 'Đã thêm bình luận!', commentId: result.insertId });
    } catch (err) {
        console.error('❌ Lỗi server:', err);
        res.status(500).json({ error: err.message });
    }
});

// Trả lời bình luận
router.post('/reply', async (req, res) => {
    try {
        const { userId, commentId, content } = req.body;

        if (!userId || !commentId || !content) {
            return res.status(400).json({ error: "Thiếu dữ liệu" });
        }

        const [comment] = await db.query("SELECT * FROM comments WHERE id = ?", [commentId]);

        if (comment.length === 0) {
            return res.status(404).json({ error: "Comment cha không tồn tại" });
        }

        const parentComment = comment[0];
        const productId = parentComment.product_id;

        const sql = "INSERT INTO comments (user_id, product_id, content, parent_id) VALUES (?, ?, ?, ?)";
        await db.query(sql, [userId, productId, content, commentId]);

        res.status(200).json({ message: "Đã thêm trả lời bình luận" });
    } catch (err) {
        console.error('❌ Lỗi server:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
