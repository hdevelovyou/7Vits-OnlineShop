import { useState, memo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";


const ProductPage = ({ cart, setCart }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [product, setProduct] = useState(null);
    
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/products");
                if (Array.isArray(response.data.list)) {
                    const found = response.data.list.find(p => p.id === parseInt(id));
                   console.log(found);
                    if (found) {
                        setProduct({
                            ...found,
                            images: found.image ? [found.image] : [],
                            rating: found.rating !== undefined ? found.rating : 4,
                            sold: found.sold !== undefined ? found.sold : 0,
                            features: found.features ? found.features : [],
                            description: found.description ? found.description : found.slug
                        });
                    } else {
                        navigate("/");
                    }
                } else {
                    console.error("Dữ liệu không đúng định dạng.");
                }
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
                navigate("/");
            }
        };

        fetchProduct();
    }, [id, navigate]);
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleQuantityChange = (value) => {
        if (value === "") {
            setQuantity(1);
            return;
        }
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 99) {
            setQuantity(numValue);
        }
    };
  
    const handleAddToCart = (product) => {
        const arr = [...cart];
        const foundIndex = arr.findIndex(item => item.id === product.id);
    
        if (foundIndex !== -1) {
            arr[foundIndex].amount += quantity;
        } else {
            
            arr.push({...product, amount: quantity });
            console.log(arr);
        }
       
    
        setCart(arr);
        localStorage.setItem("cart", JSON.stringify(arr));  // Lưu giỏ hàng vào Local Storage
    };
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);
    
    useEffect(() => {
        console.log(cart);
    },[cart]); 
    const getTotalQuantity = () => {
        return cart.reduce((total, product) => total + product.amount, 0);
    };
    if (!product) {
        return <div className="product-page">Loading...</div>;
    }
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    return (
        <>

        <div className="product-page">
            <div className="grid">
                <div className="product-container">
                    <div className="product-gallery">
                        <div className="main-image">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={`https://www.divineshop.vn${product.images[selectedImage]}`}
                                    alt={product.name}
                                    className="product-image"
                                />
                            ) : (
                                <img
                                    src="https://via.placeholder.com/300x300?text=No+Image"
                                    alt="No Image"
                                    className="product-image"
                                />
                            )}
                        </div>
                        {product.images && product.images.length >1 && (
                            <div className="thumbnail-list">
                                {product.images.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img
                                            src={`https://www.divineshop.vn${img}`}
                                            alt={`${product.name} ${index + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="product-info">
                        <h1 className="product-title">{product.name}</h1>
                        <div className="product-rating">
                            <div className="stars">
                                {[...Array(5)].map((_, idx) => (
                                    <i
                                        key={idx}
                                        className={`fa-solid fa-star ${idx < Math.floor(product.rating) ? 'active' : ''}`}
                                    ></i>
                                ))}
                            </div>
                            <span className="rating-number">({product.rating})</span>
                            <span className="sold">{product.sold.toLocaleString()} Đã Bán</span>
                        </div>
                        <div className="product-price">
                            <span className="old-price">{formatPrice(product.originalPrice)}</span>
                            <span className="new-price">{formatPrice(product.price)}</span>
                            <span className="discount">{discount}% GIẢM</span>
                        </div>
                        {product.features.length > 0 && (
                            <div className="product-features">
                                {product.features.map((feature, index) => (
                                    <div key={index} className="feature-item">
                                        <i className="fa-solid fa-check"></i>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="product-description">{product.description}</p>
                        <div className="quantity-container">
                            <div className="soluong">
                                <p>Số lượng</p>
                            </div>
                            <div className="quantity-container-input">
                                <button
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    disabled={quantity <= 1}
                                    className={quantity <= 1 ? 'disabled' : ''}
                                    aria-label="Giảm số lượng"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={quantity === "" ? "" : quantity}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "") {
                                            setQuantity("");
                                            return;
                                        }
                                        const numValue = parseInt(value);
                                        if (!isNaN(numValue) && numValue >= 1 && numValue <= 99) {
                                            setQuantity(numValue);
                                        }
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") {
                                            setQuantity(1);
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => setQuantity(prev => Math.min(99, prev + 1))}
                                    disabled={quantity >= 99}
                                    className={quantity >= 99 ? 'disabled' : ''}
                                    aria-label="Tăng số lượng"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="button-group">
                            <button className="add-to-cart" 
                                onClick={() => {
                                handleAddToCart(product);
    
                            }}>
                                <i className="fa-solid fa-cart-shopping"></i>
                                Thêm Vào Giỏ Hàng
                            </button>
                            <button className="buy-now">
                                <i className="fa-solid fa-bolt"></i>
                                Mua Ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default memo(ProductPage);
