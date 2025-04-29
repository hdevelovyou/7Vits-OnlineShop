const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Tạo pool có hỗ trợ promise
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: '7vits'
});

// Tạo promise pool
const db = pool.promise();

// Apply migrations
applyMigrations();

// Hàm chạy migration
async function applyMigrations() {
    try {
        const migrationPath = path.join(__dirname, '../data/update_products_table.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        const queries = migrationSQL.split(';').filter(query => query.trim() !== '');

        for (const query of queries) {
            await db.query(query);
        }

        console.log('Database migrations applied successfully');
    } catch (error) {
        console.error('Failed to apply migrations:', error);
    }
}

module.exports = db;
