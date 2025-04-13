const db = require("../config/connectDB"); // hoặc tùy theo nơi bạn kết nối database

exports.getCommentsByProduct = async (req, res) => {
    const productId = req.params.productId;
    try {
        const [rows] = await db.query(`
            SELECT c.*, u.username 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.product_id = ?
            ORDER BY c.created_at ASC
        `, [productId]);

        // Gom nhóm comment cha và reply
        const parentComments = rows.filter(c => c.parent_id === null);
        const replies = rows.filter(c => c.parent_id !== null);

        const result = parentComments.map(comment => ({
            ...comment,
            replies: replies.filter(reply => reply.parent_id === comment.id)
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy bình luận." });
    }
};

exports.addComment = async (req, res) => {
    const { userId, productId, content } = req.body;
    try {
        await db.query(
            `INSERT INTO comments (user_id, product_id, content) VALUES (?, ?, ?)`,
            [userId, productId, content]
        );
        res.status(201).json({ message: "Đã thêm bình luận" });
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi thêm bình luận." });
    }
};

exports.replyToComment = async (req, res) => {
    const { userId, commentId, content } = req.body;

    try {
        // Lấy product_id từ comment cha
        const [rows] = await db.query(
            `SELECT product_id FROM comments WHERE id = ?`,
            [commentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Comment cha không tồn tại" });
        }

        const productId = rows[0].product_id;

        // Thêm reply
        await db.query(
            `INSERT INTO comments (user_id, product_id, content, parent_id)
             VALUES (?, ?, ?, ?)`,
            [userId, productId, content, commentId]
        );

        res.status(201).json({ message: "Đã thêm trả lời bình luận" });
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi thêm reply" });
    }
};
