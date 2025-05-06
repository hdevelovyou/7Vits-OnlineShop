const db = require('../config/connectDB');

// Hàm gửi tin nhắn
async function sendMessage(req, res) {
    const { sender_id, receiver_id, message } = req.body;

    if (!sender_id || !receiver_id || !message) {
        return res.status(400).json({ error: 'Thiếu thông tin cần thiết!' });
    }

    try {
        // Lưu tin nhắn vào cơ sở dữ liệu
        await db.query(
            'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
            [sender_id, receiver_id, message]
        );

        // Trả về kết quả thành công
        return res.status(200).json({ message: 'Tin nhắn đã được gửi thành công!' });
    } catch (err) {
        console.error('Lỗi khi gửi tin nhắn:', err);
        return res.status(500).json({ error: 'Lỗi hệ thống. Vui lòng thử lại sau!' });
    }
}

// Hàm lấy tin nhắn của người dùng
async function getMessages(req, res) {
    const { sender_id, receiver_id } = req.params;

    if (!sender_id || !receiver_id) {
        return res.status(400).json({ error: 'Thiếu thông tin người gửi hoặc người nhận!' });
    }

    try {
        // Lấy tin nhắn giữa hai người dùng từ cơ sở dữ liệu
        const [rows] = await db.query(
            'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC',
            [sender_id, receiver_id, receiver_id, sender_id]
        );

        // Trả về kết quả
        return res.status(200).json({ messages: rows });
    } catch (err) {
        console.error('Lỗi khi lấy tin nhắn:', err);
        return res.status(500).json({ error: 'Lỗi hệ thống. Vui lòng thử lại sau!' });
    }
}

// Hàm lưu tin nhắn khi nhận từ Socket.IO
async function saveSocketMessage(sender_id, receiver_id, message) {
    try {
        // Lưu tin nhắn vào cơ sở dữ liệu khi nhận tin nhắn qua Socket.IO
        await db.query(
            'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
            [sender_id, receiver_id, message]
        );
        console.log('Tin nhắn đã được lưu vào cơ sở dữ liệu từ Socket.IO');
    } catch (err) {
        console.error('Lỗi khi lưu tin nhắn từ Socket.IO:', err);
    }
}

module.exports = {
    sendMessage,
    getMessages,
    saveSocketMessage
};