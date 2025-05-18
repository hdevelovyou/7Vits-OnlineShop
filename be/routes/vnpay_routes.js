const express = require('express');
const router = express.Router();
const moment = require('moment');
const config = require('config');
const crypto = require('crypto');
const querystring = require('qs');
const db = require('../config/connectDB'); 

//sort object by key
function sortObject(obj){
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
        if (obj.hasOwnProperty(key)){
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++){
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

//save transaction to database
async function saveTransaction(userId, amount, txnRef, orderInfo){
    try {
        //add transaction record
        const [transactionResult] = await db.query(
            `INSERT INTO transactions 
            (user_id, amount, transaction_type, status, description, reference_id) 
            VALUES (?, ?, 'deposit', 'pending', ?, ?)`,
            [userId, amount, orderInfo, txnRef]
        );

        const transactionId = transactionResult.insertId;

        //add VNPay payment record
        await db.query(
            `INSERT INTO payment_vnpay 
            (transaction_id, vnp_TxnRef, vnp_Amount, vnp_OrderInfo) 
            VALUES (?, ?, ?, ?)`,
            [transactionId, txnRef, amount * 100, orderInfo]    
        );

        return transactionId;
    } catch (error) {
        console.error('Error saving transaction:', error);
        throw error;
    }
}

async function updateTransactionStatus(txnRef, status, responseData) {
    try {
        console.log('⚙️ Starting updateTransactionStatus for txnRef:', txnRef, 'status:', status);
        
        // Find transaction by reference ID
        const [transactions] = await db.query(
            `SELECT id, status FROM transactions WHERE reference_id = ?`,
            [txnRef]
        );
        
        console.log('🔍 Found transactions:', JSON.stringify(transactions));
        
        if (transactions.length === 0) {
            console.error('⚠️ Transaction not found for txnRef:', txnRef);
            throw new Error('Transaction not found');
        }
        
        const transactionId = transactions[0].id;
        
        // Check if transaction is already processed (completed or failed)
        if (transactions[0].status === 'completed' || transactions[0].status === 'failed') {
            console.log('🚫 Transaction already processed, txnRef:', txnRef, 'current status:', transactions[0].status);
            return {
                alreadyProcessed: true,
                transactionId: transactionId,
                currentStatus: transactions[0].status
            };
        }
        
        const transactionStatus = status === '00' ? 'completed' : 'failed';
        
        console.log('📝 Updating transaction status to:', transactionStatus, 'for ID:', transactionId);
        
        // Update transaction status
        await db.query(
            `UPDATE transactions SET status = ? WHERE id = ?`,
            [transactionStatus, transactionId]
        );
        
        // Update user wallet if payment successful
        if (status === '00') {
            const [transaction] = await db.query(
                `SELECT user_id, amount FROM transactions WHERE id = ?`,
                [transactionId]
            );
            
            console.log('💰 Adding funds to wallet for user:', transaction[0].user_id, 'amount:', transaction[0].amount);
            
            try {
                // Check if user has a wallet
                const [userWallet] = await db.query(
                    `SELECT * FROM user_wallets WHERE user_id = ?`,
                    [transaction[0].user_id]
                );
                
                if (userWallet.length === 0) {
                    console.log('🔧 Creating new wallet for user:', transaction[0].user_id);
                    // Create wallet if it doesn't exist
                    await db.query(
                        `INSERT INTO user_wallets (user_id, balance) VALUES (?, ?)`,
                        [transaction[0].user_id, transaction[0].amount]
                    );
                } else {
                    // Update existing wallet
                    await db.query(
                        `UPDATE user_wallets 
                        SET balance = balance + ? 
                        WHERE user_id = ?`,
                        [transaction[0].amount, transaction[0].user_id]
                    );
                }
                console.log('✅ Wallet updated successfully');
            } catch (walletError) {
                console.error('❌ Error updating wallet:', walletError);
                throw walletError;
            }
        }
        
        console.log('📝 Updating VNPay payment details for transaction:', transactionId);
        
        // Update VNPay payment info
        await db.query(
            `UPDATE payment_vnpay SET 
            vnp_ResponseCode = ?,
            vnp_TransactionNo = ?,
            vnp_BankCode = ?,
            vnp_PayDate = ?
            WHERE transaction_id = ?`,
            [
                responseData.vnp_ResponseCode,
                responseData.vnp_TransactionNo,
                responseData.vnp_BankCode,
                responseData.vnp_PayDate,
                transactionId
            ]
        );
        
        console.log('✅ Transaction update completed successfully');
        return true;
    } catch (error) {
        console.error('❌ Error updating transaction:', error);
        throw error;
    }
}

// Create VNPay payment URL
router.post('/create_payment_url', async function (req, res) {
    try {
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    
        let tmnCode = config.get('vnp_TmnCode');
        let secretKey = config.get('vnp_HashSecret');
        let vnpUrl = config.get('vnp_Url');
        let returnUrl = req.body.returnUrl || config.get('vnp_ReturnUrl');
        
        let orderId = moment(date).format('DDHHmmss');
        let amount = req.body.amount;
        let userId = req.body.userId; // Get user ID from request
        let orderInfo = req.body.orderInfo || 'Thanh toan don hang';
        let orderType = req.body.orderType || 'billpayment';
        let locale = req.body.locale || 'vn';
        let bankCode = req.body.bankCode || '';
        
        // Save transaction to database
        await saveTransaction(userId, amount, orderId, orderInfo);
        
        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = orderType;
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        
        if (bankCode && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }
    
        vnp_Params = sortObject(vnp_Params);
    
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        
        let paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });
        
        res.status(200).json({
            status: 'success',
            message: 'Create payment URL success',
            vnpUrl: paymentUrl
        });
    } catch (error) {
        console.error('Error creating payment URL:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create payment URL',
            error: error.message
        });
    }
});

// VNPay Return URL API
router.get('/vnpay_return', async function (req, res) {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];
    
        // Remove hash and hash type from params
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
    
        // Sort params
        vnp_Params = sortObject(vnp_Params);
    
        // Get config values
        let secretKey = config.get('vnp_HashSecret');
    
        // Create signature
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    
        // Check signature
        if (secureHash === signed) {
            // Valid signature
            // Check transaction status
            const responseCode = vnp_Params['vnp_ResponseCode'];
            
            // Update transaction in database
            const updateResult = await updateTransactionStatus(vnp_Params['vnp_TxnRef'], responseCode, vnp_Params);
            
            // If transaction already processed, return appropriate response
            if (updateResult && updateResult.alreadyProcessed) {
                console.log('🔄 Responding to repeated request for txnRef:', vnp_Params['vnp_TxnRef']);
                
                // Still return success but log that it was already processed
                res.status(200).json({
                    status: updateResult.currentStatus === 'completed' ? 'success' : 'failed',
                    message: updateResult.currentStatus === 'completed' ? 
                        'Thanh toán đã được xử lý trước đó' : 'Thanh toán thất bại (đã xử lý trước đó)',
                    data: vnp_Params,
                    alreadyProcessed: true
                });
                return;
            }
            
            // Return payment result
            res.status(200).json({
                status: responseCode === '00' ? 'success' : 'failed',
                message: responseCode === '00' ? 'Thanh toán thành công' : 'Thanh toán thất bại',
                data: vnp_Params
            });
        } else {
            // Invalid signature
            res.status(200).json({
                status: 'failed',
                message: 'Chữ ký không hợp lệ',
                data: null
            });
        }
    } catch (error) {
        console.error('Error processing return URL:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process return URL',
            error: error.message
        });
    }
});

// VNPay IPN URL API (Instant Payment Notification)
router.get('/vnpay_ipn', async function (req, res) {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];
        
        let orderId = vnp_Params['vnp_TxnRef'];
        let rspCode = vnp_Params['vnp_ResponseCode'];
    
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
    
        vnp_Params = sortObject(vnp_Params);
        let secretKey = config.get('vnp_HashSecret');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     
        
        // Check order exists in database
        const [transactions] = await db.query(
            `SELECT id, status FROM transactions WHERE reference_id = ?`,
            [orderId]
        );
        
        let checkOrderId = transactions.length > 0;
        let paymentStatus = checkOrderId ? transactions[0].status : '0';
        
        // Check amount matches
        let checkAmount = true;
        if (checkOrderId) {
            const [transactionAmount] = await db.query(
                `SELECT amount FROM transactions WHERE reference_id = ?`,
                [orderId]
            );
            checkAmount = transactionAmount[0].amount * 100 == vnp_Params['vnp_Amount'];
        }
        
        if(secureHash === signed) { //kiểm tra checksum
            if(checkOrderId) {
                if(checkAmount) {
                    if(paymentStatus != "completed") { //kiểm tra trạng thái giao dịch
                        if(rspCode == "00") {
                            // Thanh toán thành công - cập nhật CSDL
                            const updateResult = await updateTransactionStatus(orderId, rspCode, vnp_Params);
                            
                            // If already processed, still return success to VNPay
                            if (updateResult && updateResult.alreadyProcessed) {
                                console.log('🔄 IPN: Already processed transaction:', orderId);
                                res.status(200).json({RspCode: '00', Message: 'Success (already processed)'});
                                return;
                            }
                            
                            res.status(200).json({RspCode: '00', Message: 'Success'});
                        }
                        else {
                            // Thanh toán thất bại - cập nhật CSDL
                            const updateResult = await updateTransactionStatus(orderId, rspCode, vnp_Params);
                            
                            // If already processed, still return success to VNPay
                            if (updateResult && updateResult.alreadyProcessed) {
                                console.log('🔄 IPN: Already processed failed transaction:', orderId);
                                res.status(200).json({RspCode: '00', Message: 'Success (already processed)'});
                                return;
                            }
                            
                            res.status(200).json({RspCode: '00', Message: 'Success'});
                        }
                    }
                    else {
                        res.status(200).json({RspCode: '02', Message: 'This order has been updated to the payment status'});
                    }
                }
                else {
                    res.status(200).json({RspCode: '04', Message: 'Amount invalid'});
                }
            }       
            else {
                res.status(200).json({RspCode: '01', Message: 'Order not found'});
            }
        }
        else {
            res.status(200).json({RspCode: '97', Message: 'Checksum failed'});
        }
    } catch (error) {
        console.error('Error processing IPN:', error);
        res.status(200).json({RspCode: '99', Message: 'Unknown error'});
    }
});

// Query transaction
router.post('/querydr', function (req, res) {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();

    let vnp_TmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnp_Api = config.get('vnp_Api');
    
    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = req.body.transDate;
    
    let vnp_RequestId = moment(date).format('HHmmss');
    let vnp_Version = '2.1.0';
    let vnp_Command = 'querydr';
    let vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;
    
    let vnp_IpAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
    
    let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TxnRef + "|" + vnp_TransactionDate + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
    
    let hmac = crypto.createHmac("sha512", secretKey);
    let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest("hex"); 
    
    let dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
    };

    // Sử dụng axios thay vì request (deprecated)
    const axios = require('axios');
    axios.post(vnp_Api, dataObj)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(error => {
            res.status(500).json({
                status: 'error',
                message: 'Lỗi khi truy vấn giao dịch',
                error: error.message
            });
        });
});

// Refund transaction
router.post('/refund', function (req, res) {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();

    let vnp_TmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnp_Api = config.get('vnp_Api');
    
    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = req.body.transDate;
    let vnp_Amount = req.body.amount * 100;
    let vnp_TransactionType = req.body.transType;
    let vnp_CreateBy = req.body.user;
            
    let vnp_RequestId = moment(date).format('HHmmss');
    let vnp_Version = '2.1.0';
    let vnp_Command = 'refund';
    let vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;
            
    let vnp_IpAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    
    let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
    
    let vnp_TransactionNo = '0';
    
    let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TransactionType + "|" + vnp_TxnRef + "|" + vnp_Amount + "|" + vnp_TransactionNo + "|" + vnp_TransactionDate + "|" + vnp_CreateBy + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
    let hmac = crypto.createHmac("sha512", secretKey);
    let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest("hex");
    
    let dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TransactionType': vnp_TransactionType,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_Amount': vnp_Amount,
        'vnp_TransactionNo': vnp_TransactionNo,
        'vnp_CreateBy': vnp_CreateBy,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
    };
    
    // Sử dụng axios thay vì request (deprecated)
    const axios = require('axios');
    axios.post(vnp_Api, dataObj)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(error => {
            res.status(500).json({
                status: 'error',
                message: 'Lỗi khi hoàn tiền giao dịch',
                error: error.message
            });
        });
});

module.exports = router; 





