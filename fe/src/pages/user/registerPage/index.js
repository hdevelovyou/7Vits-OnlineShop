import { memo } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
import { FaFacebook } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { FaCircleUser } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
const RegisterPage = () => {
    return (
        <div className="signup-page">
            <div className="form-sign">
                    <div className="title">
                        <h1>Đăng ký tài khoản</h1>
                    </div>
                    <div className="input-group">
                        <input
                            type="fname"
                            id="fname"
                            name="fname"
                            placeholder="Họ"
                        />
                        <input
                            type="lname"
                            id="lname"
                            name="lname"
                            placeholder="Tên"
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email / SĐT"
                        />
                    </div>
                    <div className="input-username">
                        <FaCircleUser className="icon" />
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Tên tài khoản"
                        />
                    </div>
                    <div className="input-group">
                        <FaLock className="icon" />
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Mật khẩu"
                        />
                        <input
                            type="confirmPassword"
                            id="conformPassword"
                            name="conformPassword"
                            placeholder="Xác nhận mật khẩu"
                        />
                    </div>

                <div className="signup">
                        <div className="otherSignUp">
                            <FaFacebook className="icon" />
                            <FcGoogle className="icon-gg" />
                        </div>
    
                        <div className="sig-btn">
                            <Link to="/otp-for-signup"><button type="button">Đăng ký</button></Link>
                        </div>
                </div>
            </div>
        </div>
    )
}

export default memo (RegisterPage);