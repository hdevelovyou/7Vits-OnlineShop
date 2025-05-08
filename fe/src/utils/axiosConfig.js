import axios from 'axios';

// Create an axios instance with default config
const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://seventvits-be.onrender.com',
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
API.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        // If token exists, add to headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 (Unauthorized) errors - redirect to login
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (data) => API.post('/api/auth/login', data),
    register: (data) => API.post('/api/auth/register', data),
    getProfile: () => API.get('/api/auth/profile'),
    updateProfile: (data) => API.put('/api/auth/profile', data),
    forgotPassword: (email) => API.post('/api/auth/forgot-password', { email }),
    resetPassword: (data) => API.post('/api/auth/reset-password', data),
};

// Product API
export const productAPI = {
    getProducts: () => API.get('/api/products'),
    getProduct: (id) => API.get(`/api/products/${id}`),
    createProduct: (data) => API.post('/api/products', data),
    updateProduct: (id, data) => API.put(`/api/products/${id}`, data),
    deleteProduct: (id) => API.delete(`/api/products/${id}`),
    searchProducts: (query) => API.get(`/api/products/search?q=${query}`),
};

// Wallet API
export const walletAPI = {
    getBalance: () => API.get('/api/wallet/balance'),
    getTransactions: () => API.get('/api/wallet/transactions'),
    createDeposit: (amount) => API.post('/api/wallet/deposit', { amount }),
};

export default API; 