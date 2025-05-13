import { IoLogoWechat } from "react-icons/io5";
import { Link } from "react-router-dom";

const ChatButton = () => {
    return (
        <div className="logo-chat">
            <Link to="/chat" className="logo-chat-link">
                <div className="logo-chat-content">
                    <IoLogoWechat className="logo-chat-icon" />
                    <h1 className="logo-chat-text">Chat</h1>
                </div>
            </Link>
        </div>
    );
};

export default ChatButton;
