const { GoogleGenerativeAI } = require('@google/generative-ai');
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
- Chuyên bán: Vật phẩm ảo
- Chính sách đổi trả: 7 ngày kể từ ngày nhận hàng
- Hotline: 1900-7777
- Email: 7vits.shop@gmail.com

HƯỚNG DẪN TRẢ LỜI:
1. Luôn chào hỏi thân thiện
2. Trả lời bằng tiếng Việt
3. Cung cấp thông tin chính xác về sản phẩm, chính sách
4. Hướng dẫn chi tiết khi khách hỏi về quy trình mua hàng, thanh toán
5. Khi không biết thông tin cụ thể, hãy hướng dẫn khách liên hệ hotline
6. Luôn kết thúc bằng câu hỏi có thể giúp gì thêm

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

            // Tạo prompt hoàn chình
            const fullPrompt = CUSTOMER_SUPPORT_PROMPT + conversationContext + "\n\nCâu hỏi của khách hàng: " + message;

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
    }
};

module.exports = chatbotController; 