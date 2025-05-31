const db = require('../config/connectDB');
const cron = require('node-cron');

// Tạo một object chứa tất cả các functions
const orderController = {
    // Helper functions
    autoConfirmOrder: async (orderId) => {
        await db.query('START TRANSACTION');
        try {
            // Kiểm tra đơn hàng còn pending và đã quá 7 ngày
            const [order] = await db.query(
                `SELECT o.*, DATEDIFF(NOW(), o.created_at) as days_passed
                 FROM orders o
                 WHERE o.id = ? AND o.status = 'pending'`,
                [orderId]
            );

            if (order.length === 0) {
                await db.query('ROLLBACK');
                return;
            }

            const orderData = order[0];
            
            // Nếu chưa đủ 7 ngày thì bỏ qua
            if (orderData.days_passed < 7) {
                await db.query('ROLLBACK');
                return;
            }

            // Chuyển tiền từ locked_balance sang balance của người bán
            await db.query(
                `UPDATE user_wallets 
                SET locked_balance = locked_balance - ?,
                    balance = balance + ?
                WHERE user_id = ?`,
                [orderData.total_amount, orderData.total_amount, orderData.seller_id]
            );

            // Cập nhật trạng thái đơn hàng và các giao dịch liên quan
            await db.query(
                'UPDATE orders SET status = ? WHERE id = ?',
                ['completed', orderId]
            );

            await db.query(
                `UPDATE transactions 
                 SET status = 'completed' 
                 WHERE reference_id = ? AND transaction_type = 'sale_income'`,
                [orderId]
            );

            
            

            await db.query('COMMIT');
            console.log(`Order ${orderId} auto-confirmed after 7 days`);
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error in auto confirm order:', error);
        }
    },

    checkPendingOrders: async () => {
        try {
            // Lấy tất cả đơn hàng pending đã quá 7 ngày
            const [pendingOrders] = await db.query(
                `SELECT id FROM orders 
                 WHERE status = 'pending' 
                 AND DATEDIFF(NOW(), created_at) >= 7`
            );

            // Xử lý từng đơn hàng
            for (const order of pendingOrders) {
                await orderController.autoConfirmOrder(order.id);
            }
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

    createSellerMap: async (items) => {
        try {
            const sellerMap = {};
            
            for (const item of items) {
                const [productResult] = await db.query(
                    'SELECT seller_id, price FROM products WHERE id = ?',
                    [item.productId]
                );
                
                if (productResult.length === 0) continue;
                
                const sellerId = productResult[0].seller_id;
                const itemPrice = productResult[0].price;
                
                if (!sellerMap[sellerId]) {
                    sellerMap[sellerId] = {
                        amount: 0,
                        items: []
                    };
                }
                
                sellerMap[sellerId].amount += itemPrice;
                sellerMap[sellerId].items.push({
                    productId: item.productId,
                    price: itemPrice
                });
            }
                
            return sellerMap;
        } catch (error) {
            console.error('Error creating seller map:', error);
            throw error;
        }
    },

    createBuyerTransaction: async (userId, totalAmount) => {
        try {
            const [buyerTransaction] = await db.query(
                `INSERT INTO transactions 
                (user_id, amount, transaction_type, status, description) 
                VALUES (?, ?, 'purchase', 'pending', ?)`,
                [userId, totalAmount, 'Thanh toán đơn hàng']
            );
            return buyerTransaction.insertId;
        } catch (error) {
            console.error('Error creating buyer transaction:', error);
            throw error;
        }
    },

    createSellerTransaction: async (sellerId, amount, orderId) => {
        try {
            const [sellerTransaction] = await db.query(
                `INSERT INTO transactions 
                (user_id, amount, transaction_type, status, description, reference_id) 
                VALUES (?, ?, 'sale_income', 'pending', ?, ?)`,
                [sellerId, amount, `Thu nhập từ đơn hàng #${orderId}`, orderId]
            );
            return sellerTransaction.insertId;
        } catch (error) {
            console.error('Error creating seller transaction:', error);
            throw error;
        }
    },

    processSellerOrders: async (sellerMap, userId, buyerTransactionId) => {
        for (const sellerId in sellerMap) {
            const seller = sellerMap[sellerId];
            
            // Tạo đơn hàng mới với trạng thái 'pending'
            const [orderResult] = await db.query(
                `INSERT INTO orders 
                (user_id, seller_id, total_amount, status) 
                VALUES (?, ?, ?, 'pending')`,
                [userId, sellerId, seller.amount]
            );
            
            const orderId = orderResult.insertId;
            
            // Thêm các sản phẩm vào đơn hàng
            for (const item of seller.items) {
                await db.query(
                    `INSERT INTO order_items 
                    (order_id, product_id, price) 
                    VALUES (?, ?, ?)`,
                    [orderId, item.productId, item.price]
                );
            }
            
            // Tạo giao dịch cho người bán (pending)
            const [sellerTransaction] = await db.query(
                `INSERT INTO transactions 
                (user_id, amount, transaction_type, status, description, reference_id) 
                VALUES (?, ?, 'sale_income', 'pending', ?, ?)`,
                [sellerId, seller.amount, `Thu nhập từ đơn hàng #${orderId}`, orderId]
            );
            
            // 4. Kiểm tra và cập nhật ví của người bán
            const [sellerWallet] = await db.query(
                'SELECT * FROM user_wallets WHERE user_id = ?',
                [sellerId]
            );

            const walletAmount = seller.amount;

            if (sellerWallet.length === 0) {
                try {
                    // Nếu người bán chưa có ví, tạo ví mới
                    await db.query(
                        'INSERT INTO user_wallets (user_id, balance, locked_balance) VALUES (?, 0, ?)',
                        [sellerId, walletAmount]
                    );
                } catch (err) {
                    // Nếu có lỗi duplicate key, thử UPDATE
                    if (err.code === 'ER_DUP_ENTRY') {
                        await db.query(
                            'UPDATE user_wallets SET locked_balance = locked_balance + ? WHERE user_id = ?',
                            [walletAmount, sellerId]
                        );
                    } else {
                        throw err;
                    }
                }
            } else {
                // Nếu đã có ví, cập nhật locked_balance
                await db.query(
                    'UPDATE user_wallets SET locked_balance = locked_balance + ? WHERE user_id = ?',
                    [walletAmount, sellerId]
                );
            }
            
            // Lưu thông tin chuyển tiền
            await db.query(
                `INSERT INTO wallet_transfers
                (order_id, buyer_id, seller_id, amount, buyer_transaction_id, seller_transaction_id, status)
                VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
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
        const maxRetries = 3;
        let retryCount = 0;
    
        while (retryCount < maxRetries) {
            try {
                const { items, totalAmount } = req.body;
                const buyerId = req.user.id;
    
                if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
                    return res.status(400).json({
                        success: false,
                        message: 'Thiếu thông tin sản phẩm hoặc tổng tiền'
                    });
                }
    
                const validationResult = await orderController.validateProducts(items, buyerId);
                if (!validationResult.success) {
                    return res.status(validationResult.status).json(validationResult);
                }
    
                // Gom sản phẩm theo seller
                const sellerMap = await orderController.createSellerMap(items); // nên dùng 1 truy vấn JOIN để tối ưu
    
                await db.query('START TRANSACTION');
    
                try {
                    const buyerTransactionId = await orderController.createBuyerTransaction(buyerId, totalAmount);
    
                    const [[buyerWallet]] = await db.query(
                        'SELECT balance FROM user_wallets WHERE user_id = ? FOR UPDATE',
                        [buyerId]
                    );
    
                    if (!buyerWallet || buyerWallet.balance < totalAmount) {
                        await db.query('ROLLBACK');
                        return res.status(400).json({ success: false, message: 'Số dư không đủ' });
                    }
    
                    await db.query(
                        'UPDATE user_wallets SET balance = balance - ? WHERE user_id = ?',
                        [totalAmount, buyerId]
                    );
    
                    // Tạo đơn hàng và các bản ghi liên quan
                    for (const sellerId in sellerMap) {
                        const { items: sellerItems, amount } = sellerMap[sellerId];
    
                        await db.query('SELECT id FROM user_wallets WHERE user_id = ? FOR UPDATE', [sellerId]);
    
                        const [orderResult] = await db.query(
                            `INSERT INTO orders (user_id, seller_id, total_amount, status) VALUES (?, ?, ?, 'pending')`,
                            [buyerId, sellerId, amount]
                        );
                        const orderId = orderResult.insertId;
    
                        const orderItems = sellerItems.map(item => [orderId, item.productId, item.price]);
                        await db.query(
                            'INSERT INTO order_items (order_id, product_id, price) VALUES ?',
                            [orderItems]
                        );

                        // Tạo transaction cho người bán
                        const [sellerTransaction] = await db.query(
                            `INSERT INTO transactions 
                             (user_id, amount, transaction_type, status, description, reference_id)
                             VALUES (?, ?, 'sale_income', 'pending', ?, ?)`,
                            [sellerId, amount, `Thu nhập từ đơn hàng #${orderId}`, orderId]
                        );

                        // Cập nhật wallet_transfers với đầy đủ thông tin
                        await db.query(
                            `INSERT INTO wallet_transfers 
                             (order_id, buyer_id, seller_id, amount, buyer_transaction_id, seller_transaction_id, status)
                             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
                            [orderId, buyerId, sellerId, amount, buyerTransactionId, sellerTransaction.insertId]
                        );

                        // Cập nhật trạng thái sản phẩm về inactive
                        await db.query(
                            'UPDATE products SET status = ? WHERE id IN (?)',
                            ['inactive', items.map(item => item.productId)]
                        );
                    }
    
                    await db.query('COMMIT');
                    return res.json({ success: true, message: 'Đơn hàng đã được tạo thành công' });
                } catch (err) {
                    await db.query('ROLLBACK');
                    throw err;
                }
    
            } catch (error) {
                console.error(`Create order attempt ${retryCount + 1} failed:`, error);
    
                if (error.code === 'ER_LOCK_WAIT_TIMEOUT' && retryCount < maxRetries - 1) {
                    retryCount++;
                    await new Promise(res => setTimeout(res, Math.random() * 900 + 100));
                    continue;
                }
    
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi khi tạo đơn hàng',
                    error: error.message
                });
            }
        }
    },

    confirmOrder: async (req, res) => {
        try {
            const orderId = req.params.orderId;
            const userId = req.user.id;

            await db.query('START TRANSACTION');

            try {
                // 1. Kiểm tra đơn hàng tồn tại và thuộc về người mua
                const [order] = await db.query(
                    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
                    [orderId, userId]
                );

                if (order.length === 0) {
                    await db.query('ROLLBACK');
                    return res.status(404).json({
                        success: false,
                        message: 'Đơn hàng không tồn tại hoặc không thuộc về bạn'
                    });
                }

                const orderData = order[0];

                // 2. Kiểm tra trạng thái đơn hàng
                if (orderData.status !== 'pending') {
                    await db.query('ROLLBACK');
                    return res.status(400).json({
                        success: false,
                        message: `Đơn hàng không thể xác nhận do đang ở trạng thái ${orderData.status}`
                    });
                }

                // 3. Trừ tiền từ locked_balance và cộng vào balance của người bán
                await db.query(
                    `UPDATE user_wallets 
                    SET locked_balance = locked_balance - ?,
                        balance = balance + ?
                    WHERE user_id = ?`,
                    [orderData.total_amount, orderData.total_amount, orderData.seller_id]
                );

                // 4. Cập nhật trạng thái đơn hàng
                await db.query(
                    'UPDATE orders SET status = ? WHERE id = ?',
                    ['completed', orderId]
                );

                // 5. Cập nhật trạng thái các transactions
                await db.query(
                    `UPDATE transactions 
                    SET status = 'completed' 
                    WHERE reference_id = ?`,
                    [orderId]
                );

                // 6. Cập nhật trạng thái sản phẩm về sold_out
                await db.query(
                    'UPDATE products SET status = ? WHERE id IN (?)',
                    ['sold_out', items.map(item => item.productId)]
                );

                await db.query('COMMIT');

                return res.json({
                    success: true,
                    message: 'Đơn hàng đã được xác nhận thành công'
                });

            } catch (error) {
                await db.query('ROLLBACK');
                throw error;
            }
        } catch (error) {
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
            const { orderId } = req.params;
            const userId = req.user.id;

            await db.query('START TRANSACTION');

            try {
                // 1. Kiểm tra đơn hàng tồn tại và thuộc về người mua
                const [order] = await db.query(
                    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
                    [orderId, userId]
                );

                if (order.length === 0) {
                    await db.query('ROLLBACK');
                    return res.status(404).json({
                        success: false,
                        message: 'Đơn hàng không tồn tại hoặc không thuộc về bạn'
                    });
                }

                const orderData = order[0];

                // 2. Kiểm tra trạng thái đơn hàng
                if (orderData.status !== 'pending') {
                    await db.query('ROLLBACK');
                    return res.status(400).json({
                        success: false,
                        message: `Đơn hàng không thể từ chối do đang ở trạng thái ${orderData.status}`
                    });
                }

                // 3. Trừ tiền từ locked_balance người bán
                await db.query(
                    'UPDATE user_wallets SET locked_balance = locked_balance - ? WHERE user_id = ?',
                    [orderData.total_amount, orderData.seller_id]
                );

                // 4. Hoàn tiền vào balance người mua
                await db.query(
                    'UPDATE user_wallets SET balance = balance + ? WHERE user_id = ?',
                    [orderData.total_amount, userId]
                );

                // 5. Cập nhật trạng thái đơn hàng
                await db.query(
                    'UPDATE orders SET status = ? WHERE id = ?',
                    ['cancelled', orderId]
                );

                // 6. Cập nhật trạng thái các transactions
                await db.query(
                    `UPDATE transactions 
                    SET status = 'cancelled' 
                    WHERE reference_id = ?`,
                    [orderId]
                );

                // 7. Cập nhật trạng thái sản phẩm về active
                const [items] = await db.query(
                    'SELECT product_id FROM order_items WHERE order_id = ?',
                    [orderId]
                );

                for (const item of items) {
                    await db.query(
                        'UPDATE products SET status = ? WHERE id = ?',
                        ['active', item.product_id]
                    );
                }

                await db.query('COMMIT');

                res.json({
                    success: true,
                    message: 'Đơn hàng đã được từ chối và hoàn tiền thành công'
                });

            } catch (error) {
                await db.query('ROLLBACK');
                throw error;
            }
        } catch (error) {
            console.error('Reject order error:', error);
            res.status(500).json({
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