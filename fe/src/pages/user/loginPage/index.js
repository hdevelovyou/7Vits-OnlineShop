import { memo } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
import { FaFacebook } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { FaCircleUser } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
const LoginPage = () => {
    return(
        <div className="login-page">
            <div>
                
                <div className="form-group">
                    <div>
                        <form>
                            <div className="title">
                                <h1>Đăng nhập</h1>
                            </div>
                            <div className="input-group">
                                <FaCircleUser className="icon" />
                                <input type="username" id="username" name="username" placeholder="Tên tài khoản" />
                            </div>
                            <div className="input-group">
                                <FaLock className="icon"/>
                                <input type="password" id="password" name="password" placeholder="Mật khẩu" />
                            </div>
    
                            <div className="remember-forgot">
                                <label>
                                    <input type="checkbox" id="remember" name="remember" />
                                     Ghi nhớ đăng nhập
                                </label>
                                <Link to = "/forgot-password">Quên mật khẩu?</Link>
                            </div>
    
                            <div className="otherLogin">
                                <FaFacebook className="icon"/>
                                <FcGoogle className="icon-gg"/>
    
                            </div>
                            <div className="login-btn">
                                <Link to = "/"><button type="login">Đăng nhập</button></Link>
                            </div>
                            <div className="sig-btn">
                                <Link to = "/register"><button type="signup">Đăng ký</button></Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default memo  (LoginPage);