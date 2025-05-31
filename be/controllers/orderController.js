const db = require('../config/connectDB');
const cron = require('node-cron');

// Tạo một object chứa tất cả các functions
const orderController = {
    // Helper functions
    checkPendingOrders: async () => {
        try {
            // Lấy tất cả đơn hàng pending đã quá 7 ngày
            const [pendingOrders] = await db.query(
                `SELECT id FROM orders 
                 WHERE status = 'pending' 
                 AND DATEDIFF(NOW(), created_at) >= 7`
            );

            // Xử lý từng đơn hàng
            
        } catch (error) {
            console.error('Error checking pending orders:', error);
        }
    },

    validateProducts: async (items, userId) => {
        try {
            for (const item of items) {
                const [productResult] = await db.query(
                    'SELECT id, seller_id, price, status FROM products WHERE id = ?',
                    [item.productId]
                );

                if (productResult.length === 0) {
                    return {
                        success: false,
                        status: 404,
                        message: `Sản phẩm với ID ${item.productId} không tồn tại`
                    };
                }

                const product = productResult[0];

                // Kiểm tra không mua sản phẩm của chính mình
                if (product.seller_id === userId) {
                    return {
                        success: false,
                        status: 400,
                        message: 'Bạn không thể mua sản phẩm do chính mình đăng bán'
                    };
                }

                // Kiểm tra trạng thái sản phẩm
                if (product.status === 'sold_out' || product.status === 'inactive') {
                    return {
                        success: false,
                        status: 400,
                        message: `Sản phẩm ID ${item.productId} đã hết hàng hoặc ngừng bán`
                    };
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Error validating products:', error);
            throw error;
        }
    },
    // Controller functions
    getOrderHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            
            // First, get total count of orders for this user
            const [countResult] = await db.query(
                'SELECT COUNT(DISTINCT o.id) as total FROM orders o WHERE o.user_id = ?',
                [userId]
            );
            
            const totalOrders = countResult[0].total;
            const totalPages = Math.ceil(totalOrders / limit);

            // Get all orders for this user with pagination
            const ordersQuery = `
                SELECT 
                    o.id as order_id,
                    o.created_at as order_date,
                    o.status as order_status,
                    o.total_amount,
                    COALESCE(u.userName, u.displayName) as seller_name,
                    wt.status as payment_status
                FROM orders o
                JOIN users u ON o.seller_id = u.id
                LEFT JOIN wallet_transfers wt ON o.id = wt.order_id
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const [orders] = await db.query(ordersQuery, [userId, limit, offset]);

            if (orders.length > 0) {
                // Get all order items for these orders in a single query
                const orderIds = orders.map(order => order.order_id);
                const itemsQuery = `
                    SELECT 
                        oi.order_id,
                        p.id as product_id,
                        p.name as product_name,
                        p.seller_id, 
                        p.image_url,
                        p.notes,
                        oi.price,
                        oi.price as total
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id IN (?)
                `;
                
                const [allItems] = await db.query(itemsQuery, [orderIds]);
                
                console.log('Order IDs:', orderIds);
                console.log('All Items:', allItems);

                // Group items by order_id
                const groupedItems = {};
                for (const item of allItems) {
                    if (!groupedItems[item.order_id]) {
                        groupedItems[item.order_id] = [];
                    }
                    groupedItems[item.order_id].push(item);
                }

                // Assign items to their respective orders
                orders.forEach(order => {
                    order.order_items = groupedItems[order.order_id] || [];
                });
            }
            
            res.json({
                success: true,
                orders: orders,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: totalOrders,
                    itemsPerPage: limit
                }
            });
            
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử mua hàng:', error);
            res.status(500).json({ 
                success: false,
                message: 'Có lỗi xảy ra khi tải lịch sử mua hàng'
            });
        }
    },

    getOrderDetails: async (req, res) => {
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
                success: true,
                order,
                items: orderItems
            });
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
            res.status(500).json({ 
                success: false,
                message: 'Có lỗi xảy ra khi lấy chi tiết đơn hàng'
            });
        }
    },

    createOrder: async (req, res) => {
        try {
            const { items, totalAmount } = req.body;
            const buyerId = req.user.id;
            console.log('Start createOrder with data:', { items, totalAmount, buyerId });

            if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
                console.log('Validation failed:', { items, totalAmount });
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin sản phẩm hoặc tổng tiền'
                });
            }

            const productIds = items.map(i => i.productId);
            console.log('Product IDs:', productIds);

            await db.query('START TRANSACTION');
            try {
                // 1. Lock ví người mua
                console.log('Locking buyer wallet:', buyerId);
                const [[buyerWallet]] = await db.query(
                    'SELECT balance FROM user_wallets WHERE user_id = ? FOR UPDATE',
                    [buyerId]
                );
                console.log('Buyer wallet:', buyerWallet);

                if (!buyerWallet || buyerWallet.balance < totalAmount) {
                    await db.query('ROLLBACK');
                    return res.status(400).json({
                        success: false,
                        message: 'Số dư không đủ'
                    });
                }

                // 2. Lock sản phẩm liên quan
                console.log('Locking products:', productIds);
                const [products] = await db.query(
                    'SELECT id, seller_id, price, status FROM products WHERE id IN (?) FOR UPDATE',
                    [productIds]
                );
                console.log('Products found:', products);

                if (products.length !== items.length) {
                    await db.query('ROLLBACK');
                    return res.status(400).json({
                        success: false,
                        message: 'Một số sản phẩm không tồn tại hoặc bị khóa giao dịch'
                    });
                }
    
                const productMap = new Map();
                let sellerId = null;
                for (const product of products) {
                    if (product.status !== 'active') {
                        await db.query('ROLLBACK');
                        return res.status(400).json({
                            success: false,
                            message: `Sản phẩm ID ${product.id} không còn khả dụng`
                        });
                    }
                    if (product.seller_id === buyerId) {
                        await db.query('ROLLBACK');
                        return res.status(400).json({
                            success: false,
                            message: 'Bạn không thể mua sản phẩm của chính mình'
                        });
                    }
                    productMap.set(product.id, product);
                    sellerId = product.seller_id;
                }
    
                // 3. Lock ví người bán
                await db.query(
                    'SELECT locked_balance FROM user_wallets WHERE user_id = ? FOR UPDATE',
                    [sellerId]
                );
    
                // 4. Tạo đơn hàng
                const [orderResult] = await db.query(
                    `INSERT INTO orders (user_id, seller_id, total_amount, status)
                     VALUES (?, ?, ?, 'pending')`,
                    [buyerId, sellerId, totalAmount]
                );
                const orderId = orderResult.insertId;
    
                // 5. Tạo order_items
                const orderItems = items.map(item => {
                    const product = productMap.get(item.productId);
                    return [orderId, item.productId, product.price];
                });
                await db.query(
                    'INSERT INTO order_items (order_id, product_id, price) VALUES ?',
                    [orderItems]
                );
    
                // 6. Cập nhật ví
                await db.query(
                    'UPDATE user_wallets SET balance = balance - ? WHERE user_id = ?',
                    [totalAmount, buyerId]
                );
                await db.query(
                    'UPDATE user_wallets SET locked_balance = locked_balance + ? WHERE user_id = ?',
                    [totalAmount, sellerId]
                );
    
                // 7. Giao dịch
                console.log('Creating transactions for order:', orderId);
                try {
                    await db.query(
                        'INSERT INTO transactions (user_id, amount, transaction_type, status, description, reference_id) VALUES (?, ?, ?, ?, ?, ?)',
                        [buyerId, totalAmount, 'purchase', 'pending', 'Thanh toán đơn hàng', orderId.toString()]
                    );
                    console.log('Buyer transaction created');

                    await db.query(
                        'INSERT INTO transactions (user_id, amount, transaction_type, status, description, reference_id) VALUES (?, ?, ?, ?, ?, ?)',
                        [sellerId, totalAmount, 'sale_income', 'pending', `Thu nhập từ đơn hàng #${orderId}`, orderId.toString()]
                    );
                    console.log('Seller transaction created');
                } catch (transactionError) {
                    console.error('Transaction creation error:', transactionError);
                    throw transactionError;
                }
                
                // 8. Cập nhật trạng thái sản phẩm
                console.log('Updating product status to inactive:', productIds);
                await db.query(
                    'UPDATE products SET status = ? WHERE id IN (?)',
                    ['inactive', productIds]
                );
    
                await db.query('COMMIT');
                console.log('Transaction committed successfully');
                return res.json({
                    success: true,
                    message: 'Đơn hàng đã được tạo thành công',
                    orderId: orderId
                });
            } catch (err) {
                console.error('Error in transaction:', err);
                await db.query('ROLLBACK');
                throw err;
            }
        } catch (error) {
            console.error('Create order error:', {
                message: error.message,
                stack: error.stack,
                sqlMessage: error.sqlMessage,
                sqlState: error.sqlState
            });
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.',
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },

    confirmOrder: async (req, res) => {
        try {
            const orderId = req.params.orderId;
            const userId = req.user.id;

            await db.query('START TRANSACTION');

            const [[order]] = await db.query(
                'SELECT * FROM orders WHERE id = ? AND user_id = ? FOR UPDATE',
                [orderId, userId]
            );

            if (!order || order.status !== 'pending') {
                await db.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Đơn hàng không tồn tại hoặc không thể xác nhận'
                });
            }

            await db.query(
                'UPDATE user_wallets SET locked_balance = locked_balance - ?, balance = balance + ? WHERE user_id = ?',
                [order.total_amount, order.total_amount, order.seller_id]
            );

            await db.query('UPDATE orders SET status = ? WHERE id = ?', ['completed', orderId]);
            await db.query('UPDATE transactions SET status = ? WHERE reference_id = ?', ['completed', orderId]);

            const [items] = await db.query('SELECT product_id FROM order_items WHERE order_id = ?', [orderId]);
            const productIds = items.map(item => item.product_id);
            await db.query('UPDATE products SET status = ? WHERE id IN (?)', ['sold_out', productIds]);

            await db.query('COMMIT');
            return res.json({
                success: true,
                message: 'Đơn hàng đã được xác nhận thành công'
            });
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Confirm order error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi xác nhận đơn hàng',
                error: error.message
            });
        }
    },

    rejectOrder: async (req, res) => {
        try {
            const orderId = req.params.orderId;
            const userId = req.user.id;

            await db.query('START TRANSACTION');

            const [[order]] = await db.query(
                'SELECT * FROM orders WHERE id = ? AND user_id = ? FOR UPDATE',
                [orderId, userId]
            );

            if (!order || order.status !== 'pending') {
                await db.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Đơn hàng không tồn tại hoặc không thể từ chối'
                });
            }

            await db.query(
                'UPDATE user_wallets SET locked_balance = locked_balance - ? WHERE user_id = ?',
                [order.total_amount, order.seller_id]
            );
            await db.query(
                'UPDATE user_wallets SET balance = balance + ? WHERE user_id = ?',
                [order.total_amount, userId]
            );

            await db.query('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', orderId]);
            await db.query('UPDATE transactions SET status = ? WHERE reference_id = ?', ['cancelled', orderId]);

            const [items] = await db.query('SELECT product_id FROM order_items WHERE order_id = ?', [orderId]);
            for (const item of items) {
                await db.query('UPDATE products SET status = ? WHERE id = ?', ['active', item.product_id]);
            }

            await db.query('COMMIT');
            return res.json({
                success: true,
                message: 'Đơn hàng đã được từ chối và hoàn tiền'
            });
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Reject order error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi từ chối đơn hàng',
                error: error.message
            });
        }
    },

    getWalletBalance: async (req, res) => {
        try {
            const userId = req.user.id;
            const [wallet] = await db.query('SELECT balance FROM user_wallets WHERE user_id = ?', [userId]);
            
            // Kiểm tra nếu người dùng chưa có ví
            if (!wallet || wallet.length === 0) {
                // Tạo ví mới với số dư 0
                await db.query('INSERT INTO user_wallets (user_id, balance, locked_balance) VALUES (?, 0, 0)', [userId]);
                return res.json({ balance: 0 });
            }

            res.json({ balance: wallet[0].balance });
        } catch (error) {
            console.error('Get wallet balance error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy số dư ví',
                error: error.message
            });
        }
    },
    getWalletLockedBalance: async (req, res) => {
        try {
            const userId = req.user.id;
            const [wallet] = await db.query('SELECT locked_balance FROM user_wallets WHERE user_id = ?', [userId]);
            res.json({ locked_balance: wallet[0].locked_balance });
        } catch (error) {
            console.error('Get wallet locked balance error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy số dư ví bị khóa',
                error: error.message
            });
        }
    },
    
    // Thêm function rút tiền
    withdrawMoney: async (req, res) => {
        try {
            const userId = req.user.id;
            const { amount, bankInfo } = req.body;
            
            // Validate input
            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Số tiền rút không hợp lệ'
                });
            }

            if (!bankInfo || !bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountHolder) {
                return res.status(400).json({
                    success: false,
                    message: 'Thông tin ngân hàng không đầy đủ'
                });
            }

            // Bắt đầu transaction
            await db.query('START TRANSACTION');

            try {
                // Lấy số dư hiện tại và khóa record để tránh race condition
                const [wallet] = await db.query(
                    'SELECT balance FROM user_wallets WHERE user_id = ? FOR UPDATE',
                    [userId]
                );

                if (!wallet || wallet.length === 0) {
                    await db.query('ROLLBACK');
                    return res.status(400).json({
                        success: false,
                        message: 'Không tìm thấy ví của người dùng'
                    });
                }

                const currentBalance = wallet[0].balance;

                // Kiểm tra số dư có đủ không
                if (currentBalance < amount) {
                    await db.query('ROLLBACK');
                    return res.status(400).json({
                        success: false,
                        message: 'Số dư trong ví không đủ để rút',
                        currentBalance: currentBalance,
                        requestedAmount: amount
                    });
                }

                // Trừ tiền từ ví
                await db.query(
                    'UPDATE user_wallets SET balance = balance - ? WHERE user_id = ?',
                    [amount, userId]
                );

                // Tạo transaction record
                const [transactionResult] = await db.query(
                    `INSERT INTO transactions 
                    (user_id, amount, transaction_type, status, description, reference_id) 
                    VALUES (?, ?, 'withdrawal', 'pending', ?, ?)`,
                    [
                        userId, 
                        amount, 
                        `Rút tiền về tài khoản ${bankInfo.bankName} - ${bankInfo.accountNumber}`,
                        `WITHDRAW_${Date.now()}`
                    ]
                );

                // Commit transaction
                await db.query('COMMIT');

                res.json({
                    success: true,
                    message: 'Yêu cầu rút tiền đã được gửi thành công',
                    transactionId: transactionResult.insertId,
                    withdrawAmount: amount,
                    remainingBalance: currentBalance - amount,
                    bankInfo: bankInfo
                });

            } catch (error) {
                await db.query('ROLLBACK');
                throw error;
            }

        } catch (error) {
            console.error('Withdraw money error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống khi rút tiền',
                error: error.message
            });
        }
    }
};

// Khởi tạo cron job
cron.schedule('0 * * * *', async () => {
    console.log('Running pending orders check...');
    await orderController.checkPendingOrders();
});

module.exports = { orderController };