import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./comment.scss";
const CommentSection = ({ productId, userId }) => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [replyContents, setReplyContents] = useState({});
    const [activeReplyId, setActiveReplyId] = useState(null); // Comment đang mở khung trả lời

    useEffect(() => {
        axios.get(`/api/comments/${productId}`).then(res => setComments(res.data));
    }, [productId]);
    const COMMENTS_LIMIT = 7;
    const displayedComments = showAll ? comments : comments.slice(0, COMMENTS_LIMIT);
    // cmt chính 
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);
        try {
            await axios.post("/api/comments", { userId, productId, content });
            setContent("");
            const res = await axios.get(`/api/comments/${productId}`);
            setComments(res.data);
        } catch (error) {
            console.error("❌ Lỗi khi gửi comment:", error);
        } finally {
            setLoading(false);
        }
    };
    // Hàm gửi reply cho từng bình luận
    const handleReplySubmit = async (commentId) => {
        const replyContent = replyContents[commentId];
        if (!replyContent?.trim()) return;
        try {
            // Giả sử API endpoint trả lời comment là `/api/comments/reply`
            await axios.post("/api/comments/reply", { userId, commentId, content: replyContent });
            // Reload lại danh sách bình luận sau khi gửi reply
            const res = await axios.get(`/api/comments/${productId}`);
            setComments(res.data);
            // Xóa nội dung reply cho comment này sau khi gửi thành công
            setReplyContents((prev) => ({ ...prev, [commentId]: "" }));
        } catch (error) {
            console.error("❌ Lỗi khi gửi reply:", error);
        }
    };
    const handleReplyChange = (commentId, text) => {
        setReplyContents((prev) => ({ ...prev, [commentId]: text }));
    };
    // chương trình chính
    return (
        <div className="comment-section container">
            <h3>Bình luận</h3>
            {!user ? (
                <h3>
                    Vui lòng <Link to="/login" style={{ color: "red" }}>đăng nhập</Link> để bình luận.
                </h3>
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
                {displayedComments.map((c) => (
                    <li key={c.id}>
                        <div className="comment-name">
                            <strong className="comment-user">{c.userName}</strong>
                            <span className="comment-time">Bình Luận vào {new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        
                        <div className="comment-body">
                        <strong>{c.content}</strong>
                        </div>
                        {/* reply inh luan*/}
                        {c.replies && c.replies.length > 0 && (
                            <ul className="reply-list">
                                {c.replies.map((r) => (
                                    <li key={r.id}>
                                        <div className="reply-header">
                                            <strong className="reply-user">{r.displayName || r.userName}</strong>
                                            <span className="reply-time">
                                                {new Date(r.createdAt).toLocaleString()}
                                            </span>

                                        </div>
                                        <div className="reply-body">{r.content}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {userId && (
                            <>
                                <button
                                    className="reply-toggle-btn"
                                    onClick={() =>
                                        setActiveReplyId((prev) => (prev === c.id ? null : c.id))
                                    }
                                >
                                    {activeReplyId === c.id ? "Ẩn trả lời" : "Trả lời"}
                                </button>

                                {activeReplyId === c.id && (
                                    <div className="reply-form">
                                        <textarea
                                            value={replyContents[c.id] || ""}
                                            onChange={(e) => handleReplyChange(c.id, e.target.value)}
                                            placeholder="Trả lời bình luận này..."
                                        />
                                        <button type="button" onClick={() => handleReplySubmit(c.id)}>
                                            Gửi trả lời
                                        </button>
                                    </div>
                                )}
                            </>
                        )}


                    </li>
                ))}
            </ul>
            {comments.length > COMMENTS_LIMIT && (
                <button
                    className="toggle-comments-btn"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? "Thu gọn bình luận" : "Xem thêm bình luận"}
                </button>
            )}
        </div>
    );
};

export default CommentSection;



