import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import './style.scss';

export default function Chat({ receiverId, receiverName }) {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(
        receiverId ? { id: receiverId, userName: receiverName || 'Người nhận' } : null
    );
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch conversations
    useEffect(() => {
        if (!user?.id) return;
        const fetchConversations = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/conversations/${user.id}`);
                setConversations(res.data.conversations);
            } catch (err) {
                console.error('Error fetching conversations:', err);
            }
        };
        fetchConversations();
    }, [user?.id]);

    // If passed receiverId, set selectedUser once conversations load
    useEffect(() => {
        if (receiverId && conversations.length > 0) {
            const target = conversations.find((conv) => conv.id === receiverId);
            setSelectedUser(target || { id: receiverId, userName: receiverName || 'Người nhận' });
        }
    }, [receiverId, receiverName, conversations]);

    // Listen for incoming messages
    useEffect(() => {
        if (!socket) return;
        const handler = (msg) => {
            if (
                (msg.sender_id === selectedUser?.id && msg.receiver_id === user?.id) ||
                (msg.sender_id === user?.id && msg.receiver_id === selectedUser?.id)
            ) {
                setMessages((prev) => [...prev, msg]);
                // update sidebar
                updateSidebar(msg);
            }
        };
        socket.on('private_message', handler);
        return () => socket.off('private_message', handler);
    }, [socket, selectedUser, user.id]);

    // Fetch message history on select
    useEffect(() => {
        if (!user?.id || !selectedUser?.id) return;
        axios
            .get(`/api/messages/${user.id}/${selectedUser.id}`)
            .then((res) => setMessages(res.data.messages))
            .catch((err) => console.error('Error fetching messages:', err));
    }, [user?.id, selectedUser?.id]);

    // Scroll to bottom
  
    // Focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, [selectedUser]);

    // Update sidebar conversations with new message
    const updateSidebar = (msg) => {
        setConversations((prev) => {
            const exists = prev.some((conv) => conv.id === msg.sender_id || conv.id === msg.receiver_id);
            const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
            const userName = selectedUser?.userName;
            const newConv = { id: otherId, userName: userName, lastMessage: msg.message };
            // if exists, map and move to top
            let updated = prev.map((conv) =>
                conv.id === newConv.id ? { ...conv, lastMessage: newConv.lastMessage } : conv
            );
            // filter out existing then unshift
            if (!exists) {
                updated = [newConv, ...prev];
            } else {
                // move to top
                updated = [
                    updated.find((c) => c.id === newConv.id),
                    ...updated.filter((c) => c.id !== newConv.id)
                ];
            }
            return updated;
        });
    };

    // Send message
    const send = (e) => {
        e.preventDefault();
        if (!input.trim() || !user || !socket || !selectedUser) return;
        const payload = {
            sender_id: user.id,
            receiver_id: selectedUser.id,
            message: input.trim(),
        };
        socket.emit('private_message', payload);
        const localMsg = { ...payload, created_at: new Date().toISOString() };
        setMessages((prev) => [...prev, localMsg]);
        updateSidebar(localMsg);
        setInput('');
    };

    return (
        <div className="chat-page">
            <div className="chat-container">
                <div className="chat-sidebar">
                    <div className="sidebar-header">
                        <h2>Tin nhắn</h2>
                    </div>
                    <div className="conversations-list">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedUser(conv)}
                                className={`conversation-item ${selectedUser?.id === conv.id ? 'active' : ''}`}
                            >
                                <div className="user-avatar">
                                    <span>{conv.userName.charAt(0).toUpperCase()}</span>
                                    <span className="online-dot"></span>
                                </div>
                                <div className="conversation-info">
                                    <h3>{conv.userName}</h3>
                                    <p>{conv.lastMessage || 'Chưa có tin nhắn'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="chat-main">
                    {selectedUser ? (
                        <div className="chat-window">
                            <h3>Chat với {selectedUser.userName}</h3>
                            <div className="messages">
                                {messages.map((m, i) => (
                                    <div key={i} className={m.sender_id === user.id ? 'mine' : 'theirs'}>
                                        <span>{m.message}</span>
                                        <small>{new Date(m.created_at).toLocaleTimeString()}</small>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={send} className="chat-input">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                />
                                <button type="submit">Gửi</button>
                            </form>
                        </div>
                    ) : (
                        <div className="no-chat-selected">Chọn một cuộc trò chuyện để bắt đầu</div>
                    )}
                </div>
            </div>
        </div>
    );
}
