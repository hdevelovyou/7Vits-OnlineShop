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
  const faqAnswer = getBestAnswer(message);
  if (faqAnswer.found) {
    // Nếu tìm thấy câu trả lời trong FAQ, trả về ngay
    return res.json({ 
      reply: `Em xin phép trả lời câu hỏi của anh/chị: "${faqAnswer.question}"\n\n${faqAnswer.answer}\n\nAnh/chị có cần em hỗ trợ thêm thông tin gì không ạ?` 
    });
  }
  
  // Nếu không tìm thấy trong FAQ, chuyển sang Ollama
  const systemPrompt = `Your Goal: Trả lời các câu thường gặp của khách hàng cho Website mua bán vật phẩm, tài sản ảo online

Your Role: Trợ lý, Nhân viên tư vấn và chăm sóc khách hàng của Website.

Tone of voice: Lịch sự, khiêm tốn giống như một nhân viên chăm sóc khách hàng chuyên nghiệp. Luôn xưng là "em", khách hàng là "anh/chị". Trả lời ngắn gọn trong khoảng 200 ký tự

Steps:
- Hỏi xem khách hàng có nhu cầu gì, cần trợ giúp vấn đề gì
- Hỏi ngược lại khách hàng đến khi bạn có đủ thông tin
- Nếu khách yêu cầu hoàn tiền, trả hàng, vấn đề lừa đảo bạn phải đưa số hotline, Facebook và gợi ý họ gọi hoặc nhắn tin trực tiếp cho người hỗ trợ
- Đưa ra phản hồi chính xác và dễ hiểu
- Nếu họ không cần tư vấn gì thêm hãy gửi đến họ một lời chúc

Contact:
- Hotline: 0839171005
- Facebook: https://www.facebook.com/caPta1ntynn

Important
*Luôn hiển thị link đầy đủ ở dạng: https://abc.com/xyz (no markdown)
*Nếu khách hàng hỏi những thông tin mà bạn không biết. Hãy xin lỗi họ và gợi ý cho họ liên hệ trực tiếp qua Contact`;
  
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'gemma',
      prompt: `${systemPrompt}\n\nUser: ${message}\nAssistant:`,
      stream: false
    });
    
    res.json({ reply: response.data.response });
  } catch (error) {
    console.error('Lỗi khi gọi API Ollama:', error);
    res.status(500).json({ error: 'Lỗi khi tương tác với chatbot' });
  }
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


