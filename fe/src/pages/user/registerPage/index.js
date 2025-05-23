import { memo, useState, useEffect } from "react";
import "./style.scss";
import { useNavigate } from "react-router-dom";
import { FaCircleUser } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { FaCheck, FaTimes } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        userName: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Validate password criteria whenever password changes
    useEffect(() => {
        const password = formData.password;
        setPasswordCriteria({
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password)
        });
    }, [formData.password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu không khớp"); // Set error for password mismatch
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
            // Prepare data for API
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                userName: formData.userName,
                password: formData.password
            };

            await axios.post("/api/auth/register-otp", { email: formData.email }
            );

            // Sau khi backend trả về success, điều hướng sang trang nhập OTP:
            navigate("/otp-for-signup", {
                state: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    userName: formData.userName,
                    password: formData.password
                }
            });

        } catch (err) {
            // Better error handling to match your login page
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError(err.message || "Đăng ký thất bại. Vui lòng thử lại sau.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
    };

    return (
        <div className="signup-page">
            <form className="form-sign" onSubmit={handleSubmit}>
                <div className="title">
                    <h1>Đăng ký tài khoản</h1>
                </div>

                {/* Error message display, styled the same as in LoginPage */}
                {error && <p className="error-message">{error}</p>}

                <div className="input-group">
                    <input type="text" name="firstName" placeholder="Họ" onChange={handleChange} required />
                    <input type="text" name="lastName" placeholder="Tên" onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <input type="text" name="email" placeholder="Email / SĐT" onChange={handleChange} required />
                </div>
                <div className="input-username">
                    <FaCircleUser className="icon" />
                    <input type="text" name="userName" placeholder="Tên tài khoản" onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <FaLock className="icon" />
                    <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} required />
                </div>

                {/* Password criteria indicators */}
                <div className="password-criteria">
                    <div className={`criteria-item ${passwordCriteria.length ? 'met' : ''}`}>
                        {passwordCriteria.length ? <FaCheck /> : <FaTimes />}
                        <span>8+ Characters</span>
                    </div>
                    <div className={`criteria-item ${passwordCriteria.lowercase ? 'met' : ''}`}>
                        {passwordCriteria.lowercase ? <FaCheck /> : <FaTimes />}
                        <span>Lowercase</span>
                    </div>
                    <div className={`criteria-item ${passwordCriteria.uppercase ? 'met' : ''}`}>
                        {passwordCriteria.uppercase ? <FaCheck /> : <FaTimes />}
                        <span>Uppercase</span>
                    </div>
                    <div className={`criteria-item ${passwordCriteria.number ? 'met' : ''}`}>
                        {passwordCriteria.number ? <FaCheck /> : <FaTimes />}
                        <span>Number</span>
                    </div>
                </div>

                <div className="input-group">
                    <FaLock className="icon" />
                    <input type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu" onChange={handleChange} required />
                </div>
                <div className="signup">
                    <div className="sig-btn-rs">
                        <button type="submit" disabled={loading}>
                            {loading ? "Đang xử lý..." : "Đăng ký"}
                        </button>
                    </div>
                    
                    <div className="google-btn">
                        <button type="button" onClick={handleGoogleLogin}>
                            <FcGoogle className="icon" /> Đăng nhập bằng Google
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default memo(RegisterPage);