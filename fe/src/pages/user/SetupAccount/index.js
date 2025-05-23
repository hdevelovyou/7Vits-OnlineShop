import { memo, useState, useEffect } from "react";
import "./style.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCircleUser } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { FaCheck, FaTimes } from "react-icons/fa";

const SetupAccount = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [setupToken, setSetupToken] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false
    });

    // Extract token from URL params when component mounts
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (!token) {
            setError("Token không hợp lệ hoặc đã hết hạn");
            return;
        }
        setSetupToken(token);
    }, [location]);

    // Validate password criteria whenever password changes
    useEffect(() => {
        setPasswordCriteria({
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password)
        });
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Validate inputs
        if (!userName || !password || !confirmPassword) {
            setError("Vui lòng điền đầy đủ thông tin");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu không khớp");
            setLoading(false);
            return;
        }

        // Check if all password criteria are met
        const allCriteriaMet = Object.values(passwordCriteria).every(criteria => criteria);
        if (!allCriteriaMet) {
            setError("Mật khẩu không đáp ứng tất cả các yêu cầu");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/setup-account`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ setupToken, userName, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || "Đã xảy ra lỗi khi thiết lập tài khoản");
            }

            // Save user data to localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("userId", data.user.id);

            // Set login status
            if (setIsLoggedIn && typeof setIsLoggedIn === 'function') {
                setIsLoggedIn(true);
            }

            // Redirect to home page
            navigate("/");
            
        } catch (error) {
            console.error("Setup account error:", error);
            setError(error.message || "Đã xảy ra lỗi khi thiết lập tài khoản");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="setup-account-page">
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="title">
                        <h1>Thiết lập tài khoản</h1>
                        <p>Hãy tạo tên người dùng và mật khẩu cho tài khoản của bạn</p>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="input-group">
                        <FaCircleUser className="icon" />
                        <input
                            type="text"
                            name="username"
                            placeholder="Tên người dùng"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="icon" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password criteria indicators */}
                    <div className="password-criteria">
                        <div className={`criteria-item ${passwordCriteria.length ? 'met' : ''}`}>
                            {passwordCriteria.length ? <FaCheck /> : <FaTimes />}
                            <span>8+ ký tự</span>
                        </div>
                        <div className={`criteria-item ${passwordCriteria.lowercase ? 'met' : ''}`}>
                            {passwordCriteria.lowercase ? <FaCheck /> : <FaTimes />}
                            <span>Chữ thường</span>
                        </div>
                        <div className={`criteria-item ${passwordCriteria.uppercase ? 'met' : ''}`}>
                            {passwordCriteria.uppercase ? <FaCheck /> : <FaTimes />}
                            <span>Chữ hoa</span>
                        </div>
                        <div className={`criteria-item ${passwordCriteria.number ? 'met' : ''}`}>
                            {passwordCriteria.number ? <FaCheck /> : <FaTimes />}
                            <span>Số</span>
                        </div>
                    </div>

                    <div className="input-group">
                        <FaLock className="icon" />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Xác nhận mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="submit-btn">
                        <button type="submit" disabled={loading}>
                            {loading ? "Đang xử lý..." : "Hoàn tất thiết lập"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(SetupAccount); 