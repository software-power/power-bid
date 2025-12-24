const express = require('express');
const router = express.Router();
const { AccessTokenVerifier } = require('../Middleware/tokenAuth');
const {
    createQuotation,
    getMyTenders,
    getTenderDetailsPublic,
    getMyInvitations,
    getTenderDetailsForEdit,
    updateQuotation,
} = require('../Controllers/tendersController');

// Protected Routes (Buyer/Admin)
router.post('/create', AccessTokenVerifier, createQuotation);
router.get('/my-tenders', AccessTokenVerifier, getMyTenders);
router.get('/my-invitations', AccessTokenVerifier, getMyInvitations); // For Sellers
router.get('/:id', AccessTokenVerifier, getTenderDetailsForEdit); // Get for Edit
router.put('/:id', AccessTokenVerifier, updateQuotation); // Update


// Public Route (Seller Access via Token)
router.get('/invitation/:token', getTenderDetailsPublic);

module.exports = router;
