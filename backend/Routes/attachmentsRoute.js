const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { AccessTokenVerifier } = require('../Middleware/tokenAuth');
const {
    addAttachmentType,
    listAttachmentTypes,
    toggleAttachmentTypeStatus,
    uploadCertificate,
    listCertificates
} = require('../Controllers/attachmentsController');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure this directory exists or create it.
        // For simplicity, using './public/uploads'. The user might need to create it.
        // We can use absolute path or relative.
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * ROUTES
 */

// Attachment Types
router.post('/types', AccessTokenVerifier, addAttachmentType);
router.get('/types', AccessTokenVerifier, listAttachmentTypes);
router.patch('/types/:id/status', AccessTokenVerifier, toggleAttachmentTypeStatus);

// Certificates
router.post('/certificates', AccessTokenVerifier, upload.single('file'), uploadCertificate);
router.get('/certificates', AccessTokenVerifier, listCertificates);


module.exports = router;
