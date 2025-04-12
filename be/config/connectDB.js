const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: '7vits'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
    
    // Apply migrations
    applyMigrations();
});

// Function to apply migrations
function applyMigrations() {
    try {
        // Đường dẫn đến file migration
        const migrationPath = path.join(__dirname, '../data/update_products_table.sql');
        
        // Đọc nội dung file migration
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Phân tách các câu lệnh SQL
        const queries = migrationSQL.split(';').filter(query => query.trim() !== '');
        
        // Thực thi từng câu lệnh SQL
        queries.forEach(query => {
            if (query.trim()) {
                db.query(query, (err) => {
                    if (err) {
                        console.error('Migration error:', err);
                    }
                });
            }
        });
        
        console.log('Database migrations applied successfully');
    } catch (error) {
        console.error('Failed to apply migrations:', error);
    }
}

module.exports = db;