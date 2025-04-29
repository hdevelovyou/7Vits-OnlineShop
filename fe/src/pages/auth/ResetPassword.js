import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.scss";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const email = localStorage.getItem("resetEmail"); // Lấy email đã lưu khi quên mật khẩu
            if (!email) {
                setError("Không tìm thấy email. Vui lòng quay lại bước quên mật khẩu.");
                return;
            }
            console.log("Reset Password:", email, password);
            const res = await axios.post("/api/auth/reset-password", { email, password });

            if (res.data.success) {
                alert("Đổi mật khẩu thành công!");
                localStorage.removeItem("resetEmail"); // Xóa email lưu
                navigate("/login"); // Chuyển về trang đăng nhập
            } else {
                setError(res.data.message || "Có lỗi xảy ra, vui lòng thử lại.");
            }
        } catch (err) {
            console.error(err);
            setError("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="otp-page">
        <form className="form-otp" onSubmit={handleSubmit}>
            <div className="title">
                <h1>Đặt lại mật khẩu</h1>
            </div>
    
            <div className="input-group">
                <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
    
            <div className="input-group">
                <input
                    type="password"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
    
            {error && <div className="error-message">{error}</div>}
    
            <div className="btn">
                <button type="submit" className="cf-btn" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Xác nhận"}
                </button>
            </div>
        </form>
    </div>
    
    );
};

export default memo(ResetPassword);
