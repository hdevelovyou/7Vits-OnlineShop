const express = require('express');
const cron = require('node-cron');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const passport = require('./config/passport');
const db = require('./config/connectDB');
const axios = require('axios');
const productRoutes = require('./routes/productRoutes');
const commentRoutes = require("./routes/comments");
const ratingRoutes = require('./routes/rating');
const nodemailer = require('nodemailer');
const router = express.Router();
const crypto = require('crypto');
const authRouter = require('./routes/authRouter');
const messageController = require('./controllers/messageController');
const { bodyParserMiddleware, urlEncodedMiddleware } = require('./middleware/bodyParser');
const vnpayRoutes = require('./routes/vnpay_routes');
const adminRouter = require('./routes/admin');
const bodyParser = require('body-parser');
const chatbotRoutes = require('./routes/chatbot');
const auctionRoutes = require('./routes/auctionRoutes');

const app = express();

// --- SOCKET.IO SETUP ---
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);

// Enhanced CORS Configuration
const allowedOrigins = [
  'https://7vits.id.vn',
  'https://sevenvits-be.onrender.com',
  'https://sevenvits-onlineshop.onrender.com',
  'https://seventvits-onlineshop.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5000',
  'http://14.225.212.12:3000',
  'https://7-vits-online-shop-frontend.vercel.app'
];

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

app.set('io', io);
// Enhanced CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Cho phép request không có origin (như từ Postman hoặc mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

// Additional CORS headers for better compatibility
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  next();
});

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Static file serving
app.use('/images', express.static(path.join(__dirname, 'public/images')));
console.log('Serving static files from:', path.join(__dirname, 'public/images'));

// Session configuration
const sharedSession = require('express-socket.io-session');
const { register } = require('module');

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

app.use(sessionMiddleware); // dùng chung cho Express
io.use(sharedSession(sessionMiddleware, { autoSave: true })); // dùng chung cho Socket.IO

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Router
app.use("/api/auth", authRouter);
app.use("/api/comments", commentRoutes);
app.use('/api', productRoutes);
app.use('/api/sellers', ratingRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/topup', vnpayRoutes);
app.use('/api', require('./routes/api'));
app.post('/api/messages/read', messageController.markMessagesAsRead);
app.get('/api/messages/unread-counts/:userId', messageController.getUnreadCounts);
app.use('/api/admin', adminRouter);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/auctions', auctionRoutes);
const feedback = require('./routes/feedback')(io);

app.use('/api/feedback',feedback);
// Test route for checking if the API is working

app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Email sending logic with nodemailer
const sendEmail = (email, otp) => {
  const transporter = nodemailer.createTransporter({
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

function broadcastOnlineUsers() {
  const onlineUserIds = Object.keys(users);
  io.emit('online_users', onlineUserIds);
}

io.on('connection', (socket) => {
  
  socket.on('register_user', (userId) => {
    if(userId) {
      console.log('register_user', userId, 'socket:', socket.id);
      socket.join(`user_${userId}`);
    }
  });

  console.log('New client connected:', socket.id);
  // --- Đóng phiên đấu giá khi hết giờ ---


  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
    broadcastOnlineUsers();
  });
  // Khi client join một phòng (auction)
  socket.on('join_auction', (auctionId) => {
    socket.join(`auction_${auctionId}`);
    console.log(`Socket ${socket.id} joined room auction_${auctionId}`);
  });
  // rời phòng 
  socket.on('leave_auction', (auctionId) => {
    socket.leave(`auction_${auctionId}`);
    console.log(`Socket ${socket.id} left room auction_${auctionId}`);
  });

 socket.on('place_bid', async ({ auctionId, bidderId, amount }) => {
  console.log('[Server] Received place_bid:', { auctionId, bidderId, amount });

  try {
    // Lấy dữ liệu auction từ DB
    const [rows] = await db.query('SELECT id, current_bid, status, end_time FROM auctions WHERE id = ?', [auctionId]);
    const auction = rows[0];
    if (!auction) {
      socket.emit('bid_failed', { message: 'Phiên đấu giá không tồn tại.' });
      return;
    }

    // Kiểm tra trạng thái lẫn thời gian
    const now = new Date();
    const endTime = new Date(auction.end_time);
    if (auction.status !== 'ongoing' || now >= endTime) {
      socket.emit('bid_failed', { message: 'Phiên đấu giá đã kết thúc.' });
      return;
    }

    if (amount <= auction.current_bid) {
      socket.emit('bid_failed', {
        message: `Giá phải cao hơn giá hiện tại (${auction.current_bid.toLocaleString()} VND).`
      });
      return;
    }
    const[walletRow]=await db.query(
      'select balance , locked_balance from user_wallets where user_id=?',
      [bidderId]
    );
    if(walletRow.length===0){
      socket.emit('bid_failed',{message:'Không tìm thấy ví của nguời dùng'});
      return ;
    }
    const {balance,locked_balance}=walletRow[0];
    const avalablebalance=balance;
    if (amount>avalablebalance){
      socket.emit('bid_failed',{
        message:`số dư không đủ ${avalablebalance.toLocaleString()} VND.`
      });
      return ;
    }
    // Cập nhật giá mới
    await db.query('UPDATE auctions SET current_bid = ? WHERE id = ?', [amount, auctionId]);

    // Tạo record bid, **dùng bidderId từ client**
    await db.query(
      'INSERT INTO bids (auction_id, bidder_id, amount) VALUES (?, ?, ?)',
      [auctionId, bidderId, amount]
    );

    io.to(`auction_${auctionId}`).emit('bid_updated', {
      auctionId: auctionId,
      currentBid: amount,
      bidderId: bidderId
    });
  } catch (err) {
    console.error('Lỗi khi xử lý place_bid:', err);
    socket.emit('bid_failed', { message: 'Lỗi server, vui lòng thử lại sau.' });
  }
});

  socket.on('private_message', async ({ sender_id, receiver_id, message }) => {
    console.log(`${sender_id} → ${receiver_id}: ${message}`);

    const newMessage = {
      sender_id,
      receiver_id,
      message,
      created_at: new Date().toISOString()
    };

    // Gửi cho người nhận
    const receiverSocketId = users[receiver_id];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('private_message', newMessage);
    }

    // Gửi lại cho người gửi
    const senderSocketId = users[sender_id];
    if (senderSocketId) {
      io.to(senderSocketId).emit('private_message', newMessage);
    }

    // Lưu vào DB
    await messageController.saveSocketMessage(sender_id, receiver_id, message);
  });

  socket.on('disconnect', () => {
    for (const [userId, sockId] of Object.entries(users)) {
      if (sockId === socket.id) {
        delete users[userId];
        console.log(`User ${userId} disconnected`);
        broadcastOnlineUsers();
        break;
      }
    }
  });
});
// --- Đóng phiên đấu giá khi hết giờ ---
async function closeAuction(auctionId) {
  try {
    // Kiểm tra auction đang còn hoạt động
    const [auctionRows] = await db.query('SELECT * FROM auctions WHERE id = ?', [auctionId]);
    const auction = auctionRows[0];
    if (!auction || auction.status !== 'ongoing') return;

    // Cập nhật trạng thái -> finished
    await db.query('UPDATE auctions SET status = ? WHERE id = ?', ['finished', auctionId]);

    // Tìm người có bid cao nhất
    const [bidRows] = await db.query(`
      SELECT bidder_id, amount 
      FROM bids 
      WHERE auction_id = ? 
      ORDER BY amount DESC LIMIT 1
    `, [auctionId]);

    let winner = null;

    if (bidRows.length > 0) {
      const { bidder_id, amount } = bidRows[0];

      // Cập nhật winner_id vào bảng auctions
      await db.query(`UPDATE auctions SET winner_id = ? WHERE id = ?`, [bidder_id, auctionId]);

      winner = { id: bidder_id, amount };
    }
    // 3) Tạo sản phẩm mới trong bảng products (nếu có winner)
    let newProductId = null;
    if (winner) {
      // Thông tin để insert: tên, mô tả, giá = amount, seller_id = auction.seller_id
      const [insertResult] = await db.query(
        `INSERT INTO products 
           (name, description, price, seller_id, status, created_at, updated_at,notes,image_url) 
         VALUES (?, ?, ?, ?, 'active', NOW(), NOW(),?,?)`,
        [
          auction.item_name,
          auction.description || null,
          winner.amount,
          auction.seller_id,
          auction.notes,
          auction.image_url
        ]
      );
      newProductId = insertResult.insertId;
    }
     await db.query('UPDATE auctions SET status = ? WHERE id = ?', ['finished', auctionId]);
    // Emit cho client biết phiên đã kết thúc và ai thắng
    io.to(`auction_${auctionId}`).emit('auction_closed', { winner,
      productId:newProductId
     });

    console.log(`✅ Phiên ${auctionId} đã kết thúc. Winner: ${winner ? winner.id : 'Không có'}`);
  } catch (err) {
    console.error('❌ Lỗi khi closeAuction:', err);
  }
}

// --- Lên lịch đóng các phiên chưa kết thúc ---
async function scheduleAuctionClose() {
  try {
    const [auctions] = await db.query(`
      SELECT id, end_time 
      FROM auctions 
      WHERE status = 'ongoing'
    `);

    const now = new Date();

    auctions.forEach(auction => {
      const endTime = new Date(auction.end_time);
      const delay = endTime - now;
      console.log('-----------------------------');
      console.log(`🛎️ Auction ID: ${auction.id}`);
      console.log(`📦 end_time (from DB): ${auction.end_time}`);
      console.log(`⏳ endTime (parsed): ${endTime.toISOString()} (${endTime.toString()})`);
      console.log(`📉 delay = ${delay} ms = ${Math.round(delay / 1000)} giây`);
      if (delay <= 0) {
        closeAuction(auction.id); // Đã hết giờ ⇒ đóng luôn
      } else {
        setTimeout(() => closeAuction(auction.id), delay);
        console.log(`⏳ Đặt lịch đóng auction_${auction.id} sau ${Math.round(delay / 1000)} giây`);
      }
    });
  } catch (err) {
    console.error('❌ Lỗi khi scheduleAuctionClose:', err);
  }
}
async function checkAndCloseExpiredAuctions() {
  try {
    // Lấy tất cả auction còn 'ongoing' mà end_time <= hiện tại
    const [expiredAuctions] = await db.query(
      `SELECT id 
       FROM auctions 
       WHERE status = 'ongoing' 
         AND end_time <= NOW()`
    );

    for (const auc of expiredAuctions) {
      console.log('[Server] Tự động đóng auction vì đã hết giờ, id =', auc.id);
      await closeAuction(auc.id);
    }
  } catch (err) {
    console.error('[Server] Lỗi khi checkAndCloseExpiredAuctions:', err);
  }
}
cron.schedule('*/30 * * * * *', async () => {
  console.log('[Server CRON] Chạy checkAndCloseExpiredAuctions at', new Date().toISOString());
  await checkAndCloseExpiredAuctions();
});


// Message routes
app.post('/api/messages', messageController.sendMessage);
app.get('/api/messages/:sender_id/:receiver_id', messageController.getMessages);
app.get('/api/conversations/:userId', messageController.getConversations);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Server start
const PORT = process.env.PORT || 5000;

// Debug route logging
console.log('--- Các route đang được khai báo ---');
app._router.stack.forEach(function (r) {
  if (r.route && r.route.path) {
    console.log(r.route.stack[0].method.toUpperCase(), r.route.path);
  }
});
(async () => {
  await scheduleAuctionClose();
})();
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Static files served at: http://localhost:${PORT}/images`);
  console.log(`CORS enabled for origins:`, allowedOrigins);
});