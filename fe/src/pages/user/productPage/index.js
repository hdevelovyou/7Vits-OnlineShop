import { useState, memo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CommentSection from "../../../components/comment/comment";
import "./style.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";

const ProductPage = ({ cart, setCart }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/products/${id}`);
                console.log("Chi tiết sản phẩm:", response.data);

                if (response.data) {
                    setProduct({
                        ...response.data,
                        images: response.data.image_url ? [response.data.image_url] : [],
                        rating: response.data.rating !== undefined ? response.data.rating : 4,
                        sold: response.data.sold !== undefined ? response.data.sold : 0,
                        features: response.data.features ? response.data.features : [],
                        originalPrice: response.data.price * 1.2
                    });
                } else {
                    setError("Không tìm thấy thông tin sản phẩm");
                    navigate("/");
                }
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

    const formatPrice = (price) => {
        return price ? price.toLocaleString('vi-VN') : '0';
    };

    // Xử lý đường dẫn hình ảnh
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) {
            console.log("Không có đường dẫn ảnh");
            return "https://via.placeholder.com/300x300?text=No+Image";
        }

        // Kiểm tra nếu đường dẫn bắt đầu bằng http hoặc https thì giữ nguyên
        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            return imageUrl;
        }

        // Nếu có đường dẫn nhưng không phải là URL đầy đủ, thêm domain
        const fullUrl = `http://localhost:5000${imageUrl}`;
        console.log("URL hình ảnh đầy đủ:", fullUrl);
        return fullUrl;
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setQuantity(value);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    const addToCart = () => {
        const item = {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: getImageUrl(product.images[0]),
            amount: quantity
        };

        // Check if item is already in cart
        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

        let updatedCart;
        if (existingItemIndex >= 0) {
            // Update item quantity if already in cart
            updatedCart = [...cart];
            updatedCart[existingItemIndex].amount += quantity;
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
                                {discount > 0 && (
                                    <div className="discount-badge">
                                        <span>-{discount}%</span>
                                    </div>
                                )}
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
                                <div className="product-rating">
                                    <div className="stars">
                                        {[...Array(5)].map((_, idx) => (
                                            <i
                                                key={idx}
                                                className={`fa-solid fa-star ${idx < Math.floor(product.rating) ? 'active' : ''}`}
                                            ></i>
                                        ))}
                                    </div>
                                    <span className="rating-number">{product.rating}/5</span>
                                    <span className="divider">|</span>
                                    <span className="sold">{product.sold.toLocaleString()} Đã Bán</span>
                                </div>
                            </div>

                            <div className="product-price">
                                <div className="price-info">
                                    <span className="new-price">{formatPrice(product.price)}đ</span>
                                    <span className="old-price">{formatPrice(product.originalPrice)}đ</span>
                                </div>
                                {discount > 0 && (
                                    <span className="discount">{discount}% GIẢM</span>
                                )}
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
                                <div className="quantity-control">
                                    <span className="quantity-label">Số lượng:</span>
                                    <div className="quantity-selector">
                                        <button
                                            onClick={decreaseQuantity}
                                            className="quantity-btn"
                                            disabled={quantity <= 1}
                                        >
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            min="1"
                                            className="quantity-input"
                                        />
                                        <button onClick={increaseQuantity} className="quantity-btn">
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="action-buttons">
                                    <button className="buy-now-btn">
                                        <i className="fa-solid fa-bolt-lightning"></i>
                                        Mua ngay
                                    </button>
                                    <button onClick={addToCart} className="add-to-cart-btn">
                                        <i className="fa-solid fa-cart-plus"></i>
                                        Thêm vào giỏ hàng
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
