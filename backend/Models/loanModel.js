const DB = require('../Config/conn');
const moment = require('moment');

// ✅ Get all loan types for a company
const getLoanTypes = (CompanyId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT LoanTypeId, LoanTypeName FROM LoanType WHERE CompanyId = ? AND status = 1`;
    DB.query(sql, [CompanyId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// ✅ Insert new loan request
const addLoanRequest = (loanData) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO LoanTransactions SET ?`;
    DB.query(sql, loanData, (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
};


// ✅ Fetch loan details for an employee (with readable status + installments)
const getLoanDetails = (EmpId, CompanyId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        lt.LoanTypeName, 
        l.RequestedAmount, 
        l.LoanNo, 
        l.Status,
        l.LoanTrId AS loanId, 
        l.LoanTrDate, 
        l.Reason, 
        l.CreatedDate
      FROM LoanTransactions l
      LEFT JOIN LoanType lt ON lt.LoanTypeId = l.LoanId
      WHERE l.EmpId = ? AND l.CompanyId = ?
      ORDER BY l.LoanTrId DESC
    `;

    DB.query(sql, [EmpId, CompanyId], async (err, loans) => {
      if (err) return reject(err);
      if (loans.length === 0) return resolve([]);

      try {
        // For each loan, fetch its installments
        const resultsWithInstallments = await Promise.all(
          loans.map((loan) => {
            return new Promise((res, rej) => {
              const instSql = `
                SELECT 
                  li.LoanInstallMonth, 
                  li.LoanInstallYear, 
                  li.LoanInstallDeduction, 
                  li.LoanInstallDeducted
                FROM loaninstallment li
                WHERE li.LoanTrId = ?
                ORDER BY li.LoanInstallMonth
              `;
              DB.query(instSql, [loan.loanId], (err2, insts) => {
                if (err2) return rej(err2);

                const installments = insts.map((r) => ({
                  LoanInstallMonth: r.LoanInstallMonth,
                  LoanInstallYear: r.LoanInstallYear,
                  LoanInstallDeduction: r.LoanInstallDeduction,
                  LoanInstallDeducted: r.LoanInstallDeducted,
                  StatusText:
                    r.LoanInstallDeducted && r.LoanInstallDeducted > 0
                      ? 'Paid'
                      : 'Pending',
                  MonthName: getMonthName(r.LoanInstallMonth),
                }));

                res({
                  ...loan,
                  StatusText: loan.Status === 1 ? 'Approved' : 'Pending',
                  installments,
                });
              });
            });
          })
        );

        resolve(resultsWithInstallments);
      } catch (error) {
        reject(error);
      }
    });
  });
};

// ✅ Helper to get month name
function getMonthName(monthNum) {
  const months = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[monthNum] || '';
}


module.exports = {
  getLoanTypes,
  addLoanRequest,
  getLoanDetails
};
