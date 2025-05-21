import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user?.id) {
      const newSocket = io(process.env.REACT_APP_API_URL, {
        transports: ['websocket'],
      });

      setSocket(newSocket);

      // Gửi register khi kết nối thành công
      newSocket.on('connect', () => {
        newSocket.emit('register', user.id);
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user?.id]);
  

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
