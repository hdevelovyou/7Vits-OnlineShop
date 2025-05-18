const express = require('express');
const router = express.Router();
const db = require('../config/connectDB');
const { authMiddleware } = require('../controllers/authController');

// Hàm hỗ trợ thử lại giao dịch
const executeWithRetry = async (operation, maxRetries = 5) => {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            // Chỉ thử lại đối với lỗi timeout khóa
            if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
                console.log(`Lần thử ${attempt} thất bại do lock timeout, đang thử lại...`);
                
                // Đợi một chút trước khi thử lại (thời gian chờ tăng theo cấp số nhân + jitter)
                const baseDelay = 500 * Math.pow(2, attempt - 1);
                const jitter = Math.floor(Math.random() * 300); // Thêm nhiễu ngẫu nhiên để tránh nhiều request cùng retry
                await new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
                
                // Đảm bảo rằng bất kỳ giao dịch trước đó đều đã được rollback
                try {
                    await db.query('ROLLBACK');
                } catch (rollbackError) {
                    // Bỏ qua lỗi rollback ở đây, chỉ ghi nhật ký
                    console.log('Lỗi khi rollback trước khi thử lại:', rollbackError.message);
                }
                
                continue;
            }
            // Đối với các lỗi khác, thất bại ngay lập tức
            throw error;
        }
    }
    // Nếu chúng ta đến đây, đã hết số lần thử lại
    throw lastError;
};

// Kiểm tra và lấy thông tin sản phẩm trước khi bắt đầu transaction để giảm thời gian giữ khóa
const validateProductsBeforeTransaction = async (items, userId) => {
    const validatedItems = [];
    const sellerDataMap = {};
    
    for (const item of items) {
        // Kiểm tra sản phẩm tồn tại và còn hàng (không khóa)
        const [productResult] = await db.query(
            'SELECT id, seller_id, price, stock, status FROM products WHERE id = ?',
            [item.productId]
        );
        
        if (productResult.length === 0) {
            throw { status: 404, message: `Sản phẩm với ID ${item.productId} không tồn tại` };
        }
        
        const product = productResult[0];
        
        // Kiểm tra người dùng không mua sản phẩm của chính mình
        if (product.seller_id === userId) {
            throw { status: 400, message: 'Bạn không thể mua sản phẩm do chính mình đăng bán' };
        }
        
        // Kiểm tra trước số lượng - sẽ kiểm tra chính xác sau với FOR UPDATE
        if (product.stock < item.quantity || product.status === 'sold_out') {
            throw { status: 400, message: `Sản phẩm ID ${item.productId} không đủ số lượng trong kho` };
        }
        
        // Chuẩn bị dữ liệu
        validatedItems.push({
            ...item,
            sellerId: product.seller_id,
            price: product.price
        });
        
        // Gom nhóm theo người bán
        if (!sellerDataMap[product.seller_id]) {
            sellerDataMap[product.seller_id] = {
                sellerId: product.seller_id,
                amount: 0,
                items: []
            };
        }
        
        const itemTotal = product.price * item.quantity;
        sellerDataMap[product.seller_id].amount += itemTotal;
        sellerDataMap[product.seller_id].items.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product.price
        });
    }
    
    return { validatedItems, sellerDataMap };
};

// API tạo đơn hàng mới và thanh toán từ ví
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { items, totalAmount } = req.body;
        const userId = req.user.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Giỏ hàng trống hoặc không hợp lệ' });
        }
        
        // Kiểm tra và xác nhận sản phẩm trước khi bắt đầu transaction
        let validatedItems, sellerDataMap;
        try {
            const result = await validateProductsBeforeTransaction(items, userId);
            validatedItems = result.validatedItems;
            sellerDataMap = result.sellerDataMap;
        } catch (validationError) {
            return res.status(validationError.status || 400).json({ 
                success: false, 
                message: validationError.message 
            });
        }

        // Thực hiện toàn bộ giao dịch với cơ chế tự động thử lại
        await executeWithRetry(async () => {
            try {
                // Bắt đầu transaction
                await db.query('START TRANSACTION');

                // 1. Kiểm tra số dư ví và khóa
                const [walletResult] = await db.query(
                    'SELECT balance FROM user_wallets WHERE user_id = ? FOR UPDATE',
                    [userId]
                );

                // Nếu không có ví, tạo ví mới với số dư 0
                if (walletResult.length === 0) {
                    await db.query(
                        'INSERT INTO user_wallets (user_id, balance) VALUES (?, 0)',
                        [userId]
                    );
                    await db.query('ROLLBACK');
                    throw { status: 400, message: 'Số dư ví không đủ để thanh toán. Vui lòng nạp tiền vào ví.' };
                }

                const walletBalance = walletResult[0].balance;

                // Kiểm tra số dư ví có đủ không
                if (walletBalance < totalAmount) {
                    await db.query('ROLLBACK');
                    throw { status: 400, message: 'Số dư ví không đủ để thanh toán. Vui lòng nạp tiền vào ví.' };
                }

                // 2. Kiểm tra và khóa các sản phẩm
                const productUpdates = [];
                for (const item of validatedItems) {
                    // Kiểm tra lại và khóa sản phẩm
                    const [productResult] = await db.query(
                        'SELECT stock FROM products WHERE id = ? FOR UPDATE',
                        [item.productId]
                    );
                    
                    if (productResult.length === 0 || productResult[0].stock < item.quantity) {
                        await db.query('ROLLBACK');
                        throw { status: 400, message: 'Sản phẩm không đủ số lượng trong kho hoặc đã bị thay đổi' };
                    }
                    
                    // Chuẩn bị dữ liệu để cập nhật (thay vì cập nhật ngay lập tức)
                    productUpdates.push({
                        id: item.productId,
                        quantity: item.quantity,
                        newStock: productResult[0].stock - item.quantity
                    });
                }

                // 3. Tạo giao dịch trừ tiền của người mua
                const [buyerTransaction] = await db.query(
                    `INSERT INTO transactions 
                    (user_id, amount, transaction_type, status, description) 
                    VALUES (?, ?, 'purchase', 'completed', ?)`,
                    [userId, totalAmount, 'Thanh toán đơn hàng']
                );

                const buyerTransactionId = buyerTransaction.insertId;

                // 4. Trừ tiền từ ví người mua
                await db.query(
                    'UPDATE user_wallets SET balance = balance - ? WHERE user_id = ?',
                    [totalAmount, userId]
                );

                // 5. Tạo đơn hàng và xử lý cho từng người bán
                for (const sellerId in sellerDataMap) {
                    const seller = sellerDataMap[sellerId];
                    
                    // Tạo đơn hàng mới
                    const [orderResult] = await db.query(
                        `INSERT INTO orders 
                        (user_id, seller_id, total_amount, status) 
                        VALUES (?, ?, ?, 'completed')`,
                        [userId, sellerId, seller.amount]
                    );
                    
                    const orderId = orderResult.insertId;
                    
                    // Thêm các sản phẩm vào đơn hàng
                    const orderItemValues = [];
                    const orderItemParams = [];
                    
                    for (const item of seller.items) {
                        orderItemValues.push('(?, ?, ?, ?)');
                        orderItemParams.push(
                            orderId, 
                            item.productId, 
                            item.quantity, 
                            item.price
                        );
                    }
                    
                    // Sử dụng INSERT nhiều hàng thay vì nhiều câu INSERT
                    if (orderItemValues.length > 0) {
                        await db.query(
                            `INSERT INTO order_items 
                            (order_id, product_id, quantity, price) 
                            VALUES ${orderItemValues.join(', ')}`,
                            orderItemParams
                        );
                    }
                    
                    // Tạo giao dịch cộng tiền cho người bán
                    const [sellerTransaction] = await db.query(
                        `INSERT INTO transactions 
                        (user_id, amount, transaction_type, status, description, reference_id) 
                        VALUES (?, ?, 'sale_income', 'completed', ?, ?)`,
                        [sellerId, seller.amount, `Thu nhập từ đơn hàng #${orderId}`, orderId]
                    );
                    
                    const sellerTransactionId = sellerTransaction.insertId;
                    
                    // Cộng tiền vào ví người bán
                    const [sellerWallet] = await db.query(
                        'SELECT * FROM user_wallets WHERE user_id = ? FOR UPDATE',
                        [sellerId]
                    );
                    
                    if (sellerWallet.length === 0) {
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
                    
                    // Ghi nhận chuyển tiền
                    await db.query(
                        `INSERT INTO wallet_transfers 
                        (order_id, buyer_id, seller_id, amount, buyer_transaction_id, seller_transaction_id, status) 
                        VALUES (?, ?, ?, ?, ?, ?, 'completed')`,
                        [orderId, userId, sellerId, seller.amount, buyerTransactionId, sellerTransactionId]
                    );
                }
                
                // 6. Cập nhật stock sản phẩm (thực hiện cuối cùng để giảm thời gian giữ khóa)
                for (const update of productUpdates) {
                    await db.query(
                        'UPDATE products SET stock = ? WHERE id = ?',
                        [update.newStock, update.id]
                    );
                    
                    // Kiểm tra nếu số lượng sản phẩm bằng 0 thì đổi trạng thái thành sold_out
                    if (update.newStock === 0) {
                        await db.query(
                            `UPDATE products SET status = 'sold_out' WHERE id = ?`,
                            [update.id]
                        );
                    }
                }
                
                // Hoàn tất transaction
                await db.query('COMMIT');
                return true;
            } catch (txError) {
                // Đảm bảo luôn rollback khi có lỗi
                try {
                    await db.query('ROLLBACK');
                } catch (rollbackError) {
                    console.error('Lỗi khi rollback transaction:', rollbackError);
                }
                throw txError;
            }
        });
        
        res.status(200).json({
            success: true,
            message: 'Đơn hàng đã được tạo và thanh toán thành công'
        });
        
    } catch (error) {
        console.error('Lỗi khi tạo đơn hàng:', error);
        
        // Nếu là lỗi ứng dụng tùy chỉnh
        if (error.status && error.message) {
            return res.status(error.status).json({ 
                success: false, 
                message: error.message
            });
        }
        
        // Lỗi chung
        res.status(500).json({ 
            success: false, 
            message: 'Đã xảy ra lỗi khi xử lý đơn hàng. Vui lòng thử lại sau.' 
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

// API lấy danh sách đơn hàng của người dùng
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [orders] = await db.query(
            `SELECT o.*, 
                    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count 
             FROM orders o 
             WHERE o.user_id = ? 
             ORDER BY o.created_at DESC`,
            [userId]
        );
        
        res.json({ orders });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
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