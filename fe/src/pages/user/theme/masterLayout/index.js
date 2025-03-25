import { memo, useState } from "react"; // Import useState hook
import Header from "../header";
import Footer from "../footer";
import React from "react"; // Import React nếu chưa có

const MasterLayout = ({ children, ...props }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Khởi tạo state isLoggedIn

    // Hàm này để truyền props xuống các children, đặc biệt là component Login nếu nó nằm trong children
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type.name === 'LoginPage') { // **Quan trọng:** Kiểm tra tên component Login của bạn, có thể là 'LoginPage' hoặc 'Login'
            return React.cloneElement(child, { setIsLoggedIn: setIsLoggedIn }); // Truyền setIsLoggedIn xuống Login
        }
        return child;
    });

    return (
        <div {...props}>
            <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /> {/* Truyền isLoggedIn và setIsLoggedIn xuống Header */}
            {childrenWithProps} {/* Render children đã được truyền props (nếu có component Login trong children) */}
            <Footer />
        </div>
    )
}

export default memo (MasterLayout);