const LoanModel = require('../Models/loanModel');
const moment = require('moment');


// ✅ POST /api/loans/request
const requestLoan = async (req, res) => {
  try {

    const EmpId =  req.userid
    const CompanyId =req.companyId;
    const LoanId = req.body.LoanTypeId;
    const RequestedAmount = req.body.RequestedAmount;
    const Reason = req.body.Reason || '';

    // console.log(LoanId);


    // 🧩 Validation

    if (!LoanId) { 
      return res.status(400).json({
        status: "error",
        message: "Loan Type is required"
      });
    }

    // if (!RequestedAmount)
    //   return
    //  res.status(400).json({ status: 'error', message: 'Amount is required' });

 
    const LoanTrDate = moment().format('YYYY-MM-DD');
    const CreatedDate = moment().format('YYYY-MM-DD');

    const loanData = {
      LoanTrDate,
      EmpId,
      LoanId,
      RequestedAmount: String(RequestedAmount).replace(/,/g, ''),
      Reason,
      Status: 0,
      CompanyId,
      CreatedBy: EmpId,
      CreatedDate
    };

    const result = await LoanModel.addLoanRequest(loanData);

    res.json({
      status: 'success',
      message: 'Loan request added successfully',
      LoanId: result,
    
    });
  } catch (err) {
    console.error('Error adding loan:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ✅ GET /api/loans/types
const getLoanTypes = async (req, res) => {
  try {
    const CompanyId = req.companyId || req.query.CompanyId;
    if (!CompanyId)
      return res.status(400).json({ status: 'error', message: 'CompanyId is required' });

    const types = await LoanModel.getLoanTypes(CompanyId);
    res.json({ status: 'success', data: types });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ✅ GET /api/loans/details/:empId
const getLoanDetails = async (req, res) => {
     const {companyId, EmployeeId} = req.query;
  try {
     const EmpId = EmployeeId || req.userid
    const CompanyId = companyId | req.companyId;

    if (!CompanyId || !EmpId)
      return res.status(400).json({ status: 'error', message: 'CompanyId and EmpId are required' });

    const loans = await LoanModel.getLoanDetails(EmpId, CompanyId);
    res.json({ status: 'success', data: loans });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = { requestLoan, getLoanTypes, getLoanDetails };
