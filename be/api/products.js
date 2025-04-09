const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000; // Đổi lại thành 5000 để dễ kết nối

app.use(cors());    

// Tạo route API
// app.get('/api/products', async (req, res) => {
//     try {
//         const response = await axios.get('https://divineshop.vn/api/product/list?limit=24&tag=Gi%E1%BA%A3i+tr%C3%AD');
//         res.json(response.data);
//     } catch (error) {
//         console.error('Lỗi khi lấy dữ liệu:', error.message);
//         res.status(500).json({ error: 'Lỗi khi lấy dữ liệu từ API.' });
//     }
// });

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
