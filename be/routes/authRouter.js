const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('../config/connectDB');
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


// verifyOtpController giữ nguyên

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

router.post("/forgot-password", forgotPasswordController);
router.post("/verify-otp", verifyOtpController);
router.post("/reset-password", resetPasswordController);



module.exports = router;
