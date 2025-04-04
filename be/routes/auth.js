const express = require('express');
const { register, login } = require('../controllers/authController');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/connectDB');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', (req, res) => res.json({ message: 'Logout successful' }));

// Google OAuth routes - only set up if credentials exist
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Generate JWT token for the user
      const token = jwt.sign(
        { id: req.user.id, userName: req.user.userName },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
      );

      // Kiểm tra xem người dùng đã có userName và password chưa
      if (!req.user.userName || !req.user.password) {
        // Nếu chưa có, chuyển hướng đến trang điền thông tin
        res.redirect(`http://localhost:3000/complete-google-signup?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
      } else {
        // Nếu đã có, chuyển đến trang callback bình thường
        res.redirect(`http://localhost:3000/oauth-callback?token=${token}&user=${JSON.stringify(req.user)}`);
      }
    }
  );

  // Thêm route xử lý hoàn tất đăng ký với Google
  router.post('/complete-google-signup', async (req, res) => {
    try {
      const { userName, password, googleId, email } = req.body;

      // Kiểm tra xem username đã tồn tại chưa
      const checkUserSQL = `SELECT * FROM users WHERE userName = ?`;
      db.query(checkUserSQL, [userName], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
          return res.status(400).json({ error: 'Tên tài khoản đã tồn tại' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cập nhật thông tin người dùng
        const updateSQL = `UPDATE users SET userName = ?, password = ? WHERE googleId = ? AND email = ?`;
        db.query(updateSQL, [userName, hashedPassword, googleId, email], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy tài khoản người dùng' });
          }
          res.json({ message: 'Đăng ký thành công' });
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  });
}

// Facebook OAuth routes - only set up if credentials exist
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  router.get('/facebook', passport.authenticate('facebook', {
    scope: ['email']
  }));

  router.get('/facebook/callback', 
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
      // Generate JWT token for the user
      const token = jwt.sign(
        { id: req.user.id, userName: req.user.userName },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
      );

      // Kiểm tra xem người dùng đã có userName và password chưa
      if (!req.user.userName || !req.user.password) {
        // Nếu chưa có, chuyển hướng đến trang điền thông tin
        res.redirect(`http://localhost:3000/complete-facebook-signup?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
      } else {
        // Nếu đã có, chuyển đến trang callback bình thường
        res.redirect(`http://localhost:3000/oauth-callback?token=${token}&user=${JSON.stringify(req.user)}`);
      }
    }
  );

  // Thêm route xử lý hoàn tất đăng ký với Facebook
  router.post('/complete-facebook-signup', async (req, res) => {
    try {
      const { userName, password, facebookId, email } = req.body;

      // Kiểm tra xem username đã tồn tại chưa
      const checkUserSQL = `SELECT * FROM users WHERE userName = ?`;
      db.query(checkUserSQL, [userName], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
          return res.status(400).json({ error: 'Tên tài khoản đã tồn tại' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cập nhật thông tin người dùng
        const updateSQL = `UPDATE users SET userName = ?, password = ? WHERE facebookId = ? AND email = ?`;
        db.query(updateSQL, [userName, hashedPassword, facebookId, email], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy tài khoản người dùng' });
          }
          res.json({ message: 'Đăng ký thành công' });
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  });
}

module.exports = router;