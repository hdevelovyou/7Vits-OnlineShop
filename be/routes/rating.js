const express = require('express');
const router = express.Router();
const db = require('../config/connectDB');

router.post('/', (req, res) => {
    const { product_id, user_id, rating } = req.body;
    if (!product_id || !user_id || !rating) {
        return res.status(400).json({ error: 'Thiếu dữ liệu.' });
    }

    db.query('INSERT INTO ratings (product_id, user_id, rating) VALUES (?, ?, ?)', 
        [product_id, user_id, rating],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Đã thêm đánh giá!', ratingId: result.insertId });
        }
    );
});

module.exports = router;
