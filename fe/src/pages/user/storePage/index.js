import { memo, useEffect, useState } from "react";
import axios from "axios";
import { Link,useLocation } from "react-router-dom";
import { formatVND } from "../../../utils/formatprice";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./style.scss";

const StorePage = () => {
    const location=useLocation();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [priceRange, setPriceRange] = useState([0, 10000000]);
    const [sortOption, setSortOption] = useState("default");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000000);
    const [sellerRatings, setSellerRatings] = useState({});
    useEffect(() => {
    // Lấy giá trị ?search=... từ URL
    const params = new URLSearchParams(location.search);
    const initialQuery = params.get("search") || "";
    setSearchQuery(initialQuery);
}, [location.search]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get("/api/products");

                if (Array.isArray(response.data)) {
                    const productList = response.data;
                    setProducts(productList);
                    setFilteredProducts(productList);

                    // Extract categories from products
                    const uniqueCategories = [...new Set(productList.map(product =>
                        product.category || "Uncategorized"))];
                    setCategories(uniqueCategories);

                    // Find min and max prices
                    if (productList.length > 0) {
                        const prices = productList.map(product => product.price);
                        setMinPrice(Math.min(...prices));
                        setMaxPrice(Math.max(...prices));
                        setPriceRange([Math.min(...prices), Math.max(...prices)]);
                    }
                } else {
                    console.error("Data format is incorrect.");
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);
    
  useEffect(() => {
    // Giả sử bạn đã có danh sách sản phẩm (có seller_id)
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data);

        // Lấy danh sách seller_id duy nhất
        const sellerIds = [...new Set(res.data.map(p => p.seller_id))];

        if (sellerIds.length > 0) {
          // Gọi API lấy rating của các seller
          const ratingRes = await axios.get(`/api/sellers/ratings?ids=${sellerIds.join(',')}`);
          setSellerRatings(ratingRes.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, []);
    useEffect(() => {
        filterProducts();
    }, [searchQuery, selectedCategory, priceRange, sortOption, products]);

    const filterProducts = () => {
        let result = [...products];

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(product =>
                product.name.toLowerCase().includes(query) ||
                (product.description && product.description.toLowerCase().includes(query))
            );
        }

        // Filter by category
        if (selectedCategory !== "all") {
            result = result.filter(product =>
                product.category === selectedCategory
            );
        }

        // Filter by price range
        result = result.filter(product =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        // Sort products
        switch (sortOption) {
            case "price-asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "name-asc":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "name-desc":
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "rating-desc":
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                // Default sorting (newest first)
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }

        setFilteredProducts(result);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handlePriceChange = (e, index) => {
        const newPriceRange = [...priceRange];
        newPriceRange[index] = parseInt(e.target.value);
        setPriceRange(newPriceRange);
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const formatPrice = (price) => {
        if (!price) return '0';
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const calculateDiscount = (originalPrice, currentPrice) => {
        return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    };

    // Giá gốc - chỉ để minh họa (thực tế sẽ lấy từ DB)
    const getOriginalPrice = (price) => {
        return price * 1.2; // Giả lập giá gốc cao hơn 20%
    };

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

    return (
        <div className="store-page">
            <div className="store-container">
                <div className="sidebar">
                    <div className="filter-section">
                        <h3>Tìm kiếm</h3>
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <button type="button">
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3>Danh mục</h3>
                        <div className="category-filter">
                            <select value={selectedCategory} onChange={handleCategoryChange}>
                                <option value="all">Tất cả danh mục</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3>Giá</h3>
                        <div className="price-filter">
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="Giá thấp nhất"
                                    value={priceRange[0]}
                                    onChange={(e) => handlePriceChange(e, 0)}
                                    min={minPrice}
                                    max={maxPrice}
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Giá cao nhất"
                                    value={priceRange[1]}
                                    onChange={(e) => handlePriceChange(e, 1)}
                                    min={minPrice}
                                    max={maxPrice}
                                />
                            </div>
                            <button type="button" onClick={() => setPriceRange([minPrice, maxPrice])}>
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3>Sắp xếp</h3>
                        <div className="sort-filter">
                            <select value={sortOption} onChange={handleSortChange}>
                                <option value="default">Mới nhất</option>
                                <option value="price-asc">Giá: Thấp đến cao</option>
                                <option value="price-desc">Giá: Cao đến thấp</option>
                                <option value="name-asc">Tên: A đến Z</option>
                                <option value="name-desc">Tên: Z đến A</option>
                                <option value="rating-desc">Đánh giá: Cao nhất</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="products-section">
                    <h2>Tất cả sản phẩm</h2>

                    {loading ? (
                        <div className="loading">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Đang tải sản phẩm...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="no-products">
                            <i className="fas fa-exclamation-circle"></i>
                            <p>Không tìm thấy sản phẩm nào phù hợp!</p>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {filteredProducts.map((product) => (
                                <div className="product-card" key={product.id}>
                                    <Link to={`/product/${product.id}`} className="product-link">
                                        <div className="product-image">
                                            <img
                                                src={getImageUrl(product.image_url)}
                                                alt={product.name}
                                            />
                                            {/* Hiển thị badge giảm giá - giả lập */}

                                        </div>
                                        <div className="product-info">
                                            <h3 className="product-name">{product.name}</h3>
                                            <p className="product-description">
                                                {product.description ?
                                                    (product.description.length > 100 ?
                                                        product.description.substring(0, 100) + "..." :
                                                        product.description) :
                                                    "Không có mô tả"}
                                            </p>
                                            <div className="product-rating-price">
                                                <div className="product-rating ">
                                                    <div className="seller-stars">
                                                        {Array.from({ length: 5 }).map((_, index) => {
                                                            const avg = sellerRatings[product.seller_id]?.average || 0;
                                                            const value = index + 1;

                                                            let className = "star empty";
                                                            if (avg >= value) {
                                                                className = "star full";
                                                            } else if (avg >= value - 0.5) {
                                                                className = "star half";
                                                            }

                                                            return (
                                                                <span key={index} className={className}>★</span>
                                                            );
                                                        })}
                                                        <span className="rating-number">
                                                            ({sellerRatings[product.seller_id]?.count || 0} reviews)
                                                        </span>
                                                    </div>

                                                </div>
                                                <div className="product-price">

                                                    <span className="current-price">{formatVND(product.price)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(StorePage);
