import { memo } from "react";
import "./style.scss";
import { CiFacebook } from "react-icons/ci";
import { FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from '../../../../assets/images/logo.png';
import { useState } from "react";
import { ROUTES } from "../../../../utils/router.js";
const Header = () => {
    const [menu, setMenu] = useState([
        {
            name: "Trang chủ",
            path: ROUTES.USER.HOME,
        },
        {
            name: "Cửa hàng",
            path: ROUTES.USER.PRODUCT,
        },
        {
            name: "Danh mục",
            path: "/",
            isShowSubmenu: false,
            child:[
                {
                    name: "loại Sản phẩm",
                    path: "/",
                },
                {
                    name: "loại Sản phẩm",
                    path: "/",
                },
                {
                    name: "loại Sản phẩm",
                    path: "/",
                },
            ]
        },
        {
            name: "Tin tức",
            path: "/",
        },
        {
            name: "Hướng dẫn",
            path: "/",
        }
    ]);
    return (
       <>
           <div className="header-top">
                <div className="container">
                    <div className="row">
                        <div className="col-3 header-top-left">
                                <p>7vits.shop@gmail.com</p>
                        </div>
                        <div className="col-6 header-top-center">
                                <p>Giảm giá đến 30% cho đơn hàng đầu tiên của bạn</p>
                        </div>
                        <div className="col-3 header-top-right">
                            <ul>
                                <li>
                                    <Link to={"https://www.facebook.com/7vits.shop"} style={{ textDecoration: 'none' }}>
                                        <CiFacebook className="word"/>
                                    </Link>
                                </li>  
                                <li>
                                    <Link to={"https://www.instagram.com/7vits.shop/"} style={{ textDecoration: 'none' }}>
                                        <FaInstagram className="word" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                        
                </div>
           </div>
           <div className="header-main">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 col-xl-3">
                           <div className="header-logo">
                                <Link to="/" style={{ textDecoration: 'none' }}>
                                    <img src={logo} alt="7vits-logo" />
                                </Link>
                           </div>
                        </div>
                        <div className="col-lg-3 col-xl-6">
                         <nav className="header-menu">
                               <ul>
                                    {menu?.map((menu, menuKey) => (
                                        <li key={menuKey}>
                                            <Link to ={menu.path}>{menu?.name}</Link>
                                        </li>
                                    ))}
                               </ul>
                         </nav>
                        </div>
                        <div className="header-login-signup">
                            <div className="col-lg-3 col-xl-3">LOGIN/SIGNUP</div>
                        </div>
                    </div>
                </div>
           </div>
       </>
    )
}

export default memo (Header);