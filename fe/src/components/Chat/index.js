import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import './style.scss';

const Chat = ({ receiverId, receiverName, receiverAvatar }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    // Kết nối Socket.IO
    useEffect(() => {
        const newSocket = io('http://localhost:5000', {
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            if (user?.id) {
                newSocket.emit('register', user.id);
            }
        });

        newSocket.on('private_message', (data) => {
            setMessages(prev => [...prev, data]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // Lấy lịch sử tin nhắn
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/messages/${user.id}/${receiverId}`);
                setMessages(response.data.messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        if (user?.id && receiverId) {
            fetchMessages();
        }
    }, [user?.id, receiverId]);

    // Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            // Gửi tin nhắn qua Socket.IO
            socket.emit('private_message', {
                sender_id: user.id,
                receiver_id: receiverId,
                message: newMessage
            });

            // Thêm tin nhắn vào state ngay lập tức
            setMessages(prev => [...prev, {
                sender_id: user.id,
                message: newMessage,
                created_at: new Date().toISOString()
            }]);

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-component">
            {/* Header */}
            <div className="chat-header">
                {receiverAvatar && (
                    <img src={receiverAvatar} alt={receiverName} className="chat-avatar" />
                )}
                <h2>{receiverName ? `Chat với ${receiverName}` : 'Chat'}</h2>
            </div>

            {/* Messages */}
            <div className="messages-container">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                    >
                        <div className="message-content">
                            <p>{msg.message}</p>
                            <span className="message-time">
                                {format(new Date(msg.created_at), 'HH:mm', { locale: vi })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="message-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                />
                <button type="submit">
                    Gửi
                </button>
            </form>
        </div>
    );
};

export default Chat; 