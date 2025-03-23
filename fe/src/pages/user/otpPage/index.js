import { memo } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
const OtpPage = () => {
    return (
        <div className="otp-page">
            <div className="form-otp">
                    <div className="title">
                        <h1>Nhập mã OTP</h1>
                    </div>
                    <div className="input-group">
                        <input
                            type="fname"
                            id="fname"
                            name="fname"
                            placeholder="Mã OTP"
                        />
                       
                    </div>
                    <div className="btn">
                        <Link to="/" className="cf-btn"><button type="button">Xác nhận</button></Link>
                    </div>
                </div>
            </div>
    )
}

export default memo (OtpPage);