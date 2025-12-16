const express = require('express');
const router = express.Router();

// Controllers
const {
    userLogin,
    registerMainAccount,
    createSubUserAccount,
    getUsers,
    getMySubAccounts,
    updateUserDetails,
} = require('../Controllers/usersController');

// Middleware
const { AccessTokenVerifier, requireOwnerRole } = require('../Middleware/tokenAuth');

// Public routes
router.post('/login', userLogin);
router.post('/register', registerMainAccount);

// Protected routes (require authentication)
router.get('/', AccessTokenVerifier, getUsers);
router.get('/sub-accounts', AccessTokenVerifier, getMySubAccounts);
router.put('/:id', AccessTokenVerifier, updateUserDetails);

// Protected routes (require OWNER role)
router.post('/sub-user', AccessTokenVerifier, requireOwnerRole, createSubUserAccount);

module.exports = router;
