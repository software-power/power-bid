import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9095';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const attachmentAPI = {
    // TYPES
    createType: async (data) => {
        try {
            const response = await apiClient.post('/attachments/types', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getTypes: async () => {
        try {
            const response = await apiClient.get('/attachments/types');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateTypeStatus: async (id, status) => {
        try {
            const response = await apiClient.patch(`/attachments/types/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // CERTIFICATES
    uploadCertificate: async (formData) => {
        try {
            const response = await apiClient.post('/attachments/certificates', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getCertificates: async () => {
        try {
            const response = await apiClient.get('/attachments/certificates');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default attachmentAPI;
