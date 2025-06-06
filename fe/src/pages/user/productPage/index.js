import { useState, memo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from '../../../contexts/AuthContext';
import CommentSection from "../../../components/comment/comment";
import "./style.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { formatVND } from "../../../utils/formatprice";
import SellerRatingDisplay from "../../../components/rating/rating"
const ProductPage = ({ cart, setCart }) => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/products/${id}`);
                console.log("Chi tiết sản phẩm:", response.data);

                if (response.data) { setProduct({ ...response.data, images: response.data.image_url ? [response.data.image_url] : [], rating: response.data.rating !== undefined ? response.data.rating : 4, sold: response.data.sold_count !== undefined ? response.data.sold_count : 0, stock: response.data.stock !== undefined ? response.data.stock : 0, features: response.data.features ? response.data.features : [], originalPrice: response.data.price * 1.2 }); } else { setError("Không tìm thấy thông tin sản phẩm"); navigate("/"); }
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
                setError("Đã xảy ra lỗi khi tải thông tin sản phẩm");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);
    const handleChatClick = () => {
        if (user && user.id) {
            // Đã đăng nhập → tới chat với seller
            navigate(
                `/chat/${product.seller_id}` +
                `?receiverName=${encodeURIComponent(product.seller_name)}`
            );
        } else {
            // Chưa đăng nhập → đưa về trang login
            navigate('/login', { state: { from: `/product/${product.id}` } });
        }
    };

    const formatPrice = (price) => {
        if (!price) return '0';
        return formatVND(price);
    };
    const userId = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).id
        : null;

    const submitRating = async () => {
        if (!selectedRating) {
            alert("Vui lòng chọn số sao để đánh giá!");
            return;
        }

        try {
            await axios.post('/api/ratings', {
                product_id: product.id,
                user_id: userId,
                rating: selectedRating
            });
            alert("Đã gửi đánh giá! Cảm ơn bạn ❤️");
        } catch (error) {
            console.error("Lỗi gửi đánh giá:", error);
            alert("Đã xảy ra lỗi khi gửi đánh giá.");
        }
    };
    // Xử lý đường dẫn hình ảnh
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) {
            console.log("Không có đường dẫn ảnh");
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
        const fullUrl = `${process.env.REACT_APP_API_URL}${imageUrl}`;
        console.log("URL hình ảnh đầy đủ:", fullUrl);
        return fullUrl;
    };

    const addToCart = () => {
        // Kiểm tra trạng thái sản phẩm và số lượng tồn kho
        if (product.status === 'sold_out' || product.stock <= 0) {
            alert("Sản phẩm đã hết hàng!");
            return;
        }

        // Kiểm tra người dùng không mua sản phẩm của chính mình
        if (user && user.id && product.seller_id === user.id) {
            alert("Bạn không thể mua sản phẩm do chính mình đăng bán");
            return;
        }

        const item = {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: getImageUrl(product.images[0]),
            amount: 1
        };

        // Check if item is already in cart
        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

        let updatedCart;
        if (existingItemIndex >= 0) {
            // Item already in cart - just replace it
            updatedCart = [...cart];
            updatedCart[existingItemIndex] = item;
            setCart(updatedCart);
        } else {
            // Add new item to cart
            updatedCart = [...cart, item];
            setCart(updatedCart);
        }

        // Save to localStorage for persistence
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        alert("Đã thêm vào giỏ hàng!");
    };

    const handleBuyNow = () => {
        // Kiểm tra trạng thái sản phẩm và số lượng tồn kho
        if (product.status === 'sold_out' || product.stock <= 0) {
            alert("Sản phẩm đã hết hàng!");
            return;
        }

        // Kiểm tra người dùng không mua sản phẩm của chính mình
        if (user && user.id && product.seller_id === user.id) {
            alert("Bạn không thể mua sản phẩm do chính mình đăng bán");
            return;
        }

        const item = {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: getImageUrl(product.images[0]),
            amount: 1
        };

        // Check if item is already in cart
        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

        let updatedCart;
        if (existingItemIndex >= 0) {
            // Item already in cart - just replace it
            updatedCart = [...cart];
            updatedCart[existingItemIndex] = item;
            setCart(updatedCart);
        } else {
            // Add new item to cart
            updatedCart = [...cart, item];
            setCart(updatedCart);
        }

        // Save to localStorage for persistence
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        // Chuyển đến trang giỏ hàng
        navigate('/gio-hang');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải sản phẩm...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => navigate('/')}>Quay lại trang chủ</button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="error-container">
                <p>Không tìm thấy sản phẩm</p>
                <button onClick={() => navigate('/')}>Quay lại trang chủ</button>
            </div>
        );
    }

    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    return (
        <>
            <div className="product-page">

                <div className="product-container">
                    <div className="product-breadcrumb">
                        <a href="/" className="breadcrumb-link">Trang chủ</a>
                        <i className="fas fa-chevron-right"></i>
                        <a href="/shop" className="breadcrumb-link">Cửa hàng</a>
                        <i className="fas fa-chevron-right"></i>
                        <span className="breadcrumb-current">{product.name}</span>
                    </div>

                    <div className="product-content">
                        <div className="product-gallery">
                            <div className="main-image">
                                <img
                                    src={getImageUrl(product.images[selectedImage])}
                                    alt={product.name}
                                    className="product-image"
                                    onError={(e) => {
                                        console.error("Lỗi tải ảnh:", product.images[selectedImage]);
                                        e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                                    }}
                                />

                            </div>
                            {product.images && product.images.length > 1 && (
                                <div className="thumbnail-list">
                                    {product.images.map((img, index) => (
                                        <div
                                            key={index}
                                            className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                            onClick={() => setSelectedImage(index)}
                                        >
                                            <img
                                                src={getImageUrl(img)}
                                                alt={`${product.name} ${index + 1}`}
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/100x100?text=Error";
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="product-info">
                            <h1 className="product-title">{product.name}</h1>

                            <div className="product-meta">
                                <div className="product-seller">
                                    <i className="fa-solid fa-store"></i>
                                    <span>Người bán: {product.seller_name || "Unknown Seller"}</span>

                                    <button onClick={handleChatClick} className="chat-link">
                                        <i className="fa-solid fa-comment-dots"></i> Nhắn tin
                                    </button>
                                </div>
                                <div className="product-rating">
                                    
                                 <span>Đánh giá từ shop</span>
                                 <SellerRatingDisplay sellerId={product.seller_id}/>

                                </div>

                                <div className="product-stock-info">
                                    <div className="stock-status">
                                        <i className={`fa-solid ${product.status === 'sold_out' || product.stock <= 0 ? 'fa-xmark' : 'fa-check'}`}></i>
                                        <span className={`status ${product.status === 'sold_out' || product.stock <= 0 ? 'out-of-stock' : 'in-stock'}`}>
                                            {product.status === 'sold_out' || product.stock <= 0 ? 'Hết hàng' : 'Còn hàng'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="product-price">
                                <div className="price-info">

                                    <span className="new-price">{formatPrice(product.price)}</span>
                                </div>

                            </div>

                            {product.description && (
                                <div className="product-description">
                                    <h3 className="section-title">Mô tả sản phẩm</h3>
                                    <p>{product.description}</p>
                                </div>
                            )}

                            {product.features && product.features.length > 0 && (
                                <div className="product-features">
                                    <h3 className="section-title">Tính năng nổi bật</h3>
                                    <ul className="feature-list">
                                        {product.features.map((feature, index) => (
                                            <li key={index} className="feature-item">
                                                <i className="fa-solid fa-check"></i>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="product-actions">
                                <div className="action-buttons">
                                    <button
                                        className="buy-now-btn"
                                        disabled={product.status === 'sold_out' || product.stock <= 0 || (user && user.id === product.seller_id)}
                                        onClick={handleBuyNow}
                                    >
                                        <i className="fa-solid fa-bolt-lightning"></i>
                                        {user && user.id === product.seller_id
                                            ? 'Không thể tự mua'
                                            : (product.status === 'sold_out' || product.stock <= 0)
                                                ? 'Hết hàng'
                                                : 'Mua ngay'
                                        }
                                    </button>
                                    <button
                                        onClick={addToCart}
                                        className="add-to-cart-btn"
                                        disabled={product.status === 'sold_out' || product.stock <= 0 || (user && user.id === product.seller_id)}
                                    >
                                        <i className="fa-solid fa-cart-plus"></i>
                                        {user && user.id === product.seller_id
                                            ? 'Không thể tự mua'
                                            : (product.status === 'sold_out' || product.stock <= 0)
                                                ? 'Hết hàng'
                                                : 'Thêm vào giỏ hàng'
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <CommentSection
                    productId={product.id}
                    userId={
                        localStorage.getItem("user")
                            ? JSON.parse(localStorage.getItem("user")).id
                            : null
                    }
                />


            </div>

        </>

    );
};

export default memo(ProductPage);
