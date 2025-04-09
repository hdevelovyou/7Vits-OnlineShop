import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './sellProductPage.scss';

const SellProductPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: 1
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Check for token
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Bạn cần đăng nhập để đăng bán sản phẩm');
                navigate('/login');
                return;
            }

            // Format price as number
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock)
            };

            // Send request to create product
            const response = await axios.post('/api/products', productData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // On success
            alert('Sản phẩm đã được đăng bán thành công!');
            navigate('/my-products');
        } catch (err) {
            setError(err.response?.data?.error || 'Đã xảy ra lỗi khi đăng bán sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const categories = [
       'Game','Key','Tài khoản game'
    ];

    return (
        <div className="sell-product-container">
            <h1>Đăng bán sản phẩm</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                    <label htmlFor="name">Tên sản phẩm *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Nhập tên sản phẩm"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Mô tả sản phẩm *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Mô tả chi tiết về sản phẩm"
                        rows={5}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Giá (VND) *</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        placeholder="Nhập giá sản phẩm"
                        min="0"
                        step="1000"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Danh mục *</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Chọn danh mục</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="stock">Số lượng *</label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                        min="1"
                    />
                </div>

                <button 
                    type="submit" 
                    className="submit-button" 
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Đăng bán'}
                </button>
            </form>
        </div>
    );
};

export default SellProductPage;