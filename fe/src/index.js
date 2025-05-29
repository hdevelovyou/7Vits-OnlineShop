import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import RouterCustom from './router';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import "./style/style.scss";
// Import cấu hình Axios
import './utils/axiosConfig';
import Chatbot from './components/Chatbot';
const root = createRoot(document.getElementById('root'));
root.render(
    <div>
        <BrowserRouter>
            <AuthProvider>
                <SocketProvider>
                    <RouterCustom />
                    <Chatbot/>
                </SocketProvider>
            </AuthProvider>
        </BrowserRouter>
    </div>
);