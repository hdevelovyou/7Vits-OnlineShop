import { memo, useState, useEffect } from "react";
import "./style.scss";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaFacebook } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { FaCircleUser } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { handleFacebookLogin } from "../../../services/facebookAuth";

const LoginPage = ({ setIsLoggedIn }) => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Check for Facebook login success
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const success = params.get('success');
        const token = params.get('token');

        if (success === 'true' && token) {
            localStorage.setItem("token", token);
            if (setIsLoggedIn && typeof setIsLoggedIn === 'function') {
                setIsLoggedIn(true);
            }
            alert("Đăng nhập Facebook thành công!");
            navigate("/");
        }
    }, [location, setIsLoggedIn, navigate]);

    // Check if setIsLoggedIn is a function
    useEffect(() => {
        if (setIsLoggedIn && typeof setIsLoggedIn !== 'function') {
            console.error('setIsLoggedIn không phải là hàm:', setIsLoggedIn);
        }
    }, [setIsLoggedIn]);

    // Check for saved login data when component mounts
    useEffect(() => {
        const savedUser = localStorage.getItem("rememberedUser");
        const savedPassword = localStorage.getItem("rememberedPassword");

        if (savedUser && savedPassword) {
            setUserName(savedUser);
            setPassword(savedPassword);
            setRemember(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userName, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            if (remember) {
                localStorage.setItem("rememberedUser", userName);
                localStorage.setItem("rememberedPassword", password);
            } else {
                localStorage.removeItem("rememberedUser");
                localStorage.removeItem("rememberedPassword");
            }

            if (setIsLoggedIn && typeof setIsLoggedIn === 'function') {
                setIsLoggedIn(true);
            } else {
                console.error('setIsLoggedIn không phải là hàm:', setIsLoggedIn);
            }
            
            alert("Đăng nhập thành công!");
            navigate("/");
        } catch (err) {
            setError(err.message || "Đăng nhập thất bại!");
        } finally {
            setIsLoading(false);
        }
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
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                                disabled={isLoading}
                            />
                            Ghi nhớ đăng nhập
                        </label>
                        <Link to="/forgot-password" style={{ pointerEvents: isLoading ? 'none' : 'auto' }}>
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <div className="otherLogin">
                        <Link to="/" style={{ pointerEvents: isLoading ? 'none' : 'auto' }}>
                            <FcGoogle className="icon-gg" />
                        </Link>
                        <div 
                            onClick={() => handleFacebookLogin(setIsLoading, setError, setIsLoggedIn, navigate)} 
                            style={{ 
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            <FaFacebook className="icon-fb" />
                        </div>
                    </div>

                    <div className="login-btn">
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </div>

                    <div className="sig-btn">
                        <Link to="/register" style={{ pointerEvents: isLoading ? 'none' : 'auto' }}>
                            <button type="button" disabled={isLoading}>
                                Đăng ký
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(LoginPage);