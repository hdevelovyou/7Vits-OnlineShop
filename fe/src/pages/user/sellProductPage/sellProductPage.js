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
        notes: ''
    });
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const formatPrice = (value) => {
        // Remove all non-digit characters
        const number = value.replace(/\D/g, '');
        // Add dots as thousand separators
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'price') {
            // Format price with dots
            const formattedPrice = formatPrice(value);
            setFormData({
                ...formData,
                [name]: formattedPrice
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra kích thước file (giới hạn 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('Kích thước ảnh không được vượt quá 2MB');
                return;
            }
            
            // Kiểm tra định dạng file
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Chỉ chấp nhận file ảnh (JPG, JPEG, PNG, GIF, WEBP)');
                return;
            }

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
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

            // Validate notes field
            if (!formData.notes || formData.notes.trim() === '') {
                setError('Ghi chú không được để trống');
                setLoading(false);
                return;
            }

            // Format price as number (remove dots and convert to number)
            const priceValue = parseFloat(formData.price.replace(/\./g, ''));
            
            const productData = {
                name: formData.name,
                description: formData.description,
                price: priceValue,
                category: formData.category,
                notes: formData.notes,
                image: image
            };

            // Send request to create product
            const response = await axios.post('/api/products', productData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
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
        'Game Key', 'App Key', 'Account'
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
                    <label htmlFor="price">Giá sản phẩm (VNĐ) *</label>
                    <input
                        type="text"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        placeholder="Nhập giá sản phẩm"
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
                        <option value="">Chọn danh mục</option>
                        {categories.map((category, index) => (
                            <option key={index} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="notes">Ghi chú *</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        required
                        placeholder="Nhập thông tin key, tài khoản, mật khẩu hoặc các thông tin khác"
                        rows={3}
                    />
                    <p className="notes-helper">Lưu ý: Thông tin này sẽ được hiển thị cho người mua sau khi thanh toán thành công</p>
                </div>

                <div className="form-group">
                    <label htmlFor="image">Ảnh sản phẩm</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        onChange={handleImageChange}
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    />
                    {previewUrl && (
                        <div className="image-preview">
                            <img src={previewUrl} alt="Preview" />
                        </div>
                    )}
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đăng bán'}
                </button>
            </form>
        </div>
    );
};

export default SellProductPage;