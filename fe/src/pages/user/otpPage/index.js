import { memo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./style.scss";

const OtpPage = () => {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;

    const handleSubmit = async () => {
        if (!otp) {
            setError("Vui lòng nhập mã OTP");
            return;
        }
        try {
            await axios.post("/api/auth/verify-otp", { email, otp });
            // Nếu verify thành công, cho phép đổi mật khẩu
            localStorage.setItem("resetEmail", email);
            navigate("/reset-password", { state: { email } });
        } catch (err) {
            console.error(err);
            setError("Mã OTP không đúng hoặc đã hết hạn");
        }
    };

    return (
        <div className="otp-page">
            <div className="form-otp">
                <div className="title">
                    <h1>Nhập mã OTP</h1>
                </div>
                <div className="input-group">
                    <input
                        type="text"
                        id="otp"
                        name="otp"
                        placeholder="Mã OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="btn">
                    <button type="button" onClick={handleSubmit} className="cf-btn">
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default memo(OtpPage);
