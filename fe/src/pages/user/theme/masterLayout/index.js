import { memo, useState, useEffect } from "react"; // Thêm useEffect
import Header from "../header";
import Footer from "../footer";
import React from "react";

const MasterLayout = ({ children, ...props }) => {
    // Khởi tạo state isLoggedIn với giá trị từ localStorage
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem("token") ? true : false;
    });

    // Theo dõi thay đổi của isLoggedIn
    useEffect(() => {
        if (!isLoggedIn) {
            // Xóa token khi logout
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    }, [isLoggedIn]);

    // Truyền prop setIsLoggedIn cho tất cả component con
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { setIsLoggedIn });
        }
        return child;
    });

    return (
        <div {...props}>
            <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            {childrenWithProps}
            <Footer />
        </div>
    );
}

export default memo(MasterLayout);