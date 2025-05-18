import { memo, useState } from "react";
import "./style.scss";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!email) {
            setError("Vui lòng nhập email");
            return;
        }
        try {
            await axios.post("/api/auth/forgot-password", { email });
            // Nếu thành công, chuyển trang
            navigate("/otp-for-forgot", { state: { email } });
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
              console.error("Status:", err.response.status);
              console.error("Data:", err.response.data);
              setError(err.response.data.message || "Không thể gửi OTP. Vui lòng kiểm tra lại email.");
            } else {
              console.error(err);
              setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
            }
          }
          
    };

    return (
        <div className="forgot-page">
            <div className="form-otp">
                <div className="title">
                    <h1>Quên mật khẩu</h1>
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="input-group">
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Nhập Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                
                <div className="btn">
                    <button type="button" onClick={handleSubmit} className="cf-btn">
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default memo(ForgotPassword);
