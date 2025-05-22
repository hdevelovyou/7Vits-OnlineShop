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
            'INSERT INTO messages (sender_id, receiver_id, message, is_read) VALUES (?, ?, ?, ?)',
            [sender_id, receiver_id, message, false]
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
            'SELECT m.id, m.sender_id, m.receiver_id, m.message, m.created_at, u.userName as senderUserName, u2.userName as receiverUserName ' +
            'FROM messages m ' +
            'JOIN users u ON m.sender_id = u.id ' +
            'JOIN users u2 ON m.receiver_id = u2.id ' +
            'WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?) ' +
            'ORDER BY m.created_at ASC',
            [sender_id, receiver_id, receiver_id, sender_id]
        );

        // Trả về kết quả
        return res.status(200).json({ messages: rows });
    } catch (err) {
        console.error('Lỗi khi lấy tin nhắn:', err);
        return res.status(500).json({ error: 'Lỗi hệ thống. Vui lòng thử lại sau!' });
    }
}

// Hàm lấy danh sách các cuộc trò chuyện
async function getConversations(req, res) {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'Thiếu thông tin người dùng!' });
    }

    try {
        // Lấy danh sách người dùng đã chat với và tin nhắn cuối cùng
        const [rows] = await db.query(
            `SELECT DISTINCT 
                u.id,
                u.userName, 
                u.avatarUrl,
                (
                    SELECT message 
                    FROM messages 
                    WHERE (sender_id = ? AND receiver_id = u.id) 
                    OR (sender_id = u.id AND receiver_id = ?)
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) as lastMessage,
                (
                    SELECT created_at 
                    FROM messages 
                    WHERE (sender_id = ? AND receiver_id = u.id) 
                    OR (sender_id = u.id AND receiver_id = ?)
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) as lastMessageTime,
                (
                    SELECT COUNT(*)
                    FROM messages
                    WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0
                ) as unreadCount
            FROM users u
            INNER JOIN messages m ON (m.sender_id = ? AND m.receiver_id = u.id) 
            OR (m.sender_id = u.id AND m.receiver_id = ?)
            WHERE u.id != ?
            GROUP BY u.id
            ORDER BY lastMessageTime DESC`,
            [userId, userId, userId, userId, userId, userId, userId, userId]
        );

        return res.status(200).json({ conversations: rows });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách cuộc trò chuyện:', err);
        return res.status(500).json({ error: 'Lỗi hệ thống. Vui lòng thử lại sau!' });
    }
}

// Hàm lưu tin nhắn khi nhận từ Socket.IO
async function saveSocketMessage(sender_id, receiver_id, message) {
    try {
        // Lưu tin nhắn vào cơ sở dữ liệu khi nhận tin nhắn qua Socket.IO
        await db.query(
            'INSERT INTO messages (sender_id, receiver_id, message, is_read) VALUES (?, ?, ?, ?)',
            [sender_id, receiver_id, message, false]
        );
        console.log('Tin nhắn đã được lưu vào cơ sở dữ liệu từ Socket.IO');
    } catch (err) {
        console.error('Lỗi khi lưu tin nhắn từ Socket.IO:', err);
    }
}

// Hàm đánh dấu tin nhắn là đã đọc
async function markMessagesAsRead(req, res) {
    const { sender_id, receiver_id } = req.body;

    if (!sender_id || !receiver_id) {
        return res.status(400).json({ error: 'Thiếu sender_id hoặc receiver_id!' });
    }

    try {
        await db.query(
            'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
            [sender_id, receiver_id]
        );

        return res.status(200).json({ message: 'Đã đánh dấu tin nhắn là đã đọc' });
    } catch (err) {
        console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', err);
        return res.status(500).json({ error: 'Lỗi hệ thống khi đánh dấu đã đọc!' });
    }
}

async function getUnreadCounts(req, res) {
    const userId = req.params.userId;

    try {
        const [results] = await db.query(
            `SELECT sender_id AS conversationId, COUNT(*) AS unreadCount
             FROM messages
             WHERE receiver_id = ? AND is_read = 0
             GROUP BY sender_id`,
            [userId]
        );

        res.status(200).json(results);
    } catch (err) {
        console.error('Lỗi khi lấy unread count:', err);
        res.status(500).json({ error: 'Lỗi hệ thống khi lấy số tin chưa đọc!' });
    }
}

module.exports = {
    sendMessage,
    getMessages,
    getConversations,
    saveSocketMessage,
    markMessagesAsRead,
    getUnreadCounts
};