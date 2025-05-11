import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import Chat from '../../../components/Chat';
import './style.scss';
import { io } from 'socket.io-client';
import { useSocket } from '../../../contexts/SocketContext';

const ChatPage = () => {
    useEffect(() => {
        document.body.classList.add('chat-page-active');
        return () => {
            document.body.classList.remove('chat-page-active');
        };
    }, []);

    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const { user } = useAuth();
    const { onlineUsers } = useSocket();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                // Lấy danh sách người dùng đã chat với
                const response = await axios.get(`http://localhost:5000/api/conversations/${user.id}`);
                console.log('Fetched conversations:', response.data.conversations);
                setConversations(response.data.conversations);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };

        if (user?.id) {
            fetchConversations();
        }
    }, [user?.id]);

    // Debug online users
    useEffect(() => {
        console.log('Current online users:', onlineUsers);
    }, [onlineUsers]);

    return (
        <div className="chat-page">
            <div className="chat-container">
                {/* Sidebar */}
                <div className="chat-sidebar">
                    <div className="sidebar-header">
                        <h2>Tin nhắn</h2>
                    </div>
                    <div className="conversations-list">
                        {console.log('Rendering conversations:', conversations)}
                        {conversations
                            .filter(conv => {
                                // Kiểm tra xem người dùng có online hay không
                                const isOnline = onlineUsers.includes(String(conv.id));
                                console.log(`User ${conv.id} (${conv.userName}) online status:`, isOnline);
                                return isOnline;  // Chỉ giữ lại các cuộc trò chuyện với người online
                            })
                            .map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedUser(conv)}
                                    className={`conversation-item ${selectedUser?.id === conv.id ? 'active' : ''}`}
                                >
                                    <div className="user-avatar">
                                        <span>{conv.userName.charAt(0).toUpperCase()}</span>
                                        <span className="online-dot"></span> {/* Biểu tượng online */}
                                    </div>
                                    <div className="conversation-info">
                                        <h3>{conv.userName}</h3>
                                        <p>{conv.lastMessage || 'Chưa có tin nhắn'}</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="chat-main">
                    {selectedUser ? (
                        <Chat receiverId={selectedUser.id} receiverName={selectedUser.userName} receiverAvatar={selectedUser.avatar} />
                    ) : (
                        <div className="no-chat-selected">
                            Chọn một cuộc trò chuyện để bắt đầu
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage; 