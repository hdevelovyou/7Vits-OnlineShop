import { memo, useState, useEffect } from "react";
import "./style.scss";
import { CiFacebook } from "react-icons/ci";
import { FaInstagram, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../../../../assets/images/logo.png";
import { ROUTES } from "../../../../utils/router.js";
import { IoSearchCircleSharp } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { AiOutlineMenu, AiOutlineSearch, AiOutlineUser } from "react-icons/ai";
import { AiOutlineDown } from "react-icons/ai";

const menuItems = [
  {
    name: "Trang chủ",
    path: ROUTES.USER.HOME,
  },
  {
    name: "Cửa hàng",
    path: ROUTES.USER.STORE,
  },
  {
    name: "Danh mục",
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

const Header = ({ isLoggedIn, setIsLoggedIn, sluong }) => { // Nhận props isLoggedIn và setIsLoggedIn
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHumbergerMenuOpen, setIsHumbergerMenuOpen] = useState(false);
  const [isShowSubmenu, setIsShowSubmenu] = useState(false);

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
    <>
      <div className={`humberger_menu_overlay ${isHumbergerMenuOpen ? "active" : ""
        }`} onClick={() => setIsHumbergerMenuOpen(false)} />

      <div className={`humberger_menu_wrapper ${isHumbergerMenuOpen ? "show" : ""}`}>
        <div className="header__menu_navbar">
          <div className="input-search">
            <input type="text" placeholder="Nhập từ khóa cần tìm kiếm" />
            <AiOutlineSearch className="header-search" />
          </div>
          <ul>
            {menuItems.map((menu, menuKey) => (
              <li key={menuKey}>
                {menu.name === "Danh mục" ? (
                  // Mục "Danh mục": chỉ toggle submenu mà không đóng menu
                  <Link
                    to={menu.path}
                    onClick={(e) => {
                      e.preventDefault(); // Ngăn không chuyển hướng ngay
                      // Toggle hiển thị submenu
                      const newMenuItems = [...menuItems];
                      newMenuItems[menuKey].isShowSubmenu = !newMenuItems[menuKey].isShowSubmenu;
                      setIsShowSubmenu(newMenuItems);
                    }}
                  >
                    {menu.name}
                    {menu.child && menu.child.length > 0 && (
                      <AiOutlineDown className="header__menu_navbar_icon" />
                    )}
                  </Link>
                ) : (
                  // Các mục khác: đóng menu và chuyển hướng
                  <Link
                    to={menu.path}
                    onClick={() => {
                      window.scrollTo(0, 0);
                      setIsHumbergerMenuOpen(false);
                    }}
                  >
                    {menu.name}
                  </Link>
                )}
                {menu.child && menu.child.length > 0 && (
                  <ul className={`header-submenu ${menu.isShowSubmenu ? "show__submenu" : ""}`}>
                    {menu.child.map((child, childKey) => (
                      <li key={childKey}>
                        <Link
                          to={child.path}
                          onClick={() => {
                            window.scrollTo(0, 0);
                            setIsHumbergerMenuOpen(false);
                          }}
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>


      </div>
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
              <div className="col-lg-3 col-sm-6">
                <div className="header-logo">
                  <Link to={ROUTES.USER.HOME} onClick={() => window.scrollTo(0, 0)} style={{ textDecoration: "none" }}>
                    <img src={logo} alt="7vits-logo" />
                  </Link>
                  <h1>7VITS</h1>
                </div>
              </div>
              <div className="col-lg-3 ">
                <nav className="header-menu">
                  <ul>
                    {menuItems.map((menu, menuKey) => (
                      <li key={menuKey}>
                        {menu.name === "Trang chủ" ? (
                          <Link to={menu.path} onClick={() => window.scrollTo(0, 0)}>
                            {menu.name}
                          </Link>
                        ) : (
                          <Link to={menu.path} onClick={() => window.scrollTo(0, 0)}>{menu.name}</Link>
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
              {/* responsive tablet */}
              <div className="col-lg-3 col-sm-6 mobile-menu">
                <div className="header-login-signup">
                  <div className="search">
                    <IoSearchCircleSharp />
                  </div>
                  <Link to="/login" onClick={() => window.scrollTo(0, 0)} className="login-btn-mobile">
                    <AiOutlineUser />
                  </Link>
                  <ul className="cart">
                    <li>
                      <Link to="/gio-hang" onClick={() => window.scrollTo(0, 0)} style={{ textDecoration: "none" }}>
                        <FaShoppingCart />
                        <span>{sluong}</span>
                      </Link>
                    </li>
                  </ul>
                  {isLoggedIn ? (
                    <>
                      <Link to="/profile " className="profile-btn">
                        <CgProfile />
                      </Link>
                      <button className="logout-btn" onClick={handleLogout}>
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/register " onClick={() => window.scrollTo(0, 0)} className="signup-btn">
                        Đăng ký
                      </Link>
                      <Link to="/login" onClick={() => window.scrollTo(0, 0)} className="login-btn">
                        Đăng nhập
                      </Link>
                    </>
                  )}
                  <div className="hamergur_open">
                    <AiOutlineMenu
                      onClick={() => setIsHumbergerMenuOpen(true)}
                    />
                  </div>
                </div>
              </div>
              {/* responsive tablet */}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(Header);