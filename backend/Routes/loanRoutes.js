const express = require('express');
const router = express.Router();


// Controllers
const loanController = require('../Controllers/loanController');
// Middleware
const { AccessTokenVerifier } = require('../Middleware/tokenAuth'); // JWT middleware


router.post('/', AccessTokenVerifier, loanController.requestLoan);
router.get('/types', AccessTokenVerifier, loanController.getLoanTypes);
router.get('/employee', AccessTokenVerifier, loanController.getLoanDetails);




module.exports = router;
