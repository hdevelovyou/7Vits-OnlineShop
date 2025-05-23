import { memo, useState, useEffect } from "react";
import Header from "../header";
import Footer from "../footer";
import { useNavigate, useLocation } from "react-router-dom";
import ChatbotComponent from "../../../../components/ChatBot/ChatBot";
import chat from "../../../../components/logochat"
import ChatButton from "../../../../components/logochat";

const MasterLayout = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem("token") ? true : false;
    });
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const isChatPage = location.pathname.startsWith('/chat');

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
            <Header cart={cart} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} sluong={cart.length} />

            {/* Truyền dữ liệu qua children nếu là function */}
            {children && typeof children === "function"
                ? children({ isLoggedIn, setIsLoggedIn, cart, setCart, updateCart })
                : children}

            {/* Ẩn Footer và Chatbot nếu đang ở /chat */}
            {!isChatPage && <Footer />}

            {!isChatPage && (
                <div style={{
                    position: 'fixed',
                    right: '20px',
                    top: '660px',
                    zIndex: 1000,
                    width: '50px',
                    height: '50px',
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <ChatButton />
                </div>
            )}

            {!isChatPage && (
                <div style={{
                    position: 'fixed',
                    right: '20px',
                    bottom: '20px',
                    zIndex: 1000
                }}>
                    <ChatbotComponent />
                </div>
            )}
        </div>
    );
};

export default memo(MasterLayout);