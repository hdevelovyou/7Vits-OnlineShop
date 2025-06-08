const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/connectDB');
require('dotenv').config({ path: './.env' });

// Kiểm tra API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('❌ GEMINI_API_KEY không được tìm thấy trong file config.env');
    process.exit(1);
}

console.log('✅ Gemini API Key đã được load thành công');

// Khởi tạo Gemini AI với API key
const genAI = new GoogleGenerativeAI(apiKey);

// Prompt cho chatbot hỗ trợ khách hàng
const CUSTOMER_SUPPORT_PROMPT = `
Bạn là một trợ lý AI thông minh tên là "VitBot" của cửa hàng trực tuyến 7Vits. Nhiệm vụ của bạn là hỗ trợ khách hàng một cách thân thiện và chuyên nghiệp.

THÔNG TIN VỀ CỬA HÀNG:
- Tên: 7Vits Online Shop
- Chuyên bán: Vật phẩm ảo (CD Keys, Tài khoản game, etc.)
- Chính sách đổi trả: 7 ngày kể từ ngày nhận hàng
- Hotline: 1900-7777
- Email: 7vits.shop@gmail.com

HƯỚNG DẪN TRẢ LỜI:
1. Luôn chào hỏi thân thiện
2. Trả lời bằng tiếng Việt
3. Cung cấp thông tin chính xác về sản phẩm, chính sách
4. Hướng dẫn chi tiết khi khách hỏi về quy trình mua hàng, thanh toán
5. Khi không biết thông tin cụ thể, hãy hướng dẫn khách liên hệ hotline
6. Khi có kết quả tìm kiếm sản phẩm, hãy giới thiệu chi tiết và gợi ý khách hàng
7. Luôn kết thúc bằng câu hỏi có thể giúp gì thêm

CÁCH XỬ LÝ KẾT QUẢ TÌM KIẾM SẢN PHẨM:
- Nếu có kết quả tìm kiếm, hãy giới thiệu các sản phẩm phù hợp
- Đề xuất sản phẩm có đánh giá cao hoặc bán chạy
- Nếu không tìm thấy, gợi ý khách hàng từ khóa khác hoặc liên hệ hỗ trợ
- Luôn hỏi thêm thông tin để tư vấn tốt hơn

Hãy trả lời câu hỏi sau một cách chuyên nghiệp:


Đây là Chính sách của Shop:
Chính Sách Mua Bán & Giao Dịch
1. Đối tượng áp dụng
Chính sách này áp dụng cho tất cả người mua và người bán tham gia giao dịch trên nền tảng của chúng tôi, bao gồm các sản phẩm số như:
CD Key (Steam, Origin, Battle.net,...)
Tài khoản game (Account Game)
Vật phẩm game và dịch vụ số khác
2. Quy định với người bán
2.1. Điều kiện tài khoản bán hàng
Người bán phải cung cấp tài khoản trắng thông tin, nghĩa là:
Không liên kết email, số điện thoại, bảo mật 2 lớp.
Không có lịch sử cá nhân trên tài khoản (email cá nhân, thông tin thanh toán, liên kết nền tảng khác).
Tài khoản cần sẵn sàng để người mua có thể đổi thông tin ngay sau khi nhận hàng.
2.2. Chính sách rút tiền
Số tiền thu được từ mỗi đơn hàng sẽ được tạm giữ trong 7 ngày kể từ thời điểm giao dịch thành công.
Sau 7 ngày, nếu không có khiếu nại hoặc yêu cầu bảo hành từ người mua, số tiền sẽ được tự động mở khóa để rút.
Trong thời gian này, người bán có trách nhiệm hỗ trợ bảo hành nếu có lỗi xảy ra theo mục 3 bên dưới.
3. Chính sách bảo hành
Tất cả tài khoản game hoặc key game bán ra phải có thời gian bảo hành tối thiểu 7 ngày kể từ thời điểm giao hàng.
Bảo hành áp dụng trong các trường hợp:
Tài khoản không thể đăng nhập do bị thu hồi.
Key bị khóa, đã qua sử dụng hoặc không kích hoạt được do lỗi từ phía người bán.
Không bảo hành trong các trường hợp:
Người mua tự thay đổi thông tin gây mất quyền truy cập.
Bị khóa tài khoản do vi phạm điều khoản nhà phát hành (sử dụng cheat, tool, thay đổi IP liên tục,...).
4. Chính sách dành cho người mua
4.1. Quy trình nhận sản phẩm
Sau khi thanh toán thành công, người mua sẽ nhận được sản phẩm qua email hoặc giao diện tài khoản.
Người mua có trách nhiệm kiểm tra ngay và tiến hành đổi thông tin tài khoản (nếu là account) để tránh bị mất quyền kiểm soát.
4.2. Khiếu nại và hoàn tiền
Khiếu nại cần được gửi trong vòng 7 ngày kể từ ngày mua.
Cần có bằng chứng rõ ràng (video/ảnh ghi lại quá trình sử dụng sản phẩm, lỗi gặp phải).
Chúng tôi sẽ đóng vai trò trung gian xử lý tranh chấp giữa hai bên.
5. Trách nhiệm và cam kết
Chúng tôi chỉ là nền tảng trung gian, không trực tiếp tạo ra sản phẩm.
Cam kết giữ tiền trung gian và đảm bảo quyền lợi hai chiều:
Người mua được nhận đúng sản phẩm, hoạt động bình thường.
Người bán nhận tiền sau khi hết thời gian bảo hành cam kết.
Mọi hành vi gian lận, spam, hoặc bán sản phẩm vi phạm bản quyền sẽ bị khóa tài khoản vĩnh viễn.
6. Liên hệ hỗ trợ
Email: 7vits.shop@gmail.com
Hotline/Zalo/Fanpage: 7VITS - https://www.facebook.com/7vits.shop
Thời gian làm việc: 8h – 22h hàng ngày
`;

// Hàm tìm kiếm sản phẩm trong database
async function searchProductsInDB(productName) {
    try {
        const searchTerm = `%${productName}%`;
        const sql = `
            SELECT p.id, p.name, p.description, p.price, p.category, 
                   p.stock, p.status, u.userName as seller_name,
                   COALESCE(AVG(r.rating), 0) as average_rating,
                   COUNT(r.rating) as rating_count,
                   (SELECT SUM(oi.quantity)
                    FROM order_items oi
                    JOIN orders o ON oi.order_id = o.id
                    WHERE oi.product_id = p.id AND o.status IN ('completed', 'processing')
                   ) as sold_count
            FROM products p
            JOIN users u ON p.seller_id = u.id
            LEFT JOIN ratings r ON p.id = r.product_id
            WHERE p.status = 'active' 
            AND (p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)
            GROUP BY p.id
            ORDER BY p.created_at DESC
            LIMIT 10
        `;
        
        const [results] = await db.query(sql, [searchTerm, searchTerm, searchTerm]);
        
        // Format kết quả
        return results.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            seller_name: product.seller_name,
            average_rating: parseFloat(product.average_rating).toFixed(1),
            rating_count: product.rating_count,
            sold_count: product.sold_count || 0
        }));
    } catch (error) {
        console.error('Lỗi tìm kiếm sản phẩm:', error);
        return [];
    }
}

// Hàm kiểm tra xem tin nhắn có phải là yêu cầu tìm kiếm sản phẩm không
function isProductSearchQuery(message) {
    const searchKeywords = [
        'tìm', 'tìm kiếm', 'tìm sản phẩm', 'có sản phẩm', 
        'sản phẩm nào', 'bán', 'key', 'game', 'account',
        'tài khoản', 'cd key', 'steam', 'origin', 'battle.net',
        'có không', 'có bán', 'còn', 'có còn'
    ];
    
    const lowerMessage = message.toLowerCase();
    return searchKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Hàm trích xuất từ khóa tìm kiếm từ tin nhắn
function extractSearchKeyword(message) {
    // Loại bỏ các từ không cần thiết
    const stopWords = ['tìm', 'tìm kiếm', 'có', 'bán', 'sản phẩm', 'nào', 'không', 'còn', 'key', 'game', 'tài', 'khoản'];
    
    let words = message.toLowerCase()
        .replace(/[^\w\s]/g, '') // Loại bỏ dấu câu
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.includes(word));
    
    // Nếu không có từ khóa sau khi lọc, trả về toàn bộ message gốc
    return words.length > 0 ? words.join(' ') : message;
}

const chatbotController = {
    // API xử lý tin nhắn từ chatbot
    async sendMessage(req, res) {
        try {
            const { message, conversationHistory = [] } = req.body;

            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: 'Tin nhắn không được để trống'
                });
            }

            console.log('📩 Nhận tin nhắn từ user:', message);

            // Kiểm tra xem có phải là yêu cầu tìm kiếm sản phẩm không
            let productSearchResults = [];
            let productInfo = "";
            
            if (isProductSearchQuery(message)) {
                console.log('🔍 Phát hiện yêu cầu tìm kiếm sản phẩm');
                const searchKeyword = extractSearchKeyword(message);
                console.log('🔑 Từ khóa tìm kiếm:', searchKeyword);
                
                productSearchResults = await searchProductsInDB(searchKeyword);
                
                if (productSearchResults.length > 0) {
                    productInfo = "\n\nKết quả tìm kiếm sản phẩm:\n";
                    productSearchResults.forEach((product, index) => {
                        productInfo += `${index + 1}. ${product.name}\n`;
                        productInfo += `   - Giá: ${product.price.toLocaleString('vi-VN')}₫\n`;
                        productInfo += `   - Danh mục: ${product.category}\n`;
                        productInfo += `   - Người bán: ${product.seller_name}\n`;
                        productInfo += `   - Đánh giá: ${product.average_rating}★ (${product.rating_count} lượt)\n`;
                        productInfo += `   - Đã bán: ${product.sold_count} sản phẩm\n`;
                        if (product.description) {
                            productInfo += `   - Mô tả: ${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}\n`;
                        }
                        productInfo += `   - Tình trạng: ${product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}\n\n`;
                    });
                } else {
                    productInfo = `\n\nKhông tìm thấy sản phẩm nào với từ khóa "${searchKeyword}". Bạn có thể thử tìm kiếm với từ khóa khác hoặc xem tất cả sản phẩm trên website.\n`;
                }
            }

            // Khởi tạo model - Sử dụng model mới thay vì gemini-pro đã deprecated
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Tạo context từ lịch sử hội thoại
            let conversationContext = "";
            if (conversationHistory.length > 0) {
                conversationContext = "\n\nLịch sử hội thoại:\n";
                conversationHistory.forEach((msg, index) => {
                    conversationContext += `${msg.role}: ${msg.content}\n`;
                });
            }

            // Tạo prompt hoàn chình với thông tin sản phẩm (nếu có)
            const fullPrompt = CUSTOMER_SUPPORT_PROMPT + conversationContext + productInfo + "\n\nCâu hỏi của khách hàng: " + message;

            console.log('🤖 Đang gọi Gemini API...');

            // Gọi API Gemini
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            console.log('✅ Gemini API phản hồi thành công');

            // Trả về kết quả
            res.json({
                success: true,
                response: text,
                productSearchResults: productSearchResults, // Thêm kết quả tìm kiếm sản phẩm
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Lỗi chatbot chi tiết:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            let errorMessage = 'Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau.';
            
            // Xử lý các loại lỗi cụ thể
            if (error.message.includes('API key not valid')) {
                errorMessage = 'API key Gemini không hợp lệ. Vui lòng kiểm tra cấu hình.';
            } else if (error.message.includes('quota')) {
                errorMessage = 'Đã vượt quá giới hạn API. Vui lòng thử lại sau.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet.';
            }
            
            res.status(500).json({
                success: false,
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // API lấy thông tin trạng thái chatbot
    async getStatus(req, res) {
        try {
            res.json({
                success: true,
                status: 'online',
                botName: 'VitBot',
                capabilities: [
                    'Tư vấn sản phẩm',
                    'Hướng dẫn mua hàng', 
                    'Chính sách đổi trả',
                    'Hỗ trợ thanh toán'
                ]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Không thể lấy thông tin trạng thái'
            });
        }
    },

    // API reset cuộc hội thoại
    async resetConversation(req, res) {
        try {
            res.json({
                success: true,
                message: 'Cuộc hội thoại đã được reset',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Không thể reset cuộc hội thoại'
            });
        }
    },

    // API tìm kiếm sản phẩm cho chatbot
    async searchProducts(req, res) {
        try {
            const { query } = req.body;
            
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Từ khóa tìm kiếm không được để trống'
                });
            }

            console.log('🔍 Tìm kiếm sản phẩm với từ khóa:', query);
            
            const products = await searchProductsInDB(query);
            
            res.json({
                success: true,
                products: products,
                count: products.length,
                query: query,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Lỗi tìm kiếm sản phẩm:', error);
            res.status(500).json({
                success: false,
                error: 'Đã xảy ra lỗi trong quá trình tìm kiếm sản phẩm'
            });
        }
    }
};

module.exports = chatbotController; 