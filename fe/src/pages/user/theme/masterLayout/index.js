import { memo, useState, useEffect } from "react";
import Header from "../header";
import Footer from "../footer";
import { useNavigate, useLocation } from "react-router-dom";
import ChatbotComponent from "../../../../components/ChatBot/ChatBot";

const MasterLayout = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem("token") ? true : false;
    });

    const navigate = useNavigate();
    const location = useLocation();

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

    // Sync cart with localStorage changes
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === "cart") {
                try {
                    const updatedCart = event.newValue ? JSON.parse(event.newValue) : [];
                    setCart(updatedCart);
                } catch (error) {
                    console.error("Error parsing updated cart from localStorage:", error);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    }, [isLoggedIn]);

    return (
        <div>
            <Header cart={cart} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} sluong={cart.length} />
            {children && typeof children === "function"
                ? children({ isLoggedIn, setIsLoggedIn, cart, setCart, updateCart,  })
                : children}
            <Footer />
            <div style={{
                position: 'fixed',
                right: '20px',
                bottom: '20px',
                zIndex: 1000
            }}>
                <ChatbotComponent />
            </div>
        </div>
    );
};

export default memo(MasterLayout);