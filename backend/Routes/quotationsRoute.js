const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { AccessTokenVerifier } = require('../Middleware/tokenAuth');
const {
    submitQuotation,
    getMyQuotation,
    getSubmittedQuotations,
    getTenderComparison,
    selectSupplier,
    uploadDocument,
} = require('../Controllers/quotationsController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/quotations/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, JPG, PNG, DOC, DOCX files are allowed'));
        }
    }
});

// Protected Routes (Seller)
router.post('/submit', AccessTokenVerifier, submitQuotation);
router.get('/my-quotation/:invitationToken', AccessTokenVerifier, getMyQuotation);
router.get('/my-quotation/:invitationToken/:tenderId', AccessTokenVerifier, getMyQuotation);
router.get('/get-submitted', AccessTokenVerifier, getSubmittedQuotations);
router.post('/:quotationId/upload-document', AccessTokenVerifier, upload.single('document'), uploadDocument);

// Protected Routes (Buyer)
router.get('/comparison/:tenderId', AccessTokenVerifier, getTenderComparison);
router.post('/select-supplier', AccessTokenVerifier, selectSupplier);

module.exports = router;
