const express = require('express');
const router = express.Router();

// Controllers
const leaveController = require('../Controllers/leaveController');

// Middleware
const { AccessTokenVerifier } = require('../Middleware/tokenAuth'); // JWT middleware

// Routes

// Get leave types (protected)
router.get('/types', AccessTokenVerifier, leaveController.getLeaveTypes);

// Submit leave request (protected)
router.post('/', AccessTokenVerifier, leaveController.requestLeave);

//  ✅ Get leave requests for a single employee
router.get('/employee',AccessTokenVerifier, leaveController.getEmployeeLeaveRequests);

// ✅ Get Leave Summary Report
router.get('/employee/summary', AccessTokenVerifier, leaveController.getLeaveSummary);


// router.get('/employee/:EmpId', LeaveController.getEmployeeLeaveRequests);

module.exports = router;
