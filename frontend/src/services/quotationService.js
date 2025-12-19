import apiClient from './userService';

export const quotationAPI = {
    // Submit or update quotation
    submitQuotation: async (quotationData) => {
        try {
            const response = await apiClient.post('/quotations/submit', quotationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get seller's own quotation for a tender
    getMyQuotation: async (invitationToken, tenderId = '') => {
        try {
            const url = tenderId
                ? `/quotations/my-quotation/${invitationToken || 'null'}/${tenderId}`
                : `/quotations/my-quotation/${invitationToken}`;
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get tender comparison (Buyer only)
    getTenderComparison: async (tenderId) => {
        try {
            const response = await apiClient.get(`/quotations/comparison/${tenderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Select supplier for item (Buyer only)
    selectSupplier: async (selectionData) => {
        try {
            const response = await apiClient.post('/quotations/select-supplier', selectionData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Upload document
    uploadDocument: async (quotationId, file, documentType) => {
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('document_type', documentType);

            const response = await apiClient.post(`/quotations/${quotationId}/upload-document`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Get all submitted quotations for seller's account
    getSubmittedQuotations: async () => {
        try {
            const response = await apiClient.get('/quotations/get-submitted');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};
