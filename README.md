# Website mua bán vật phẩm, tài sản ảo online - Made by 7Vits
## Giới thiệu
Đây là đồ án phát triển website sàn thương mại điện tử, trung gian cho các giao dịch vật phẩm ảo (Ví dụ: Key Game, Accout, CD-Key, ...). Ở website xây dựng hệ thống trustless - nghĩa là không cần phải đặt niềm tin vào bên trung gian,các bên không cần tin nhau, mà chỉ cần tin vào mã nguồn, thuật toán và cơ chế đồng thuận.
### Giáo viên hướng dẫn
- Trần Tuấn Dũng
### Lớp : NT208.P22.ANTT
### Nhom 8 - Thành viên thực hiên:
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
- **React Router**: Quản lý định tuyến
- **Axios**: Xử lý HTTP request
- **SCSS**: Styling với Sass
- **Socket.io-client**: Giao tiếp real-time

### Backend
- **Node.js/Express**: Web server framework
- **MySQL**: Cơ sở dữ liệu quan hệ
- **JWT (JSON Web Tokens)**: Xác thực người dùng
- **Bcrypt**: Mã hóa mật khẩu
- **Socket.io**: Xử lý kết nối real-time
- **Nodemailer**: Gửi email thông báo và xác thực
- **VNPay API**: Tích hợp cổng thanh toán

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
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=yourpassword
# DB_NAME=7vits
# JWT_SECRET=your_jwt_secret
# EMAIL_USERNAME=your_email
# EMAIL_PASSWORD=your_email_password
# ... các biến khác

# Chạy server ở chế độ development
npm run dev
```

### Frontend
```bash
# Di chuyển vào thư mục frontend
cd fe

# Cài đặt các dependencies
npm install

# Chạy ứng dụng React ở chế độ development
npm start
```

## Cấu trúc cơ sở dữ liệu

Hệ thống sử dụng các bảng chính:
- **users**: Thông tin người dùng
- **products**: Thông tin sản phẩm đăng bán
- **categories**: Danh mục sản phẩm
- **orders**: Đơn hàng
- **order_items**: Chi tiết đơn hàng
- **transactions**: Giao dịch tài chính
- **wallet_transfers**: Chuyển tiền giữa các ví
- **comments**: Bình luận sản phẩm
- **ratings**: Đánh giá sản phẩm

## Quy trình mua bán

1. **Người bán** đăng sản phẩm kèm thông tin, giá cả
2. **Người mua** tìm kiếm, chọn sản phẩm và thêm vào giỏ hàng
3. **Người mua** thanh toán qua ví nội bộ
4. **Hệ thống** xác thực giao dịch, chuyển tiền từ người mua sang người bán
5. **Người mua** nhận được thông tin sản phẩm qua email hoặc trang quản lý đơn hàng
6. **Người mua** có thể đánh giá sản phẩm sau khi mua

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


