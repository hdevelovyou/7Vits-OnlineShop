import { memo, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./style.scss";

const StorePage = () => {
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

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:5000/api/products");
                
                if (Array.isArray(response.data.list)) {
                    const productList = response.data.list;
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
        filterProducts();
    }, [searchQuery, selectedCategory, priceRange, sortOption, products]);

    const filterProducts = () => {
        let result = [...products];

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(product => 
                product.name.toLowerCase().includes(query) || 
                product.slug.toLowerCase().includes(query)
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

    const calculateDiscount = (originalPrice, price) => {
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    return (
        <div className="store-page">
            <div className="container">
                <div className="store-header">
                    <h1>CỬA HÀNG</h1>
                    <p>Khám phá các sản phẩm chất lượng cao của chúng tôi</p>
                </div>

                <div className="store-controls">
                    <div className="search-bar">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm sản phẩm..." 
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        <button>
                            <i className="fas fa-search"></i>
                        </button>
                    </div>

                    <div className="filter-sort-container">
                        <div className="filter-container">
                            <div className="filter-group">
                                <label>Danh mục:</label>
                                <select value={selectedCategory} onChange={handleCategoryChange}>
                                    <option value="all">Tất cả danh mục</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Giá từ:</label>
                                <input
                                    type="number"
                                    min={minPrice}
                                    max={priceRange[1]}
                                    value={priceRange[0]}
                                    onChange={(e) => handlePriceChange(e, 0)}
                                />
                            </div>

                            <div className="filter-group">
                                <label>đến:</label>
                                <input
                                    type="number"
                                    min={priceRange[0]}
                                    max={maxPrice}
                                    value={priceRange[1]}
                                    onChange={(e) => handlePriceChange(e, 1)}
                                />
                            </div>
                        </div>

                        <div className="sort-container">
                            <label>Sắp xếp theo:</label>
                            <select value={sortOption} onChange={handleSortChange}>
                                <option value="default">Mới nhất</option>
                                <option value="price-asc">Giá: Thấp đến cao</option>
                                <option value="price-desc">Giá: Cao đến thấp</option>
                                <option value="name-asc">Tên: A-Z</option>
                                <option value="name-desc">Tên: Z-A</option>
                                <option value="rating-desc">Đánh giá cao nhất</option>
                            </select>
                        </div>
                    </div>
                </div>

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
                                            src={`https://www.divineshop.vn${product.image}`} 
                                            alt={product.name} 
                                        />
                                        {product.originalPrice > product.price && (
                                            <div className="discount-badge">
                                                -{calculateDiscount(product.originalPrice, product.price)}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{product.name}</h3>
                                        <p className="product-description">{product.slug}</p>
                                        <div className="product-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <i 
                                                    key={i}
                                                    className={`fa-solid fa-star ${i < (product.rating || 4) ? 'active' : ''}`}
                                                ></i>
                                            ))}
                                            <span className="rating-number">({product.rating || 4})</span>
                                        </div>
                                        <div className="product-price">
                                            {product.originalPrice > product.price && (
                                                <span className="original-price">
                                                    <s>{formatPrice(product.originalPrice)}đ</s>
                                                </span>
                                            )}
                                            <span className="current-price">{formatPrice(product.price)}đ</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(StorePage);
