const DB = require('../Config/conn');

// ✅ Get all payroll years for a company
const getPayrollYears = (companyId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT Year 
      FROM PayrollMonthYear 
      WHERE CompanyId = ? 
      ORDER BY Year DESC
    `;

    DB.query(sql, [companyId], (err, results) => {
      if (err) return reject(err);
      // convert to plain array of numbers
      const years = results.map(r => r.Year);
      resolve(years);
    });
  });
};

module.exports = { getPayrollYears };
