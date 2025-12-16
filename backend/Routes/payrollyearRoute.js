const express = require('express');
const router = express.Router();
const { getYears } = require('../Controllers/payrollyearController');
const { AccessTokenVerifier } = require('../Middleware/tokenAuth');

// POST: Fetch payroll years by company_id
router.get('/', AccessTokenVerifier, getYears);
module.exports = router;
