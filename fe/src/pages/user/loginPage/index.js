import { memo, useState, useEffect } from "react";
import "./style.scss";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaCircleUser } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const LoginPage = () => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const savedUser = localStorage.getItem("rememberedUser");
        const savedPassword = localStorage.getItem("rememberedPassword");

        if (savedUser && savedPassword) {
            setUserName(savedUser);
            setPassword(savedPassword);
            setRemember(true);
        }
        
        // Kiểm tra xem người dùng có bị đá ra do token hết hạn không hoặc lỗi xác thực
        const params = new URLSearchParams(location.search);
        const errorType = params.get('error');
        const customMessage = params.get('message');
        
        if (params.get('expired') === 'true') {
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (errorType === 'email_conflict') {
            setError(customMessage ? decodeURIComponent(customMessage) : "Email này đã được sử dụng cho tài khoản khác. Vui lòng đăng nhập bằng phương thức ban đầu.");
        } else if (errorType === 'auth_failed') {
            setError(customMessage ? decodeURIComponent(customMessage) : "Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
        }
    }, [location.search]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userName, password })
            });

            const data = await response.json();
            console.log('User role ở frontend:', data.user && data.user.role);//kiểm tra xem role có tồn tại không
            if (!response.ok) throw new Error(data.error);


            // Nếu checkbox "Ghi nhớ đăng nhập" được chọn, lưu username và password vào localStorage
            if (remember) {
                localStorage.setItem("rememberedUser", userName);
                localStorage.setItem("rememberedPassword", password);
            } else {
                localStorage.removeItem("rememberedUser");
                localStorage.removeItem("rememberedPassword");
            }
            const oldUser = JSON.parse(localStorage.getItem("user"));
            const existingAvatarUrl = oldUser ? oldUser.avatarUrl : "https://sv1.anhsieuviet.com/2025/04/10/7VITS-9.png";
            const mergedUser = {
                ...data.user,
                avatarUrl: existingAvatarUrl || data.user.avatarUrl, // Giữ nguyên avatarUrl cũ nếu có
            };
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(mergedUser));
            localStorage.setItem("userId", data.user.id);
            
            if(data.user.role === "admin") {
                navigate("/admin");
            } else {
                window.dispatchEvent(new Event("userLoggedIn")); 
                navigate("/");
            }
             
        } catch (err) {
            if (err.response?.status === 403) {
                setError(err.response.data.error);
            } else {
            setError(err.message);
            }
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
    };

    return (
        <div className="login-page">
            <div className="form-group">
                <form onSubmit={handleLogin}>
                    <div className="title">
                        <h1>Đăng nhập</h1>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="input-group">
                        <FaCircleUser className="icon" />
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Tên tài khoản"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <FaLock className="icon" />
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="remember-forgot">
                        <label>
                            <input
                                type="checkbox"
                                id="remember"
                                name="remember"
                                checked={remember}
                                onChange={() => setRemember(!remember)}
                            />
                            Ghi nhớ đăng nhập
                        </label>
                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                    </div>

                    <div className="google-btn">
                        <button type="button" onClick={handleGoogleLogin}>
                            <FcGoogle className="icon" /> Đăng nhập bằng Google
                        </button>
                    </div>
                    
                    <div className="login-btn">
                        <button type="submit">Đăng nhập</button>
                    </div>

                   

                    <div className="sig-btn">
                        <Link to="/register" onClick={()=>window.scroll(0,0)}><button type="button">Đăng ký</button></Link>
                    </div>
                    <div className="sig-btn-mobile">
                    <p>Chưa có tài khoản?
                        <Link to="/register" onClick={()=>window.scroll(0,0)}>
                         Đăng ký ngay
                        </Link>
                    </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(LoginPage);