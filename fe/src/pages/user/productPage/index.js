import { useState, memo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./style.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Import all product images
import chatgpt from "../../../assets/images/chatgpt.png";
import adobepd from "../../../assets/images/adobe-pd.jpg";
import lolskin from "../../../assets/images/lolskin.jpg";
import steamgc from "../../../assets/images/Steam-Gift-card.jpg";
import yt from "../../../assets/images/yt.png";

// Product data (in a real app, this would be in a separate file or from an API)
const productsData = [
    {
        id: 1,
        name: "Tài khoản ChatGPT Plus 1 tháng",
        desc: "Tài khoản ChatGPT Plus chính hãng, đầy đủ tính năng GPT-4.",
        priceOld: 499000,
        priceNew: 399000,
        image: chatgpt,
        images: [chatgpt, chatgpt, chatgpt],
        rating: 5,
        sold: 2410,
        features: [
            "Truy cập GPT-4 không giới hạn",
            "Hỗ trợ kỹ thuật 24/7",
            "Bảo hành 30 ngày",
            "Tài khoản chính hãng"
        ]
    },
    {
        id: 2,
        name: "Adobe License",
        desc: "Phần mềm bản quyền Adobe chính hãng.",
        priceOld: 1299000,
        priceNew: 800000,
        image: adobepd,
        images: [adobepd, adobepd, adobepd],
        rating: 4,
        sold: 1520,
        features: [
            "Bản quyền trọn đời",
            "Cập nhật thường xuyên",
            "Hỗ trợ kỹ thuật 24/7"
        ]
    },
    {
        id: 3,
        name: "League of Legends Skin",
        desc: "Trang phục độc quyền trong game.",
        priceOld: 399000,
        priceNew: 299000,
        image: lolskin,
        images: [lolskin, lolskin, lolskin],
        rating: 5,
        sold: 1850,
        features: [
            "Skin giới hạn",
            "Hiệu ứng đặc biệt",
            "Dành riêng cho tài khoản Liên Minh Huyền Thoại"
        ]
    },
    {
        id: 4,
        name: "Steam Gift Card",
        desc: "Thẻ nạp Steam dành cho game thủ.",
        priceOld: 1000000,
        priceNew: 800000,
        image: steamgc,
        images: [steamgc, steamgc, steamgc],
        rating: 4,
        sold: 2100,
        features: [
            "Nạp tiền vào tài khoản Steam",
            "Mua game và vật phẩm trong Steam",
            "Hỗ trợ tất cả tài khoản Steam"
        ]
    },
    {
        id: 5,
        name: "Youtube Premium 12 tháng",
        desc: "Gói Youtube Premium chính hãng, không quảng cáo, phát nhạc nền.",
        priceOld: 1000000,
        priceNew: 800000,
        image: yt,
        images: [yt, yt, yt],
        rating: 4,
        sold: 1300,
        features: [
            "Xem video không quảng cáo",
            "Phát nhạc nền khi tắt màn hình",
            "Tải video để xem ngoại tuyến"
        ]
    },
    {
        id: 6,
        name: "Youtube Premium 12 tháng",
        desc: "Gói Youtube Premium chính hãng, không quảng cáo, phát nhạc nền.",
        priceOld: 1000000,
        priceNew: 800000,
        image: yt,
        images: [yt, yt, yt],
        rating: 4,
        sold: 1300,
        features: [
            "Xem video không quảng cáo",
            "Phát nhạc nền khi tắt màn hình",
            "Tải video để xem ngoại tuyến"
        ]
    }
];

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [product, setProduct] = useState(null);

    useEffect(() => {
        //Tìm sản phẩm có id trùng với id trong url
        const foundProduct = productsData.find(p => p.id === parseInt(id));
        if (foundProduct) {
            setProduct(foundProduct);
        } else {
            //Nếu không tìm thấy sản phẩm, chuyển hướng về trang chủ
            navigate('/');
        }
    }, [id, navigate]);

    if (!product) {
        return <div className="product-page">Loading...</div>;
    }

    const discount = Math.round(((product.priceOld - product.priceNew) / product.priceOld) * 100);

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

    return (
        <div className="product-page">
            <div className="grid">
                <div className="product-container">
                    <div className="product-gallery">
                        <div className="main-image">
                            <img
                                src={product.images[selectedImage]}
                                alt={product.name}
                                className="product-image"
                            />
                        </div>
                        <div className="thumbnail-list">
                            {product.images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={image} alt={`${product.name} ${index + 1}`} />
                                </div>
                            ))}
                        </div>
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
                            <span className="old-price">{formatPrice(product.priceOld)}</span>
                            <span className="new-price">{formatPrice(product.priceNew)}</span>
                            <span className="discount">{discount}% GIẢM</span>
                        </div>
                        <div className="product-features">
                            {product.features.map((feature, index) => (
                                <div key={index} className="feature-item">
                                    <i className="fa-solid fa-check"></i>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
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
                            <button className="add-to-cart">
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
    );
};

export default memo(ProductPage);