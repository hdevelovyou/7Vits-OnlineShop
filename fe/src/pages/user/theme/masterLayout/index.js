import { memo, useState, useEffect } from "react";
import Header from "../header";
import Footer from "../footer";
import productPage from "../../productPage";
import { useNavigate, useLocation } from "react-router-dom";
import ChatbotComponent from "../../../../components/ChatBot/ChatBot";

const MasterLayout = ({ children }) => {
    // Khởi tạo state isLoggedIn với giá trị từ localStorage
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem("token") ? true : false;
    });
    
    const navigate = useNavigate();
    const location = useLocation();

    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });
    // Theo dõi thay đổi của isLoggedIn
    useEffect(() => {
        if (!isLoggedIn) {
            // Xóa token khi logout
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    }, [isLoggedIn]);

    
    // Không sử dụng React.Children.map nữa, thay vào đó truyền props trực tiếp
    return (
        <div>
            <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} sluong={cart.length} />
            {children && typeof children === 'function' 
                ? children({ isLoggedIn, setIsLoggedIn, cart, setCart }) 
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
}

export default memo(MasterLayout);