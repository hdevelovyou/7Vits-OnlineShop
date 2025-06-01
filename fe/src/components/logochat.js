import { FaFacebookMessenger } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./logochat.scss";

const ChatButton = ({ unreadConversations = 0 }) => {
    return (
        <div className="logo-chat">
            <Link to="/chat" className="logo-chat-link">
                <div className="logo-chat-content">
                    <FaFacebookMessenger className="logo-chat-mainicon" />
                    {unreadConversations > 0 && (
                        <span className="chat-badge">{unreadConversations}</span>
                    )}
                </div>
            </Link>
        </div>
    );
};

export default ChatButton;