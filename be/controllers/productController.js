const db = require('../config/connectDB');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const sql = `SELECT p.*, u.userName as seller_name 
                     FROM products p 
                     JOIN users u ON p.seller_id = u.id 
                     WHERE p.status = 'active' 
                     ORDER BY p.created_at DESC`;
        
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `SELECT p.*, u.userName as seller_name 
                     FROM products p 
                     JOIN users u ON p.seller_id = u.id 
                     WHERE p.id = ?`;
        
        const [results] = await db.query(sql, [id]);
        
        if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
        
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, notes, image } = req.body;
        const seller_id = req.user.id;
        
        const sql = `INSERT INTO products (name, description, price, category, stock, seller_id, image_url, notes) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await db.query(sql, [name, description, price, category, stock, seller_id, image, notes]);
        
        res.status(201).json({ 
            message: 'Product created successfully', 
            productId: result.insertId 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, stock, status, notes, image } = req.body;
        const seller_id = req.user.id;
        
        // Check if product belongs to the user
        const checkOwnerSQL = `SELECT * FROM products WHERE id = ? AND seller_id = ?`;
        const [ownerResults] = await db.query(checkOwnerSQL, [id, seller_id]);
        
        if (ownerResults.length === 0) {
            return res.status(403).json({ error: 'Unauthorized access to this product' });
        }
        
        const updateSQL = `UPDATE products 
                           SET name = ?, description = ?, price = ?, 
                               category = ?, stock = ?, status = ?, image_url = ?, notes = ? 
                           WHERE id = ?`;
        
        await db.query(updateSQL, [name, description, price, category, stock, status, image || ownerResults[0].image_url, notes, id]);
        
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const seller_id = req.user.id;
        
        // Check if product belongs to the user
        const checkOwnerSQL = `SELECT * FROM products WHERE id = ? AND seller_id = ?`;
        const [ownerResults] = await db.query(checkOwnerSQL, [id, seller_id]);
        
        if (ownerResults.length === 0) {
            return res.status(403).json({ error: 'Unauthorized access to this product' });
        }
        
        const deleteSQL = `DELETE FROM products WHERE id = ?`;
        await db.query(deleteSQL, [id]);
        
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get products by seller ID
exports.getProductsBySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        
        const sql = `SELECT p.*, u.userName as seller_name 
                     FROM products p 
                     JOIN users u ON p.seller_id = u.id 
                     WHERE p.seller_id = ? 
                     ORDER BY p.created_at DESC`;
        
        const [results] = await db.query(sql, [sellerId]);
        
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get my products - for logged in sellers
exports.getMyProducts = async (req, res) => {
    try {
        const seller_id = req.user.id;
        
        const sql = `SELECT * FROM products 
                     WHERE seller_id = ? 
                     ORDER BY created_at DESC`;
        
        const [results] = await db.query(sql, [seller_id]);
        
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
