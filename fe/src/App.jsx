import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VnpayTopup from './components/vnpay_Topup/vnpay_Topup';
import VnpayReturn from './components/vnpay_Return/vnpay_Return';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {LoginPage, RegisterPage} from './pages/user/loginPage';
import {Homepage} from './pages/user/homePage';

function App() {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
                headers: {
                    authorization: `Bearer ${token}`
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log('User data:', data);
                if(data.user){
                    setIsLoggedIn(true);
                    setUser(data.user);
                } else {
                    setIsLoggedIn(false);
                    setUser(null);
                    // Nếu không có user, có thể xóa token để yêu cầu đăng nhập lại
                    localStorage.removeItem('token');
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                // Nếu có lỗi, có thể xóa token để yêu cầu đăng nhập lại
                localStorage.removeItem('token');
                setIsLoggedIn(false);
                setUser(null);
            });
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
    }, []);
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && isLoggedIn) {
            navigate("/"); // Nếu đã có token thì về trang chủ
        }
    }, [navigate, isLoggedIn]);
    
    return(
        <Router>
            <Routes>
                <Route path="/topup" element={<VnpayTopup />} />
                <Route path="/payment/vnpay_return" element={<VnpayReturn />} />
                <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Homepage user={user} />} />
                {/* Thêm các route khác ở đây */}
            </Routes>
        </Router>
    );
}

export default App; 