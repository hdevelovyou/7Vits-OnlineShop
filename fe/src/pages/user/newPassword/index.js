import { memo } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
const NewPassword = () => {
    return (
        <div className="forgot-page">
            <div className="form-otp">
                    <div className="title">
                        <h1>Nhập mật khẩu mới</h1>
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Mật khẩu mới"
                        />
                       
                    </div>
                    <div className="input-group">
                        <input
                            type="confirmPassword"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Nhập lại mật khẩu mới"
                        />
                       
                    </div>
                    <div className="btn">
                        <Link to="/" className="cf-btn"><button type="button">Xác nhận</button></Link>
                    </div>
                </div>
            </div>
    )
}

export default memo (NewPassword);