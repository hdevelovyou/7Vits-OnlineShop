const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const passport = require('./config/passport');
const db = require('./config/connectDB');
const axios = require('axios');
const { getBestAnswer, searchFaq } = require('./utils/faqUtils');
const productRoutes = require('./routes/productRoutes');
const bodyParser = require("body-parser");
const commentRoutes = require("./routes/comments");
const ratingRoutes = require('./routes/rating');
const nodemailer = require('nodemailer');
const router = express.Router();
const crypto = require('crypto');
const authRouter = require('./routes/authRouter');
const messageController = require('./controllers/messageController');
const { bodyParserMiddleware, urlEncodedMiddleware } = require('./middleware/bodyParser');
const app = express();

// --- SOCKET.IO SETUP ---
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

// Static file serving
app.use('/images', express.static(path.join(__dirname, 'public/images')));
console.log('Serving static files from:', path.join(__dirname, 'public/images'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/auth', require('./routes/auth'));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/comments", commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api', productRoutes);

// Test route for checking if the API is working
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working',
    env: process.env.GOOGLE_CLIENT_ID ? 'OAuth configured' : 'OAuth not configured'
  });
});

// Chat route for handling FAQ and messages
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  const faqResults = searchFaq(message);

  if (faqResults && faqResults.length > 0) {
    const bestMatch = faqResults[0];
    return res.json({
      reply: `Em xin phép trả lời câu hỏi của anh/chị: "${bestMatch.question}"\n\n${bestMatch.answer}\n\nAnh/chị có cần em hỗ trợ thêm thông tin gì không ạ?`
    });
  }

  return res.json({
    reply: "Em xin lỗi, em chưa được đào tạo để trả lời câu hỏi này. Để được hỗ trợ tốt nhất, anh/chị vui lòng liên hệ trực tiếp với chúng tôi qua:\n\n- Hotline: 0839171005\n- Facebook: https://www.facebook.com/caPta1ntynn\n\nCảm ơn anh/chị đã sử dụng dịch vụ của 7VITS."
  });
});

// API endpoint for FAQ search
app.get('/api/faq/search', (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  const results = searchFaq(query);
  res.json({ results });
});

// Test image route for static files
app.get('/test-image/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'public/images/products', filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(404).send('File not found');
    }
  });
});

// Email sending logic with nodemailer
const sendEmail = (email, otp) => {
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

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return { error: "Không thể gửi email" };
    }
    console.log("Email sent: " + info.response);
    return { success: "Email đã được gửi." };
  });
};

// --- SOCKET.IO LOGIC FOR 1-1 CHAT ---
const users = {}; // userId -> socket.id

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('private_message', async ({ sender_id, receiver_id, message }) => {
    console.log(`${sender_id} → ${receiver_id}: ${message}`);

    const receiverSocketId = users[receiver_id];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('private_message', {
        sender_id,
        message,
        created_at: new Date().toISOString()
      });
    }
    // Gọi hàm lưu tin nhắn vào cơ sở dữ liệu
    await messageController.saveSocketMessage(sender_id, receiver_id, message);
    try {
      await db.query(
        'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
        [sender_id, receiver_id, message]
      );
      console.log('Message saved to database');
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, sockId] of Object.entries(users)) {
      if (sockId === socket.id) {
        delete users[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Route gửi tin nhắn
app.post('/api/messages', messageController.sendMessage);

// Route lấy tin nhắn giữa hai người dùng
app.get('/api/messages/:sender_id/:receiver_id', messageController.getMessages);

// Server start
const PORT = process.env.PORT || 5000;
console.log('--- Các route đang được khai báo ---');
app._router.stack.forEach(function (r) {
  if (r.route && r.route.path) {
    console.log(r.route.stack[0].method.toUpperCase(), r.route.path);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Static files served at: http://localhost:${PORT}/images`);
  console.log(`FAQ system loaded and active`);
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
