const DB = require('../Config/conn');

/**
 * ATTACHMENT TYPES
 */

// Create Attachment Type
const createAttachmentType = (data) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO attachment_type (name, account_id, status)
            VALUES (?, ?, ?)
        `;
        DB.query(sql, [data.name, data.account_id, data.status || 'active'], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Get Attachment Types
// If accountId is provided, filter by it. If null (Admin viewing all?), we might handle that in controller or here.
// But req says "Admin: All accounts", "Buyer/Seller: Own only".
// So efficient query:
const getAttachmentTypes = (accountId = null) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM attachment_type`;
        const params = [];

        if (accountId) {
            sql += ` WHERE account_id = ?`;
            params.push(accountId);
        }

        sql += ` ORDER BY created_at DESC`;

        DB.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Update Attachment Type Status
const updateAttachmentTypeStatus = (id, status) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE attachment_type SET status = ? WHERE id = ?`;
        DB.query(sql, [status, id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


/**
 * CERTIFICATES
 */

// Create Certificate
const createCertificate = (data) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO certificates_attachment (account_id, attach_type, certificate_number, file_path, status)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            data.account_id,
            data.attach_type,
            data.certificate_number || null,
            data.file_path,
            data.status || 'active'
        ];
        DB.query(sql, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Get Certificates
const getCertificates = (accountId = null) => {
    return new Promise((resolve, reject) => {
        // returning join with attachment_type for name
        let sql = `
            SELECT c.*, t.name as attachment_name 
            FROM certificates_attachment c
            JOIN attachment_type t ON c.attach_type = t.id
        `;
        const params = [];

        if (accountId) {
            sql += ` WHERE c.account_id = ?`;
            params.push(accountId);
        }

        sql += ` ORDER BY c.created_at DESC`;

        DB.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const getCertificateById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM certificates_attachment WHERE id = ?`;
        DB.query(sql, [id], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

module.exports = {
    createAttachmentType,
    getAttachmentTypes,
    updateAttachmentTypeStatus,
    createCertificate,
    getCertificates,
    getCertificateById
};
