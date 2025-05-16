CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    userName VARCHAR(255),
    email VARCHAR(100),
    password VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    googleId VARCHAR(255),
    profilePic VARCHAR(255),
    facebookId VARCHAR(255),
    displayName VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS user_wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
--cataloty
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT NOT NULL,
    stock INT DEFAULT 0,
    seller_id INT NOT NULL,
    status ENUM('active', 'inactive', 'sold_out') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- database rating
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parent_id INT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Bảng lưu lịch sử giao dịch
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type ENUM('deposit', 'purchase', 'refund', 'withdrawal', 'sale_income') NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    description TEXT,
    reference_id VARCHAR(255) COMMENT 'ID tham chiếu đến đơn hàng hoặc mã giao dịch VNPay',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng lưu đơn hàng
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    seller_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng lưu thông tin chuyển tiền giữa người mua và người bán
CREATE TABLE IF NOT EXISTS wallet_transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    buyer_transaction_id INT NOT NULL,
    seller_transaction_id INT NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Bảng lưu thông tin nạp tiền qua VNPay
CREATE TABLE IF NOT EXISTS payment_vnpay (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    vnp_TxnRef VARCHAR(255) NOT NULL COMMENT 'Mã tham chiếu của giao dịch tại hệ thống của merchant',
    vnp_Amount VARCHAR(255) NOT NULL COMMENT 'Số tiền thanh toán',
    vnp_OrderInfo TEXT COMMENT 'Thông tin mô tả nội dung thanh toán',
    vnp_ResponseCode VARCHAR(255) COMMENT 'Mã phản hồi kết quả thanh toán',
    vnp_TransactionNo VARCHAR(255) COMMENT 'Mã giao dịch tại hệ thống VNPay',
    vnp_BankCode VARCHAR(255) COMMENT 'Mã ngân hàng thanh toán',
    vnp_PayDate VARCHAR(255) COMMENT 'Thời gian thanh toán',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Bảng lưu chi tiết đơn hàng
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Thêm dữ liệu mẫu
INSERT INTO users (firstName, lastName, userName, email, password, displayName)
VALUES ('Test', 'User', 'testuser', 'test@example.com', 'password123', 'Test User');

INSERT INTO user_wallets (user_id, balance)
VALUES (1, 0);

INSERT INTO categories (name, description)
VALUES ('Digital', 'Sản phẩm kỹ thuật số');

-- Kiểm tra xem cột image_url đã tồn tại trong bảng products chưa
SET @exists = 0;
SELECT COUNT(*) INTO @exists FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'image_url';

-- Nếu cột chưa tồn tại, thêm cột mới
SET @query = IF(@exists = 0, 
    'ALTER TABLE products ADD COLUMN image_url VARCHAR(255) DEFAULT NULL',
    'SELECT "Column image_url already exists"');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Kiểm tra xem cột notes đã tồn tại trong bảng products chưa
SET @notesExists = 0;
SELECT COUNT(*) INTO @notesExists FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'notes';

-- Nếu cột notes chưa tồn tại, thêm cột mới
SET @notesQuery = IF(@notesExists = 0, 
    'ALTER TABLE products ADD COLUMN notes TEXT COMMENT "Ghi chú của người bán như key, thông tin đăng nhập cho sản phẩm"',
    'SELECT "Column notes already exists"');

PREPARE notesStmt FROM @notesQuery;
EXECUTE notesStmt;
DEALLOCATE PREPARE notesStmt; 