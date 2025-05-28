# 🤖 VitBot - Chatbot Hỗ Trợ Khách Hàng

VitBot là một chatbot AI thông minh được tích hợp vào hệ thống 7Vits Online Shop, sử dụng Google Gemini API để cung cấp hỗ trợ khách hàng 24/7.

## ✨ Tính năng

- **💬 Trò chuyện thông minh**: Sử dụng Gemini AI để hiểu và trả lời câu hỏi của khách hàng
- **🎯 Hỗ trợ chuyên biệt**: Tư vấn sản phẩm, hướng dẫn mua hàng, chính sách đổi trả
- **📱 Giao diện hiện đại**: Thiết kế responsive, thân thiện với người dùng
- **⚡ Nhanh chóng**: Phản hồi tức thì với hiệu ứng typing indicator
- **🔄 Lịch sử hội thoại**: Lưu trữ và theo dõi ngữ cảnh cuộc trò chuyện
- **❓ Câu hỏi thường gặp**: Gợi ý câu hỏi phổ biến cho người dùng mới

## 🏗️ Cấu trúc dự án

### Backend (Node.js/Express)

```
be/
├── controllers/
│   └── chatbotController.js     # Controller xử lý logic chatbot
├── routes/
│   └── chatbot.js              # Routes API cho chatbot
├── config.env                  # File cấu hình môi trường
└── server.js                   # Server chính (đã cập nhật)
```

### Frontend (React)

```
fe/src/
├── components/
│   └── Chatbot/
│       ├── index.jsx           # Component chatbot chính
│       └── style.scss          # Styles cho chatbot
└── App.jsx                     # App chính (đã tích hợp chatbot)
```

## 🚀 Cài đặt

### 1. Cài đặt dependencies

#### Backend:
```bash
cd be
npm install @google/generative-ai dotenv
```

#### Frontend:
```bash
cd fe
# axios đã có sẵn trong project
```

### 2. Cấu hình API key

Tạo file `be/config.env` (hoặc `.env`):
```env
GEMINI_API_KEY=AIzaSyDPKsIGNgRS-jUduoxLQYBw47Iv0CIlTE8
PORT=5000
```

### 3. Khởi động server

```bash
# Backend
cd be
npm start

# Frontend  
cd fe
npm start
```

## 📡 API Endpoints

### POST `/api/chatbot/message`
Gửi tin nhắn tới chatbot

**Request:**
```json
{
  "message": "Chính sách đổi trả như thế nào?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Xin chào"
    },
    {
      "role": "assistant", 
      "content": "Xin chào! Tôi có thể giúp gì cho bạn?"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "Chính sách đổi trả của 7Vits cho phép...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET `/api/chatbot/status`
Lấy trạng thái chatbot

**Response:**
```json
{
  "success": true,
  "status": "online",
  "botName": "VitBot",
  "capabilities": [
    "Tư vấn sản phẩm",
    "Hướng dẫn mua hàng",
    "Chính sách đổi trả",
    "Thông tin vận chuyển",
    "Hỗ trợ thanh toán"
  ]
}
```

### POST `/api/chatbot/reset`
Reset cuộc hội thoại

**Response:**
```json
{
  "success": true,
  "message": "Cuộc hội thoại đã được reset",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎨 Tùy chỉnh

### Cập nhật prompt cho chatbot

Chỉnh sửa `CUSTOMER_SUPPORT_PROMPT` trong `be/controllers/chatbotController.js`:

```javascript
const CUSTOMER_SUPPORT_PROMPT = `
Bạn là một trợ lý AI thông minh tên là "VitBot" của cửa hàng trực tuyến 7Vits...

THÔNG TIN VỀ CỬA HÀNG:
- Tên: 7Vits Online Shop
- Chuyên bán: [Cập nhật thông tin sản phẩm]
- Chính sách đổi trả: [Cập nhật chính sách]
...
`;
```

### Thay đổi giao diện

Chỉnh sửa `fe/src/components/Chatbot/style.scss` để tùy chỉnh:
- Màu sắc theme
- Kích thước chatbot window
- Font chữ và spacing
- Animation effects

### Thêm câu hỏi thường gặp

Cập nhật mảng `quickQuestions` trong `fe/src/components/Chatbot/index.jsx`:

```javascript
const quickQuestions = [
    "Chính sách đổi trả như thế nào?",
    "Phí vận chuyển bao nhiêu?",
    "Cách thanh toán online?",
    "Thời gian giao hàng?",
    "Câu hỏi mới..." // Thêm câu hỏi mới
];
```

## 🔧 Troubleshooting

### Lỗi API Key không hợp lệ
```
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent: [400 Bad Request] API key not valid.
```

**Giải pháp:**
- Kiểm tra API key trong file `config.env`
- Đảm bảo API key có quyền truy cập Gemini API
- Kiểm tra billing account Google Cloud

### Lỗi CORS
```
Access to XMLHttpRequest blocked by CORS policy
```

**Giải pháp:**
- Đảm bảo frontend URL được thêm vào `allowedOrigins` trong `be/server.js`
- Kiểm tra cấu hình CORS

### Chatbot không hiển thị
**Kiểm tra:**
- Component Chatbot đã được import và sử dụng trong App.jsx
- File CSS đã được import đúng cách
- Console browser có lỗi JavaScript không

## 📱 Mobile Responsive

Chatbot được thiết kế responsive cho mobile:
- Tự động điều chỉnh kích thước trên màn hình nhỏ
- Touch-friendly interface
- Optimized cho các thiết bị di động

## 🔒 Bảo mật

- API key được lưu trữ trong environment variables
- Validation input để tránh injection attacks  
- Rate limiting có thể được thêm vào để tránh spam

## 🚀 Cải tiến trong tương lai

- [ ] Thêm voice input/output
- [ ] Tích hợp với hệ thống CRM
- [ ] Analytics và báo cáo hội thoại
- [ ] Multi-language support
- [ ] Integration với payment gateway
- [ ] Chatbot training với dữ liệu sản phẩm cụ thể

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console logs
2. Verify API endpoints
3. Check network requests trong Developer Tools
4. Liên hệ team phát triển

---

**Developed with ❤️ using Gemini AI** 