import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const socketRef = useRef(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (user?.id) {
            console.log('Connecting to socket server...');
            socketRef.current = io('http://localhost:5000', { withCredentials: true });

            socketRef.current.on('connect', () => {
                console.log('Socket connected successfully');
                console.log('Registering user:', user.id);
                socketRef.current.emit('register', user.id);
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            socketRef.current.on('online_users', (userIds) => {
                console.log('Received online users:', userIds);
                setOnlineUsers(userIds.map(String));
            });
        }
        return () => {
            if (socketRef.current) {
                console.log('Disconnecting socket...');
                socketRef.current.disconnect();
            }
        };
    }, [user?.id]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext); 