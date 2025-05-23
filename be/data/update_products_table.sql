-- Kiểm tra nếu bảng users đã tồn tại
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
    displayName VARCHAR(255),
    avatarUrl LONGTEXT
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
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read TINYINT(1) DEFAULT 0
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

-- Kiểm tra nếu bảng products đã tồn tại
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    stock INT DEFAULT 0,
    seller_id INT NOT NULL,
    status ENUM('active', 'inactive', 'sold_out') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Kiểm tra xem cột image_url đã tồn tại trong bảng products chưa
SET @exists = 0;
SELECT COUNT(*) INTO @exists FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'image_url';

-- Nếu cột chưa tồn tại, thêm cột mới
SET @query = IF(@exists = 0, 
    'ALTER TABLE products ADD COLUMN image_url LONGTEXT DEFAULT NULL COMMENT "Base64 encoded image data"',
    'ALTER TABLE products MODIFY COLUMN image_url LONGTEXT DEFAULT NULL COMMENT "Base64 encoded image data"');

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