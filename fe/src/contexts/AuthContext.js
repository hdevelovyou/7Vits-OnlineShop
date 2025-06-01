import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from "socket.io-client";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import socket from '../socket';

const AuthContext = createContext(null);

function useForceLogout(userId)
{
    const navigate = useNavigate();
    useEffect(() => {
        if(!userId) return;
        console.log('Registering userId to socket:', userId);
        socket.emit('register_user', userId);

        const handleForceLogout = (data) => {
            console.log('Received force_logout:', data);
            alert(data?.reason || "Your account has been banned by admin!");
            localStorage.clear();
            navigate("/login");
        };

        socket.on('force_logout', handleForceLogout);

        return () => {
            socket.off('force_logout', handleForceLogout);
        }
    }, [userId, navigate]);
}
export default useForceLogout;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isLoggedIn = !!user;
    const navigate = useNavigate();

    const refreshUser = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
        window.addEventListener("userLoggedIn", refreshUser);
        return () => window.removeEventListener("userLoggedIn", refreshUser);
    }, []);

    useEffect(() => {
        let intervalId;
        if (user) {
            intervalId = setInterval(async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('No token');
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.user?.role === 'banned') {
                        alert("Your account has been banned by admin");
                        setUser(null);
                        localStorage.clear();
                        navigate("/login");
                    }
                } catch (e) {
                    // Nếu lỗi xác thực, cũng logout
                    setUser(null);
                    localStorage.clear();
                    navigate("/login");
                }
            }, 5000); // Set polling 5 giây
        }
        return () => clearInterval(intervalId);
    }, [user]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });
            const token = response.data.token;
            if (token) {
                localStorage.setItem('token', token);
                window.dispatchEvent(new Event("userLoggedIn")); // Gọi refreshUser toàn app
            }
            setUser(response.data.user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Đăng nhập thất bại'
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/logout', {}, {
                withCredentials: true
            });
            setUser(null);
            localStorage.removeItem('token');
            window.location.reload();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Đăng xuất thất bại'
            };
        }
    };

    const value = {
        user,
        isLoggedIn,
        loading,
        login,
        logout,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};