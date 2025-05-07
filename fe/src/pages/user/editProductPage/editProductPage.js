import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../sellProductPage/sellProductPage.scss'; // Reuse the same styles

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: 1,
        status: 'active',
        notes: ''
    });
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
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setFormData({
                    name: response.data.name,
                    description: response.data.description,
                    price: response.data.price,
                    category: response.data.category,
                    stock: response.data.stock,
                    status: response.data.status,
                    notes: response.data.notes || ''
                });
            } catch (err) {
                setError('Không thể tải thông tin sản phẩm');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

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
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Bạn cần đăng nhập để cập nhật sản phẩm');
                navigate('/login');
                return;
            }

            // Format price as number
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock)
            };

            // Send request to update product
            await axios.put(`/api/products/${id}`, productData, {
                headers: {
                    'Authorization': `Bearer ${token}`
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
        'Game','Key','Tài khoản game'
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
                        <option value="active">Đang bán</option>
                        <option value="inactive">Đã ẩn</option>
                        <option value="sold_out">Đã bán hết</option>
                    </select>
                </div>

                <button type="submit" className="submit-button" disabled={submitting}>
                    {submitting ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                </button>
            </form>
        </div>
    );
};

export default EditProductPage;