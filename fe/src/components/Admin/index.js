import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const [isAdmin, setIsAdmin] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        axios.get(`${process.env.REACT_APP_API_URL}/api/admin`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            // Chỉ cần tới được đây là đã là admin do middleware đã kiểm tra
            setIsAdmin(true);
        })
        .catch(error => {
            setIsAdmin(false);
        });
    }, [navigate]);

    useEffect(() => {
        if (isAdmin === false) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    if (isAdmin === null)
        return <div>Đang kiểm tra quyền truy cập...</div>;
    if (isAdmin === false)
        return null;

    return (
        <div>
            <h1>Chào mừng Admin</h1>
            <p>Quản lý người dùng, sản phẩm, đơn hàng tại đây.</p>
        </div>
    );
};

export default AdminPage;
