const crypto = require('crypto');
const querystring = require('querystring');
const moment = require('moment');
const config = require('../config/vnpay');

/**
 * Create VNPay payment URL
 * @param {Object} paymentData - Payment information
 * @param {number} paymentData.amount - Amount to pay in VND (must be converted to smallest unit, e.g. 10000 = 10,000 VND)
 * @param {string} paymentData.orderInfo - Order description
 * @param {string} paymentData.orderType - Order type code (e.g. 100000 for recharge)
 * @param {string} paymentData.ipAddr - IP address of client
 * @param {string} paymentData.returnUrl - URL to redirect after payment (optional, will use config if not provided)
 * @returns {string} VNPay payment URL
 */
const createPaymentUrl = (paymentData) => {
    // Format date for VNPay
    const createDate = moment().format('YYYYMMDDHHmmss');
    const orderId = moment().format('HHmmss');

    // Prepare data for VNPay
    let vnpParams = {
        vnp_Version: config.VNP_VERSION,
        vnp_Command: config.VNP_COMMAND,
        vnp_TmnCode: config.VNP_TMN_CODE,
        vnp_Locale: config.VNP_LOCALE,
        vnp_CurrCode: config.VNP_CURR_CODE,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: paymentData.orderInfo,
        vnp_OrderType: paymentData.orderType || '100000', // Default for topup
        vnp_Amount: paymentData.amount * 100, // Convert to smallest unit (VNPay requires amount in lowest currency unit)
        vnp_ReturnUrl: paymentData.returnUrl || config.VNP_RETURN_URL,
        vnp_IpAddr: paymentData.ipAddr,
        vnp_CreateDate: createDate,
    };

    // Sort params by key (required by VNPay)
    const sortedParams = sortObject(vnpParams);
    
    // Convert to querystring
    const signData = querystring.stringify(sortedParams, { encode: false });
    
    // Create signature
    const hmac = crypto.createHmac('sha512', config.VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    // Add signature to params
    vnpParams.vnp_SecureHash = signed;
    
    // Create full URL
    const paymentUrl = `${config.VNP_URL}?${querystring.stringify(vnpParams, { encode: true })}`;
    
    return paymentUrl;
};

/**
 * Verify VNPay return data
 * @param {Object} vnpParams - Query params returned from VNPay
 * @returns {boolean} Is data valid
 */
const verifyReturnUrl = (vnpParams) => {
    const secureHash = vnpParams.vnp_SecureHash;
    
    // Remove the hash and signature from params
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;
    
    // Sort object by key name
    const sortedParams = sortObject(vnpParams);
    
    // Convert to querystring
    const signData = querystring.stringify(sortedParams, { encode: false });
    
    // Create signature
    const hmac = crypto.createHmac('sha512', config.VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    // Compare generated hash with the hash returned from VNPay
    return secureHash === signed;
};

/**
 * Sort object by key
 * @param {Object} obj - Object to sort
 * @returns {Object} Sorted object
 */
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    
    for (const key of keys) {
        if (obj.hasOwnProperty(key)) {
            sorted[key] = obj[key];
        }
    }
    
    return sorted;
}

module.exports = {
    createPaymentUrl,
    verifyReturnUrl
}; 