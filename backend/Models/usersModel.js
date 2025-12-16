const DB = require('../Config/conn');

/**
 * Find user by email
 */
const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM users WHERE email = ?`;
    DB.query(sql, [email], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Find user by ID
 */
const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM users WHERE id = ?`;
    DB.query(sql, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Check if email already exists
 */
const checkEmailExists = (email) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT COUNT(*) as count FROM users WHERE email = ?`;
    DB.query(sql, [email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0].count > 0);
    });
  });
};

/**
 * Create main account (OWNER)
 */
const createMainAccount = (userData) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO users (type, role_id, full_name, email, phone, password, status, main_account_id)
      VALUES (?, 'OWNER', ?, ?, ?, ?, 'active', NULL)
    `;
    const values = [
      userData.type,
      userData.full_name,
      userData.email,
      userData.phone,
      userData.password, // Already hashed
    ];

    DB.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Create sub-user under main account
 */
const createSubUser = (userData) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO users (type, role_id, full_name, email, phone, password, status, main_account_id)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    `;
    const values = [
      userData.type,
      userData.role_id,
      userData.full_name,
      userData.email,
      userData.phone,
      userData.password, // Already hashed
      userData.main_account_id,
    ];

    DB.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Get all users (for admin)
 */
const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, type, role_id, full_name, email, phone, status, main_account_id, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    DB.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Get sub-users by main account ID
 */
const getUsersByMainAccount = (mainAccountId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, type, role_id, full_name, email, phone, status, created_at, updated_at
      FROM users
      WHERE main_account_id = ?
      ORDER BY created_at DESC
    `;
    DB.query(sql, [mainAccountId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Update user
 */
const updateUser = (id, userData) => {
  return new Promise((resolve, reject) => {
    let sql = `UPDATE users SET full_name = ?, email = ?, phone = ?, status = ?`;
    let values = [userData.full_name, userData.email, userData.phone, userData.status];

    // Only update password if provided
    if (userData.password) {
      sql += `, password = ?`;
      values.push(userData.password);
    }

    sql += ` WHERE id = ?`;
    values.push(id);

    DB.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  findUserByEmail,
  findUserById,
  checkEmailExists,
  createMainAccount,
  createSubUser,
  getAllUsers,
  getUsersByMainAccount,
  updateUser,
};
