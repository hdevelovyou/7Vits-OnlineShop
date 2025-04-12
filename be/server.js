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
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình CORS để cho phép tất cả các nguồn trong môi trường phát triển
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

// Phục vụ tệp tĩnh từ thư mục public
app.use('/images', express.static(path.join(__dirname, 'public/images')));
// Log đường dẫn tĩnh
console.log('Serving static files from:', path.join(__dirname, 'public/images'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // For development (use true in production with HTTPS)
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth'));
// Other routes...
app.use("/api/comments", commentRoutes);
// Routes products
app.use('/api', productRoutes);
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', env: process.env.GOOGLE_CLIENT_ID ? 'OAuth configured' : 'OAuth not configured' });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  // Kiểm tra xem có câu trả lời từ FAQ hay không
  const faqResults = searchFaq(message);
  
  // Chỉ trả lời nếu tìm thấy kết quả trong FAQ
  if (faqResults && faqResults.length > 0) {
    const bestMatch = faqResults[0];
    return res.json({ 
      reply: `Em xin phép trả lời câu hỏi của anh/chị: "${bestMatch.question}"\n\n${bestMatch.answer}\n\nAnh/chị có cần em hỗ trợ thêm thông tin gì không ạ?` 
    });
  }
  
  // Nếu không tìm thấy trong FAQ, gợi ý liên hệ trực tiếp
  return res.json({ 
    reply: "Em xin lỗi, em chưa được đào tạo để trả lời câu hỏi này. Để được hỗ trợ tốt nhất, anh/chị vui lòng liên hệ trực tiếp với chúng tôi qua:\n\n- Hotline: 0839171005\n- Facebook: https://www.facebook.com/caPta1ntynn\n\nCảm ơn anh/chị đã sử dụng dịch vụ của 7VITS."
  });
});

// API endpoint cho FAQ
app.get('/api/faq/search', (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  
  const results = searchFaq(query);
  res.json({ results });
});

// Thêm route kiểm tra file static
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

// Start server
const PORT = process.env.PORT || 5000;
console.log('--- Các route đang được khai báo ---');
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(r.route.stack[0].method.toUpperCase(), r.route.path);
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files served at: http://localhost:${PORT}/images`);
  console.log(`FAQ system loaded and active`);
});


