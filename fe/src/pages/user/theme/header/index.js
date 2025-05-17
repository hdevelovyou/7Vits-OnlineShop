import { memo, useState, useEffect } from "react";
import "./style.scss";
import { CiFacebook } from "react-icons/ci";
import { FaInstagram, FaShoppingCart, FaWallet, FaStore, FaGamepad, FaKey } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../../../../assets/images/logo.png";
import { ROUTES } from "../../../../utils/router.js";
import { IoSearchCircleSharp } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { AiOutlineMenu, AiOutlineSearch, AiOutlineUser } from "react-icons/ai";
import { AiOutlineDown } from "react-icons/ai";
import { FaHouse } from "react-icons/fa6";
import { MdEmojiEvents, MdLogout } from "react-icons/md";
const menuItems = [
  {
    name: "Ví",
    icon: <FaWallet />,
    path: ROUTES.USER.TOPUP,
    isWallet: true,
  },
  {
    name: "Trang chủ",
    icon: <FaHouse />,
    path: ROUTES.USER.HOME,
  },
  {
    name: "Cửa hàng",
    icon: <FaStore />,
    path: ROUTES.USER.STORE,
  },
  {
    name: "Chính sách",
    icon: <MdEmojiEvents />,
    path: "/su-kien",
  },
 {
    name: "Đăng xuất",
    icon: <MdLogout />,
    path: "/",
  },
  
];

const Header = ({ isLoggedIn, setIsLoggedIn, sluong }) => { // Nhận props isLoggedIn và setIsLoggedIn
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHumbergerMenuOpen, setIsHumbergerMenuOpen] = useState(false);
  const [isShowSubmenu, setIsShowSubmenu] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Fetch wallet balance when user is logged in
    if (isLoggedIn) {
      fetchWalletBalance();
      
      // Refresh balance when tab becomes visible again
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Setup interval to refresh balance every minute when the app is active
      const balanceInterval = setInterval(fetchWalletBalance, 60000);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(balanceInterval);
      };
    }
  }, [isLoggedIn]);
  
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      fetchWalletBalance();
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await fetch(`/api/auth/wallet-balance?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setWalletBalance(data.balance);
      } else {
        console.error("Failed to fetch wallet balance:", data.error);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false); // Gọi setIsLoggedIn để cập nhật trạng thái đăng nhập về false khi logout
    localStorage.removeItem("token"); // Xóa token
    localStorage.removeItem("userId"); // Xóa userId
    window.location.href = "/"; 
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
            {menuItems.filter(menu=>menu.name!=="Danh mục").map((menu, menuKey) => {
              if (menu.name === "Đăng xuất" && !isLoggedIn) return null; // Nếu không đăng nhập thì không hiển thị mục "Đăng xuất"
              if (menu.name === "Ví" && !isLoggedIn) return null; // Không hiển thị mục "Ví" nếu chưa đăng nhập

              return (
                <li key={menuKey}
                  className={menu.name === "Đăng xuất" ? "logout-mobile" : ""}
                >
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
                      {menu.icon}
                      <span>{menu.name}</span>
                      {menu.child && menu.child.length > 0 && (
                        <AiOutlineDown className="header__menu_navbar_icon" />
                      )}
                    </Link>
                  ) : menu.name === "Đăng xuất" ? (
                    // xu ly cho dang xuat
                    <Link
                      to={menu.path}
                      onClick={() => {
                        window.scrollTo(0, 0);
                        handleLogout();
                        setIsHumbergerMenuOpen(false);
                      }}
                    >
                      {menu.icon}
                      <span>{menu.name}</span>
                   
                    </Link>
                  ) : menu.isWallet ? (
                    // Hiển thị số dư ví
                    <Link
                      to={menu.path}
                      onClick={() => {
                        window.scrollTo(0, 0);
                        setIsHumbergerMenuOpen(false);
                      }}
                    >
                      {menu.icon}
                      <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(walletBalance)}</span>
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
                      {menu.icon}
                      <span>{menu.name}</span>
                    
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
              );
            })}
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
                    {menuItems
                      .filter(menu => menu.name !== "Đăng xuất" &&
                                      menu.name !=="Key Bản quyền" &&
                                      menu.name !=="Key Game" &&
                                      menu.name !=="Tài khoản Game" 
                                      && menu.name !=="Ví"
                      ) 
                      .map((menu, menuKey) => (
                        <li key={menuKey}>
                          {menu.name === "Trang chủ" ? (
                            <Link to={menu.path} onClick={() => window.scrollTo(0, 0)}>
                              {menu.name}
                            </Link>
                          ) : (
                            <Link to={menu.path} onClick={() => window.scrollTo(0, 0)}>
                              {menu.name}
                            </Link>
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
                  {
                    isLoggedIn ? (
                      <Link to="/profile" onClick={() => window.scrollTo(0, 0)} className="login-btn-mobile">
                        <CgProfile />
                      </Link>
                    ) : (
                      <Link to="/login" onClick={() => window.scrollTo(0, 0)} className="login-btn-mobile">
                        <AiOutlineUser />
                      </Link>
                    )
                  }
                  {isLoggedIn && (
                    <Link to="/profile" onClick={() => window.scrollTo(0, 0)} className="profile-btn">
                      <AiOutlineUser />
                    </Link>
                  )}

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
                      
                      <Link to="/" onClick={handleLogout} className="logout-btn">
                        Đăng xuất
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/register " onClick={() => window.scrollTo(0, 0)} className="signup-btn">
                        Đăng ký
                      </Link>
                      <Link to="/login" onClick={() => window.scrollTo(0, 0)} className="login-btn-header">
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