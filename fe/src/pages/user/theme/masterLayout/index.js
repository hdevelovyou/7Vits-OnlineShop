import { memo, useState, useEffect } from "react";
import Header from "../header";
import Footer from "../footer";
import "./style.scss";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import ChatButton from "../../../../components/logochat";
import Chat from "../../../../components/Chat";

const MasterLayout = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem("token") ? true : false;
    });
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [unreadConversations, setUnreadConversations] = useState(0);
    const handleUnreadChange = (count) => setUnreadConversations(count);

    const navigate = useNavigate();
    const location = useLocation();
    const isChatPage = location.pathname.startsWith('/chat');
    const receiverId = isChatPage ? location.pathname.split('/')[2] : null;
    const receiverName = isChatPage ? new URLSearchParams(location.search).get('receiverName') : null;

    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem("cart");
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error parsing cart from localStorage:", error);
            return [];
        }
    });

    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
    };

    // Verify token on component mount and when location changes
    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        const userData = await response.json();
                        // Update user data in localStorage
                        localStorage.setItem('user', JSON.stringify(userData.user));
                        localStorage.setItem('userId', userData.user.id);
                        setIsLoggedIn(true);
                    } else {
                        // Token is invalid
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        localStorage.removeItem("userId");
                        setIsLoggedIn(false);
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("userId");
                    setIsLoggedIn(false);
                }
            } else {
                setIsLoggedIn(false);
            }
            setIsAuthLoading(false);
        };
        
        verifyToken();
    }, []); // Only run on mount

    // Listen for localStorage changes (for cross-tab sync)
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === "cart") {
                try {
                    const updatedCart = event.newValue ? JSON.parse(event.newValue) : [];
                    setCart(updatedCart);
                } catch (error) {
                    console.error("Error parsing updated cart from localStorage:", error);
                }
            } else if (event.key === "token") {
                // Handle token changes from other tabs
                const newToken = event.newValue;
                if (newToken) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                    localStorage.removeItem("user");
                    localStorage.removeItem("userId");
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    // Clean up localStorage when logged out
    useEffect(() => {
        if (!isLoggedIn) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userId");
        }
    }, [isLoggedIn]);

    // Show loading while verifying auth
    if (isAuthLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '18px' 
            }}>
                Đang kiểm tra đăng nhập...
            </div>
        );
    }

    return (
        <div>
            {/* Luôn hiện Header */}
            <Header unreadConversations={unreadConversations} cart={cart} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} sluong={cart.length} />
            <Chat key={receiverId} receiverId={receiverId} receiverName={receiverName} onUnreadChange={handleUnreadChange} isChatPage={isChatPage} style={{ display: isChatPage ? undefined : "none" }} />
            {/* Truyền dữ liệu qua children nếu là function */}
            {children && typeof children === "function"
                ? children({ isLoggedIn, setIsLoggedIn, cart, setCart, updateCart })
                : children}

            {/* Ẩn Footer nếu đang ở /chat */}
            {!isChatPage && <Footer />}

            {!isChatPage && isLoggedIn &&(
                <div className="chat" >
                    <ChatButton unreadConversations={unreadConversations} />
                </div>
            )}
        </div>
    );
};

export default memo(MasterLayout);