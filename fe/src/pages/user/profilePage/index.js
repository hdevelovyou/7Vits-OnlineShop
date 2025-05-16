import { memo, useState, useEffect, useRef } from "react";
import "./style.scss";
import { FaUser, FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";

const ProfilePage = () => {
    const [user, setUser] = useState({
        userName: "",
        firstName: "",
        lastName: "",
        email: "",
        createdAt: "",
        avatarUrl: "",
        displayName: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [showAvatarOptions, setShowAvatarOptions] = useState(false);
    
    const fileInputRef = useRef(null);

    const handleChooseFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Kích hoạt input file
        }
    };

    // URL của ảnh mặc định - thay thế bằng URL thật của bạn
    const defaultAvatarUrl = "https://sv1.anhsieuviet.com/2025/04/10/7VITS-9.png";
    const handleAvaterChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async () => {
                const imageUrl = reader.result;
                setAvatarUrl(imageUrl);

                // Lưu vào localStorage (tạm thời)
                const userData = localStorage.getItem("user");
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    parsedUser.avatarUrl = imageUrl;
                    localStorage.setItem("user", JSON.stringify(parsedUser));
                }

                // Gửi lên server để lưu vào database
                const token = localStorage.getItem("token");
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/update-avatar`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ avatarUrl: imageUrl })
                    });
                    const resData = await response.json();
                    if (!response.ok) {
                        throw new Error(resData.error || "Lỗi khi cập nhật avatar");
                    }
                } catch (err) {
                    alert("Lỗi khi lưu avatar xuống database: " + err.message);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        // Lấy dữ liệu người dùng từ localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser({
                userName: parsedUser.userName || "",
                firstName: parsedUser.firstName || "",
                lastName: parsedUser.lastName || "",
                email: parsedUser.email || "",
                createdAt: parsedUser.createdAt || "",
                avatarUrl: parsedUser.avatarUrl || "",
                displayName: parsedUser.displayName || "",
            });
            setNewUserName(parsedUser.userName || "");

            // Kiểm tra và đặt URL ảnh đại diện
            if (parsedUser.avatarUrl) {
                setAvatarUrl(parsedUser.avatarUrl);
            } else {
                setAvatarUrl(defaultAvatarUrl); // Đặt ảnh mặc định nếu không có
            }
        }
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/get-avatar`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.avatarUrl) {
                    setAvatarUrl(data.avatarUrl);
                } else {
                    setAvatarUrl(defaultAvatarUrl);
                }
                
                // Kết hợp dữ liệu từ API với dữ liệu hiện tại, giữ lại các trường từ state hiện tại nếu API không trả về
                setUser(prevUser => ({
                    ...prevUser,
                    userName: data.userName || prevUser.userName,
                    firstName: data.firstName || prevUser.firstName,
                    lastName: data.lastName || prevUser.lastName,
                    email: data.email || prevUser.email,
                    createdAt: data.createdAt || prevUser.createdAt, 
                    avatarUrl: data.avatarUrl || prevUser.avatarUrl,
                    displayName: data.displayName || prevUser.displayName
                }));
            } catch (err) {
                setAvatarUrl(defaultAvatarUrl);
            }
        };
        fetchUser();
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

    const handleRemoveAvatar = () => {
        const confirmRemove = window.confirm("Bạn có chắc chắn muốn gỡ ảnh đại diện không?");
        if (confirmRemove) {
            setAvatarUrl(defaultAvatarUrl);

            // Cập nhật lại localStorage
            const userData = localStorage.getItem("user");
            if (userData) {
                const parsedUser = JSON.parse(userData);
                parsedUser.avatarUrl = defaultAvatarUrl;
                localStorage.setItem("user", JSON.stringify(parsedUser));
            }
        }
    };

    const toggleAvatarOptions = () => {
        setShowAvatarOptions((prev) => !prev);
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
                            <img 
                                src={avatarUrl} 
                                alt="User Avatar" 
                                className="user-avatar" 
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="avatar-placeholder" style={{ display: 'none' }}>
                                <FaUser className="avatar-icon" />
                            </div>
                        </div>
                        <button 
                            type="button" 
                            className="change-avatar-button" 
                            onClick={toggleAvatarOptions}
                        >
                            Thay đổi ảnh đại diện
                        </button>
                        {showAvatarOptions && (
                            <div className="avatar-options">
                                <button 
                                    type="button" 
                                    className="avatar-option" 
                                    onClick={handleChooseFile}
                                >
                                    Chọn ảnh từ máy
                                </button>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    ref={fileInputRef} 
                                    onChange={handleAvaterChange} 
                                    style={{ display: 'none' }} // Ẩn input file
                                />
                                <button 
                                    type="button" 
                                    className="avatar-option" 
                                    onClick={handleRemoveAvatar}
                                >
                                    Gỡ ảnh
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="user-info">
                        <div className="info-row">
                            <label>Tên người dùng:</label>
                            <div className="info-value">
                                <span>{user.userName}</span>
                            </div>                         
                        </div>
                        <div className="info-row">
                            <label>Họ và tên:</label>
                            <div className="info-value">
                                <span>
                                    {user.firstName || user.lastName 
                                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                                        : user.displayName || 'Chưa cập nhật'}
                                </span>
                            </div>                         
                        </div>
                        <div className="info-row">
                            <label>Email:</label>
                            <div className="info-value">
                                <span>{user.email}</span>
                            </div>                         
                        </div>
                        <div className="info-row">
                            <label>Ngày tham gia:</label>
                            <div className="info-value">
                                <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : ''}</span>
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