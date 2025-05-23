const express = require('express');
const router = express.Router();
const db = require('../config/connectDB');
const { authMiddleware } = require('../controllers/authController');

// API tạo đơn hàng mới và thanh toán từ ví
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { items, totalAmount } = req.body;
        const userId = req.user.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Giỏ hàng trống hoặc không hợp lệ' });
        }

        // Bắt đầu transaction
        await db.query('START TRANSACTION');

        try {
            // 1. Kiểm tra số dư ví
            const [walletResult] = await db.query(
                'SELECT balance FROM user_wallets WHERE user_id = ?',
                [userId]
            );

            // Nếu không có ví hoặc số dư không đủ
            if (walletResult.length === 0 || walletResult[0].balance < totalAmount) {
                await db.query('ROLLBACK');
                return res.status(400).json({ 
                    success: false, 
                    message: 'Số dư ví không đủ để thanh toán. Vui lòng nạp tiền vào ví.' 
                });
            }

            // 2. Kiểm tra sản phẩm có tồn tại và không phải của chính người mua
            for (const item of items) {
                const [productResult] = await db.query(
                    'SELECT id, seller_id, price, status FROM products WHERE id = ?',
                    [item.productId]
                );

                if (productResult.length === 0) {
                    await db.query('ROLLBACK');
                    return res.status(404).json({ 
                        success: false, 
                        message: `Sản phẩm với ID ${item.productId} không tồn tại` 
                    });
                }

                const product = productResult[0];

                // Kiểm tra không mua sản phẩm của chính mình
                if (product.seller_id === userId) {
                    await db.query('ROLLBACK');
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Bạn không thể mua sản phẩm do chính mình đăng bán' 
                    });
                }

                // Kiểm tra trạng thái sản phẩm
                if (product.status === 'sold_out' || product.status === 'inactive') {
                    await db.query('ROLLBACK');
                    return res.status(400).json({ 
                        success: false, 
                        message: `Sản phẩm ID ${item.productId} đã hết hàng hoặc ngừng bán` 
                    });
                }

                // Cập nhật trạng thái sản phẩm thành đã bán
                await db.query(
                    'UPDATE products SET status = ? WHERE id = ?',
                    ['sold_out', item.productId]
                );
            }

            // 3. Trừ tiền từ ví người mua
            await db.query(
                'UPDATE user_wallets SET balance = balance - ? WHERE user_id = ?',
                [totalAmount, userId]
            );

            // 4. Tạo giao dịch trừ tiền người mua
            const [buyerTransaction] = await db.query(
                `INSERT INTO transactions 
                (user_id, amount, transaction_type, status, description) 
                VALUES (?, ?, 'purchase', 'completed', ?)`,
                [userId, totalAmount, 'Thanh toán đơn hàng']
            );

            const buyerTransactionId = buyerTransaction.insertId;

            // 5. Tạo map để nhóm sản phẩm theo người bán
            const sellerMap = {};
            
            for (const item of items) {
                const [productResult] = await db.query(
                    'SELECT seller_id, price FROM products WHERE id = ?',
                    [item.productId]
                );
                
                const sellerId = productResult[0].seller_id;
                const itemPrice = productResult[0].price;
                // Mỗi sản phẩm chỉ có thể mua 1 cái
                const itemQuantity = 1;
                const itemTotal = itemPrice * itemQuantity;
                
                if (!sellerMap[sellerId]) {
                    sellerMap[sellerId] = {
                        amount: 0,
                        items: []
                    };
                }
                
                sellerMap[sellerId].amount += itemTotal;
                sellerMap[sellerId].items.push({
                    productId: item.productId,
                    quantity: itemQuantity,
                    price: itemPrice
                });
            }

            // 6. Tạo đơn hàng và chuyển tiền cho từng người bán
            for (const sellerId in sellerMap) {
                const seller = sellerMap[sellerId];
                
                // Tạo đơn hàng mới
                const [orderResult] = await db.query(
                    `INSERT INTO orders 
                    (user_id, seller_id, total_amount, status) 
                    VALUES (?, ?, ?, 'completed')`,
                    [userId, sellerId, seller.amount]
                );
                
                const orderId = orderResult.insertId;
                
                // Thêm các sản phẩm vào đơn hàng
                for (const item of seller.items) {
                    await db.query(
                        `INSERT INTO order_items 
                        (order_id, product_id, quantity, price) 
                        VALUES (?, ?, ?, ?)`,
                        [orderId, item.productId, item.quantity, item.price]
                    );
                }
                
                // Tạo giao dịch cộng tiền cho người bán
                const [sellerTransaction] = await db.query(
                    `INSERT INTO transactions 
                    (user_id, amount, transaction_type, status, description, reference_id) 
                    VALUES (?, ?, 'sale_income', 'completed', ?, ?)`,
                    [sellerId, seller.amount, `Thu nhập từ đơn hàng #${orderId}`, orderId]
                );
                
                // Cộng tiền vào ví người bán
                const [sellerWalletResult] = await db.query(
                    'SELECT * FROM user_wallets WHERE user_id = ?',
                    [sellerId]
                );
                
                if (sellerWalletResult.length === 0) {
                    // Tạo ví mới cho người bán nếu chưa có
                    await db.query(
                        'INSERT INTO user_wallets (user_id, balance) VALUES (?, ?)',
                        [sellerId, seller.amount]
                    );
                } else {
                    // Cập nhật ví hiện có
                    await db.query(
                        'UPDATE user_wallets SET balance = balance + ? WHERE user_id = ?',
                        [seller.amount, sellerId]
                    );
                }
                
                // Lưu thông tin chuyển tiền
                await db.query(
                    `INSERT INTO wallet_transfers
                    (order_id, buyer_id, seller_id, amount, buyer_transaction_id, seller_transaction_id, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'completed')`,
                    [
                        orderId,
                        userId,
                        sellerId,
                        seller.amount,
                        buyerTransactionId,
                        sellerTransaction.insertId
                    ]
                );
            }

            // Hoàn tất transaction
            await db.query('COMMIT');
            
            res.status(200).json({
                success: true,
                message: 'Đơn hàng đã được tạo và thanh toán thành công'
            });
            
        } catch (error) {
            // Đảm bảo luôn rollback khi có lỗi
            await db.query('ROLLBACK');
            throw error;
        }
        
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi tạo đơn hàng'
        });
    }
});

// API lấy số dư ví người dùng
router.get('/wallet-balance', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [walletResult] = await db.query(
            'SELECT balance FROM user_wallets WHERE user_id = ?',
            [userId]
        );
        
        if (walletResult.length === 0) {
            // Tạo ví mới với số dư 0 nếu chưa có
            await db.query(
                'INSERT INTO user_wallets (user_id, balance) VALUES (?, 0)',
                [userId]
            );
            return res.json({ balance: 0 });
        }
        
        res.json({ balance: walletResult[0].balance });
    } catch (error) {
        console.error('Lỗi khi lấy số dư ví:', error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
});

// API lấy lịch sử mua hàng của người dùng
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Lấy danh sách đơn hàng và thông tin chi tiết sản phẩm
        const [orders] = await db.query(
            `SELECT 
                o.id as _id,
                o.created_at as createdAt,
                o.total_amount as totalAmount,
                o.status,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', p.id,
                        'name', p.name,
                        'price', oi.price,
                        'quantity', oi.quantity,
                        'image', p.image_url
                    )
                ) as items
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             JOIN products p ON oi.product_id = p.id
             WHERE o.user_id = ?
             GROUP BY o.id
             ORDER BY o.created_at DESC`,
            [userId]
        );

        // Parse items array from string to JSON for each order
        orders.forEach(order => {
            if (typeof order.items === 'string') {
                order.items = JSON.parse(order.items);
            }
        });
        
        res.json(orders);
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử mua hàng:', error);
        res.status(500).json({ 
            success: false,
            message: 'Có lỗi xảy ra khi tải lịch sử mua hàng'
        });
    }
});

// API lấy chi tiết đơn hàng
router.get('/:orderId', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;
        
        // Kiểm tra đơn hàng có tồn tại và thuộc về người dùng hiện tại
        const [orderResult] = await db.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
        );
        
        if (orderResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }
        
        const order = orderResult[0];
        
        // Lấy danh sách sản phẩm trong đơn hàng
        const [orderItems] = await db.query(
            `SELECT oi.*, p.name, p.image_url, p.notes
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [orderId]
        );
        
        res.json({
            order,
            items: orderItems
        });
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
});

module.exports = router; 