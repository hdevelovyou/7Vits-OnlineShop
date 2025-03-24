import { memo, useState, useEffect } from "react";
import "./style.scss";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { FaCircleUser } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";

const LoginPage = () => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Khi component mount, kiểm tra xem có dữ liệu được lưu không
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

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userName, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Nếu checkbox "Ghi nhớ đăng nhập" được chọn, lưu username và password vào localStorage
            if (remember) {
                localStorage.setItem("rememberedUser", userName);
                localStorage.setItem("rememberedPassword", password);
            } else {
                localStorage.removeItem("rememberedUser");
                localStorage.removeItem("rememberedPassword");
            }

            alert("Đăng nhập thành công!");
            navigate("/");
        } catch (err) {
            alert(err.message);
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

                    <div className="otherLogin">
                        <FaFacebook className="icon" />
                        <FcGoogle className="icon-gg" />
                    </div>

                    <div className="login-btn">
                        <button type="submit">Đăng nhập</button>
                    </div>

                    <div className="sig-btn">
                        <Link to="/register"><button type="button">Đăng ký</button></Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(LoginPage);