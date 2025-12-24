import apiClient from './userService'; // Reusing the axios instance with interceptors

export const tenderAPI = {
    // Create new quotation/tender
    createQuotation: async (tenderData) => {
        try {
            const response = await apiClient.post('/tenders/create', tenderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get Buyer's tenders
    getMyTenders: async () => {
        try {
            const response = await apiClient.get('/tenders/my-tenders');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get Public Tender by Token
    getTenderByToken: async (token) => {
        try {
            // Note: This matches the route defined in backend specific for public access
            const response = await apiClient.get(`/tenders/invitation/${token}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get Seller's invitations
    getMyInvitations: async () => {
        try {
            const response = await apiClient.get('/tenders/my-invitations');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get Tender by ID (for editing)
    getTenderById: async (tenderId) => {
        try {
            const response = await apiClient.get(`/tenders/${tenderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update Quotation
    updateQuotation: async (tenderId, tenderData) => {
        try {
            const response = await apiClient.put(`/tenders/${tenderId}`, tenderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
