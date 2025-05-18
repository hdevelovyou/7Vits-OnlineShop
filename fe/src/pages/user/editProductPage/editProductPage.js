import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../sellProductPage/sellProductPage.scss'; // Reuse the same styles
import '../../../utils/formatprice'; // Assuming you have a formatVND function for formatting prices
import { formatVND } from '../../../utils/formatprice';

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        status: 'active',
        notes: ''
    });
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`/api/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const product = response.data;
                setFormData({
                    name: product.name,
                    description: product.description,
                    price: product.price.toString(),
                    category: product.category,
                    status: product.status,
                    notes: product.notes || ''
                });

                if (product.image_url) {
                    setImage(product.image_url);
                    setPreviewUrl(product.image_url);
                }
            } catch (err) {
                setError('Không thể tải thông tin sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra kích thước file (giới hạn 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Kích thước ảnh không được vượt quá 5MB');
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
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Bạn cần đăng nhập để cập nhật sản phẩm');
                navigate('/login');
                return;
            }

            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                image: image
            };

            // Send request to update product
            await axios.put(`/api/products/${id}`, productData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // On success
            alert('Sản phẩm đã được cập nhật thành công!');
            navigate('/my-products');
        } catch (err) {
            setError(err.response?.data?.error || 'Đã xảy ra lỗi khi cập nhật sản phẩm');
        } finally {
            setSubmitting(false);
        }
    };

    const categories = [
        'Game', 'Key', 'Tài khoản game'
    ];

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="sell-product-container">
            <h1>Chỉnh sửa sản phẩm</h1>

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
                        type="text" // Đổi từ number sang text
                        id="price"
                        name="price"
                        value={formatVND(formData.price).replace('đ', '')} // Hiển thị đã định dạng
                        onChange={(e) => {
                            // Lọc chỉ giữ lại số và convert sang number
                            const rawValue = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, price: Number(rawValue) });
                        }}
                        onBlur={() => {
                
                            if (formData.price < 0) setFormData({ ...formData, price: 0 });
                        }}
                        required
                        placeholder="Nhập giá sản phẩm"
                        inputMode="numeric" // Hiện bàn phím số trên mobile
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
                    <label htmlFor="notes">Ghi chú (Key, thông tin đăng nhập)</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Nhập key, thông tin đăng nhập hoặc các thông tin khác cho sản phẩm"
                        rows={3}
                    />
                    <small className="notes-helper">Thông tin này sẽ được hiển thị cho người mua sau khi họ mua hàng</small>
                </div>

                <div className="form-group">
                    <label htmlFor="status">Trạng thái *</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                    >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Tạm ngưng</option>
                    </select>
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

                <button type="submit" className="submit-button" disabled={submitting}>
                    {submitting ? 'Đang xử lý...' : 'Cập nhật sản phẩm'}
                </button>
            </form>
        </div>
    );
};

export default EditProductPage;