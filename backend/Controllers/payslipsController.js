const { getEmployeePayslip } = require('../Models/payslipsModel');

const getPayslip = async (req, res) => {
    const {companyId, EmployeeId, month,year} = req.query;
  try {
    // ✅ Use middleware value if available, fallback to body/query
     const EmpId = EmployeeId || req.userid
    const CompanyId = companyId | req.companyId;
    const Month = month || req.userid
    const Year = year || req.companyId;
    // const Month = req.body.month || req.query.month;
    // const Year = req.body.year || req.query.year;

    //console.log(req.userid);
    //return

    //    const CompanyId = 1;
    // const EmpId =68;
    // const Month =5;
    // const Year = 2025;

    if (!CompanyId || !EmpId ) {
      return res.status(400).json({
        status: 'error',
        message: 'CompanyId and  EmpId are required',
      });
    }

    const payslip = await getEmployeePayslip({
      company_id: CompanyId,
      emp_id: EmpId,
      month: month,
      year: year,
    });

    if (!payslip || payslip.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Payslip not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Payslip fetched successfully',
      data: payslip,
    });
  } catch (error) {
    console.error('Payslip Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = { getPayslip };
