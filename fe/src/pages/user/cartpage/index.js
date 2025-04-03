import { useState, useEffect } from "react";
import "./style.scss"
const CartPage = () => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);
    const handleUpdateAmount = (id, newAmount) => {
        const updatedCart = cart.map(item => 
            item.id === id ? { ...item, amount: newAmount } : item
        );
    
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };
    
    return (
        <div >
            <h1>Giỏ hàng của bạn</h1>
            {cart.length === 0 ? (
                <p>Giỏ hàng trống</p>
            ) : (
                <div>
                    {cart.map((item) => (
                        <div key={item.id} className="cart-item">
                            <h2>{item.name}</h2>
                            <p>Số lượng: {item.amount}</p> {/* Hiển thị số lượng của sản phẩm */}
                            <p>Giá: {item.price.toLocaleString()} VND</p>
                            <div>
    <button onClick={() => handleUpdateAmount(item.id, item.amount - 1)}>-</button>
    <span>{item.amount}</span>
    <button onClick={() => handleUpdateAmount(item.id, item.amount + 1)}>+</button>
</div>

                        </div>
                        
                    ))}
                </div>
            )}
            
        </div>
    );
};

export default CartPage;
