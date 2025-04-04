import { memo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCircleUser } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import axios from "axios";
import "./style.scss";

const FacebookAuthCompletionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        userName: "",
        password: "",
        confirmPassword: "",
        facebookId: "",
        email: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        // Get user data from URL parameters
        const params = new URLSearchParams(location.search);
        const userParam = params.get('user');
        
        if (userParam) {
            try {
                const userData = JSON.parse(decodeURIComponent(userParam));
                console.log("User data from URL:", userData); // Debug: Xem dữ liệu thực tế
                
                // Kiểm tra ID có thể được lưu dưới tên khác
                const facebookId = userData.facebookId || userData.id;
                
                if (!facebookId) {
                    console.error("Không tìm thấy Facebook ID trong dữ liệu người dùng:", userData);
                    setError("Không tìm thấy thông tin Facebook ID");
                    return;
                }
                
                setFormData(prev => ({
                    ...prev,
                    facebookId: facebookId,
                    email: userData.email || ""
                }));
                
            } catch (err) {
                console.error("Error parsing user data:", err);
                setError("Có lỗi xảy ra khi xử lý thông tin người dùng.");
            }
        } else {
            setError("Không có dữ liệu người dùng");
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
        
        if (!formData.facebookId || !formData.email) {
            setError("Thiếu thông tin Facebook ID hoặc email");
            return;
        }
        
        console.log("Form data being sent:", {
            userName: formData.userName,
            password: formData.password,
            facebookId: formData.facebookId,
            email: formData.email
        });
        
        setLoading(true);
        try {
            // Gửi đúng các trường mà server cần
            const res = await axios.post("http://localhost:5000/api/auth/complete-facebook-signup", {
                userName: formData.userName,
                password: formData.password,
                facebookId: formData.facebookId,
                email: formData.email
            });
            
            // Get the token from URL parameters
            const params = new URLSearchParams(location.search);
            const token = params.get('token');
            
            // Store the token and user data
            if (token) {
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify({
                    id: res.data.id || "",
                    userName: formData.userName,
                    email: formData.email
                }));
                
                alert("Hoàn tất đăng ký thành công!");
                navigate("/");
            } else {
                setError("Không tìm thấy token xác thực");
            }
        } catch (err) {
            console.error("Error during signup completion:", err.response || err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError(err.message || "Đăng ký thất bại. Vui lòng thử lại sau.");
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="facebook-auth-completion-page">
            <form className="form-completion" onSubmit={handleSubmit}>
                <div className="title">
                    <h1>Hoàn tất đăng ký tài khoản</h1>
                    <p>Vui lòng nhập tên người dùng và mật khẩu để hoàn tất đăng ký</p>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                <div className="input-group">
                    <FaCircleUser className="icon" />
                    <input 
                        type="text" 
                        name="userName" 
                        placeholder="Tên tài khoản" 
                        value={formData.userName}
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
                        value={formData.password}
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="input-group">
                    <FaLock className="icon" />
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="Xác nhận mật khẩu" 
                        value={formData.confirmPassword}
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="completion-btn">
                    <button type="submit" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                    </button>
                </div>
                
                {/* Debug section to see values - remove in production */}
                <div style={{display: 'none'}}>
                    <p>facebookId: {formData.facebookId}</p>
                    <p>email: {formData.email}</p>
                </div>
            </form>
        </div>
    );
};

export default memo(FacebookAuthCompletionPage);