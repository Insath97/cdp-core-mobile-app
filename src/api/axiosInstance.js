import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

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
        const errorDetails = {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        };
        console.error('API Error:', errorDetails);

        // Show error on screen for easier debugging on mobile
        toast.error(`API Error: ${error.message} (Status: ${error.response?.status || 'Network Error'})\nURL: ${error.config?.url}`, {
            duration: 10000,
            position: 'top-center'
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
