import { memo, useState, useEffect, useRef } from "react";
import "./users.scss";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../utils/router.js";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [products, setProducts] = useState([]);
  const [comments, setComments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const detailRef = useRef(null);

  useEffect(() => {
    axios.get("/api/users").then(res => setUsers(res.data));
  }, []);

  const handleSelect = async (user) => {
    setSelected(user);
    const [detail, prods, comms, convs] = await Promise.all([
      axios.get(`/api/users/${user.id}`),
      axios.get(`/api/users/${user.id}/products`),
      axios.get(`/api/users/${user.id}/comments`),
      axios.get(`/api/users/${user.id}/conversations`),
    ]);
    setUserDetail(detail.data);
    setProducts(prods.data);
    setComments(comms.data);
    setConversations(convs.data);
    setSelectedConversation(null);
    setMessages([]);

    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };
  const handleSelectConversation = async (otherUser) => {
    setSelectedConversation(otherUser);
    const res = await axios.get(`/api/users/${selected.id}/messages/${otherUser.otherUserId}`);
    setMessages(res.data);
  };
  const handleDeleteConversation = async (otherUserId) => {
    await axios.delete(`/api/users/${selected.id}/conversations/${otherUserId}`);
    // Cập nhật lại danh sách conversation
    const res = await axios.get(`/api/users/${selected.id}/conversations`);
    setConversations(res.data);
    setSelectedConversation(null);
    setMessages([]);
  };

  return (
    <div className="admin-users">
      <div className="user-list">
        <h2>Users list</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>UserName</th>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Joining date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id} onClick={() => handleSelect(u)} style={{ cursor: "pointer" }}>
                <td>{idx + 1}</td>
                <td>{u.userName}</td>
                <td>{u.email}</td>
                <td>{u.firstName || ""}</td>
                <td>{u.lastName || ""}</td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""}</td>
                <td>
                  <button
                      onClick={async e => {
                        e.stopPropagation();
                        if (window.confirm("Are you sure you want to delete this user?")) {
                          await axios.delete(`/api/users/${u.id}`);
                          const res = await axios.get("/api/users");
                          setUsers(res.data); 
                          setSelected(null);
                          setUserDetail(null);
                          setProducts([]);
                          setComments([]);
                        }
                      }}
                    >
                      Delete account
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <br></br><br></br>
      {selected && userDetail && (
        <div className="user-detail" ref={detailRef}>
          <div className="info-card">
            <h3>User information</h3>
            <br></br>
            <ul>
              <li><b>UserName:</b> {userDetail.userName}</li>
              <li><b>Email:</b> {userDetail.email}</li>
              <li><b>First Name:</b> {userDetail.firstName}</li>
              <li><b>Last Name:</b> {userDetail.lastName}</li>
              <li><b>Joining date:</b> {userDetail.createdAt ? new Date(userDetail.createdAt).toLocaleDateString() : ""}</li>
            </ul>
          </div>
          <div className="info-card">
            <h3>Posted products</h3>
            {products.length === 0 ? (
              <div className="default-noti">This user has no posted any product up to this point.</div>
            ) : (
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Posting date</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.price?.toLocaleString() ?? ""}</td>
                      <td>{p.status}</td>
                      <td>{p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="info-card">
            <h3>Comments</h3>
            <br></br>
            {comments.length === 0 ? (
              <div className="default-noti">This user has no comment up to this point.</div>
            ) : (
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Content</th>
                    <th>Product Name</th>
                    <th>Seller Name</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((c) => (
                    <tr key={c.id}>
                      <td>{c.content}</td>
                      <td>{c.productName}</td>
                      <td>{c.sellerName}</td>
                      <td>{c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="info-card">
            <h3>Conversations</h3>
            {conversations.length === 0 ? (
              <div className="default-noti">This user has no conversation up to this point.</div>
            ) : (
              <ul className="conversation-table">
                <thead>
                  <th>No.</th>
                  <th>UserName</th>
                  <th>Email</th>
                  <th>Action</th>
                </thead>
                <tbody>
                  {conversations.map((c, idx) => (
                    <tr>
                    <td>{idx + 1}</td>
                    <td>{c.userName}</td>
                    <td>{c.email}</td>
                    <td>
                      <button className="action-btn" onClick={() => handleSelectConversation(c)}>
                        View messages
                      </button>
                      <button className="action-btn" onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm("Are you sure you want to delete this conversation?")) {
                                  await handleDeleteConversation(c.otherUserId);
                                }
                              }}
                            >
                        Delete
                      </button>
                    </td>
                    </tr>
                  ))}
                </tbody>
              </ul>
            )}
            <br></br>
            {selectedConversation && (
              <div className="messages-list">
                <h4>Message history with {selectedConversation.userName}</h4>
                <ul>
                  {messages.map((m) => (
                    <li key={m.id}>
                      <b>{m.senderUserName}:</b> {m.message} <span className="msg-time">{new Date(m.created_at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
    )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

