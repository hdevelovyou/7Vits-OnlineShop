import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './style.scss';

const Chatbot = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Xin chào! Tôi là VitBot - trợ lý AI của 7Vits. Tôi có thể giúp bạn:",
            isBot: true,
            timestamp: new Date()
        },
        {
            id: 2,
            text: "• Tư vấn sản phẩm\n• Hướng dẫn mua hàng\n• Chính sách đổi trả\n• Hỗ trợ thanh toán",
            isBot: true,
            timestamp: new Date()
        },
        {
            id: 3,
            text: "Bạn cần hỗ trợ gì hôm nay? 😊",
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        
        // Thêm vào lịch sử hội thoại
        const newHistory = [
            ...conversationHistory,
            { role: 'user', content: inputMessage }
        ];
        setConversationHistory(newHistory);

        const currentInput = inputMessage;
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/chatbot/message`, {
                message: currentInput,
                conversationHistory: newHistory
            });

            if (response.data.success) {
                const botMessage = {
                    id: Date.now() + 1,
                    text: response.data.response,
                    isBot: true,
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, botMessage]);
                
                // Cập nhật lịch sử hội thoại
                setConversationHistory(prev => [
                    ...prev,
                    { role: 'assistant', content: response.data.response }
                ]);
            } else {
                throw new Error(response.data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Lỗi gửi tin nhắn:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: `Xin lỗi, đã có lỗi xảy ra: ${error.response?.data?.error || error.message}. Vui lòng thử lại sau.`,
                isBot: true,
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const resetConversation = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/chatbot/reset`);
            setMessages([
                {
                    id: 1,
                    text: "Xin chào! Tôi là VitBot - trợ lý AI của 7Vits. Tôi có thể giúp bạn:",
                    isBot: true,
                    timestamp: new Date()
                },
                {
                    id: 2,
                    text: "• Tư vấn sản phẩm\n• Hướng dẫn mua hàng\n• Hỗ trợ thanh toán",
                    isBot: true,
                    timestamp: new Date()
                },
                {
                    id: 3,
                    text: "Bạn cần hỗ trợ gì hôm nay? 😊",
                    isBot: true,
                    timestamp: new Date()
                }
            ]);
            setConversationHistory([]);
        } catch (error) {
            console.error('Lỗi reset cuộc hội thoại:', error);
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const quickQuestions = [
        "Chính sách đổi trả như thế nào?",
        "Cách mua tài khoản game?",
        "Cách thanh toán online?",
        "Thời gian bảo hành bao lâu?"
    ];

    const handleQuickQuestion = (question) => {
        setInputMessage(question);
    };

    // Ẩn chatbot nếu đang ở trang /chat
    if (location.pathname.startsWith('/chat')) {
        return null;
    }

    return (
        <div className="chatbot-container">
            {/* Floating Button */}
            <div 
                className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <span className="close-icon">✕</span>
                ) : (
                    <span className="chat-icon">
                        <img src="/7VITSnobg.png" alt="Chat" className="chat-logo" />
                    </span>
                )}
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="bot-info">
                            <div className="bot-avatar">
                                <img src="/7VITSnobg.png" alt="VitBot" className="bot-logo" />
                            </div>
                            <div className="bot-details">
                                <h4>VitBot</h4>
                                <span className="status">● Online</span>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button 
                                className="reset-btn"
                                onClick={resetConversation}
                                title="Bắt đầu cuộc trò chuyện mới"
                            >
                                🔄️
                            </button>
                            <button 
                                className="close-btn"
                                onClick={() => setIsOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((message) => (
                            <div 
                                key={message.id} 
                                className={`message ${message.isBot ? 'bot' : 'user'} ${message.isError ? 'error' : ''}`}
                            >
                                {message.isBot && (
                                    <div className="message-avatar">
                                        <img src="/7VITSnobg.png" alt="VitBot" className="bot-logo" />
                                    </div>
                                )}
                                <div className="message-content">
                                    <div className="message-text">
                                        {message.text.split('\n').map((line, index) => (
                                            <div key={index}>{line}</div>
                                        ))}
                                    </div>
                                    <div className="message-time">
                                        {formatTimestamp(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="message bot loading">
                                <div className="message-avatar">
                                    <img src="/7VITSnobg.png" alt="VitBot" className="bot-logo" />
                                </div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length <= 3 && (
                        <div className="quick-questions">
                            <div className="quick-questions-title">Câu hỏi thường gặp:</div>
                            <div className="quick-questions-list">
                                {quickQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        className="quick-question-btn"
                                        onClick={() => handleQuickQuestion(question)}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="chatbot-input">
                        <div className="input-container">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn của bạn..."
                                disabled={isLoading}
                                rows="1"
                            />
                            <button 
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="send-btn"
                            >
                                {isLoading ? '⏳' : '➤'}
                            </button>
                        </div>
                        <div className="powered-by">
                            Powered by Gemini AI ✨
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot; 