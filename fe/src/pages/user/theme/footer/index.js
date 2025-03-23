import { memo } from "react";
import "./style.scss";
import logo from '../../../../assets/images/logo.png';
import { CiFacebook } from "react-icons/ci";
import { FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import momo from '../../../../assets/images/momo.png';
import zl from '../../../../assets/images/zalopay.png';
import vs from '../../../../assets/images/vs.png';    
const Footer = () => {
    return (
        <div id="footer">
            <div className="footer-top">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 col-xl-6 footer-top-left">
                            <ul>
                                <li><img src={momo} alt="momo"/></li>
                                <li><img src={zl} alt="zl"/></li>
                                <li><img src={vs} alt="vs"/></li>
                                <li>và nhiều hình thức thanh toán khác</li>

                            </ul>
                        </div>
                        <div className="col-lg-3 col-xl-3 footer-top-left"></div>
                        <div className="col-lg-3 col-xl-3 footer-top-right"><p>© 2025 7VITS. All Rights Reserved.</p></div>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 col-xl-3 footer-bottom-left">
                            <h3>Liên hệ</h3>
                            <p>Địa chỉ: Hàn Thuyên, khu phố 6 P, Thủ Đức, Hồ Chí Minh</p>
                            <p>Điện thoại: 0123456789</p>
                            <p>7vits.shop@gmail.com</p>
                            <ul>
                                <li>
                                    <Link to={"https://www.facebook.com/7vits.shop"} style={{ textDecoration: 'none' }}>
                                        <CiFacebook/>
                                    </Link>
                                </li>  
                                <li>
                                    <Link to={"https://www.instagram.com/7vits.shop/"} style={{ textDecoration: 'none' }}>
                                        <FaInstagram />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="col-lg-3 col-xl-6 footer-bottom-center">
                           <div className="footer-logo"><img src={logo} alt="7vits-logo" /></div>
                        </div>
                        <div className="col-lg-3 col-xl-3 footer-bottom-right">
                            <h3>7VITS là ai?</h3>
                            <p>7VITS là nơi những giao dịch của bạn luôn được đảm bảo an toàn, tin cậy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

export default memo (Footer);