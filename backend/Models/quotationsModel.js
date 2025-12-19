const DB = require('../Config/conn');

/**
 * Create Seller Quotation (Transactional)
 * Creates quotation and all items in one transaction
 */
const createSellerQuotation = (quotationData, items) => {
    return new Promise((resolve, reject) => {
        DB.getConnection((err, connection) => {
            if (err) return reject(err);

            connection.beginTransaction(async (err) => {
                if (err) {
                    connection.release();
                    return reject(err);
                }

                try {
                    // 1. Insert Quotation
                    const quotationSql = `
            INSERT INTO seller_quotations 
            (tender_id, invitation_id, seller_account_id, submitted_by, delivery_period, remarks, status, submitted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;
                    const quotationValues = [
                        quotationData.tender_id,
                        quotationData.invitation_id,
                        quotationData.seller_account_id,
                        quotationData.submitted_by,
                        quotationData.delivery_period,
                        quotationData.remarks,
                        quotationData.status || 'draft',
                        quotationData.status === 'submitted' ? new Date() : null
                    ];

                    const quotationResult = await new Promise((res, rej) => {
                        connection.query(quotationSql, quotationValues, (error, result) => {
                            if (error) return rej(error);
                            res(result);
                        });
                    });

                    const quotationId = quotationResult.insertId;

                    // 2. Insert Items
                    if (items && items.length > 0) {
                        const itemSql = `
              INSERT INTO seller_quotation_items 
              (quotation_id, tender_item_id, unit_price, discount_percent, alternative_brand, alternative_origin, remarks)
              VALUES ?
            `;
                        const itemValues = items.map(item => [
                            quotationId,
                            item.tender_item_id,
                            item.unit_price,
                            item.discount_percent || 0,
                            item.alternative_brand || null,
                            item.alternative_origin || null,
                            item.remarks || null
                        ]);

                        await new Promise((res, rej) => {
                            connection.query(itemSql, [itemValues], (error, result) => {
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
                        resolve({ quotationId });
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
 * Update Seller Quotation
 */
const updateSellerQuotation = (quotationId, quotationData, items) => {
    return new Promise((resolve, reject) => {
        DB.getConnection((err, connection) => {
            if (err) return reject(err);

            connection.beginTransaction(async (err) => {
                if (err) {
                    connection.release();
                    return reject(err);
                }

                try {
                    // 1. Update Quotation
                    const quotationSql = `
            UPDATE seller_quotations 
            SET delivery_period = ?, remarks = ?, status = ?, submitted_at = ?, updated_at = NOW()
            WHERE id = ?
          `;
                    const quotationValues = [
                        quotationData.delivery_period,
                        quotationData.remarks,
                        quotationData.status,
                        quotationData.status === 'submitted' ? new Date() : null,
                        quotationId
                    ];

                    await new Promise((res, rej) => {
                        connection.query(quotationSql, quotationValues, (error, result) => {
                            if (error) return rej(error);
                            res(result);
                        });
                    });

                    // 2. Delete existing items
                    await new Promise((res, rej) => {
                        connection.query('DELETE FROM seller_quotation_items WHERE quotation_id = ?', [quotationId], (error, result) => {
                            if (error) return rej(error);
                            res(result);
                        });
                    });

                    // 3. Insert new items
                    if (items && items.length > 0) {
                        const itemSql = `
              INSERT INTO seller_quotation_items 
              (quotation_id, tender_item_id, unit_price, discount_percent, alternative_brand, alternative_origin, remarks)
              VALUES ?
            `;
                        const itemValues = items.map(item => [
                            quotationId,
                            item.tender_item_id,
                            item.unit_price,
                            item.discount_percent || 0,
                            item.alternative_brand || null,
                            item.alternative_origin || null,
                            item.remarks || null
                        ]);

                        await new Promise((res, rej) => {
                            connection.query(itemSql, [itemValues], (error, result) => {
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
                        resolve({ quotationId });
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
 * Get Seller Quotation by Invitation
 */
const getSellerQuotationByInvitation = (invitationId, sellerAccountId, tenderId = null) => {
    return new Promise((resolve, reject) => {
        let sql = `
      SELECT sq.*, 
             t.title as tender_title,
             t.description as tender_description
      FROM seller_quotations sq
      JOIN tenders t ON sq.tender_id = t.id
      LEFT JOIN tender_invitations ti ON sq.invitation_id = ti.id
      WHERE `;

        const params = [];
        if (tenderId) {
            sql += `sq.tender_id = ? `;
            params.push(tenderId);
        } else if (invitationId) {
            sql += `sq.invitation_id = ? `;
            params.push(invitationId);
        } else {
            return resolve(null);
        }

        sql += `AND sq.seller_account_id = ? LIMIT 1`;
        params.push(sellerAccountId);

        DB.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

/**
 * Get Quotation Items
 */
const getQuotationItems = (quotationId) => {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT sqi.*, 
             ti.item_name, ti.brand, ti.country_of_origin, ti.strength, ti.unit_of_measure, ti.qty,
             bis.id as selection_id,
             bis.selected_quotation_id,
             CASE WHEN bis.selected_quotation_id = sqi.quotation_id THEN 1 ELSE 0 END as is_accepted
      FROM seller_quotation_items sqi
      JOIN tender_items ti ON sqi.tender_item_id = ti.id
      LEFT JOIN buyer_item_selections bis ON ti.id = bis.tender_item_id
      WHERE sqi.quotation_id = ?
    `;
        DB.query(sql, [quotationId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

/**
 * Get All Quotations for a Tender (Buyer Comparison)
 */
const getQuotationsByTender = (tenderId) => {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT sq.*, 
             u.full_name as seller_name,
             u.email as seller_email,
             (SELECT COUNT(*) FROM seller_quotation_items WHERE quotation_id = sq.id) as item_count
      FROM seller_quotations sq
      JOIN users u ON sq.submitted_by = u.id
      WHERE sq.tender_id = ? AND sq.status = 'submitted'
      ORDER BY sq.submitted_at DESC
    `;
        DB.query(sql, [tenderId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

/**
 * Get All Quotations for a Seller Account
 */
const getQuotationsBySellerAccount = (sellerAccountId) => {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT sq.*, 
             t.title as tender_title,
             t.description as tender_description,
             ti.invitation_token,
             (SELECT COUNT(*) FROM seller_quotation_items WHERE quotation_id = sq.id) as item_count
      FROM seller_quotations sq
      JOIN tenders t ON sq.tender_id = t.id
      LEFT JOIN tender_invitations ti ON sq.invitation_id = ti.id
      WHERE sq.seller_account_id = ?
      ORDER BY sq.created_at DESC
    `;
        DB.query(sql, [sellerAccountId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

/**
 * Get Top 5 Suppliers by Item (for comparison table)
 */
const getTopSuppliersByItem = (tenderId, limit = 5) => {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT 
        ti.id as tender_item_id,
        ti.item_name,
        ti.brand,
        ti.country_of_origin,
        ti.strength,
        ti.unit_of_measure,
        ti.qty,
        sqi.quotation_id,
        sqi.unit_price,
        sqi.discount_percent,
        sqi.final_price,
        sqi.alternative_brand,
        sqi.alternative_origin,
        sq.seller_account_id,
        u.full_name as seller_name,
        bis.id as is_selected
      FROM tender_items ti
      LEFT JOIN seller_quotation_items sqi ON ti.id = sqi.tender_item_id
      LEFT JOIN seller_quotations sq ON sqi.quotation_id = sq.id AND sq.status = 'submitted'
      LEFT JOIN users u ON sq.submitted_by = u.id
      LEFT JOIN buyer_item_selections bis ON ti.id = bis.tender_item_id AND sqi.quotation_id = bis.selected_quotation_id
      WHERE ti.tender_id = ?
      ORDER BY ti.id, sqi.final_price ASC
    `;
        DB.query(sql, [tenderId], (err, results) => {
            if (err) return reject(err);

            // Group by item and limit to top 5 per item
            const grouped = {};
            results.forEach(row => {
                if (!grouped[row.tender_item_id]) {
                    grouped[row.tender_item_id] = {
                        item: {
                            id: row.tender_item_id,
                            name: row.item_name,
                            brand: row.brand,
                            origin: row.country_of_origin,
                            strength: row.strength,
                            uom: row.unit_of_measure,
                            qty: row.qty
                        },
                        suppliers: []
                    };
                }

                if (row.quotation_id && grouped[row.tender_item_id].suppliers.length < limit) {
                    grouped[row.tender_item_id].suppliers.push({
                        quotation_id: row.quotation_id,
                        seller_account_id: row.seller_account_id,
                        seller_name: row.seller_name,
                        unit_price: row.unit_price,
                        discount_percent: row.discount_percent,
                        final_price: row.final_price,
                        alternative_brand: row.alternative_brand,
                        alternative_origin: row.alternative_origin,
                        is_selected: row.is_selected ? true : false
                    });
                }
            });

            resolve(Object.values(grouped));
        });
    });
};

/**
 * Save Buyer's Item Selection
 */
const saveItemSelection = (tenderId, itemId, quotationId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
      INSERT INTO buyer_item_selections (tender_id, tender_item_id, selected_quotation_id, selected_by)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE selected_quotation_id = ?, selected_by = ?, selected_at = NOW()
    `;
        DB.query(sql, [tenderId, itemId, quotationId, userId, quotationId, userId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

/**
 * Upload Quotation Document
 */
const uploadQuotationDocument = (quotationId, documentType, filePath) => {
    return new Promise((resolve, reject) => {
        const sql = `
      INSERT INTO seller_quotation_documents (quotation_id, document_type, file_path)
      VALUES (?, ?, ?)
    `;
        DB.query(sql, [quotationId, documentType, filePath], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

/**
 * Get Matching Seller Items for a List of Tender Items
 */
const getMatchingSellerItems = (sellerAccountId, tenderItems) => {
    return new Promise((resolve, reject) => {
        if (!tenderItems || tenderItems.length === 0) {
            return resolve([]);
        }

        // Build complex OR query for triples (item_name, strength, unit_of_measure)
        let sql = `
      SELECT * FROM seller_items 
      WHERE seller_account_id = ? AND (
    `;

        const params = [sellerAccountId];
        const conditions = [];

        tenderItems.forEach(item => {
            conditions.push(`(item_name = ? AND strength = ? AND uom = ?)`);
            params.push(item.item_name, item.strength, item.unit_of_measure || item.uom); // Handle either field name
        });

        sql += conditions.join(' OR ') + ')';

        DB.query(sql, params, (err, results) => {
            if (err) {
                if (err.code === 'ER_NO_SUCH_TABLE') {
                    console.warn('Warning: seller_items table missing. Inventory validation skipped.');
                    return resolve({ items: [], inventorySupported: false });
                }
                return reject(err);
            }
            resolve({ items: results, inventorySupported: true });
        });
    });
};

module.exports = {
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
};
