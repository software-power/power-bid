const { getPayrollYears } = require('../Models/payrollyearModel');

const getYears = async (req, res) => {

 const CompanyId =  req.companyId;
  //const company_Id = 1;

//   if (!company_Id) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'company_id is required',
//     });
//   }

  try {
    const years = await getPayrollYears(CompanyId);

    if (!years || years.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No payroll years found for this company',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Payroll years fetched successfully',
      data: years,
    });
  } catch (err) {
    console.error('Error fetching payroll years:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

module.exports = { getYears };
