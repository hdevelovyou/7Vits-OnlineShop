import { useState, useEffect } from "react";
import "./style.scss";
import axios from "axios";
import { format } from "date-fns";

const PurchaseHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Bạn cần đăng nhập để xem lịch sử mua hàng");
        }

        const response = await axios.get("/api/orders/history", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tải lịch sử mua hàng");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return '0';
    }
    return Number(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  if (loading) {
    return <div className="purchase-history loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="purchase-history error">{error}</div>;
  }

  return (
    <div className="purchase-history">
      <h1>Lịch Sử Mua Hàng</h1>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>Bạn chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span className="order-date">
                  Ngày mua: {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                </span>
                <span className="order-id">
                  Mã đơn hàng: {order._id}
                </span>
              </div>
              
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <img src={item.image || 'https://via.placeholder.com/50x50'} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="item-price">{formatPrice(item.price)}</p>
                      <p className="item-quantity">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-footer">
                <div className="order-total">
                  <span>Tổng tiền:</span>
                  <span className="total-amount">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="order-status">
                  <span>Trạng thái:</span>
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {order.status === 'COMPLETED' ? 'Hoàn thành' :
                     order.status === 'PENDING' ? 'Đang xử lý' :
                     order.status === 'CANCELLED' ? 'Đã hủy' : order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory; 