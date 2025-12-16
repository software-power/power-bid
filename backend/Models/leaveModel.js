// leaveModel.js
const DB = require('../Config/conn');
const moment = require('moment');

const LeaveModel = {


  getLeaveTypes: (CompanyId) => {
    const sql = `SELECT * FROM leavetype WHERE status = 1 AND CompanyId = ? AND LeaveName LIKE '%ANNUAL%'`;
    return new Promise((resolve, reject) => {
      DB.query(sql, [CompanyId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },




  // Get next leave number
  getNextLeaveNo: (CompanyId) => {
    const sql = `SELECT COALESCE(MAX(LeaveNo), 0) + 1 AS nextLeaveNo FROM leavetransaction WHERE CompanyId = ?`;
    return new Promise((resolve, reject) => {
      DB.query(sql, [CompanyId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].nextLeaveNo);
      });
    });
  },

  // Get company leave approval setting
  getCompanyLeaveApproval: (CompanyId) => {
    const sql = `SELECT leave_approve FROM company WHERE CompanyId = ?`;
    return new Promise((resolve, reject) => {
      DB.query(sql, [CompanyId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  },

  // Insert leave transaction
  addLeaveTransaction: (data) => {
    const sql = `INSERT INTO leavetransaction
      (LeaveNo, LeaveTrDate, LeaveAppDate, EmpId, LeaveTypeId, Type, FromDate, ToDate, NoOfDays, Remarks, Status, LeaveAction, EncashAmount, CompanyId, CreatedBy, CreatedDate, LeaveGivenFrom, UseFormula, is_verify)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      data.LeaveNo,
      data.LeaveTrDate,
      data.LeaveAppDate,
      data.EmpId,
      data.LeaveTypeId,
      'OUT',
      data.FromDate,
      data.ToDate,
      data.NoOfDays,
      data.Remarks || '',
      data.Status,
      data.LeaveAction,
      data.EncashAmount || 0,
      data.CompanyId,
      data.CreatedBy,
      data.CreatedDate,
      'Transaction',
      data.UseFormula || 0,
      0
    ];

    return new Promise((resolve, reject) => {
      DB.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  // Optional: get leave requests for employee
  getEmployeeLeaves: (EmpId) => {
    const sql = `SELECT lt.*, l.LeaveName 
                 FROM leavetransaction lt
                 LEFT JOIN leavetype l ON lt.LeaveTypeId = l.LeaveId
                 WHERE lt.EmpId = ? ORDER BY lt.LeaveTrDate DESC`;
    return new Promise((resolve, reject) => {
      DB.query(sql, [EmpId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

// ✅ Get all leave requests for a specific employee
getEmployeeLeaveRequests: (EmpId, CompanyId) => {
  const sql = `
    SELECT 
      lt.LeaveNo,
      lt.LeaveTrDate,
      lt.FromDate,
      lt.ToDate,
      lt.NoOfDays,
      lt.Remarks,
      lt.Status,
      CASE 
        WHEN lt.Status = 1 THEN 'Approved'
        WHEN lt.Status = 0 THEN 'Pending'
        WHEN lt.Status = 2 THEN 'Rejected'
        ELSE 'Unknown'
      END AS StatusText,
      lt.LeaveAction,
      ltype.LeaveName AS LeaveType
    FROM leavetransaction lt
    LEFT JOIN leavetype ltype ON lt.LeaveTypeId = ltype.LeaveId
    WHERE lt.EmpId = ? AND lt.CompanyId = ?
    ORDER BY lt.LeaveTrDate DESC
  `;

  return new Promise((resolve, reject) => {
    DB.query(sql, [EmpId, CompanyId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
},

// ✅ Get Leave Summary Report
getLeaveSummaryReports: (data) => {
  const { CompanyId, EmpId, Status } = data;

  let sql = `
    SELECT 
      lt.EmpId,
      e.EmpFname,
      l.LeaveName,
      lt.LeaveTrDate AS TransactionDate,
      lt.NoOfDays,
      lt.Type,
      lt.LeaveGivenFrom,
      (
        SELECT COALESCE(SUM(NoOfDays), 0)
        FROM leavetransaction
        WHERE LeaveGivenFrom = 'EmpDetails'
          AND Type = 'IN'
          AND EmpId = e.EmpId
      ) AS OpeningBalance,
      SUM(CASE WHEN lt.Type = 'IN' THEN lt.NoOfDays ELSE 0 END) AS TotalLeaveIn,
      SUM(CASE WHEN lt.Type = 'OUT' THEN lt.NoOfDays ELSE 0 END) AS TotalLeaveOut
    FROM leavetransaction lt
    LEFT JOIN employee e ON e.EmpId = lt.EmpId
    LEFT JOIN leavetype l ON l.LeaveId = lt.LeaveTypeId
    WHERE lt.CompanyId = ?
  `;

  const params = [CompanyId];

  if (EmpId) {
    sql += ' AND lt.EmpId = ?';
    params.push(EmpId);
  }

  if (Status !== undefined && Status !== null && Status !== '') {
    sql += ' AND lt.Status = ?';
    params.push(Status);
  }

  sql += `
    GROUP BY lt.EmpId, l.LeaveName, lt.LeaveTrDate
    ORDER BY lt.EmpId, lt.LeaveTrDate
  `;

  return new Promise((resolve, reject) => {
    DB.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
},


  

};

module.exports = LeaveModel;
