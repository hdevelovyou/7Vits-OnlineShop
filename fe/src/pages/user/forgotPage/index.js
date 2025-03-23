import { memo } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
const ForgotPassword = () => {
    return (
        <div className="forgot-page">
            <div className="form-otp">
                    <div className="title">
                        <h1>Quên mật khẩu</h1>
                    </div>
                    <div className="input-group">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Nhập Email / SĐT"
                        />
                       
                    </div>
                    <div className="btn">
                        <Link to="/otp" className="cf-btn"><button type="button">Xác nhận</button></Link>
                    </div>
                </div>
            </div>
    )
}

export default memo (ForgotPassword);