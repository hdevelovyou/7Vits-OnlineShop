# Website mua bán vật phẩm, tài sản ảo online - Made by 7Vits
## Giới thiệu
Đây là đồ án phát triển website sàn thương mại điện tử, trung gian cho các giao dịch vật phẩm ảo (Ví dụ: Key Game, Accout, CD-Key, ...). Ở website xây dựng hệ thống trustless - nghĩa là không cần phải đặt niềm tin vào bên trung gian,các bên không cần tin nhau, mà chỉ cần tin vào mã nguồn, thuật toán và cơ chế đồng thuận.
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
- **Đăng ký, đăng nhập**: Hỗ trợ đăng nhập bằng email/mật khẩu và OAuth (Google, Facebook)
- **Quản lý tài khoản**: Thông tin cá nhân, lịch sử giao dịch, số dư ví điện tử
- **Mua bán sản phẩm ảo**: Đăng bán, tìm kiếm, lọc sản phẩm theo danh mục
- **Ví điện tử**: Nạp tiền và thanh toán trực tuyến qua ví nội bộ hoặc VNPay
- **Hệ thống đánh giá**: Đánh giá sản phẩm, xếp hạng người bán
- **Chat trực tiếp**: Liên hệ giữa người mua và người bán
- **Hệ thống đơn hàng**: Quản lý đơn hàng, theo dõi trạng thái giao dịch
- **Hệ thống bảo mật**: Xác thực OTP, bảo vệ giao dịch, cơ chế escrow (trung gian)

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

## Cài đặt và chạy dự án

### Yêu cầu
- Node.js (v16+)
- MySQL
- Git

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

## Cấu trúc cơ sở dữ liệu
![database](./asset/data.jpeg)
Hệ thống sử dụng các bảng chính sau:

### 1. Bảng users
- Lưu trữ thông tin người dùng
- Các trường chính: id, firstName, lastName, userName, email, password, googleId, facebookId, displayName, avatarUrl, role
- Hỗ trợ đăng nhập bằng email/password, Google và Facebook

### 2. Bảng user_wallets
- Quản lý ví điện tử của người dùng
- Các trường chính: user_id, balance (số dư), locked_balance (số dư bị khóa)
- Liên kết với bảng users qua user_id

### 3. Bảng categories
- Quản lý danh mục sản phẩm
- Các trường chính: id, name, description
- Theo dõi thời gian tạo và cập nhật

### 4. Bảng products
- Lưu trữ thông tin sản phẩm
- Các trường chính: name, description, price, category_id, stock, seller_id, status, image_url, notes
- Trạng thái sản phẩm: active, inactive, sold_out
- Liên kết với users (seller) và categories

### 5. Bảng ratings
- Quản lý đánh giá sản phẩm
- Các trường chính: user_id, product_id, rating (1-5)
- Liên kết với users và products

### 6. Bảng comments
- Quản lý bình luận sản phẩm
- Các trường chính: user_id, product_id, content, parent_id
- Hỗ trợ bình luận đa cấp (reply)

### 7. Bảng transactions
- Quản lý giao dịch tài chính
- Các trường chính: user_id, amount, transaction_type, status, description, reference_id
- Loại giao dịch: deposit, purchase, refund, withdrawal, sale_income
- Trạng thái: pending, completed, failed, cancelled

### 8. Bảng orders
- Quản lý đơn hàng
- Các trường chính: user_id, seller_id, total_amount, status
- Trạng thái: pending, processing, completed, cancelled, refunded

### 9. Bảng order_items
- Chi tiết các sản phẩm trong đơn hàng
- Các trường chính: order_id, product_id, quantity, price
- Liên kết với orders và products

### 10. Bảng wallet_transfers
- Quản lý chuyển tiền giữa các ví
- Các trường chính: order_id, buyer_id, seller_id, amount, buyer_transaction_id, seller_transaction_id, status
- Theo dõi trạng thái chuyển tiền: pending, completed, failed, cancelled

### 11. Bảng payment_vnpay
- Lưu trữ thông tin thanh toán qua VNPay
- Các trường chính: transaction_id, vnp_TxnRef, vnp_Amount, vnp_OrderInfo, vnp_ResponseCode, vnp_TransactionNo, vnp_BankCode, vnp_PayDate
- Liên kết với bảng transactions

### 12. Bảng seller_ratings
- Quản lý đánh giá người bán
- Các trường chính: seller_id, user_id, rating (1-5)
- Đảm bảo mỗi người dùng chỉ đánh giá một người bán một lần

## Quy trình mua bán

### 1. Tạo đơn hàng
1. **Người mua** chọn sản phẩm và thêm vào giỏ hàng
2. **Hệ thống** kiểm tra:
   - Sản phẩm còn tồn tại và đang active
   - Người mua không mua sản phẩm của chính mình
   - Số dư ví người mua đủ để thanh toán
3. **Hệ thống** tạo đơn hàng:
   - Tạo transaction cho người mua (trạng thái pending)
   - Trừ tiền từ ví người mua
   - Cập nhật trạng thái sản phẩm thành inactive
   - Tạo đơn hàng với trạng thái pending
   - Tạo transaction cho người bán (trạng thái pending)
   - Cộng tiền vào locked_balance của người bán

### 2. Xử lý đơn hàng
1. **Trạng thái Pending**:
   - Tiền người mua đã bị trừ
   - Tiền người bán đang bị khóa (locked_balance)
   - Sản phẩm đã bị khóa (inactive)
   - Thời gian chờ xác nhận: 7 ngày

2. **Xác nhận đơn hàng** (Người mua):
   - Chuyển tiền từ locked_balance sang balance của người bán
   - Cập nhật trạng thái đơn hàng thành completed
   - Cập nhật trạng thái các transactions thành completed
   - Người mua nhận được thông tin sản phẩm

3. **Từ chối đơn hàng** (Người mua):
   - Trừ tiền từ locked_balance người bán
   - Hoàn tiền vào balance người mua
   - Cập nhật trạng thái đơn hàng thành cancelled
   - Cập nhật trạng thái các transactions thành cancelled
   - Cập nhật trạng thái sản phẩm về active

4. **Tự động xác nhận** (Sau 7 ngày):
   - Nếu người mua không thực hiện thao tác
   - Hệ thống tự động xác nhận đơn hàng
   - Chuyển tiền cho người bán
   - Cập nhật trạng thái tương ứng

### 3. Đánh giá và phản hồi
1. **Đánh giá sản phẩm**:
   - Người mua có thể đánh giá sản phẩm (1-5 sao)
   - Thêm bình luận về trải nghiệm mua hàng

2. **Đánh giá người bán**:
   - Người mua có thể đánh giá người bán
   - Mỗi người dùng chỉ đánh giá một người bán một lần
   - Đánh giá ảnh hưởng đến uy tín người bán

### 4. Bảo mật và an toàn
1. **Bảo vệ giao dịch**:
   - Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
   - Khóa (lock) các bản ghi khi thực hiện giao dịch
   - Tự động rollback nếu có lỗi xảy ra

2. **Xử lý đồng thời**:
   - Sử dụng cơ chế retry khi có xung đột
   - Giới hạn thời gian chờ lock
   - Đảm bảo tính nhất quán của dữ liệu

3. **Theo dõi và kiểm tra**:
   - Ghi log đầy đủ các giao dịch
   - Lưu trữ lịch sử thay đổi trạng thái
   - Cho phép truy vết khi có vấn đề

## Đóng góp và phát triển

Dự án đang trong giai đoạn phát triển. Các tính năng sẽ được cập nhật liên tục:
- Tích hợp thêm phương thức thanh toán
- Cải thiện hệ thống chat, thêm thông báo thời gian thực
- Phát triển ứng dụng di động
- Tích hợp blockchain để tăng tính minh bạch cho giao dịch

## Screenshots

_Các hình ảnh demo sẽ được thêm vào sau_

## Giấy phép

Dự án này được phát triển cho mục đích học tập và nghiên cứu.

## Liên hệ

Để biết thêm thông tin, vui lòng liên hệ qua email: [email@example.com]


