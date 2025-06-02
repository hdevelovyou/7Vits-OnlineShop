import { memo, useState, useEffect, useRef } from "react";
import "./products.scss";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../utils/router.js";
import axios from "axios";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const detailRef = useRef(null);

  useEffect(() => {
    // Hàm lấy dữ liệu sản phẩm từ API
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/admin/products');
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100); // Đợi render xong mới cuộn
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await axios.delete(`/api/admin/products/${productId}`);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div className="products-page">
      <h2>Products list</h2>
      <table className="product-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Product name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Seller</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, idx) => (
            <tr key={p.id}>
              <td>{idx + 1}</td>
              <td>{p.name}</td>
              <td>{p.price?.toLocaleString() ?? ""}</td>
              <td>{p.category}</td>
              <td>{p.sellerName}</td>
              <td>{p.status}</td>
              <td>
                <button onClick={() => handleViewProduct(p)}>Xem</button>
                <button onClick={() => handleDeleteProduct(p.id)} style={{marginLeft: 8}}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedProduct && (
        <div className="product-detail" ref={detailRef} style={{marginTop: 32, padding: 24, background: "#222", borderRadius: 8}}>
          <h3>Product details</h3>
          <br></br>
          {selectedProduct.image_url && (
            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.name}
              style={{maxWidth: 300, marginBottom: 16, borderRadius: 8}}
            />
          )}
          <ul>
            <li><b>Product name:</b> {selectedProduct.name}</li>
            <li><b>Descriptions:</b> {selectedProduct.description || "This product has no description"}</li>
            <li><b>Seller:</b> {selectedProduct.sellerName}</li>
            <li><b>Notes:</b> {selectedProduct.notes || "This product has no note"}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Products;

