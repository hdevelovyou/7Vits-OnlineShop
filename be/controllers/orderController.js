const db = require('../config/connectDB');
const cron = require('node-cron');
const crypto = require('crypto'); // Thêm để tạo idempotency key

// Hàm tạo idempotency key
const generateIdempotencyKey = (buyerId, productIds, timestamp) => {
    const data = `${buyerId}-${productIds.sort().join(',')}-${timestamp}`;
    return crypto.createHash('md5').update(data).digest('hex');
};

// Hàm dọn dẹp dữ liệu từ đơn hàng lỗi
const cleanupFailedOrder = async (orderId) => {
    if (!orderId) return;
    
    try {
        console.log(`[CLEANUP] Starting cleanup for failed order ${orderId}`);

        // Kiểm tra xem có bản ghi transactions nào không
        const [txnRecords] = await db.query('SELECT COUNT(*) as count FROM transactions WHERE reference_id = ?', [orderId.toString()]);
        if (txnRecords[0].count > 0) {
            // Xóa các bản ghi giao dịch liên quan đến orderId bị lỗi
            await db.query('DELETE FROM transactions WHERE reference_id = ?', [orderId.toString()]);
            console.log(`[CLEANUP] Cleaned up ${txnRecords[0].count} transactions for failed order ${orderId}`);
        } else {
            console.log(`[CLEANUP] No transaction records found for order ${orderId}`);
        }
        
        // Kiểm tra xem có bản ghi order_items nào không
        const [itemRecords] = await db.query('SELECT COUNT(*) as count, GROUP_CONCAT(product_id) as products FROM order_items WHERE order_id = ?', [orderId]);
        if (itemRecords[0].count > 0) {
            console.log(`[CLEANUP] Found ${itemRecords[0].count} order_items with products: ${itemRecords[0].products}`);
            
            // Đảm bảo các bản ghi order_items cũng được dọn dẹp
            await db.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
            console.log(`[CLEANUP] Cleaned up order_items for failed order ${orderId}`);
        } else {
            console.log(`[CLEANUP] No order_items found for order ${orderId}`);
        }
        
        // Kiểm tra xem có bản ghi order nào không
        const [orderRecord] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (orderRecord.length > 0) {
            // Xóa bản ghi order chính
            await db.query('DELETE FROM orders WHERE id = ?', [orderId]);
            console.log(`[CLEANUP] Cleaned up order ${orderId}`);
        } else {
            console.log(`[CLEANUP] No order record found with ID ${orderId}`);
        }
        
        console.log(`[CLEANUP] Completed cleanup for failed order ${orderId}`);
    } catch (error) {
        console.error('[CLEANUP] Error cleaning up failed order:', error);
    }
};

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
            const { items, totalAmount, idempotencyKey: clientIdempotencyKey } = req.body;
            const buyerId = req.user.id;
            console.log('Start createOrder with data:', { items, totalAmount, buyerId });
    
            // --- 1. VALIDATION BƯỚC NGOÀI TRANSACTION --------------------------------------------------
    
            // Kiểm tra payload
            if (!Array.isArray(items) || items.length === 0 || !totalAmount) {
                console.log('Validation failed:', { items, totalAmount });
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin sản phẩm hoặc tổng tiền'
                });
            }
    
            // Chuẩn hóa và ép kiểu totalAmount
            const numericTotal = parseFloat(totalAmount);
            if (isNaN(numericTotal) || numericTotal <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Giá trị tổng tiền không hợp lệ'
                });
            }
    
            // Lấy danh sách productId từ items
            const productIds = items.map(i => parseInt(i.productId, 10)).filter(id => !isNaN(id));
            if (productIds.length !== items.length) {
                return res.status(400).json({
                    success: false,
                    message: 'productId không hợp lệ'
                });
            }
            console.log('Product IDs for validation:', productIds);
            
            // Tạo idempotency key nếu client không cung cấp
            const idempotencyKey = clientIdempotencyKey || 
                generateIdempotencyKey(buyerId, productIds, Date.now());
            console.log('Using idempotency key:', idempotencyKey);
            
            // Kiểm tra nếu đã có đơn hàng với idempotency key này
            const [existingOrders] = await db.query(
                'SELECT id, status FROM orders WHERE idempotency_key = ?',
                [idempotencyKey]
            );
            
            if (existingOrders && existingOrders.length > 0) {
                const existingOrder = existingOrders[0];
                console.log('Found existing order with same idempotency key:', existingOrder);
                
                return res.json({
                    success: true,
                    message: 'Đơn hàng đã được tạo trước đó',
                    orderId: existingOrder.id,
                    wasExisting: true
                });
            }
    
            // Bước 1a: SELECT tất cả sản phẩm để kiểm tra "status" + xác định sellerId
            const [productRows] = await db.query(
                'SELECT id, seller_id, price, status FROM products WHERE id IN (?)',
                [productIds]
            );
    
            // Nếu số lượng sản phẩm trả về không khớp, tức có product không tồn tại
            if (productRows.length !== items.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Một số sản phẩm không tồn tại'
                });
            }
    
            // Kiểm tra "status" và "sellerId" đồng nhất
            const productMap = new Map(); // key: productId, value: { seller_id, price, status }
            let sellerId = null;
            for (const p of productRows) {
                // Nếu bất kỳ sản phẩm nào không "active", trả về lỗi ngay
                if (p.status !== 'active') {
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm ID ${p.id} không còn khả dụng`
                    });
                }
                // Nếu buyer đang cố mua sản phẩm do chính mình đăng
                if (p.seller_id === buyerId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Bạn không thể mua sản phẩm của chính mình'
                    });
                }
                productMap.set(p.id, p);
                // Giả sử tất cả items đều do cùng một seller; nếu nhiều seller thì xử lý tương tự
                sellerId = p.seller_id;
            }
    
            // --- 2. BẮT ĐẦU TRANSACTION: Đảm bảo thứ tự khóa nhất quán ---------------------------------
    
            // Tăng timeout để giảm khả năng timeout
            await db.query('SET SESSION innodb_lock_wait_timeout = 60');

            // Thêm logic retry - tối đa 3 lần thử lại
            let retryCount = 0;
            const MAX_RETRIES = 3;
            let lastError = null;
            let orderId = null;
            let transactionSuccessful = false;

            while (retryCount < MAX_RETRIES && !transactionSuccessful) {
                try {
                    // Nếu có orderId từ lần thử trước, đảm bảo dọn dẹp trước khi thử lại
                    if (orderId) {
                        await cleanupFailedOrder(orderId);
                        orderId = null;
                    }
                    
                    await db.query('START TRANSACTION');
                    console.log(`[TXN] Starting transaction (attempt ${retryCount + 1}/${MAX_RETRIES})`);
                    
                    // QUAN TRỌNG: Sắp xếp các ID người dùng để luôn khóa theo thứ tự ID tăng dần
                    // Điều này đảm bảo các giao dịch khác nhau sẽ khóa theo cùng một thứ tự
                    const usersToLock = [buyerId, sellerId].sort((a, b) => a - b);
                    console.log('[TXN] User locking order:', usersToLock);
                    
                    // 1. KHÓA WALLETS TRƯỚC TIÊN (theo thứ tự ID tăng dần)
                    for (const userId of usersToLock) {
                        console.log(`[TXN] Locking wallet for user: ${userId}`);
                        await db.query(
                            'SELECT balance, locked_balance FROM user_wallets WHERE user_id = ? FOR UPDATE',
                            [userId]
                        );
                    }
                    
                    // Kiểm tra số dư sau khi đã khóa cả hai ví
                    const [[buyerWallet]] = await db.query(
                        'SELECT balance FROM user_wallets WHERE user_id = ?',
                        [buyerId]
                    );
                    
                    if (!buyerWallet || parseFloat(buyerWallet.balance) < numericTotal) {
                        await db.query('ROLLBACK');
                        return res.status(400).json({
                            success: false,
                            message: 'Số dư không đủ'
                        });
                    }
                    
                    // 2. SAU ĐÓ KHÓA PRODUCTS (theo thứ tự ID tăng dần)
                    const sortedProductIds = productIds.slice().sort((a, b) => a - b);
                    console.log('[TXN] Product locking order:', sortedProductIds);
                    
                    for (const productId of sortedProductIds) {
                        console.log(`[TXN] Locking product: ${productId}`);
                        await db.query(
                            'SELECT id, status FROM products WHERE id = ? FOR UPDATE',
                            [productId]
                        );
                    }
                    
                    // Kiểm tra lại trạng thái sản phẩm sau khi đã khóa
                    const [lockedProducts] = await db.query(
                        'SELECT id, status FROM products WHERE id IN (?)',
                        [sortedProductIds]
                    );
                    
                    // Kiểm tra xem tất cả sản phẩm vẫn còn active
                    for (const product of lockedProducts) {
                        if (product.status !== 'active') {
                            await db.query('ROLLBACK');
                            return res.status(400).json({
                                success: false,
                                message: `Sản phẩm ID ${product.id} vừa được người khác mua`
                            });
                        }
                    }
                    
                    // Tạo SAVEPOINT trước khi tạo đơn hàng
                    await db.query('SAVEPOINT before_order_creation');
                    
                    // 3. TẠO ĐƠN HÀNG (thêm idempotency_key)
                    console.log('[TXN] Creating order');
                    const [orderResult] = await db.query(
                        `INSERT INTO orders (user_id, seller_id, total_amount, status, idempotency_key, created_at)
                         VALUES (?, ?, ?, 'pending', ?, NOW())`,
                        [buyerId, sellerId, numericTotal, idempotencyKey]
                    );
                    orderId = orderResult.insertId;
                    
                    // 4. TẠO CHI TIẾT ĐƠN HÀNG
                    console.log('[TXN] Creating order items');
                    try {
                        const orderItemsParams = items.map(i => {
                            const p = productMap.get(parseInt(i.productId, 10));
                            return [orderId, i.productId, p.price];
                        });
                        const placeholders = orderItemsParams.map(() => '(?, ?, ?)').join(', ');
                        const flatValues = orderItemsParams.flat();
                        
                        console.log(`[TXN] Order items query parameters: ${JSON.stringify(orderItemsParams)}`);
                        
                        const [orderItemsResult] = await db.query(
                            `INSERT INTO order_items (order_id, product_id, price) VALUES ${placeholders}`,
                            flatValues
                        );
                        
                        console.log(`[TXN] Successfully created ${orderItemsResult.affectedRows} order_items records`);
                    } catch (orderItemsError) {
                        console.error('[TXN] Error creating order_items:', {
                            message: orderItemsError.message,
                            code: orderItemsError.errno,
                            sqlState: orderItemsError.sqlState
                        });
                        throw orderItemsError; // Re-throw to be caught by the main try-catch
                    }
                    
                    // 5. CẬP NHẬT VÍ
                    console.log('[TXN] Updating wallets');
                    await db.query(
                        'UPDATE user_wallets SET balance = balance - ? WHERE user_id = ?',
                        [numericTotal, buyerId]
                    );
                    await db.query(
                        'UPDATE user_wallets SET locked_balance = locked_balance + ? WHERE user_id = ?',
                        [numericTotal, sellerId]
                    );
                    
                    // 6. CẬP NHẬT TRẠNG THÁI SẢN PHẨM
                    console.log('[TXN] Updating product statuses');
                    try {
                        const [productUpdateResult] = await db.query(
                            'UPDATE products SET status = ? WHERE id IN (?)',
                            ['inactive', productIds]
                        );
                        
                        console.log(`[TXN] Updated status for ${productUpdateResult.affectedRows} products to inactive`);
                        
                        // Verify products were actually updated
                        const [verifyProducts] = await db.query(
                            'SELECT id, status FROM products WHERE id IN (?)',
                            [productIds]
                        );
                        
                        const stillActiveProducts = verifyProducts.filter(p => p.status === 'active').map(p => p.id);
                        if (stillActiveProducts.length > 0) {
                            console.warn(`[TXN] Warning: These products were not updated to inactive: ${stillActiveProducts.join(', ')}`);
                        } else {
                            console.log('[TXN] All products successfully marked as inactive');
                        }
                    } catch (productUpdateError) {
                        console.error('[TXN] Error updating product statuses:', {
                            message: productUpdateError.message,
                            code: productUpdateError.errno,
                            sqlState: productUpdateError.sqlState
                        });
                        throw productUpdateError; // Re-throw to be caught by the main try-catch
                    }
                    
                    // 7. TẠO CÁC BẢN GHI TRANSACTIONS (đưa vào trong transaction chính)
                    console.log('[TXN] Creating transaction records');
                    await db.query(
                        `INSERT INTO transactions
                         (user_id, amount, transaction_type, status, description, reference_id)
                         VALUES (?, ?, 'purchase', 'pending', 'Thanh toán đơn hàng', ?)`,
                        [buyerId, numericTotal, orderId.toString()]
                    );
                    
                    await db.query(
                        `INSERT INTO transactions
                         (user_id, amount, transaction_type, status, description, reference_id)
                         VALUES (?, ?, 'sale_income', 'pending', ?, ?)`,
                        [sellerId, numericTotal, `Thu nhập từ đơn hàng #${orderId}`, orderId.toString()]
                    );
                    
                    // 8. COMMIT
                    console.log('[TXN] Committing transaction');
                    await db.query('COMMIT');
                    console.log('[TXN] Transaction committed successfully for orderId:', orderId);
                    
                    // Đánh dấu transaction đã thành công để thoát khỏi vòng lặp retry
                    transactionSuccessful = true;
                    
                } catch (txnError) {
                    // Nếu có lỗi, LUÔN đảm bảo rollback để không tạo dữ liệu một nửa
                    try {
                        // Nếu có savepoint, rollback đến savepoint
                        if (txnError.message.includes('order_items')) {
                            await db.query('ROLLBACK TO SAVEPOINT before_order_creation');
                            console.log('[TXN] Rolled back to savepoint before_order_creation');
                        } else {
                            // Rollback toàn bộ transaction
                            await db.query('ROLLBACK');
                            console.log('[TXN] Transaction rolled back successfully');
                        }
                    } catch (rollbackError) {
                        console.error('[TXN] Error during rollback:', rollbackError.message);
                    }
                    
                    console.error('[TXN] Error:', {
                        message: txnError.message,
                        code: txnError.errno,
                        sqlState: txnError.sqlState,
                        attempt: retryCount + 1
                    });
                    
                    // Lưu lại lỗi cuối cùng
                    lastError = txnError;
                    
                    // Nếu là lỗi timeout hoặc deadlock, thử lại
                    if (txnError.errno === 1205 || txnError.errno === 1213) {
                        retryCount++;
                        console.log(`[TXN] Retrying transaction (${retryCount}/${MAX_RETRIES})`);
                        
                        // Đặt lại orderId trước khi thử lại
                        if (orderId) {
                            try {
                                // Dọn dẹp dữ liệu trước khi thử lại - trong trường hợp rollback không hoàn toàn
                                await cleanupFailedOrder(orderId);
                            } catch (cleanupError) {
                                console.error('[TXN] Error cleaning up before retry:', cleanupError);
                            }
                            orderId = null;
                        }
                        
                        // Chờ một khoảng thời gian ngẫu nhiên trước khi thử lại (để giảm xung đột)
                        const backoffTime = Math.floor(Math.random() * 1000) + 500; // 500-1500ms
                        await new Promise(resolve => setTimeout(resolve, backoffTime));
                    } else {
                        // Nếu là lỗi khác, không thử lại
                        return res.status(500).json({
                            success: false,
                            message: 'Lỗi server khi tạo đơn hàng',
                            error: txnError.message
                        });
                    }
                }
            }
            
            // Nếu đã thử lại MAX_RETRIES lần nhưng vẫn thất bại
            if (!transactionSuccessful) {
                console.error('[TXN] Max retries reached, transaction failed');
                
                if (lastError.errno === 1205) {
                    return res.status(409).json({
                        success: false,
                        message: 'Hệ thống đang bận, vui lòng thử lại sau (timeout sau nhiều lần thử)'
                    });
                } else if (lastError.errno === 1213) {
                    return res.status(409).json({
                        success: false,
                        message: 'Xung đột giao dịch, vui lòng thử lại (deadlock sau nhiều lần thử)'
                    });
                }
                
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi server khi tạo đơn hàng sau nhiều lần thử',
                    error: lastError.message
                });
            }
            
            // --- 3. TRẢ VỀ KẾT QUẢ (đã di chuyển phần PHẦN SAU TRANSACTION vào trong transaction chính) ---
            return res.json({
                success: true,
                message: 'Đơn hàng đã được tạo thành công',
                orderId
            });
            
        } catch (error) {
            // Lỗi ngoài transaction
            console.error('Create order error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.',
                error: error.message
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