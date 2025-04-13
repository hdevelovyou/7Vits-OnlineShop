const express = require("express");
const router = express.Router();
const db = require('../config/connectDB');
const commentController = require("../controllers/commentController");

// Lấy bình luận theo product_ids
router.get('/:productId', (req, res) => {
    const { productId } = req.params;

    const sql = `
        SELECT c.*, u.userName 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.product_id = ? 
        ORDER BY c.created_at ASC
    `;

    db.query(sql, [productId], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        // Tạo cấu trúc lồng cha - con
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
    });
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

//tra loi binh luan 
router.post("/reply", (req, res) => {
    const { userId, commentId, content } = req.body;

    if (!userId || !commentId || !content) {
        return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    db.query("SELECT * FROM comments WHERE id = ?", [commentId], (err, comment) => {
        if (err) {
            console.error("❌ Lỗi MySQL:", err);
            return res.status(500).json({ error: "Lỗi khi kiểm tra comment cha" });
        }

        if (comment.length === 0) {
            return res.status(404).json({ error: "Comment cha không tồn tại" });
        }

        const parentComment = comment[0];
        const productId = parentComment.product_id;

        // Insert reply
        db.query(
            "INSERT INTO comments (user_id, product_id, content, parent_id) VALUES (?, ?, ?, ?)",
            [userId, productId, content, commentId],
            (err, result) => {
                if (err) {
                    console.error("❌ Lỗi MySQL khi thêm reply:", err);
                    return res.status(500).json({ error: "Lỗi khi thêm reply" });
                }

                res.status(200).json({ message: "Đã thêm trả lời bình luận" });
            }
        );
    });
});




module.exports = router;
