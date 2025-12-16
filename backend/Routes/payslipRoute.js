
const express = require('express');
const router = express.Router();
const { getPayslip } = require('../Controllers/payslipsController');
const { AccessTokenVerifier } = require('../Middleware/tokenAuth');

router.get('/', AccessTokenVerifier, getPayslip);

module.exports = router;
