import axios from 'axios';

// Thiết lập baseURL with fallback to the proxy in package.json
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://seventvits-be.onrender.com';

// Thêm request interceptor để tự động thêm token vào header
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi chung và token hết hạn
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Axios Error:', error);
    
    // Kiểm tra nếu lỗi do token không hợp lệ hoặc hết hạn
    if (error.response && 
        (error.response.status === 401 || 
         (error.response.status === 400 && 
          error.response.data && 
          error.response.data.error === 'Token không hợp lệ'))) {
      
      console.log('Token hết hạn, tự động đăng xuất');
      
      // Xóa token và thông tin người dùng
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Chuyển hướng đến trang đăng nhập
      window.location.href = '/login?expired=true';
    }
    
    return Promise.reject(error);
  }
);

export default axios; 