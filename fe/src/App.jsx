import React from 'react';
import { Routes, Route } from 'react-router-dom';
import VnpayTopup from './components/vnpay_Topup/vnpay_Topup';
import VnpayReturn from './components/vnpay_Return/vnpay_Return';
import LoginPage from './pages/user/loginPage';
import RegisterPage from './pages/user/registerPage'; 
import Homepage from './pages/user/homePage';
import { useAuth } from './contexts/AuthContext';

function App() {
    const { user, isLoggedIn } = useAuth();

    return(
        <Routes>
            <Route path="/topup" element={<VnpayTopup />} />
            <Route path="/payment/vnpay_return" element={<VnpayReturn />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Homepage user={user} />} />
        </Routes>
    );
}

export default App;