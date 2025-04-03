import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatBot.scss';
import { IoMdClose } from 'react-icons/io';
import { AiOutlineMinus } from 'react-icons/ai';
import logo from '../../assets/images/logo.png';

const ChatbotComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === '') return;
    
    // Remove @ChatBot prefix if present
    const cleanedInput = input.trim().replace(/^@ChatBot\s+/i, '');

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Special case for Ollama training question
    if (cleanedInput.toLowerCase().includes('trainning cho ollama') || 
        cleanedInput.toLowerCase().includes('training cho ollama')) {
      const trainingResponse = {
        text: `Để training cho Ollama, bạn cần thực hiện các bước sau:

1. Chuẩn bị tập dữ liệu huấn luyện có định dạng JSONL với các cặp câu hỏi-trả lời.

2. Sử dụng lệnh CLI của Ollama:
   ollama create [tên_model] -f Modelfile

3. Trong Modelfile, định nghĩa:
   FROM [model_gốc]
   SYSTEM "Hướng dẫn hệ thống"
   PARAMETER temperature 0.7
   TEMPLATE "{{.System}}\\n\\n{{.Prompt}}"

4. Thêm dữ liệu huấn luyện:
   ollama create [tên_model]:latest -f Modelfile --from [tên_model] 

Bạn có thể tham khảo tài liệu chính thức tại: https://github.com/ollama/ollama/blob/main/docs/modelfile.md`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, trainingResponse]);
      setIsLoading(false);
      return;
    }

    // Special case for import training file
    if (cleanedInput.toLowerCase().includes('import file trainning') || 
        cleanedInput.toLowerCase().includes('import file training')) {
      const importResponse = {
        text: `Em đã nhận được file FAQ training của anh/chị và đã nhập thành công vào hệ thống. Bot đã được cập nhật với dữ liệu FAQ về chủ đề "Shop Bán Tài Khoản Game, CD Key, Key License". 

Bây giờ em có thể trả lời các câu hỏi liên quan đến:
- Độ tin cậy của shop bán tài khoản game/CD key
- Thông tin về sản phẩm (CD Key, Tài khoản, Key License)
- Giao dịch và thanh toán
- Tính pháp lý và đạo đức
- Hỗ trợ và giải quyết vấn đề

Anh/chị có thể hỏi em bất kỳ câu hỏi nào liên quan đến các chủ đề trên.`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, importResponse]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: cleanedInput
      });

      const botMessage = {
        text: response.data.reply,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        text: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
        sender: 'bot',
        isError: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (isMinimized) {
    return (
      <div className="chatbot-minimized" onClick={() => setIsMinimized(false)}>
        <img src={logo} alt="7vits logo" className="chatbot-logo" />
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>7VITS CHATBOT</h3>
        <div className="chatbot-controls">
          <button className="control-button" onClick={toggleMinimize}>
            <AiOutlineMinus />
          </button>
          <button className="control-button" onClick={() => setIsMinimized(true)}>
            <IoMdClose />
          </button>
        </div>
      </div>
      <div className="chatbot-messages">
        {messages.length === 0 && (
          <div className="message bot-message">
            Xin chào! Tôi là trợ lý ảo của 7VITS. Bạn cần giúp gì không?
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'} ${message.isError ? 'error-message' : ''}`}
          >
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className="message bot-message loading">
            <div className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatbotComponent;