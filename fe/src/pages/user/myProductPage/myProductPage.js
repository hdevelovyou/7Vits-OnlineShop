import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './myProductPage.scss';

const MyProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get('/api/my-products', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setProducts(response.data);
            } catch (err) {
                setError('Không thể tải danh sách sản phẩm');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyProducts();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/products/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setProducts(products.filter(product => product.id !== id));
            } catch (err) {
                setError('Không thể xóa sản phẩm');
                console.error(err);
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const product = products.find(p => p.id === id);
            
            await axios.put(`/api/products/${id}`, 
                { 
                    ...product,
                    status: newStatus 
                }, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Update local state
            setProducts(products.map(p => 
                p.id === id ? {...p, status: newStatus} : p
            ));
        } catch (err) {
            setError('Không thể cập nhật trạng thái sản phẩm');
            console.error(err);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'active': return 'status-active';
            case 'inactive': return 'status-inactive';
            case 'sold_out': return 'status-soldout';
            default: return '';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Đang bán';
            case 'inactive': return 'Đã ẩn';
            case 'sold_out': return 'Đã bán';
            default: return status;
        }
    };

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="my-products-container">
            <div className="header-section">
                <h1>Sản phẩm của tôi</h1>
                <Link to="/sell-product" className="add-product-btn">+ Thêm sản phẩm mới</Link>
            </div>

            {error && <div className="error-message">{error}</div>}

            {products.length === 0 ? (
                <div className="no-products">
                    <p>Bạn chưa có sản phẩm nào.</p>
                    <Link to="/sell-product" className="add-first-product-btn">Đăng bán sản phẩm đầu tiên</Link>
                </div>
            ) : (
                <div className="products-table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Tên sản phẩm</th>
                                <th>Giá</th>
                                <th>Danh mục</th>
                                <th>Tồn kho</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>{product.name}</td>
                                    <td>{product.price.toLocaleString('vi-VN')}đ</td>
                                    <td>{product.category}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(product.status)}`}>
                                            {getStatusLabel(product.status)}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <div className="dropdown">
                                            <button className="change-status-btn">
                                                Thay đổi trạng thái
                                            </button>
                                            <div className="dropdown-content">
                                                <button onClick={() => handleStatusChange(product.id, 'active')}>Đang bán</button>
                                                <button onClick={() => handleStatusChange(product.id, 'inactive')}>Ẩn sản phẩm</button>
                                                <button onClick={() => handleStatusChange(product.id, 'sold_out')}>Đã bán hết</button>
                                            </div>
                                        </div>
                                        <Link to={`/edit-product/${product.id}`} className="edit-btn">Sửa</Link>
                                        <button 
                                            onClick={() => handleDelete(product.id)} 
                                            className="delete-btn"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyProductsPage;