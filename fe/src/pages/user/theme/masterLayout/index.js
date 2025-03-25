import { memo, useState, useEffect } from "react";
import Header from "../header";
import Footer from "../footer";
import { useNavigate, useLocation } from "react-router-dom";

const MasterLayout = ({ children }) => {
    // Khởi tạo state isLoggedIn với giá trị từ localStorage
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem("token") ? true : false;
    });
    
    const navigate = useNavigate();
    const location = useLocation();

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
            <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            {children && typeof children === 'function' 
                ? children({ isLoggedIn, setIsLoggedIn }) 
                : children}
            <Footer />
        </div>
    );
}

export default memo(MasterLayout);