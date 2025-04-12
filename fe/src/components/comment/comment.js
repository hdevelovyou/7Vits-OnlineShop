import { useState, useEffect } from "react";
import axios from "axios";
import "./comment.scss";
const CommentSection = ({ productId, userId }) => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        axios.get(`/api/comments/${productId}`).then(res => setComments(res.data));
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content) return;
        await axios.post('/api/comments', { userId, productId, content });
        setContent("");
        const res = await axios.get(`/api/comments/${productId}`);
        setComments(res.data);
    };
    return (
        <div className="comment-section">
            <h3>Bình luận</h3>
            {!user ? (
                <p>Vui lòng đăng nhập để bình luận.</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Nhập bình luận..."
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Đang gửi..." : "Gửi"}
                    </button>
                </form>
            )}
            <ul className="comment-list">
                {comments.map((c) => (
                    <li key={c.id}>
                        <div className="comment-name">
                            <strong className="comment-user">{c.userName}</strong>
                            <span className="comment-time">Bình Luận vào {new Date(c.created_at).toLocaleString()}</span>
                        </div>
                       
                       
                        {c.content}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommentSection;



