const db = require('../config/connectDB');
const { authMiddleware } = require('./authController');
const upload = require('../utils/fileUpload');

// Get all products
exports.getAllProducts = (req, res) => {
    const sql = `SELECT p.*, u.userName as seller_name 
                 FROM products p 
                 JOIN users u ON p.seller_id = u.id 
                 WHERE p.status = 'active' 
                 ORDER BY p.created_at DESC`;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Get a single product by ID
exports.getProductById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT p.*, u.userName as seller_name 
                 FROM products p 
                 JOIN users u ON p.seller_id = u.id 
                 WHERE p.id = ?`;
    
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(results[0]);
    });
};

// Upload product image middleware
exports.uploadProductImage = upload.single('image');

// Create a new product
exports.createProduct = (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const seller_id = req.user.id; // From JWT auth middleware
        
        // Xử lý file ảnh nếu có
        let imagePath = null;
        if (req.file) {
            // Lấy đường dẫn tương đối của file ảnh để lưu vào DB
            imagePath = `/images/products/${req.file.filename}`;
        }
        
        const sql = `INSERT INTO products (name, description, price, category, stock, seller_id, image_url) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(sql, [name, description, price, category, stock, seller_id, imagePath], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ 
                message: 'Product created successfully', 
                productId: result.insertId 
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Update a product
exports.updateProduct = (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, stock, status } = req.body;
        const seller_id = req.user.id; // From JWT auth middleware
        
        // Check if product belongs to the user
        const checkOwnerSQL = `SELECT * FROM products WHERE id = ? AND seller_id = ?`;
        
        db.query(checkOwnerSQL, [id, seller_id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(403).json({ error: 'Unauthorized access to this product' });
            
            // Xử lý file ảnh nếu có
            let imagePath = results[0].image_url; // Giữ lại ảnh cũ nếu không có ảnh mới
            if (req.file) {
                // Lấy đường dẫn tương đối của file ảnh để lưu vào DB
                imagePath = `/images/products/${req.file.filename}`;
            }
            
            // Update the product
            const updateSQL = `UPDATE products 
                              SET name = ?, description = ?, price = ?, 
                                  category = ?, stock = ?, status = ?, image_url = ? 
                              WHERE id = ?`;
            
            db.query(updateSQL, [name, description, price, category, stock, status, imagePath, id], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Product updated successfully' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a product
exports.deleteProduct = (req, res) => {
    try {
        const { id } = req.params;
        const seller_id = req.user.id; // From JWT auth middleware
        
        // Check if product belongs to the user
        const checkOwnerSQL = `SELECT * FROM products WHERE id = ? AND seller_id = ?`;
        
        db.query(checkOwnerSQL, [id, seller_id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(403).json({ error: 'Unauthorized access to this product' });
            
            // Delete the product
            const deleteSQL = `DELETE FROM products WHERE id = ?`;
            
            db.query(deleteSQL, [id], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Product deleted successfully' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get products by seller ID
exports.getProductsBySeller = (req, res) => {
    const { sellerId } = req.params;
    
    const sql = `SELECT p.*, u.userName as seller_name 
                 FROM products p 
                 JOIN users u ON p.seller_id = u.id 
                 WHERE p.seller_id = ? 
                 ORDER BY p.created_at DESC`;
    
    db.query(sql, [sellerId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Get my products - for logged in sellers
exports.getMyProducts = (req, res) => {
    const seller_id = req.user.id; // From JWT auth middleware
    
    const sql = `SELECT * FROM products 
                 WHERE seller_id = ? 
                 ORDER BY created_at DESC`;
    
    db.query(sql, [seller_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};