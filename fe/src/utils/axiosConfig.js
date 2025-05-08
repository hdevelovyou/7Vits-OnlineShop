import axios from 'axios';

// Thiết lập baseURL từ biến môi trường
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Thêm interceptor để xử lý lỗi chung
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Axios Error:', error);
    return Promise.reject(error);
  }
);

export default axios; 