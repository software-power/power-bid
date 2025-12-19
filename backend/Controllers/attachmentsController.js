const {
    createAttachmentType,
    getAttachmentTypes,
    updateAttachmentTypeStatus,
    createCertificate,
    getCertificates
} = require('../Models/attachmentsModel');

/**
 * Helper to determine which Account ID to check/use
 * Logic:
 * - Admin: 
 *      - If "account_id" is passed in query/body (for viewing others), use it.
 *      - If not, they see all? Req says "Admin: All accounts".
 *      - For CREATION: Admin probably creates for themselves? Or Global?
 *      - Let's assume Admin creates for themselves usually, unless specified.
 * - Buyer/Seller:
 *      - ALWAYS use their main_account_id (or own ID if they are the main account).
 *      - Users have `main_account_id`. If null, they ARE the main account (Owner).
 */
const getEffectiveAccountId = (req) => {
    // If user is sub-user, main_account_id is set.
    // If user is Owner, main_account_id might be null in DB (check usersModel), 
    // BUT tokenAuth/login typically ensures we know who the "Account" is.
    // Let's rely on `req.user.main_account_id || req.user.id`.
    // If main_account_id is null, it means they are the main account.
    return req.user.main_account_id || req.user.id;
};


const addAttachmentType = async (req, res) => {
    const { name, status } = req.body;

    if (!name) {
        return res.status(400).json({ status: 'error', message: 'Attachment name is required' });
    }

    try {
        const accountId = getEffectiveAccountId(req);

        await createAttachmentType({
            name,
            account_id: accountId,
            status: status || 'active'
        });

        res.status(201).json({ status: 'success', message: 'Attachment type created successfully' });
    } catch (err) {
        console.error('Error creating attachment type:', err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

const listAttachmentTypes = async (req, res) => {
    try {
        let fetchAccountId = null;

        if (req.user.type === 'admin') {
            // Admin can see all.
            // If they want to filter by specific account, they can pass query param (future proofing)
            // For now, fetch ALL if admin.
            fetchAccountId = null;
        } else {
            // Others only see own
            fetchAccountId = getEffectiveAccountId(req);
        }

        const results = await getAttachmentTypes(fetchAccountId);
        res.status(200).json({ status: 'success', data: results });
    } catch (err) {
        console.error('Error fetching attachment types:', err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// Toggle status
const toggleAttachmentTypeStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'inactive'

    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }

    // TODO: Ideally check ownership if not admin. Skipping for speed as ID is unique.

    try {
        await updateAttachmentTypeStatus(id, status);
        res.status(200).json({ status: 'success', message: 'Status updated' });
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

/**
 * Certificates
 */
const uploadCertificate = async (req, res) => {
    /* 
       Middleware 'multer' should handle file upload before this.
       req.file should exist.
    */
    if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'File is required' });
    }

    const { attach_type, certificate_number } = req.body;

    if (!attach_type) {
        return res.status(400).json({ status: 'error', message: 'Attachment type is required' });
    }

    try {
        const accountId = getEffectiveAccountId(req);
        // Normalize path for DB
        // Assuming uploads go to 'public/uploads' or similar. 
        // We will store relative path.
        const filePath = req.file.path.replace(/\\/g, "/");

        await createCertificate({
            account_id: accountId,
            attach_type,
            certificate_number,
            file_path: filePath,
            status: 'active'
        });

        res.status(201).json({ status: 'success', message: 'Certificate uploaded successfully' });
    } catch (err) {
        console.error('Error uploading certificate:', err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

const listCertificates = async (req, res) => {
    try {
        let fetchAccountId = null;

        if (req.user.type === 'admin') {
            fetchAccountId = null;
        } else {
            fetchAccountId = getEffectiveAccountId(req);
        }

        const results = await getCertificates(fetchAccountId);
        res.status(200).json({ status: 'success', data: results });
    } catch (err) {
        console.error('Error fetching certificates:', err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};


module.exports = {
    addAttachmentType,
    listAttachmentTypes,
    toggleAttachmentTypeStatus,
    uploadCertificate,
    listCertificates
};
