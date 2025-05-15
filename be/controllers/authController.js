const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/connectDB');

// Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { firstName, lastName, userName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !userName || !email || !password) {
      console.log('Missing required fields:', { firstName, lastName, userName, email, password: !!password });
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    console.log('Checking for existing user...');
    try {
      // The db exported from connectDB.js is already a promise pool
      const [results] = await db.query(
        'SELECT * FROM users WHERE userName = ? OR email = ?',
        [userName, email]
      );

      if (results.length > 0) {
        console.log('User already exists');
        return res.status(400).json({ error: 'Username hoặc Email/SĐT đã tồn tại' });
      }

      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      console.log('Inserting new user...');
      await db.query(
        'INSERT INTO users (firstName, lastName, userName, email, password) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, userName, email, hashedPassword]
      );
      
      console.log('User registered successfully');
      res.json({ message: 'Đăng ký thành công' });
    } catch (dbErr) {
      console.error('Database error:', dbErr);
      return res.status(500).json({ error: 'Lỗi cơ sở dữ liệu: ' + dbErr.message });
    }
  } catch (err) {
    console.error('Unexpected error during registration:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng ký' });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    const [results] = await db.query(
      'SELECT * FROM users WHERE userName = ? OR email = ?',
      [userName, userName]
    );

    if (results.length === 0) {
      return res.status(400).json({ error: 'Tài khoản không tồn tại' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Mật khẩu không đúng!' });
    }

    const token = jwt.sign(
      { id: user.id, userName: user.userName },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        userName: user.userName,
        firstName: user.firstName, // Thêm firstName
        lastName: user.lastName,   // Thêm lastName
        email: user.email,
        createdAt: user.createdAt,
        avatarUrl: user.avatarUrl || '', // Thêm avatarUrl
      },
      token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// Middleware xác thực JWT
exports.authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Truy cập bị từ chối' });

  jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secretkey', (err, verified) => {
    if (err) {
      return res.status(400).json({ error: 'Token không hợp lệ' });
    }

    req.user = verified;
    next();
  });
};
