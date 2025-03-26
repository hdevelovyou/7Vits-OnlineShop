import { memo, useState, useEffect } from "react";
import "./style.scss";
import { CiFacebook } from "react-icons/ci";
import { FaInstagram, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../../../../assets/images/logo.png";
import { ROUTES } from "../../../../utils/router.js";
import { IoSearchCircleSharp } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
const menuItems = [
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
    child: [
      { name: "Tài khoản Game", path: "/" },
      { name: "Key Bản quyền", path: "/" },
      { name: "Key Game", path: "/" },
    ],
  },
  {
    name: "Sự kiện",
    path: "/",
  },
];

const Header = ({ isLoggedIn, setIsLoggedIn }) => { // Nhận props isLoggedIn và setIsLoggedIn
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false); // Gọi setIsLoggedIn để cập nhật trạng thái đăng nhập về false khi logout
    localStorage.removeItem("token"); // Xóa token
    localStorage.removeItem("user"); // Xóa thông tin user
  };

  return (
    <div id="header" className={isScrolled ? "scrolled" : ""}>
      <div className="header-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-xl-3 header-top-left">
              <p>7vits.shop@gmail.com</p>
            </div>
            <div className="col-lg-3 col-xl-6 header-top-center">
              <p>Giảm giá đến 30% cho đơn hàng đầu tiên của bạn</p>
            </div>
            <div className="col-lg-3 col-xl-3 header-top-right">
              <ul>
                <li>
                  <Link to="https://www.facebook.com/7vits.shop" style={{ textDecoration: "none" }}>
                    <CiFacebook className="word" />
                  </Link>
                </li>
                <li>
                  <Link to="https://www.instagram.com/7vits.shop/" style={{ textDecoration: "none" }}>
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
                <Link to={ROUTES.USER.HOME} onClick={() => window.scrollTo(0, 0)} style={{ textDecoration: "none" }}>
                  <img src={logo} alt="7vits-logo" />
                </Link>
                <h1>7VITS</h1>
              </div>
            </div>
            <div className="col-lg-3 col-xl-6">
              <nav className="header-menu">
                <ul>
                  {menuItems.map((menu, menuKey) => (
                    <li key={menuKey}>
                      {menu.name === "Trang chủ" ? (
                        <Link to={menu.path} onClick={() => window.scrollTo(0, 0)}>
                          {menu.name}
                        </Link>
                      ) : (
                        <Link to={menu.path}>{menu.name}</Link>
                      )}
                      {menu.child && menu.child.length > 0 && (
                        <ul className="header-submenu">
                          {menu.child.map((child, childKey) => (
                            <li key={childKey}>
                              <Link to={child.path}>{child.name}</Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="col-lg-3 col-xl-3">
              <div className="header-login-signup">
                <div className="search">
                  <IoSearchCircleSharp />
                </div>
                <div className="cart">
                  <FaShoppingCart />
                </div>
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="profile-btn">
                      <CgProfile />
                    </Link>
                    <button className="logout-btn" onClick={handleLogout}>
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="signup-btn">
                      Đăng ký
                    </Link>
                    <Link to="/login" className="login-btn">
                      Đăng nhập
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Header);