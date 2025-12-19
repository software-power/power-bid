const DB = require('../Config/conn');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new Tender (Transactional)
 * Creates tender, items, and invitations in one go.
 */
const createTender = (tenderData, items, invitations) => {
    return new Promise((resolve, reject) => {
        DB.getConnection((err, connection) => {
            if (err) return reject(err);

            connection.beginTransaction(async (err) => {
                if (err) {
                    connection.release();
                    return reject(err);
                }

                try {
                    // 1. Insert Tender
                    const tenderSql = `
            INSERT INTO tenders (title, description, account_id, created_by, status)
            VALUES (?, ?, ?, ?, 'published')
          `;
                    const tenderValues = [
                        tenderData.title,
                        tenderData.description,
                        tenderData.account_id,
                        tenderData.created_by,
                    ];

                    const tenderResult = await new Promise((res, rej) => {
                        connection.query(tenderSql, tenderValues, (error, result) => {
                            if (error) return rej(error);
                            res(result);
                        });
                    });

                    const tenderId = tenderResult.insertId;

                    // 2. Insert Items
                    if (items && items.length > 0) {
                        const itemSql = `
              INSERT INTO tender_items (tender_id, item_name, brand, country_of_origin, strength, unit_of_measure, qty, allow_alternative, account_id)
              VALUES ?
            `;
                        const itemValues = items.map(item => [
                            tenderId,
                            item.itemName,
                            item.brand || null,
                            item.countryOfOrigin || null,
                            item.strength || null,
                            item.unitOfMeasure,
                            item.qty,
                            item.allowAlternative ? 1 : 0,
                            tenderData.account_id
                        ]);

                        await new Promise((res, rej) => {
                            connection.query(itemSql, [itemValues], (error, result) => {
                                if (error) return rej(error);
                                res(result);
                            });
                        });
                    }

                    // 3. Insert Invitations
                    const insertedInvitations = [];
                    if (invitations && invitations.length > 0) {
                        const inviteSql = `
              INSERT INTO tender_invitations (tender_id, email, invitation_token, required_documents, account_id)
              VALUES ?
            `;

                        const inviteValues = invitations.map(invite => {
                            const token = uuidv4();
                            insertedInvitations.push({ email: invite.email, token });
                            return [
                                tenderId,
                                invite.email,
                                token,
                                tenderData.required_documents,
                                tenderData.account_id
                            ];
                        });

                        await new Promise((res, rej) => {
                            connection.query(inviteSql, [inviteValues], (error, result) => {
                                if (error) return rej(error);
                                res(result);
                            });
                        });
                    }

                    // Commit Transaction
                    connection.commit((commitErr) => {
                        if (commitErr) {
                            return connection.rollback(() => {
                                connection.release();
                                reject(commitErr);
                            });
                        }
                        connection.release();
                        resolve({ tenderId, invitations: insertedInvitations });
                    });

                } catch (error) {
                    connection.rollback(() => {
                        connection.release();
                        reject(error);
                    });
                }
            });
        });
    });
};

/**
 * Get Tenders by Account ID
 */
const getTendersByAccount = (accountId) => {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT t.*, 
             (SELECT COUNT(*) FROM tender_items WHERE tender_id = t.id) as item_count,
             (SELECT COUNT(*) FROM tender_invitations WHERE tender_id = t.id) as invite_count
      FROM tenders t
      WHERE t.account_id = ?
      ORDER BY t.created_at DESC
    `;
        DB.query(sql, [accountId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

/**
 * Get Tender by ID
 */
const getTenderById = (tenderId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM tenders WHERE id = ?`;
        DB.query(sql, [tenderId], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

/**
 * Get Tender by Invitation Token (Public Access)
 */
const getTenderByToken = (token) => {
    return new Promise((resolve, reject) => {
        // Join invitations with tenders to get full details
        const sql = `
      SELECT t.*, ti.id as invitation_id, ti.required_documents, ti.status as invitation_status, ti.email as invited_email
      FROM tender_invitations ti
      JOIN tenders t ON ti.tender_id = t.id
      WHERE ti.invitation_token = ?
    `;

        DB.query(sql, [token], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]); // Return single result (or undefined)
        });
    });
};

/**
 * Get Items for a Tender
 */
/**
 * Get Items for a Tender
 */
const getTenderItems = (tenderId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM tender_items WHERE tender_id = ?`;
        DB.query(sql, [tenderId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

/**
 * Get Invitations by Email (For Seller Dashboard)
 */
const getInvitationsByEmails = (emails) => {
    return new Promise((resolve, reject) => {
        if (!emails || emails.length === 0) return resolve([]);

        const sql = `
            SELECT ti.id as invitation_id, t.id as tender_id, t.title, t.description, t.status as tender_status, t.created_at as tender_date,
                   ti.invitation_token, ti.status as invitation_status, ti.required_documents, ti.created_at as invited_at,
                   u.full_name as buyer_name
            FROM tender_invitations ti
            JOIN tenders t ON ti.tender_id = t.id
            JOIN users u ON t.created_by = u.id
            WHERE ti.email IN (?)
            ORDER BY ti.created_at DESC
        `;
        DB.query(sql, [emails], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

/**
 * Get Specific Invitation for a Tender and a list of emails
 */
const getInvitationByTenderAndEmails = (tenderId, emails) => {
    return new Promise((resolve, reject) => {
        if (!emails || emails.length === 0) return resolve(null);

        const sql = `SELECT * FROM tender_invitations WHERE tender_id = ? AND email IN (?) LIMIT 1`;
        DB.query(sql, [tenderId, emails], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

module.exports = {
    createTender,
    getTendersByAccount,
    getTenderByToken,
    getTenderById,
    getTenderItems,
    getInvitationsByEmails,
    getInvitationByTenderAndEmails,
};
