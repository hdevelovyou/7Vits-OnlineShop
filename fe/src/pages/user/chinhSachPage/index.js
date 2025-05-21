import { memo } from "react";
import "./style.scss";

const ChinhSachPage = () => {
  return (
    <div id="content">
      <div className="policy-container">
        <div className="policy-header">
          <h1>Chính Sách Mua Bán & Giao Dịch</h1>
        </div>
        
        <div className="policy-section">
          <h2>1. Đối tượng áp dụng</h2>
          <p>Chính sách này áp dụng cho tất cả người mua và người bán tham gia giao dịch trên nền tảng của chúng tôi, bao gồm các sản phẩm số như:</p>
          <ul>
            <li>CD Key (Steam, Origin, Battle.net,...)</li>
            <li>Tài khoản game (Account Game)</li>
            <li>Vật phẩm game và dịch vụ số khác</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>2. Quy định với người bán</h2>
          <h3>2.1. Điều kiện tài khoản bán hàng</h3>
          <p>Người bán phải cung cấp tài khoản trắng thông tin, nghĩa là:</p>
          <ul>
            <li>Không liên kết email, số điện thoại, bảo mật 2 lớp.</li>
            <li>Không có lịch sử cá nhân trên tài khoản (email cá nhân, thông tin thanh toán, liên kết nền tảng khác).</li>
            <li>Tài khoản cần sẵn sàng để người mua có thể đổi thông tin ngay sau khi nhận hàng.</li>
          </ul>

          <h3>2.2. Chính sách rút tiền</h3>
          <ul>
            <li>Số tiền thu được từ mỗi đơn hàng sẽ được tạm giữ trong 7 ngày kể từ thời điểm giao dịch thành công.</li>
            <li>Sau 7 ngày, nếu không có khiếu nại hoặc yêu cầu bảo hành từ người mua, số tiền sẽ được tự động mở khóa để rút.</li>
            <li>Trong thời gian này, người bán có trách nhiệm hỗ trợ bảo hành nếu có lỗi xảy ra theo mục 3 bên dưới.</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>3. Chính sách bảo hành</h2>
          <p>Tất cả tài khoản game hoặc key game bán ra phải có thời gian bảo hành tối thiểu 7 ngày kể từ thời điểm giao hàng.</p>
          
          <h3>Bảo hành áp dụng trong các trường hợp:</h3>
          <ul>
            <li>Tài khoản không thể đăng nhập do bị thu hồi.</li>
            <li>Key bị khóa, đã qua sử dụng hoặc không kích hoạt được do lỗi từ phía người bán.</li>
          </ul>

          <h3>Không bảo hành trong các trường hợp:</h3>
          <ul>
            <li>Người mua tự thay đổi thông tin gây mất quyền truy cập.</li>
            <li>Bị khóa tài khoản do vi phạm điều khoản nhà phát hành (sử dụng cheat, tool, thay đổi IP liên tục,...).</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>4. Chính sách dành cho người mua</h2>
          <h3>4.1. Quy trình nhận sản phẩm</h3>
          <ul>
            <li>Sau khi thanh toán thành công, người mua sẽ nhận được sản phẩm qua email hoặc giao diện tài khoản.</li>
            <li>Người mua có trách nhiệm kiểm tra ngay và tiến hành đổi thông tin tài khoản (nếu là account) để tránh bị mất quyền kiểm soát.</li>
          </ul>

          <h3>4.2. Khiếu nại và hoàn tiền</h3>
          <ul>
            <li>Khiếu nại cần được gửi trong vòng 7 ngày kể từ ngày mua.</li>
            <li>Cần có bằng chứng rõ ràng (video/ảnh ghi lại quá trình sử dụng sản phẩm, lỗi gặp phải).</li>
            <li>Chúng tôi sẽ đóng vai trò trung gian xử lý tranh chấp giữa hai bên.</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>5. Trách nhiệm và cam kết</h2>
          <p>Chúng tôi chỉ là nền tảng trung gian, không trực tiếp tạo ra sản phẩm.</p>
          <p>Cam kết giữ tiền trung gian và đảm bảo quyền lợi hai chiều:</p>
          <ul>
            <li>Người mua được nhận đúng sản phẩm, hoạt động bình thường.</li>
            <li>Người bán nhận tiền sau khi hết thời gian bảo hành cam kết.</li>
          </ul>
          <p>Mọi hành vi gian lận, spam, hoặc bán sản phẩm vi phạm bản quyền sẽ bị khóa tài khoản vĩnh viễn.</p>
        </div>

        <div className="policy-section">
          <h2>6. Liên hệ hỗ trợ</h2>
          <ul>
            <li>Email: <a href="mailto:7vits.shop@gmail.com">7vits.shop@gmail.com</a></li>
            <li>Hotline/Zalo/Fanpage: 7VITS - <a href="https://www.facebook.com/7vits.shop" target="_blank" rel="noopener noreferrer">https://www.facebook.com/7vits.shop</a></li>
            <li>Thời gian làm việc: 8h – 22h hàng ngày</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default memo(ChinhSachPage); 