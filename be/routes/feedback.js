const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/connectDB');
const authMiddleware = require('../middleware/authMiddleware');
const { route } = require('./auctionRoutes');

module.exports=(io)=>{
     const router = express.Router();
    router.post('/', authMiddleware, async (req, res) => {
        const errors = validationResult(req);
    
        if (!errors.isEmpty) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { message } = req.body;
            const userId = req.user ? req.user.id : null;
            const [result] = await db.query(
                `INSERT INTO feedbacks (user_id, message)
             VALUES (?, ?)`,
                [userId, message]
            );
            
            const [[newFeedback]] = await db.query(
                `SELECT f.id, f.user_id, u.userName AS user_name, f.message, f.created_at
           FROM feedbacks f
           LEFT JOIN users u ON f.user_id = u.id
           WHERE f.id = ?`,
                [result.insertId]
            );
    
            io.emit('new_feedback', newFeedback);
            return res.status(201).json({
                success: true,
                feedbackId: newFeedback,
                message: 'Cảm ơn bạn đã gửi phản hồi!'
            });
        }
        catch (err) {
            console.error("Lỗi khi tạo feedback", err);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    });
    
    
    router.get('/', async (req, res) => {
        try {
            const [row] = await db.query(`
          SELECT f.id, f.user_id, u.userName AS user_name, f.message, f.created_at
          FROM feedbacks f
          LEFT JOIN users u ON f.user_id = u.id
          ORDER BY f.created_at DESC
        `)
            return res.json(row);
        } catch (err) {
            console.error("Lõi khi lấy feed back", err);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    
    })
    return router;
}
