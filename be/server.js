const express = require('express');
const session = require('express-session');
const cors = require('cors');
const env = require('./config/enviroment'); // Use the environment config
const passport = require('./config/passport');
const db = require('./config/connectDB');
const axios = require('axios');
const { getBestAnswer, searchFaq } = require('./utils/faqUtils');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: env.SESSION_SECRET || 'default_secret',
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

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', env: env.GOOGLE_CLIENT_ID ? 'OAuth configured' : 'OAuth not configured' });
});

app.use(cors()); 

app.get('/api/products', async (req, res) => {
  try {
      const response = await axios.get('https://divineshop.vn/api/product/list?limit=24&tag=Gi%E1%BA%A3i+tr%C3%AD');
      res.json(response.data);
  } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error.message);
      res.status(500).json({ error: 'Lỗi khi lấy dữ liệu từ API.' });
  }
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`FAQ system loaded and active`);
});


