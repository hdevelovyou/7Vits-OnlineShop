const db = require("../config/connectDB"); // file kết nối MySQL

exports.getCommentsByProduct = (req, res) => {
    const productId = req.params.productId;
    const query = `
        SELECT comments.*, users.userName, users.profilePic 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        WHERE product_id = ?
        ORDER BY created_at DESC`;

    db.query(query, [productId], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

exports.addComment = (req, res) => {
    const { user_id, product_id, content } = req.body;
    const query = "INSERT INTO comments (user_id, product_id, content) VALUES (?, ?, ?)";

    db.query(query, [user_id, product_id, content], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ message: "Bình luận thành công" });
    });
};
