const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('../config/connectDB');
const { authMiddleware } = require('../controllers/authController');
const { profile } = require('console');
const router = express.Router();

const otpStore = {}; // vẫn giữ tạm thời

// forgotPasswordController
const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email là bắt buộc." });
        }

        // Thay vì 'pool', sử dụng 'db' (đối tượng kết nối MySQL bạn đã khai báo)
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Email không tồn tại." });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        otpStore[email] = otp;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Mã OTP của bạn',
            text: `Mã OTP để đặt lại mật khẩu của bạn là: ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "OTP đã được gửi tới email." });
    } catch (error) {
        console.error("Error in forgotPasswordController:", error);
        res.status(500).json({ error: "Lỗi server." });
    }
};

const registerOTPController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email là bắt buộc." });
        }

        // Kiểm tra nếu email đã tồn tại thì không cho đăng ký
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ error: "Email đã tồn tại." });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        otpStore[email] = otp;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Mã OTP đăng ký tài khoản',
            text: `Mã OTP để xác nhận đăng ký tài khoản của bạn là: ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "OTP đăng ký đã được gửi tới email." });
    } catch (error) {
        console.error("Error in registerOTPController:", error);
        res.status(500).json({ error: "Lỗi server." });
    }
};

// verifyOtpController

const verifyOtpController = (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: 'Thiếu email hoặc OTP.' });
    }
    const savedOtp = otpStore[email];
    if (!savedOtp) {
        return res.status(400).json({ message: 'Không tìm thấy OTP.' });
    }
    if (savedOtp !== otp) {
        return res.status(400).json({ message: 'OTP không đúng.' });
    }
    delete otpStore[email];
    res.json({ message: 'Xác thực OTP thành công.' });
};

// resetPasswordController
const resetPasswordController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Thiếu email hoặc mật khẩu." });
        }

        // Thay vì 'pool', sử dụng 'db' (đây là kết nối MySQL bạn đã khai báo)
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Email không tồn tại." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Cập nhật mật khẩu vào cơ sở dữ liệu
        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        res.json({ success: true, message: "Đổi mật khẩu thành công." });
    } catch (error) {
        console.error("Error in resetPasswordController:", error);
        res.status(500).json({ success: false, message: "Lỗi server." });
    }
};

// API cập nhật avatar
router.put('/update-avatar', authMiddleware, async (req, res) => {
    console.log('Body nhận được:', req.body);
    const userId = req.user.id;
    const { avatarUrl } = req.body;
    if (!avatarUrl) {
        return res.status(400).json({ error: 'Thiếu avatarUrl' });
    }
    try {
        await db.query('UPDATE users SET avatarUrl = ? WHERE id = ?', [avatarUrl, userId]);
        res.json({ success: true, avatarUrl });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

//API lấy avatar
router.get('/get-avatar', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await db.query('SELECT userName, firstName, lastName, email, createdAt, avatarUrl FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        // Trả về toàn bộ thông tin user cần thiết
        res.json(rows[0]);
    } catch (err) {
        console.error('Lỗi khi lấy avatar từ DB:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});
router.post("/register-otp", registerOTPController);
router.post("/forgot-password", forgotPasswordController);
router.post("/verify-otp", verifyOtpController);
router.post("/reset-password", resetPasswordController);

module.exports = router;
