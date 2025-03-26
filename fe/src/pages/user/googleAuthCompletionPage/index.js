import { memo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCircleUser } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import axios from "axios";
import "./style.scss";

const GoogleAuthCompletionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        userName: "",
        password: "",
        confirmPassword: "",
        googleId: "",
        email: ""
    });
    const [error, setError] = useState("");
    
    useEffect(() => {
        // Get user data from URL parameters
        const params = new URLSearchParams(location.search);
        const userParam = params.get('user');
        
        if (userParam) {
            try {
                const userData = JSON.parse(decodeURIComponent(userParam));
                setFormData(prev => ({
                    ...prev,
                    googleId: userData.googleId,
                    email: userData.email
                }));
            } catch (err) {
                console.error("Error parsing user data:", err);
                setError("Có lỗi xảy ra khi xử lý thông tin người dùng.");
            }
        }
    }, [location]);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu không khớp");
            return;
        }
        
        try {
            const res = await axios.post("http://localhost:5000/api/auth/complete-google-signup", formData);
            alert("Hoàn tất đăng ký thành công!");
            
            // Get the token from URL parameters
            const params = new URLSearchParams(location.search);
            const token = params.get('token');
            
            // Store the token and user data
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify({...formData, password: undefined}));
            
            navigate("/");
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError(err.message || "Đăng ký thất bại. Vui lòng thử lại sau.");
            }
        }
    };
    
    return (
        <div className="google-auth-completion-page">
            <form className="form-completion" onSubmit={handleSubmit}>
                <div className="title">
                    <h1>Hoàn tất đăng ký tài khoản</h1>
                    <p>Vui lòng nhập tên người dùng và mật khẩu để hoàn tất đăng ký</p>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                <div className="input-username">
                    <FaCircleUser className="icon" />
                    <input 
                        type="text" 
                        name="userName" 
                        placeholder="Tên tài khoản" 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="input-group">
                    <FaLock className="icon" />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Mật khẩu" 
                        onChange={handleChange} 
                        required 
                    />
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="Xác nhận mật khẩu" 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="completion-btn">
                    <button type="submit">Hoàn tất đăng ký</button>
                </div>
            </form>
        </div>
    );
};

export default memo(GoogleAuthCompletionPage);