import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Thiết lập baseURL with fallback to the proxy in package.json
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://seventvits-be.onrender.com';

// Thiết lập timeout mặc định
axios.defaults.timeout = 30000; // 30 giây

// Tạo instance axios riêng cho các API quan trọng cần thời gian xử lý lâu
export const longRunningApiClient = axios.create({
  baseURL: axios.defaults.baseURL,
  timeout: 60000, // 60 giây cho các API quan trọng
});

// Thêm request interceptor để tự động thêm token vào header cho cả axios mặc định và instance mới
const addAuthToken = config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

axios.interceptors.request.use(addAuthToken, error => Promise.reject(error));
longRunningApiClient.interceptors.request.use(addAuthToken, error => Promise.reject(error));

// Hàm xử lý lỗi chung
const handleAxiosError = error => {
  console.error('Axios Error:', error);
  
  // Kiểm tra lỗi timeout
  if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
    console.log('Request timeout - Thao tác mất quá nhiều thời gian');
    // Có thể hiển thị thông báo cho người dùng hoặc thực hiện các hành động khác
  }
  
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
};

// Thêm interceptor để xử lý lỗi chung và token hết hạn
axios.interceptors.response.use(response => response, handleAxiosError);
longRunningApiClient.interceptors.response.use(response => response, handleAxiosError);

// Hàm tạo order với retry tự động
export const createOrder = async (orderData, maxRetries = 2) => {
  let lastError = null;
  
  // Tạo idempotency key và lưu vào sessionStorage để sử dụng lại nếu cần retry từ phía client
  let idempotencyKey = sessionStorage.getItem(`order_key_${JSON.stringify(orderData.items)}`);
  if (!idempotencyKey) {
    idempotencyKey = uuidv4();
    sessionStorage.setItem(`order_key_${JSON.stringify(orderData.items)}`, idempotencyKey);
  }
  
  // Thêm idempotency key vào request
  const orderDataWithKey = {
    ...orderData,
    idempotencyKey
  };
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Ghi log dữ liệu gửi đi để debug
      console.log(`Create order attempt ${attempt + 1}/${maxRetries + 1} with data:`, orderDataWithKey);
      
      // Sử dụng longRunningApiClient với timeout dài hơn
      const response = await longRunningApiClient.post('/api/orders/create', orderDataWithKey);
      console.log('Order API response:', response.data);
      
      // Nếu order đã tồn tại (wasExisting = true), xóa idempotency key khỏi sessionStorage
      if (response.data.success) {
        sessionStorage.removeItem(`order_key_${JSON.stringify(orderData.items)}`);
      }
      
      return response.data;
    } catch (error) {
      const errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
      };
      
      console.log(`Create order attempt ${attempt + 1}/${maxRetries + 1} failed:`, errorDetails);
      lastError = error;
      
      // Chi tiết lỗi 500 từ server (nếu có)
      if (error.response?.status === 500) {
        console.error('Server error details:', error.response.data);
        
        // Kiểm tra xem lỗi có phải do deadlock hoặc timeout không
        const errorMsg = error.response.data?.message || error.response.data?.error || '';
        const isDbLockError = 
          errorMsg.includes('deadlock') || 
          errorMsg.includes('lock') || 
          errorMsg.includes('timeout') ||
          errorMsg.includes('try again');
        
        // Nếu là lỗi deadlock/timeout, tiếp tục thử lại
        if (isDbLockError && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          console.log(`Server deadlock/timeout detected. Retrying in ${Math.round(delay/1000)} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // Nếu là lỗi timeout hoặc lỗi 409 (conflict), thử lại
      const shouldRetry = (error.code === 'ECONNABORTED' && error.message.includes('timeout')) || 
                          (error.response && error.response.status === 409);
      
      if (shouldRetry && attempt < maxRetries) {
        // Chờ một khoảng thời gian trước khi thử lại (độ trễ tăng dần)
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.log(`Retrying in ${Math.round(delay/1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Nếu không phải lỗi cần retry hoặc đã hết số lần thử, ném lỗi
      throw lastError;
    }
  }
};

export default axios; 