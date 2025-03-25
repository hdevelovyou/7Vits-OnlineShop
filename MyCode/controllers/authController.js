const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/connectDB');

// Đăng ký tài khoản
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, userName, email, password } = req.body;

        // Kiểm tra xem user đã tồn tại chưa (email có thể là email hoặc số điện thoại)
        const checkUserSQL = `SELECT * FROM users WHERE userName = ? OR email = ?`;
        db.query(checkUserSQL, [userName, email], async (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) {
                return res.status(400).json({ error: 'Username hoặc Email/SĐT đã tồn tại' });
            }

            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);
            const sql = `INSERT INTO users (firstName, lastName, userName, email, password) VALUES (?, ?, ?, ?, ?)`;

            db.query(sql, [firstName, lastName, userName, email, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Đăng ký thành công' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};

// Đăng nhập (chấp nhận username, email hoặc số điện thoại)
exports.login = (req, res) => {
    const { userName, password } = req.body;
    const sql = `SELECT * FROM users WHERE userName = ? OR email = ?`;

    db.query(sql, [userName, userName], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(400).json({ error : 'Tài khoản không tồn tại' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Mật khẩu không đúng!' });

        // Tạo token JWT
        const token = jwt.sign({ id: user.id, userName: user.userName }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

        res.json({
            message: 'Đăng nhập thành công',
            user: { id: user.id, userName: user.userName, email: user.email },
            token
        });
    });
};

// Middleware xác thực JWT
exports.authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Truy cập bị từ chối' });

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secretkey');
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token không hợp lệ' });
    }
};
