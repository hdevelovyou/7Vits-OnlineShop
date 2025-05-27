require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Tạo pool có hỗ trợ promise
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    // Cấu hình tối ưu cho pool connection
    connectionLimit: 20,               // Tăng giới hạn kết nối (mặc định là 10)
    queueLimit: 0,                     // Không giới hạn hàng đợi
    waitForConnections: true,          // Đợi kết nối nếu hết
    acquireTimeout: 30000,             // Tăng thời gian timeout khi lấy kết nối (30 giây)
    // Cấu hình tối ưu cho transaction
    connectTimeout: 15000,             // Tăng timeout kết nối
    // Cấu hình statement timeout cho các truy vấn
    maxIdle: 10,                       // Số lượng kết nối idle tối đa
    idleTimeout: 60000,                // Timeout cho idle connections
    // Thiết lập timeout for innodb lock
    enableKeepAlive: true,             // Giữ kết nối sống
    keepAliveInitialDelay: 10000       // Delay trước khi gửi keepalive packet đầu tiên
});

// Xử lý khi kết nối bị lỗi
pool.on('connection', function (connection) {
    connection.query('SET SESSION innodb_lock_wait_timeout=10'); // Giảm thời gian chờ khóa InnoDB (mặc định 50s)
    connection.query('SET SESSION wait_timeout=60'); // Giảm wait timeout
    connection.query('SET SESSION interactive_timeout=60'); // Giảm interactive timeout
});

// Tạo promise pool
const db = pool.promise();

// Bắt các sự kiện của pool
pool.on('acquire', function (connection) {
    console.log('Connection %d acquired', connection.threadId);
});

pool.on('release', function (connection) {
    console.log('Connection %d released', connection.threadId);
});

pool.on('enqueue', function () {
    console.log('Waiting for available connection slot');
});

// Apply migrations
applyMigrations();

// Hàm chạy migration
async function applyMigrations() {
    try {
        const migrationPath = path.join(__dirname, '../data/database.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        const queries = migrationSQL
            .split(';')
            .map(q => q.trim())
            .filter(q => q && !/^NULL$/i.test(q));

        for (const query of queries) {
            console.log('Running migration:', query);
            await db.query(query);
        }

        console.log('Database migrations applied successfully');
    } catch (error) {
        console.error('Failed to apply migrations:', error);
    }
}

module.exports = db;