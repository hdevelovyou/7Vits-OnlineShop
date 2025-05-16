/* MyProductsPage.jsx */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './myProductPage.scss';
import {
  SwipeableList,
  SwipeableListItem,
  TrailingActions,
  SwipeAction,
  Type as ListType
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';

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
        const { data } = await axios.get('/api/my-products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(data);
      } catch {
        setError('Không thể tải danh sách sản phẩm');
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
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch {
        setError('Không thể xóa sản phẩm');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const prod = products.find(p => p.id === id);
      await axios.put(`/api/products/${id}`, { ...prod, status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch {
      setError('Không thể cập nhật trạng thái sản phẩm');
    }
  };

  const trailingActions = (product) => (
    <TrailingActions style={{ width: 120 }}>
      <SwipeAction onClick={() =>navigate(`/edit-product/${product.id}`)}>
        <button className="change">Thay đổi</button>
      </SwipeAction>
      <SwipeAction destructive onClick={() => handleDelete(product.id)}>
       <button className="delete">Xóa</button>
      </SwipeAction>
    </TrailingActions>
  );

  const formatPrice = price => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const getStatusLabel = status => ({ active: 'Đang bán', inactive: 'Đã ẩn', sold_out: 'Đã bán hết' }[status] || 'Không xác định');
  const getStatusClass = status => ({ active: 'status-active', inactive: 'status-inactive', sold_out: 'status-soldout' }[status] || '');

  // Xử lý đường dẫn hình ảnh
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return "https://via.placeholder.com/300x300?text=No+Image";
    }

    // Nếu là base64 image thì trả về trực tiếp
    if (imageUrl.startsWith('data:image')) {
        return imageUrl;
    }

    // Kiểm tra nếu đường dẫn bắt đầu bằng http hoặc https thì giữ nguyên
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Nếu có đường dẫn nhưng không phải là URL đầy đủ, thêm domain
    return `${process.env.REACT_APP_API_URL}${imageUrl}`;
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
     
          <div className="desktop-only">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tên SP</th>
                  <th>Giá</th>
                  <th>Danh mục</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.image_url ? <img src={getImageUrl(p.image_url)} alt="" className="product-thumbnail"/> : '—'}</td>
                    <td><Link to={`/product/${p.id}`}>{p.name}</Link></td>
                    <td>{formatPrice(p.price)}</td>
                    <td>{p.category}</td>
                    <td>{p.stock}</td>
                    <td><span className={`status-badge ${getStatusClass(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                    <td className="actions">
                      <div className="dropdown">
                        <button className="change-status-btn">Thay đổi trạng thái</button>
                        <div className="dropdown-content">
                          <button onClick={() => handleStatusChange(p.id, 'active')}>Đang bán</button>
                          <button onClick={() => handleStatusChange(p.id, 'inactive')}>Ẩn sản phẩm</button>
                          <button onClick={() => handleStatusChange(p.id, 'sold_out')}>Đã bán hết</button>
                        </div>
                      </div>
                      <Link to={`/edit-product/${p.id}`} className="edit-btn"><i className="fas fa-edit"/></Link>
                      <button className="delete-btn" onClick={() => handleDelete(p.id)}><i className="fas fa-trash-alt"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

      
          <div className="mobile-only">
            <div className="mobile-table-header">
              <div className="cell image">Hình ảnh</div>
              <div className="cell name">Tên SP</div>
              <div className="cell price">Giá</div>
              <div className="cell category">Danh mục</div>
              <div className="cell stock">Tồn kho</div>
              <div className="cell status">Trạng thái</div>
            </div>
            <SwipeableList threshold={0.2} type={ListType.IOS}>
              {products.map(p => (
                <SwipeableListItem
                  key={p.id}
                  trailingActions={trailingActions(p)}
                  fullSwipe={false}
                >
                  <div className="mobile-table-row">
                    <div className="cell image">{p.image_url ? <img src={getImageUrl(p.image_url)} alt=""/> : '—'}</div>
                    <div className="cell name"><Link to={`/product/${p.id}`}>{p.name}</Link></div>
                    <div className="cell price">{formatPrice(p.price)}</div>
                    <div className="cell category">{p.category}</div>
                    <div className="cell stock">{p.stock}</div>
                    <div className="cell status"><span className={`status-badge ${getStatusClass(p.status)}`}>{getStatusLabel(p.status)}</span></div>
                  </div>
                </SwipeableListItem>
              ))}
            </SwipeableList>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProductsPage;