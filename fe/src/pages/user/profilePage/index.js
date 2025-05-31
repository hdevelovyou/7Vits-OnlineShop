import { memo, useState, useEffect, useRef } from "react";
import "./style.scss";
import { FaUser, FaCheck, FaHistory } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from 'axios';

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
    const [walletInfo, setWalletInfo] = useState({
        balance: 0,
        lockedBalance: 0
    });
    const [isEditing, setIsEditing] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [showAvatarOptions, setShowAvatarOptions] = useState(false);
    
    const fileInputRef = useRef(null);

    // Format currency function
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    useEffect(() => {
        // Fetch wallet information
        const fetchWalletInfo = async () => {
            try {
                const [balanceRes, lockedBalanceRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/api/orders/wallet-balance`),
                    axios.get(`${process.env.REACT_APP_API_URL}/api/orders/wallet-locked-balance`)
                ]);

                setWalletInfo({
                    balance: balanceRes.data.balance,
                    lockedBalance: lockedBalanceRes.data.locked_balance
                });
            } catch (error) {
                console.error('Error fetching wallet info:', error);
            }
        };

        fetchWalletInfo();
    }, []);

    const handleChooseFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
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
                setAvatarUrl(defaultAvatarUrl);
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
            const userData = localStorage.getItem("user");
            if (userData) {
                const parsedUser = JSON.parse(userData);
                parsedUser.userName = newUserName;
                localStorage.setItem("user", JSON.stringify(parsedUser));
                setUser(prev => ({
                    ...prev,
                    userName: newUserName
                }));
                setIsEditing(false);
                setSuccessMessage("Tên người dùng đã được cập nhật thành công!");
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            }
        }
    };

    const handleCancelEdit = () => {
        setNewUserName(user.userName);
        setIsEditing(false);
    };

    const handleRemoveAvatar = () => {
        const confirmRemove = window.confirm("Bạn có chắc chắn muốn gỡ ảnh đại diện không?");
        if (confirmRemove) {
            setAvatarUrl(defaultAvatarUrl);
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
                                    style={{ display: 'none' }}
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
                                <a href={`mailto:${user.email}`} title={user.email}>
                                    {user.email}
                                </a>
                            </div>                         
                        </div>
                        <div className="info-row">
                            <label>Ngày tham gia:</label>
                            <div className="info-value">
                                <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                            </div>                         
                        </div>
                        <div className="wallet-info">
                            <h2>Thông tin ví</h2>
                            <div className="info-row">
                                <label>Số dư khả dụng:</label>
                                <div className="info-value">
                                    <span className="balance available">{formatCurrency(walletInfo.balance)}</span>
                                </div>
                            </div>
                            <div className="info-row">
                                <label>Số dư tạm khóa:</label>
                                <div className="info-value">
                                    <span className="balance locked">{formatCurrency(walletInfo.lockedBalance)}</span>
                                </div>
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
                
                <div className="profile-actions">
                    <Link to="/user/purchase-history" className="action-link">
                        <FaHistory className="action-icon" />
                        <span>Lịch sử mua hàng</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default memo(ProfilePage);