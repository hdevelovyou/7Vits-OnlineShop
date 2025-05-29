import { IoLogoWechat } from "react-icons/io5";
import { Link } from "react-router-dom";
import "./logochat.scss";

const ChatButton = ({ unreadConversations = 0 }) => {
    return (
        <div className="logo-chat">
            <Link to="/chat" className="logo-chat-link">
                <div className="logo-chat-content" style={{ position: "relative" }}>
                    <IoLogoWechat className="logo-chat-icon" />
                    <h1 className="logo-chat-text">Chat</h1>
                    {unreadConversations > 0 && (
                        <span className="chat-badge">{unreadConversations}</span>
                    )}
                </div>
            </Link>
        </div>
    );
};

export default ChatButton;
