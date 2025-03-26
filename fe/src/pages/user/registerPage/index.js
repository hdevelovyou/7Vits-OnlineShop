import { memo, useState } from "react";
import "./style.scss";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { FaCircleUser } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import axios from "axios";
// Import Appwrite dependencies
import { Client, Account } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Update this with your Appwrite endpoint
    .setProject('67e41482001ce25b7a7f'); // Update with your project ID

const account = new Account(client);

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        userName: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleSignUp = async () => {
        try {
            // Redirect to Google OAuth login
            await account.createOAuth2Session(
                'google', 
                'http://localhost:3000/', // Success URL - adjust as needed
                'http://localhost:3000/fail' // Failure URL - adjust as needed
            );
        } catch (err) {
            setError(err.message || "Google authentication failed");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu không khớp"); // Set error for password mismatch
            return;
        }
        
        try {
            const res = await axios.post("http://localhost:5000/api/auth/register", formData);
            alert("Đăng ký thành công!");
            navigate("/otp-for-signup");
        } catch (err) {
            // Better error handling to match your login page
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError(err.message || "Đăng ký thất bại. Vui lòng thử lại sau.");
            }
        }
    };

    return (
        <div className="signup-page">
            <form className="form-sign" onSubmit={handleSubmit}>
                <div className="title">
                    <h1>Đăng ký tài khoản</h1>
                </div>
                
                {/* Error message display */}
                {error && <p className="error-message">{error}</p>}
                
                <div className="input-group">
                    <input type="text" name="firstName" placeholder="Họ" onChange={handleChange} required />
                    <input type="text" name="lastName" placeholder="Tên" onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <input type="text" name="email" placeholder="Email / SĐT" onChange={handleChange} required />
                </div>
                <div className="input-username">
                    <FaCircleUser className="icon" />
                    <input type="text" name="userName" placeholder="Tên tài khoản" onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <FaLock className="icon" />
                    <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} required />
                    <input type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu" onChange={handleChange} required />
                </div>
                <div className="signup">
                    <div className="otherSignUp">
                        <FaFacebook className="icon" />
                        <FcGoogle className="icon-gg" onClick={handleGoogleSignUp} style={{cursor: 'pointer'}} />
                    </div>
                    <div className="sig-btn">
                        <button type="submit">Đăng ký</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default memo(RegisterPage);