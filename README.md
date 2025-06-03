# Website mua bán vật phẩm, tài sản ảo online - Made by 7Vits
## Giới thiệu đồ án

Đồ án này xây dựng một **website sàn thương mại điện tử** chuyên dành cho các giao dịch **vật phẩm ảo** như *key game*, *tài khoản game*, *CD-Key*, v.v.

Điểm nổi bật của hệ thống là mô hình giao dịch **"trustless"** – tức là **không yêu cầu các bên phải đặt niềm tin vào bên trung gian hoặc vào nhau**. Thay vào đó, niềm tin được đảm bảo thông qua:

- **Mã nguồn minh bạch**
- **Thuật toán rõ ràng**
- **Cơ chế đồng thuận được thiết kế chặt chẽ**

Website đóng vai trò trung gian đảm bảo giao dịch được thực hiện đúng cam kết giữa người mua và người bán, thông qua:

- **Hợp đồng thông minh (Smart Contract)**  - Dự kiến phát triển trong tương lai gần
- **Cơ chế escrow phi tập trung**

Cơ chế này giúp giảm thiểu rủi ro lừa đảo và gia tăng tính bảo mật, minh bạch trong từng giao dịch.

### Giáo viên hướng dẫn
- Trần Tuấn Dũng
### Lớp : NT208.P22.ANTT
### Nhom 7 - Thành viên thực hiên:
+ 23520468	Bùi Nguyễn Công Hiếu
+ 23521191	Châu Hoàng Phúc
+ 23520166	Nguyễn Hữu Cảnh
+ 23520139	Trần Gia Bảo
+ 23521080	Nguyễn Huỳnh Nhân

### Cấu trúc đồ án
Đồ án gồm 2 phần chính:
-`\be` - Backend, sử dung Nodejs/Express server
-`\fe` - Frontend, sử dụng React application

## Tính năng chính
![BussinessFunctionDiagram](./asset/Bussiness%20Function%20Diagram.png)
### Quản lý người dùng
- **Đăng ký, đăng nhập**: Hỗ trợ đăng nhập bằng email/mật khẩu và OAuth (Google, Facebook).
- **Quản lý tài khoản**: Thông tin cá nhân, lịch sử giao dịch, số dư ví điện tử.
- **Hệ thống đánh giá**: Đánh giá sản phẩm.
### Sản phẩm và giao dịch
- **Mua bán sản phẩm ảo**: Đăng bán, tìm kiếm, lọc sản phẩm theo danh mục.
- **Ví điện tử**: Nạp tiền và thanh toán trực tuyến qua ví nội bộ hoặc VNPay.
- **Hệ thống đơn hàng**: Quản lý đơn hàng, theo dõi trạng thái giao dịch.
- **Hệ thống thanh toán**: Hỗ trợ phương thức thanh toán escrow an toàn và bảo mật.
   + Escrow là một cơ chế thanh toán trung gian, nơi tiền của người mua được giữ tạm thời trong một khu vực an toàn (ví dụ như locked_balance) cho đến khi điều kiện cụ thể được đáp ứng
### Đấu giá
- **Hệ thống đấu giá**: Đăng đấu giá sản phẩm, đặt giá, theo dõi phiên đấu giá theo thời gian thực.

### Bảo mật và truyền thông
- **Chat trực tiếp**: Trò chuyện thời gian thực giữa các người dùng, có thể gửi sticker, ảnh.
- **Hệ thống bảo mật**: Xác thực OTP, bảo vệ giao dịch, cơ chế escrow (trung gian).



## Cấu trúc cơ sở dữ liệu
![database](./asset/data.jpeg)
## Cài đặt và chạy dự án

### Yêu cầu
- Node.js (v16+)
- MySQL
- Git
- Tạo tài khoản môi trường test trên VNPay tại https://sandbox.vnpayment.vn/devreg/
- Tạo tài khoản Google - 
- 

### Backend
```bash
# Di chuyển vào thư mục backend
cd be

# Cài đặt các dependencies
npm install


# Tạo file .env với các biến môi trường cần thiết
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

EMAIL_PASSWORD=your_email_app_password_here
EMAIL_USERNAME=your_email@gmail.com

DB_HOST=your_database_host
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=your_database_port

GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
# Chạy server ở chế độ development
npm run dev
```

### Frontend
```bash
# Di chuyển vào thư mục frontend
cd fe

# Cài đặt các dependencies
npm install

# Tạo file .env với các biến môi trường cần thiết
DANGEROUSLY_DISABLE_HOST_CHECK=true
REACT_APP_API_URL=http://localhost:5000

# Chạy ứng dụng React ở chế độ development
npm start
```
## Miêu tả chi tiết các chức năng chính

### Mua hàng
1. **Duyệt và tìm kiếm sản phẩm**
   - Người dùng có thể xem danh sách sản phẩm được phân loại theo danh mục
   - Tìm kiếm sản phẩm theo tên, mô tả hoặc từ khóa
   - Lọc sản phẩm theo giá, danh mục, đánh giá

2. **Thêm vào giỏ hàng**
   - Thêm sản phẩm vào giỏ hàng với số lượng tùy chọn
   - Xem và chỉnh sửa giỏ hàng (thay đổi số lượng, xóa sản phẩm)
   - Lưu giỏ hàng cho lần truy cập sau

3. **Quy trình thanh toán**
   - Kiểm tra tính hợp lệ của sản phẩm (còn hàng, không mua sản phẩm của chính mình)
   - Kiểm tra số dư trong ví điện tử
   - Tạo đơn hàng và trừ tiền từ ví người mua
   - Khóa số tiền trong locked_balance của người bán

4. **Xác nhận đơn hàng**
   - Người mua xác nhận đã nhận được sản phẩm
   - Hệ thống chuyển tiền từ locked_balance sang balance của người bán
   - Tự động xác nhận sau 7 ngày nếu người mua không thực hiện thao tác





### Đấu giá
1. **Tạo phiên đấu giá**
   - Người dùng đăng sản phẩm để đấu giá
   - Thiết lập giá khởi điểm và thời gian kết thúc
   - Cung cấp mô tả chi tiết và hình ảnh sản phẩm
   - Hệ thống tạo phiên đấu giá với trạng thái "ongoing"

2. **Tham gia đấu giá**
   - Người dùng xem danh sách các phiên đấu giá đang diễn ra
   - Đặt giá cao hơn giá hiện tại (hệ thống kiểm tra số dư và tính hợp lệ)
   - Theo dõi trạng thái đấu giá theo thời gian thực
   - Nhận thông báo khi có người đặt giá cao hơn

3. **Kết thúc đấu giá**
   - Hệ thống tự động xác định người thắng cuộc khi đến thời gian kết thúc
   - Trừ tiền từ tài khoản người thắng và chuyển vào locked_balance người bán
   - Tạo đơn hàng tự động với trạng thái pending
   - Gửi thông báo cho người thắng và người bán

4. **Xử lý sau đấu giá**
   - Xác nhận giao nhận sản phẩm theo quy trình mua hàng thông thường
   - Hoàn tiền nếu có tranh chấp hoặc hủy đấu giá

### Chat giữa user
1. **Kết nối người dùng**
   - Tạo kênh chat giữa người mua và người bán
   - Hiển thị trạng thái online/offline của người dùng
   - Thông báo khi có tin nhắn mới

2. **Tính năng chat**
   - Gửi tin nhắn văn bản theo thời gian thực
   - Chia sẻ hình ảnh và sticker
   - Xem lịch sử tin nhắn trước đó
   - Thông báo đã xem tin nhắn

3. **Bảo mật và quản lý**
   - Mã hóa tin nhắn
   - Lưu trữ lịch sử chat an toàn
   - Báo cáo người dùng vi phạm
   - Chặn người dùng không mong muốn

4. **Tích hợp với giao dịch**
   - Trao đổi thông tin về sản phẩm
   - Đàm phán giá cả
   - Chia sẻ mã xác thực sản phẩm
   - Hỗ trợ giải quyết vấn đề sau khi mua hàng

## Định hướng phát triển trong tương lai

Dự án đang trong giai đoạn phát triển. Hướng phát triển tiếp theo cho đồ án
- Tích hợp thêm phương thức thanh toán (Momo, Visa, Paypal,... )
- Tích hợp thêm hệ thống thanh toán bằng blockchain, Smart Contracts (Solana,...)
- Cải thiện hệ thống chat, thêm thông báo thời gian thực
- Phát triển ứng dụng di động
- Tích hợp blockchain để tăng tính minh bạch cho giao dịch

## Công nghệ sử dụng

### Frontend
- **React**: Thư viện xây dựng giao diện người dùng
- **React Router**: Quản lý định tuyến và điều hướng
- **Axios**: Xử lý các yêu cầu HTTP
- **SCSS/Sass**: Tiền xử lý CSS để tạo kiểu
- **Socket.io-client**: Giao tiếp thời gian thực (chat, thông báo)
- **Redux/Redux Toolkit**: Quản lý trạng thái toàn cục
- **React Query**: Quản lý trạng thái máy chủ và bộ nhớ đệm
- **Material-UI**: Thư viện thành phần giao diện
- **Formik & Yup**: Xử lý form và xác thực
- **React Icons**: Thư viện biểu tượng
- **React Toastify**: Thông báo toast

### Backend
- **Node.js/Express**: Framework máy chủ web
- **MySQL**: Hệ quản trị cơ sở dữ liệu quan hệ
- **JWT (JSON Web Tokens)**: Xác thực người dùng
- **Bcrypt**: Mã hóa mật khẩu
- **Socket.io**: Xử lý kết nối thời gian thực
- **Nodemailer**: Gửi email thông báo và xác thực
- **VNPay API**: Tích hợp cổng thanh toán
- **Multer**: Xử lý tải lên tệp
- **Cors**: Chia sẻ tài nguyên đa nguồn gốc
- **Dotenv**: Quản lý biến môi trường
- **Node-cron**: Lập lịch tác vụ tự động
- **Express-validator**: Middleware xác thực
- **Morgan**: Ghi log yêu cầu HTTP
- **Helmet**: Middleware bảo mật

### Công cụ phát triển
- **Git**: Quản lý phiên bản
- **npm**: Quản lý gói
- **ESLint**: Kiểm tra mã
- **Prettier**: Định dạng mã
- **Postman**: Kiểm thử API
- **MySQL Workbench**: Quản lý cơ sở dữ liệu
- **VS Code**: Môi trường phát triển tích hợp

### Triển khai & Lưu trữ
- **Vercel**: Lưu trữ Frontend
- **Railway**: Lưu trữ Backend
- **MySQL Hosting**: Lưu trữ cơ sở dữ liệu
- **Cloudinary**: Lưu trữ hình ảnh
- **GitHub**: Kho lưu trữ mã nguồn

### Bảo mật
- **JWT Authentication**: Xác thực người dùng
- **Bcrypt Password Hashing**: Mã hóa mật khẩu
- **CORS Protection**: Bảo vệ yêu cầu đa nguồn gốc
- **Helmet Security Headers**: Bảo mật HTTP headers
- **Rate Limiting**: Giới hạn tốc độ yêu cầu
- **Input Validation**: Kiểm tra dữ liệu đầu vào
- **SQL Injection Prevention**: Bảo vệ cơ sở dữ liệu
- **XSS Protection**: Bảo vệ tấn công XSS
- **CSRF Protection**: Bảo vệ tấn công CSRF

### Hiệu suất & Tối ưu hóa
- **React Query Caching**: Quản lý bộ nhớ đệm
- **Image Optimization**: Tối ưu hóa hình ảnh
- **Code Splitting**: Chia nhỏ bundle
- **Lazy Loading**: Tải components khi cần
- **Database Indexing**: Tối ưu truy vấn
- **Connection Pooling**: Quản lý kết nối cơ sở dữ liệu
- **Compression**: Nén dữ liệu phản hồi
- **Caching**: Bộ nhớ đệm tài nguyên tĩnh

## Screenshots

_Các hình ảnh demo sẽ được thêm vào sau_

## Giấy phép

Dự án này được phát triển cho mục đích học tập và nghiên cứu.

## Liên hệ

Để biết thêm thông tin, vui lòng liên hệ qua email: 7vits.shop@gmail.com


