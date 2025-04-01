import { memo, useState, useEffect, useRef } from "react";
import "./style.scss";
import { FaCamera, FaUser, FaCheck } from "react-icons/fa";

const ProfilePage = () => {
    const [user, setUser] = useState({
        userName: "",
        avatar: null
    });
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser({
                userName: parsedUser.userName || "",
                avatar: localStorage.getItem("userAvatar") || null
            });
            setNewUserName(parsedUser.userName || "");
        }
    }, []);

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAvatar = () => {
        if (previewAvatar) {
            // Save avatar to localStorage
            localStorage.setItem("userAvatar", previewAvatar);
            
            // Update user state
            setUser(prev => ({
                ...prev,
                avatar: previewAvatar
            }));
            
            setPreviewAvatar(null);
            setSuccessMessage("Avatar đã được cập nhật thành công!");
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        }
    };

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
                        <div className="avatar-container" onClick={handleAvatarClick}>
                            {previewAvatar || user.avatar ? (
                                <img 
                                    src={previewAvatar || user.avatar} 
                                    alt="User Avatar" 
                                    className="user-avatar" 
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    <FaUser className="avatar-icon" />
                                </div>
                            )}
                            <div className="avatar-overlay">
                                <FaCamera className="camera-icon" />
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleAvatarChange} 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                        />
                        
                        {previewAvatar && (
                            <div className="avatar-actions">
                                <button className="save-btn" onClick={handleSaveAvatar}>Lưu Avatar</button>
                                <button className="cancel-btn" onClick={() => setPreviewAvatar(null)}>Hủy</button>
                            </div>
                        )}
                    </div>
                    
                    <div className="user-info">
                        <div className="info-row">
                            <label>Tên người dùng:</label>
                            {isEditing ? (
                                <div className="edit-field">
                                    <input 
                                        type="text" 
                                        value={newUserName} 
                                        onChange={(e) => setNewUserName(e.target.value)}
                                    />
                                    <div className="edit-actions">
                                        <button className="save-btn" onClick={handleSaveUserName}>Lưu</button>
                                        <button className="cancel-btn" onClick={handleCancelEdit}>Hủy</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="info-value">
                                    <span>{user.userName}</span>
                                    <button className="edit-btn" onClick={handleEditUserName}>Sửa</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(ProfilePage);