const {
    createSellerQuotation,
    updateSellerQuotation,
    getSellerQuotationByInvitation,
    getQuotationItems,
    getQuotationsByTender,
    getQuotationsBySellerAccount,
    getTopSuppliersByItem,
    saveItemSelection,
    uploadQuotationDocument,
    getMatchingSellerItems,
} = require('../Models/quotationsModel');
const {
    getTenderByToken,
    getTenderItems,
    getTenderById,
    getInvitationByTenderAndEmails
} = require('../Models/tendersModel');
const { getUsersByMainAccount } = require('../Models/usersModel');

/**
 * Submit Seller Quotation
 */
const submitQuotation = async (req, res) => {
    const { invitation_token, tender_id, delivery_period, remarks, items, status } = req.body;
    const userId = req.user.id;
    const sellerAccountId = req.user.main_account_id || req.user.id;

    // Validation
    if (!invitation_token && !tender_id) {
        return res.status(400).json({
            status: 'error',
            message: 'Invitation token or Tender ID is required',
        });
    }

    if (!items || items.length === 0) {
        return res.status(400).json({
            status: 'error',
            message: 'At least one item is required',
        });
    }

    try {
        let tender;
        if (invitation_token && invitation_token !== 'null') {
            tender = await getTenderByToken(invitation_token);
        } else if (tender_id) {
            tender = await getTenderById(tender_id);
            if (tender) {
                // If we don't have invitation_token, try to find the invitation_id for this seller account
                const accountUsers = await getUsersByMainAccount(sellerAccountId);
                const emails = accountUsers.map(u => u.email);
                if (!emails.includes(req.user.email)) emails.push(req.user.email);

                const invitation = await getInvitationByTenderAndEmails(tender.id, emails);
                tender.invitation_id = invitation ? invitation.id : null;
            }
        }

        if (!tender) {
            return res.status(404).json({
                status: 'error',
                message: 'Invalid invitation token or tender ID',
            });
        }

        // Check if quotation already exists
        const existingQuotation = await getSellerQuotationByInvitation(tender.invitation_id, sellerAccountId, tender.id);

        const quotationData = {
            tender_id: tender.id,
            invitation_id: tender.invitation_id,
            seller_account_id: sellerAccountId,
            submitted_by: userId,
            delivery_period,
            remarks,
            status: status || 'draft',
        };

        // Validate items
        const tenderItems = await getTenderItems(tender.id);

        // Just check prices (stock validation disabled per user request)
        for (const submittedItem of items) {
            if (submittedItem.unit_price <= 0) {
                const originalItem = tenderItems.find(ti => ti.id === submittedItem.tender_item_id);
                return res.status(400).json({
                    status: 'error',
                    message: `Price for "${originalItem.item_name || 'item'}" must be greater than 0.`,
                });
            }
        }

        let result;
        if (existingQuotation) {
            // Update existing quotation
            result = await updateSellerQuotation(existingQuotation.id, quotationData, items);
        } else {
            // Create new quotation
            result = await createSellerQuotation(quotationData, items);
        }

        res.status(201).json({
            status: 'success',
            message: existingQuotation ? 'Quotation updated successfully' : 'Quotation submitted successfully',
            data: result,
        });
    } catch (err) {
        console.error('Submit quotation error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to submit quotation: ' + (err.message || 'Unknown error'),
        });
    }
};

/**
 * Get Seller's Own Quotation for a Tender
 */
const getMyQuotation = async (req, res) => {
    const { invitationToken, tenderId } = req.params;
    const sellerAccountId = req.user.main_account_id || req.user.id;

    try {
        let tender;
        if (invitationToken && invitationToken !== 'null') {
            tender = await getTenderByToken(invitationToken);
            if (!tender) console.warn(`Tender not found for token: ${invitationToken}`);
        } else if (tenderId) {
            tender = await getTenderById(tenderId);
            if (tender) {
                // Resolve invitation_id for the logged in seller
                const accountUsers = await getUsersByMainAccount(sellerAccountId);
                const emails = accountUsers.map(u => u.email);
                if (!emails.includes(req.user.email)) emails.push(req.user.email);

                const invitation = await getInvitationByTenderAndEmails(tender.id, emails);
                tender.invitation_id = invitation ? invitation.id : null;
            } else {
                console.warn(`Tender not found for ID: ${tenderId}`);
            }
        }

        if (!tender) {
            return res.status(404).json({
                status: 'error',
                message: `Tender not found (Token: ${invitationToken}, ID: ${tenderId})`,
            });
        }

        // Get quotation
        const quotation = await getSellerQuotationByInvitation(tender.invitation_id, sellerAccountId, tender.id);
        console.log(`[getMyQuotation] Found quotation: ${quotation ? quotation.id : 'None'}`);

        if (!quotation) {
            // Return tender details for new quotation
            console.log(`[getMyQuotation] Fetching tender items for tender: ${tender.id}`);
            const tenderItems = await getTenderItems(tender.id);
            console.log(`[getMyQuotation] Found ${tenderItems.length} items. Matching seller inventory...`);
            const inventory = await getMatchingSellerItems(sellerAccountId, tenderItems);
            const availableItems = inventory.items;
            const inventorySupported = inventory.inventorySupported;

            const itemsWithAvailability = tenderItems.map(item => {
                return {
                    ...item,
                    is_available: true,
                    available_qty: 999999, // Treat as unlimited for now
                };
            });

            return res.status(200).json({
                status: 'success',
                data: {
                    tender,
                    items: itemsWithAvailability,
                    quotation: null,
                },
            });
        }

        // Get quotation items
        const rawItems = await getQuotationItems(quotation.id);
        const inventory = await getMatchingSellerItems(sellerAccountId, rawItems);
        const availableItems = inventory.items;
        const inventorySupported = inventory.inventorySupported;

        const itemsWithAvailability = rawItems.map(item => {
            return {
                ...item,
                is_available: true,
                available_qty: 999999,
            };
        });

        res.status(200).json({
            status: 'success',
            data: {
                tender,
                quotation,
                items: itemsWithAvailability,
            },
        });
    } catch (error) {
        console.error('Get quotation error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Internal server error',
        });
    }
};

/**
 * Get All Submitted Quotations (Seller Account Hierarchy)
 */
const getSubmittedQuotations = async (req, res) => {
    const sellerAccountId = req.user.main_account_id || req.user.id;

    try {
        const quotations = await getQuotationsBySellerAccount(sellerAccountId);
        res.status(200).json({
            status: 'success',
            data: quotations,
        });
    } catch (err) {
        console.error('Get submitted quotations error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

/**
 * Get Tender Comparison (Buyer Only)
 */
const getTenderComparison = async (req, res) => {
    const { tenderId } = req.params;
    const buyerAccountId = req.user.main_account_id || req.user.id;

    try {
        // Verify tender ownership
        const tender = await getTenderById(tenderId);
        if (!tender || tender.account_id !== buyerAccountId) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. You do not own this tender.',
            });
        }

        // Get comparison data (top 5 suppliers per item)
        const comparison = await getTopSuppliersByItem(tenderId, 5);

        res.status(200).json({
            status: 'success',
            data: comparison,
        });
    } catch (err) {
        console.error('Get comparison error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

/**
 * Select Supplier for Item (Buyer Only)
 */
const selectSupplier = async (req, res) => {
    const { tender_id, item_id, quotation_id } = req.body;
    const userId = req.user.id;

    if (!tender_id || !item_id || !quotation_id) {
        return res.status(400).json({
            status: 'error',
            message: 'Tender ID, Item ID, and Quotation ID are required',
        });
    }

    try {
        const buyerAccountId = req.user.main_account_id || req.user.id;
        const tender = await getTenderById(tender_id);
        if (!tender || tender.account_id !== buyerAccountId) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. You do not own this tender.',
            });
        }

        await saveItemSelection(tender_id, item_id, quotation_id, userId);

        res.status(200).json({
            status: 'success',
            message: 'Supplier selected successfully',
        });
    } catch (err) {
        console.error('Select supplier error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to select supplier',
        });
    }
};

/**
 * Upload Quotation Document
 */
const uploadDocument = async (req, res) => {
    const { quotationId } = req.params;
    const { document_type } = req.body;

    if (!req.file) {
        return res.status(400).json({
            status: 'error',
            message: 'No file uploaded',
        });
    }

    try {
        const filePath = req.file.path;
        await uploadQuotationDocument(quotationId, document_type, filePath);

        res.status(200).json({
            status: 'success',
            message: 'Document uploaded successfully',
            data: { file_path: filePath },
        });
    } catch (err) {
        console.error('Upload document error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to upload document',
        });
    }
};

module.exports = {
    submitQuotation,
    getMyQuotation,
    getSubmittedQuotations,
    getTenderComparison,
    selectSupplier,
    uploadDocument,
};
