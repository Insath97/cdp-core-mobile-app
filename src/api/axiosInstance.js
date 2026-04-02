import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'https://api-core.cdp.lk/api/v1',
    withCredentials: true, // Crucial for sending/receiving cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
    (config) => {
        // Try to get token from localStorage OR cookie
        const token = localStorage.getItem('token') || Cookies.get('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling 401 errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Detailed error logging for mobile debugging
        console.error('API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            Cookies.remove('auth_token');
            // Check if we are on mobile to avoid full redirect reload loop if not needed
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
