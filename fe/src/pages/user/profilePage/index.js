import { memo, useState, useEffect } from "react";
import "./style.scss";
import { FaUser, FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";

const ProfilePage = () => {
    const [user, setUser] = useState({
        userName: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    
    // URL của ảnh mặc định - thay thế bằng URL thật của bạn
    const defaultAvatarUrl = "https://sv1.anhsieuviet.com/2025/04/10/7VITS-9.png"; 

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser({
                userName: parsedUser.userName || "",
            });
            setNewUserName(parsedUser.userName || "");
        }
    }, []);

    const handleEditUserName = () => {
        setIsEditing(true);
    };

    const handleSaveUserName = () => {
        if (newUserName.trim() !== "") {
            // Get existing user data
            const userData = localStorage.getItem("user");
            if (userData) {
                const parsedUser = JSON.parse(userData);
                
                // Update userName
                parsedUser.userName = newUserName;
                
                // Save back to localStorage
                localStorage.setItem("user", JSON.stringify(parsedUser));
                
                // Update user state
                setUser(prev => ({
                    ...prev,
                    userName: newUserName
                }));
                
                setIsEditing(false);
                setSuccessMessage("Tên người dùng đã được cập nhật thành công!");
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            }
        }
    };

    const handleCancelEdit = () => {
        // Reset to current userName
        setNewUserName(user.userName);
        setIsEditing(false);
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <h1>Thông Tin Cá Nhân</h1>
                
                {successMessage && (
                    <div className="success-message">
                        <FaCheck className="success-icon" />
                        {successMessage}
                    </div>
                )}
                
                <div className="profile-section">
                    <div className="avatar-section">
                        <div className="avatar-container">
                            {/* Hiển thị ảnh mặc định */}
                            <img 
                                src={defaultAvatarUrl} 
                                alt="Default Avatar" 
                                className="user-avatar" 
                                onError={(e) => {
                                    // Fallback nếu URL ảnh lỗi
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="avatar-placeholder" style={{ display: 'none' }}>
                                <FaUser className="avatar-icon" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="user-info">
                        <div className="info-row">
                            <label>Tên người dùng:</label>
                            <div className="info-value">
                                <span>{user.userName}</span>
                            </div>
                        </div>
                        <div className="profile-action-buttons">
                            <Link to="/sell-product" className="nav-link sell-product-button">
                                Đăng bán sản phẩm
                            </Link>
                            <Link to="/my-products" className="nav-link sell-product-button">
                                Sản phẩm của tôi
                            </Link>
                        </div>
                    </div>
                </div>
                
                {/* Add the sell product link button */}
                
            </div>
        </div>
    );
};

export default memo(ProfilePage);