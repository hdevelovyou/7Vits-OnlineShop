require('dotenv').config();

const VNP_TMN_CODE = process.env.VNP_TMN_CODE || 'PINVQSPT';
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || 'FQBRXYZMVTAEGEL0OLIHOJV4TYHBP6EJ';
const VNP_URL = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNP_RETURN_URL = process.env.VNP_RETURN_URL || 'http://localhost:3000/wallet/vnpay-return';
const VNP_API_URL = process.env.VNP_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';
const VNP_VERSION = process.env.VNP_VERSION || '2.1.0';
const VNP_COMMAND = process.env.VNP_COMMAND || 'pay';
const VNP_CURR_CODE = process.env.VNP_CURR_CODE || 'VND';
const VNP_LOCALE = process.env.VNP_LOCALE || 'vn';

module.exports = {
    VNP_TMN_CODE,
    VNP_HASH_SECRET,
    VNP_URL,
    VNP_RETURN_URL,
    VNP_API_URL,
    VNP_VERSION,
    VNP_COMMAND,
    VNP_CURR_CODE,
    VNP_LOCALE
}; 