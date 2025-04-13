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
    // replyContents lưu nội dung reply cho từng comment (key = comment id)
    const [replyContents, setReplyContents] = useState({});
    // activeReplyId lưu id của bình luận (bao gồm cả reply) đang mở form trả lời
    const [activeReplyId, setActiveReplyId] = useState(null);

    useEffect(() => {
        axios.get(`/api/comments/${productId}`)
            .then(res => setComments(res.data))
            .catch(err => console.error("Lỗi lấy bình luận:", err));
    }, [productId]);

    const COMMENTS_LIMIT = 7;
    const displayedComments = showAll ? comments : comments.slice(0, COMMENTS_LIMIT);

    // Hàm flattenReplies: chuyển danh sách reply lồng vào 1 mảng phẳng
    const flattenReplies = (replies) => {
      let flat = [];
      replies.forEach((reply) => {
          flat.push(reply);
          if (reply.replies && reply.replies.length > 0) {
              flat = flat.concat(flattenReplies(reply.replies));
          }
      });
      return flat;
    };

    // Xử lý gửi bình luận chính
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
            console.error("❌ Lỗi khi gửi bình luận:", error);
        } finally {
            setLoading(false);
        }
    };

    // Khi nhấn nút "Trả lời", mở form trả lời và tự động thêm tag tên
    const handleReplyClick = (comment) => {
        setActiveReplyId((prev) => (prev === comment.id ? null : comment.id));
        setReplyContents((prev) => ({
            ...prev,
            [comment.id]: prev[comment.id] || `@${comment.userName} `
        }));
    };

    // Cập nhật nội dung reply cho bình luận có ID = commentId
    const handleReplyChange = (commentId, text) => {
        setReplyContents((prev) => ({ ...prev, [commentId]: text }));
    };

    // Gửi reply cho comment
    const handleReplySubmit = async (commentId) => {
        const replyContent = replyContents[commentId];
        if (!replyContent?.trim()) return;
        try {
            await axios.post("/api/comments/reply", { userId, commentId, content: replyContent });
            setReplyContents((prev) => ({ ...prev, [commentId]: "" }));
            setActiveReplyId(null);
            const res = await axios.get(`/api/comments/${productId}`);
            setComments(res.data);
        } catch (error) {
            console.error("❌ Lỗi khi gửi reply:", error);
        }
    };

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
                            <span className="comment-time">
                                Bình Luận vào {new Date(c.created_at).toLocaleString()}
                            </span>
                        </div>
                        <div className="comment-body">
                            <strong>{c.content}</strong>
                        </div>
                        {/* Nút trả lời cho comment cha */}
                        {userId && (
                            <button className="reply-toggle-btn" onClick={() => handleReplyClick(c)}>
                                {activeReplyId === c.id ? "Ẩn trả lời" : "Trả lời"}
                            </button>
                        )}
                        {/* Form trả lời cho comment cha */}
                        {userId && activeReplyId === c.id && (
                            <div className="reply-form">
                                <textarea
                                    value={replyContents[c.id] || ""}
                                    onChange={(e) => handleReplyChange(c.id, e.target.value)}
                                    placeholder={`Trả lời @${c.userName}`}
                                />
                                <button type="button" onClick={() => handleReplySubmit(c.id)}>
                                    Gửi trả lời
                                </button>
                            </div>
                        )}
                        {/* Render tất cả các reply (làm phẳng) */}
                        {c.replies && c.replies.length > 0 && (
                            <ul className="reply-list">
                                {flattenReplies(c.replies).map((r) => (
                                    <li key={r.id}>
                                        <div className="reply-header">
                                            <strong className="reply-user">{r.userName}</strong>
                                            <span className="reply-time">
                                                {new Date(r.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="reply-body">{r.content}</div>
                                        {/* Nút trả lời cho mỗi reply (trả lời của reply) */}
                                        {userId && (
                                            <button
                                                className="reply-toggle-btn"
                                                onClick={() => handleReplyClick(r)}
                                            >
                                                {activeReplyId === r.id ? "Ẩn trả lời" : "Trả lời"}
                                            </button>
                                        )}
                                        {userId && activeReplyId === r.id && (
                                            <div className="reply-form">
                                                <textarea
                                                    value={replyContents[r.id] || ""}
                                                    onChange={(e) => handleReplyChange(r.id, e.target.value)}
                                                    placeholder={`Trả lời @${r.userName}`}
                                                />
                                                <button type="button" onClick={() => handleReplySubmit(r.id)}>
                                                    Gửi trả lời
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
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
