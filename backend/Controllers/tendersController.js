const {
    createTender,
    getTendersByAccount,
    getTenderByToken,
    getTenderById,
    getTenderItems,
    getInvitationsByEmails,
    getInvitedEmailsByTenderId,
    updateTenderTransaction,
} = require('../Models/tendersModel');
const { getUsersByMainAccount } = require('../Models/usersModel');
const { sendTenderInvitation } = require('../Services/emailService');

// Current domain for generating links - In production this should be from env
const SYSTEM_DOMAIN = process.env.SYSTEM_DOMAIN || 'http://localhost:3000';

/**
 * Create a new Quotation/Tender
 */
const createQuotation = async (req, res) => {
    const { title, description, start_date, end_date, items, invited_emails, required_documents } = req.body;
    const userId = req.user.id;
    const accountId = req.user.main_account_id || req.user.id; // Fallback to user ID if main_account_id is missing/null

    // Validation
    if (!title || !items || items.length === 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Title and at least one item are required',
        });
    }

    // Parse emails
    let invitations = [];
    if (invited_emails && invited_emails.length > 0) {
        invitations = invited_emails.map(email => ({ email }));
    }

    const tenderData = {
        title,
        description,
        start_date,
        end_date,
        // required_documents,
        account_id: accountId,
        created_by: userId,
    };

    try {
        const result = await createTender(tenderData, items, invitations);

        // Send emails asynchronously
        if (result.invitations && result.invitations.length > 0) {
            // Don't await this to keep response fast, or await if critical
            result.invitations.forEach(invite => {
                const link = `${SYSTEM_DOMAIN}/tender/invitation/${invite.token}`;
                // You might want to fetch buyer name properly later
                sendTenderInvitation(
                    invite.email,
                    req.user.full_name, // Or Company Name
                    title,
                    required_documents,
                    link
                );
            });
        }

        res.status(201).json({
            status: 'success',
            message: 'Quotation created and invitations sent successfully',
            data: { tenderId: result.tenderId },
        });

    } catch (err) {
        console.error('Create quotation error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create quotation: ' + (err.message || err.sqlMessage || 'Unknown error'),
            error: err // Optional: send full error object for inspection
        });
    }
};

/**
 * Get Buyer's Tenders
 */
const getMyTenders = async (req, res) => {
    try {
        const accountId = req.user.main_account_id || req.user.id;
        const tenders = await getTendersByAccount(accountId);
        res.status(200).json({
            status: 'success',
            data: tenders,
        });
    } catch (err) {
        console.error('Get tenders error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

/**
 * Get Tender Public Details (for Seller via Token)
 */
const getTenderDetailsPublic = async (req, res) => {
    const { token } = req.params;
    const { tenderId } = req.query;

    try {
        let tender;
        if (token && token !== 'null') {
            tender = await getTenderByToken(token);
        } else if (tenderId) {
            tender = await getTenderById(tenderId);
        }

        if (!tender) {
            return res.status(404).json({
                status: 'error',
                message: 'Invalid invitation token or tender ID',
            });
        }

        // Get items
        const items = await getTenderItems(tender.id);

        res.status(200).json({
            status: 'success',
            data: {
                tender,
                items
            },
        });

    } catch (err) {
        console.error('Get public tender error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

/**
 * Get Seller's Invitations
 */
const getMyInvitations = async (req, res) => {
    try {
        const mainAccountId = req.user.main_account_id || req.user.id;

        // Get all users in the account to fetch all possible invited emails
        const accountUsers = await getUsersByMainAccount(mainAccountId);
        const emails = accountUsers.map(u => u.email);

        // Add the current user's email just in case (though it should be in the list)
        if (!emails.includes(req.user.email)) {
            emails.push(req.user.email);
        }

        const invitations = await getInvitationsByEmails(emails);

        res.status(200).json({
            status: 'success',
            data: invitations,
        });
    } catch (err) {
        console.error('Get my invitations error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

/**
 * Get Tender Details For Editing (Buyer)
 */
const getTenderDetailsForEdit = async (req, res) => {
    const { id } = req.params;
    const accountId = req.user.main_account_id || req.user.id; // Verify ownership

    try {
        const tender = await getTenderById(id);

        if (!tender) {
            return res.status(404).json({ status: 'error', message: 'Tender not found' });
        }

        // Check ownership
        if (tender.account_id !== accountId) {
            return res.status(403).json({ status: 'error', message: 'Unauthorized access to this tender' });
        }

        const items = await getTenderItems(id);
        const invited_emails = await getInvitedEmailsByTenderId(id);

        res.status(200).json({
            status: 'success',
            data: {
                tender,
                items,
                invited_emails,
            }
        });

    } catch (err) {
        console.error('Get tender details for edit error:', err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};


/**
 * Update Quotation/Tender
 */
const updateQuotation = async (req, res) => {
    const { id } = req.params;
    const { title, description, start_date, end_date, items, invited_emails, required_documents } = req.body;
    const accountId = req.user.main_account_id || req.user.id; // Verify ownership

    try {
        // Verify existance and ownership first
        const tender = await getTenderById(id);
        if (!tender) {
            return res.status(404).json({ status: 'error', message: 'Tender not found' });
        }
        if (tender.account_id !== accountId) {
            return res.status(403).json({ status: 'error', message: 'Unauthorized access to this tender' });
        }

        const tenderData = {
            title,
            description,
            start_date,
            end_date,
            required_documents,
            account_id: accountId
        };

        // Determine new emails to invite
        // Fetch existing invited emails
        const existingEmails = await getInvitedEmailsByTenderId(id);
        const newEmails = invited_emails.filter(email => !existingEmails.includes(email));

        let newInvitations = [];
        if (newEmails.length > 0) {
            newInvitations = newEmails.map(email => ({ email }));
        }

        const result = await updateTenderTransaction(id, tenderData, items, newInvitations);

        // Send emails asynchronously for NEW invitations
        if (result.newInvitations && result.newInvitations.length > 0) {
            result.newInvitations.forEach(invite => {
                const link = `${SYSTEM_DOMAIN}/tender/invitation/${invite.token}`;
                sendTenderInvitation(
                    invite.email,
                    req.user.full_name,
                    title,
                    required_documents,
                    link
                );
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Quotation updated successfully',
        });

    } catch (err) {
        console.error('Update quotation error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update quotation: ' + (err.message || err.sqlMessage || 'Unknown error'),
        });
    }
};

module.exports = {
    createQuotation,
    getMyTenders,
    getTenderDetailsPublic,
    getMyInvitations,
    getTenderDetailsForEdit,
    updateQuotation,
};
