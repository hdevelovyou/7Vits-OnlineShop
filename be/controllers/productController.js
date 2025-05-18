const db = require('../config/connectDB');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        // Cập nhật truy vấn để lấy số lượng đã bán cho mỗi sản phẩm
        const sql = `SELECT p.*, u.userName as seller_name,
                     (SELECT SUM(oi.quantity) 
                      FROM order_items oi 
                      JOIN orders o ON oi.order_id = o.id 
                      WHERE oi.product_id = p.id AND o.status IN ('completed', 'processing')
                     ) as sold_count
                     FROM products p 
                     JOIN users u ON p.seller_id = u.id 
                     WHERE p.status = 'active' 
                     ORDER BY p.created_at DESC`;
        
        const [results] = await db.query(sql);
        
        // Chuyển đổi null thành 0 cho các sản phẩm chưa có đơn hàng
        results.forEach(product => {
            if (product.sold_count === null) {
                product.sold_count = 0;
            }
        });
        
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        // Cập nhật truy vấn để lấy số lượng đã bán từ bảng order_items
        const sql = `SELECT p.*, u.userName as seller_name,
                     (SELECT SUM(oi.quantity)
                      FROM order_items oi
                      JOIN orders o ON oi.order_id = o.id
                      WHERE oi.product_id = p.id AND o.status IN ('completed', 'processing')
                     ) as sold_count
                     FROM products p
                     JOIN users u ON p.seller_id = u.id
                     WHERE p.id = ?`;
        
        const [results] = await db.query(sql, [id]);
        
        if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
        
        // Chuyển đổi null thành 0 nếu chưa có đơn hàng nào
        if (results[0].sold_count === null) {
            results[0].sold_count = 0;
        }
        
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, notes, image } = req.body;
        const seller_id = req.user.id;
        
        const sql = `INSERT INTO products (name, description, price, category, stock, seller_id, image_url, notes) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        // Always set stock to 1
        const stock = 1;
        
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
        const { name, description, price, category, status, notes, image } = req.body;
        const seller_id = req.user.id;
        
        // Check if product belongs to the user
        const checkOwnerSQL = `SELECT * FROM products WHERE id = ? AND seller_id = ?`;
        const [ownerResults] = await db.query(checkOwnerSQL, [id, seller_id]);
        
        if (ownerResults.length === 0) {
            return res.status(403).json({ error: 'Unauthorized access to this product' });
        }
        
        // Always set stock to 1
        const stock = 1;
        
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
        
        const sql = `SELECT p.*, u.userName as seller_name,
                    (SELECT SUM(oi.quantity) 
                     FROM order_items oi 
                     JOIN orders o ON oi.order_id = o.id 
                     WHERE oi.product_id = p.id AND o.status IN ('completed', 'processing')
                    ) as sold_count
                    FROM products p 
                    JOIN users u ON p.seller_id = u.id 
                    WHERE p.seller_id = ? 
                    ORDER BY p.created_at DESC`;
        
        const [results] = await db.query(sql, [sellerId]);
        
        // Chuyển đổi null thành 0 cho các sản phẩm chưa có đơn hàng
        results.forEach(product => {
            if (product.sold_count === null) {
                product.sold_count = 0;
            }
        });
        
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get my products - for logged in sellers
exports.getMyProducts = async (req, res) => {
    try {
        const seller_id = req.user.id;
        
        const sql = `SELECT p.*, 
                    (SELECT SUM(oi.quantity) 
                     FROM order_items oi 
                     JOIN orders o ON oi.order_id = o.id 
                     WHERE oi.product_id = p.id AND o.status IN ('completed', 'processing')
                    ) as sold_count 
                    FROM products p 
                    WHERE p.seller_id = ? 
                    ORDER BY p.created_at DESC`;
        
        const [results] = await db.query(sql, [seller_id]);
        
        // Convert null to 0 for products without orders
        results.forEach(product => {
            if (product.sold_count === null) {
                product.sold_count = 0;
            }
        });
        
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
