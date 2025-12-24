import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://10.10.100.15:9095';
//const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:7001';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Don't redirect if we are already on the login or register page
            // This prevents loops if the login API itself returns 401 (invalid credentials)
            const currentHash = window.location.hash;
            if (!currentHash.includes('#/login') && !currentHash.includes('#/register')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '#/login';
            }
        }
        return Promise.reject(error);
    }
);

// User API endpoints
export const userAPI = {
    // Register main account
    register: async (userData) => {
        try {
            const response = await apiClient.post('/users/register', {
                full_name: userData.fullName,
                email: userData.email,
                phone: userData.phone,
                tin_no: userData.tinNo,
                business_licence: userData.businessLicence,
                password: userData.password,
                type: userData.userType,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Login
    login: async (email, password) => {
        try {
            const response = await apiClient.post('/users/login', {
                email,
                password,
            });

            // Store token in localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get all users
    getAllUsers: async () => {
        try {
            const response = await apiClient.get('/users');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get sub-accounts
    getSubAccounts: async () => {
        try {
            const response = await apiClient.get('/users/sub-accounts');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Create sub-user
    createSubUser: async (userData) => {
        try {
            const response = await apiClient.post('/users/sub-user', {
                full_name: userData.fullName,
                email: userData.email,
                phone: userData.phone,
                tin_no: userData.tinNo,
                business_licence: userData.businessLicence,
                password: userData.password,
                role_id: userData.roleId || 'STAFF',
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update user
    updateUser: async (id, userData) => {
        try {
            const response = await apiClient.put(`/users/${id}`, {
                full_name: userData.fullName,
                email: userData.email,
                phone: userData.phone,
                tin_no: userData.tinNo,
                business_licence: userData.businessLicence,
                password: userData.password,
                status: userData.status,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: () => {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },
};

export default apiClient;
