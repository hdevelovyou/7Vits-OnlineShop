import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import EmojiPicker from 'emoji-picker-react';
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
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [zoomedImageSize, setZoomedImageSize] = useState({ width: 0, height: 0 });
    const scale = 3;
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [showChatWindow, setShowChatWindow] = useState(false);

    // Đăng ký socket với user ID
    useEffect(() => {
        if (socket && user?.id) {
            socket.emit('register', user.id);
        }
    }, [socket, user?.id]);

    useEffect(() => {
        if (!socket) return;

        const handleOnlineUsers = (data) => {
            console.log('Online users data from server:', data);
            setOnlineUsers(data); // data là mảng ID
        };

        socket.on('online_users', handleOnlineUsers);

        return () => {
            socket.off('online_users', handleOnlineUsers);
        };
    }, [socket]);

    // Fetch conversations
    useEffect(() => {
        if (!user?.id) return;
        const fetchConversations = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/conversations/${user.id}`);
                setConversations(res.data.conversations);
                const counts = {};
                res.data.conversations.forEach(conv => {
                    counts[conv.id] = conv.unreadCount || 0;
                });
                setUnreadCounts(counts);
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
        if (!socket || !user?.id) return;

        const handler = (msg) => {
            const isRelevant =
                (msg.sender_id === user.id || msg.receiver_id === user.id);

            if (isRelevant) {
                const isCurrent =
                    (msg.sender_id === selectedUser?.id && msg.receiver_id === user.id) ||
                    (msg.sender_id === user.id && msg.receiver_id === selectedUser?.id);

                if (isCurrent) {
                    setMessages((prev) => [...prev, msg]);
                    if (msg.sender_id !== user.id) {
                        axios.post(`${process.env.REACT_APP_API_URL}/api/messages/read`, {
                            sender_id: msg.sender_id,
                            receiver_id: user.id,
                        }).catch(() => { });
                    }
                } else {
                    // Tin nhắn mới đến cuộc trò chuyện khác, tăng unread count
                    if (msg.sender_id !== user.id) {
                        setUnreadCounts((prev) => ({
                            ...prev,
                            [msg.sender_id]: (prev[msg.sender_id] || 0) + 1,
                        }));
                    }
                }

                updateSidebar(msg);
            }
        };

        socket.on('private_message', handler);

        return () => {
            socket.off('private_message', handler);
        };
    }, [socket, user?.id, selectedUser?.id]);


    // Fetch message history on select
    useEffect(() => {
        if (!user?.id || !selectedUser?.id) return;

        axios
            .get(`${process.env.REACT_APP_API_URL}/api/messages/${user.id}/${selectedUser.id}`)
            .then((res) => {
                setMessages(res.data.messages);

                // Gửi mark read lên server
                return axios.post(`${process.env.REACT_APP_API_URL}/api/messages/read`, {
                    sender_id: selectedUser.id,
                    receiver_id: user.id,
                });
            })
            .then(() => {
                // Xoá số lượng unread của cuộc trò chuyện này
                setUnreadCounts((prev) => {
                    const updated = { ...prev };
                    delete updated[selectedUser.id];
                    return updated;
                });
            })
            .catch((err) => console.error('Lỗi khi load hoặc mark read:', err));
    }, [user?.id, selectedUser?.id]);


    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, [selectedUser]);

    useEffect(() => {
        const setVh = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        window.addEventListener('resize', setVh);
        setVh();
        return () => window.removeEventListener('resize', setVh);
    }, []);

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

    // Send image
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file || !user || !socket || !selectedUser) return;
        if (file.size > 1024 * 1024) {
            alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 1MB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            // Gửi base64 dạng chuỗi thẳng vào message
            const payload = {
                sender_id: user.id,
                receiver_id: selectedUser.id,
                message: reader.result, // base64 string ở đây
                created_at: new Date().toISOString(),
            };
            socket.emit('private_message', payload);
            updateSidebar(payload);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // Send message
    const send = (e) => {
        e.preventDefault();
        if (!input.trim() || !user || !socket || !selectedUser) return;
        const payload = {
            sender_id: user.id,
            receiver_id: selectedUser.id,
            message: input.trim(),
            created_at: new Date().toISOString(),
        };
        socket.emit('private_message', payload);
        updateSidebar(payload);
        setInput('');
    };

    // Khi chọn user trên mobile, set showChatWindow = true
    const handleSelectUser = (conv) => {
        setSelectedUser(conv);
        // Nếu là mobile thì chuyển sang chat window
        if (window.innerWidth <= 900) setShowChatWindow(true);
    };

    // Khi bấm nút "Quay lại" trong chat window trên mobile
    const handleBack = () => {
        setShowChatWindow(false);
    };

    const isMobile = window.innerWidth <= 900;

    return (
        <div className="chat-page">
            <div className="chat-container">
                {/* Sidebar chỉ hiện trên desktop hoặc khi chưa chọn user trên mobile */}
                {(!isMobile || !showChatWindow) && (
                    <div className="chat-sidebar">
                        <div className="sidebar-header">
                            <h2>Tin nhắn</h2>
                        </div>
                        <div className="conversations-list">
                            {conversations.map((conv) => {
                                const unreadCount = unreadCounts[conv.id] || 0;
                                return (
                                    <div
                                        key={conv.id}
                                        onClick={() => handleSelectUser(conv)}
                                        className={`conversation-item ${selectedUser?.id === conv.id ? 'active' : ''}`}
                                    >
                                        <div className="user-avatar">
                                            {conv.avatarUrl ? (
                                                <img src={conv.avatarUrl} alt={conv.userName} className="avatar-img" />
                                            ) : (
                                                <span>{conv.userName.charAt(0).toUpperCase()}</span>
                                            )}
                                            {onlineUsers.includes(String(conv.id)) && <span className="online-dot"></span>}
                                        </div>
                                        <div className="conversation-info">
                                            <div className="conversation-header">
                                                <h3>{conv.userName}</h3>
                                                {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
                                            </div>
                                            <p>{conv.lastMessage || 'Chưa có tin nhắn'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {/* Chat window chỉ hiện trên desktop hoặc khi đã chọn user trên mobile */}
                {(!isMobile || showChatWindow) && (
                    <div className="chat-main">
                        {/* Nút back chỉ hiện trên mobile */}
                        {isMobile && selectedUser && (
                            <div className="chat-mobile-header">
                                <button className="back-btn" onClick={handleBack}>
                                    ←
                                </button>
                                <div className="mobile-header-user">
                                    {selectedUser.avatarUrl ? (
                                        <img src={selectedUser.avatarUrl} alt={selectedUser.userName} className="avatar-img" />
                                    ) : (
                                        <span className="avatar-placeholder">{selectedUser.userName?.charAt(0).toUpperCase()}</span>
                                    )}
                                    <span className="user-name">{selectedUser.userName}</span>
                                </div>
                            </div>
                        )}
                        {selectedUser ? (
                            <div className="chat-window">

                                <div className="messages">
                                    {messages.map((m, i) => {
                                        const isImage = m.message.startsWith('data:image');
                                        const isMine = m.sender_id === user.id;

                                        if (isImage) {
                                            return (
                                                <div
                                                    key={i}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                                                        margin: '10px 0'
                                                    }}
                                                >
                                                    <div>
                                                        <img
                                                            src={m.message}
                                                            alt="sent-img"
                                                            className="chat-image"
                                                            onClick={(e) => {
                                                                setZoomedImage(m.message);
                                                                setZoomedImageSize({ width: e.target.naturalWidth, height: e.target.naturalHeight });
                                                            }}
                                                            style={{ cursor: 'zoom-in' }}
                                                        />

                                                        <small style={{ display: 'block', textAlign: isMine ? 'right' : 'left' }}>
                                                            {new Date(m.created_at).toLocaleString('vi-VN', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                second: '2-digit',
                                                            })}
                                                        </small>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={i} className={isMine ? 'mine' : 'theirs'}>
                                                <span>{m.message}</span>
                                                <small>
                                                    {new Date(m.created_at).toLocaleString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                    })}
                                                </small>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                                <form onSubmit={send} className="chat-input">
                                    <button
                                        type="button"
                                        className="emoji-toggle"
                                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                                    >
                                        😊
                                    </button>

                                    <button
                                        type="button"
                                        className="image-upload-toggle"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        📷
                                    </button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                    />

                                    {showEmojiPicker && (
                                        <div className="emoji-picker-container">
                                            <EmojiPicker onEmojiClick={(emojiData) => setInput((prev) => prev + emojiData.emoji)} />
                                        </div>
                                    )}
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
                )}
            </div>
            {zoomedImage && (
                <div className="zoomed-image-overlay" onClick={() => setZoomedImage(null)}>
                    <img
                        src={zoomedImage}
                        alt="Zoomed"
                        className="zoomed-image"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: zoomedImageSize.width * scale,
                            height: zoomedImageSize.height * scale,
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            objectFit: 'contain',
                        }}
                    />
                </div>
            )}
        </div>
    );
}
