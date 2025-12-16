// const DB = require('../Config/conn');

// // Get Employee Payslip
// const getEmployeePayslip = async ({ company_id, emp_id, month, year }) => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//       SELECT e.EmpFname, e.EmpEmail, e.EmpTin, e.MobileNo, e.Address,e.NHIFRegNo,
//              d.DeptName AS DepartmentName, des.DesignationName,
//              ems.BasicSalary, ems.GrossSalary,
//              ems.PayrollMonth, ems.PayrollYear,
//              ems.PayeAmt,
//              ems.Netpay,
//              ems.SDLAmt,
//              ems.wcfcontribution,
//              ems.PensionAmt as nssf,
//              ems.TotalIncome as Taxable,
//              ems.TotalDeductions as Totaldeduction,
//              ems.SalaryAdvance,
//              c.CompanyName
//       FROM empmonthsalary ems
//       JOIN employee e ON e.EmpId = ems.EmpId AND e.CompanyId = ems.CompanyId
//       LEFT JOIN department d ON d.DeptId = ems.DepartmentId
//       LEFT JOIN designation des ON des.DesignationId = ems.DesignationId
//       LEFT JOIN company c ON c.CompanyId = e.CompanyId
//       WHERE ems.CompanyId = ? AND ems.EmpId = ? 
//     `;

//     if(month) sql +=`AND ems.PayrollMonth = ${month}? `;
//     if(year) sql +=`AND ems.PayrollYear = ${year} `;

//     DB.query(sql, [company_id, emp_id, month, year], async (err, salaryResult) => {
//       if (err) return reject(err);
//       if (salaryResult.length === 0) return resolve([]);

//       const emp = salaryResult;

//       const payments = await getEmployeePayments({ company_id, emp_id, month, year });
//       const deductions = await getEmployeeDeductions({ company_id, emp_id, month, year });
//       const loans = await getEmployeeLoans({ company_id, emp_id, month, year });

//       resolve({
//         employee: emp,
//         payments,
//         deductions,
//         loans,
//       });
//     });
//   });
// };

// //Get employee payments
// const getEmployeePayments = ({ company_id, emp_id, month, year }) => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//       SELECT p.Payments, emp.Amount
//       FROM empmonthpayments emp
//       JOIN payments p ON p.PaymentId = emp.PaymentId
//       WHERE emp.CompanyId = ? AND emp.EmpId = ? 
//         AND emp.PayrollMonth = ? AND emp.PayrollYear = ?
//         AND emp.Amount <> 0
//     `;
//     DB.query(sql, [company_id, emp_id, month, year], (err, result) => {
//       if (err) return reject(err);
//       resolve(result);
//     });
//   });
// };

// // Get employee deductions
// const getEmployeeDeductions = ({ company_id, emp_id, month, year }) => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//       SELECT d.Deductions, ed.DedAmount
//       FROM empmonthdeductions ed
//       JOIN deductions d ON d.DeductionId = ed.DeductionId
//       WHERE ed.CompanyId = ? AND ed.EmpId = ? 
//         AND ed.PayrollMonth = ? AND ed.PayrollYear = ?
//         AND ed.DedAmount <> 0
//     `;
//     DB.query(sql, [company_id, emp_id, month, year], (err, result) => {
//       if (err) return reject(err);
//       resolve(result);
//     });
//   });
// };

// // Get employee loans
// const getEmployeeLoans = ({ company_id, emp_id, month, year }) => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//       SELECT lt.LoanTypeName, el.LoanAmount
//       FROM empmonthloan el
//       JOIN loantype lt ON lt.LoanTypeId = el.LoanId
//       WHERE el.CompanyId = ? AND el.EmpId = ?
//         AND el.PayrollMonth = ? AND el.PayrollYear = ?
//     `;
//     DB.query(sql, [company_id, emp_id, month, year], (err, result) => {
//       if (err) return reject(err);
//       resolve(result);
//     });
//   });
// };

// module.exports = {
//   getEmployeePayslip,
// };


const DB = require('../Config/conn');

// ✅ Get Employee Payslip (Flexible for all months or specific)
const getEmployeePayslip = async ({ company_id, emp_id, month, year }) => {
  return new Promise((resolve, reject) => {
    // Base SQL
    let sql = `
      SELECT e.EmpFname, e.EmpEmail, e.EmpTin, e.MobileNo, e.Address, e.NHIFRegNo,
             d.DeptName AS DepartmentName, des.DesignationName,
             ems.BasicSalary, ems.GrossSalary,
             ems.PayrollMonth, ems.PayrollYear,
             ems.PayeAmt, ems.Netpay, ems.SDLAmt, ems.wcfcontribution,
             ems.PensionAmt AS nssf,
             ems.TotalIncome AS Taxable,
             ems.TotalDeductions AS Totaldeduction,
             ems.SalaryAdvance,
             c.CompanyName
      FROM empmonthsalary ems
      JOIN employee e ON e.EmpId = ems.EmpId AND e.CompanyId = ems.CompanyId
      LEFT JOIN department d ON d.DeptId = ems.DepartmentId
      LEFT JOIN designation des ON des.DesignationId = ems.DesignationId
      LEFT JOIN company c ON c.CompanyId = e.CompanyId
      WHERE ems.CompanyId = ? AND ems.EmpId = ?
    `;

    const params = [company_id, emp_id];

    // Dynamically add filters
    if (month) {
      sql += ' AND ems.PayrollMonth = ?';
      params.push(month);
    }

    if (year) {
      sql += ' AND ems.PayrollYear = ?';
      params.push(year);
    }

    sql += ' ORDER BY ems.PayrollYear DESC, ems.PayrollMonth DESC';

    DB.query(sql, params, async (err, salaryResult) => {
      if (err) return reject(err);
      if (salaryResult.length === 0) return resolve([]);

      // If specific month/year → one payslip; otherwise → all payslips
      const employees = Array.isArray(salaryResult) ? salaryResult : [salaryResult];

      // For each payslip, attach details (payments, deductions, loans)
      const result = await Promise.all(
        employees.map(async (emp) => {
          const payments = await getEmployeePayments({ company_id, emp_id, month: emp.PayrollMonth, year: emp.PayrollYear });
          const deductions = await getEmployeeDeductions({ company_id, emp_id, month: emp.PayrollMonth, year: emp.PayrollYear });
          const loans = await getEmployeeLoans({ company_id, emp_id, month: emp.PayrollMonth, year: emp.PayrollYear });

          return {
            ...emp,
            payments,
            deductions,
            loans,
          };
        })
      );

      resolve(result);
    });
  });
};

// ✅ Get employee payments
const getEmployeePayments = ({ company_id, emp_id, month, year }) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT p.Payments, emp.Amount
      FROM empmonthpayments emp
      JOIN payments p ON p.PaymentId = emp.PaymentId
      WHERE emp.CompanyId = ? AND emp.EmpId = ?
    `;
    const params = [company_id, emp_id];

    if (month) {
      sql += ' AND emp.PayrollMonth = ?';
      params.push(month);
    }
    if (year) {
      sql += ' AND emp.PayrollYear = ?';
      params.push(year);
    }

    sql += ' AND emp.Amount <> 0';

    DB.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// ✅ Get employee deductions
const getEmployeeDeductions = ({ company_id, emp_id, month, year }) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT d.Deductions, ed.DedAmount
      FROM empmonthdeductions ed
      JOIN deductions d ON d.DeductionId = ed.DeductionId
      WHERE ed.CompanyId = ? AND ed.EmpId = ?
    `;
    const params = [company_id, emp_id];

    if (month) {
      sql += ' AND ed.PayrollMonth = ?';
      params.push(month);
    }
    if (year) {
      sql += ' AND ed.PayrollYear = ?';
      params.push(year);
    }

    sql += ' AND ed.DedAmount <> 0';

    DB.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// ✅ Get employee loans
const getEmployeeLoans = ({ company_id, emp_id, month, year }) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT lt.LoanTypeName, el.LoanAmount
      FROM empmonthloan el
      JOIN loantype lt ON lt.LoanTypeId = el.LoanId
      WHERE el.CompanyId = ? AND el.EmpId = ?
    `;
    const params = [company_id, emp_id];

    if (month) {
      sql += ' AND el.PayrollMonth = ?';
      params.push(month);
    }
    if (year) {
      sql += ' AND el.PayrollYear = ?';
      params.push(year);
    }

    DB.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  getEmployeePayslip,
};
