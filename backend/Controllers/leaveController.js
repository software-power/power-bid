const LeaveModel = require('../Models/leaveModel');
const moment = require('moment');

const getLeaveTypes = async (req, res) => {
  try {
    //const CompanyId = req.user?.companyId;
    const CompanyId = req.companyId || req.body.CompanyId;
   // const CompanyId =1;
    const leaveTypes = await LeaveModel.getLeaveTypes(CompanyId);
    res.json({ status: 'success', data: leaveTypes });
  } catch (err) {
    res.status(500).json({ status: 'error', code: 'internal_error', message: err.message });
  }
};


const requestLeave = async (req, res) => {
  try {
    const { leaveTypeId, fromDate, toDate, noOfDays, leaveAction, useFormula = 0, encashAmount = 0, remarks = '', CompanyId:CompaId } = req.body;

    const EmpId = req.userid; 
    const CompanyId = CompaId | req.companyId;

    // Validation
    if (!leaveTypeId)
         return res.status(400).json({
         status: 'error', 
         code: 'leave_type_required',
         message: 'Leave Type is required'
         });
    if (!fromDate) 
        return res.status(400).json({
         status: 'error',
          code: 'from_date_required',
          message: 'From Date is required'
         });

    if (!toDate)
         return res.status(400).json({
         status: 'error', 
         code: 'to_date_required', 
         message: 'To Date is required' });
    if (!noOfDays || isNaN(noOfDays) || noOfDays <= 0)
         return res.status(400).json({
         status: 'error', code: 'no_of_days_required',
          message: 'Number of days is required and must be greater than 0' });
    // if (!leaveAction)
    //      return res.status(400).json({ 
    //     status: 'error', 
    //     code: 'leave_action_required', 
    //     message: 'Leave Action is required' 
    // });

    // if (leaveAction.toLowerCase() === 'sold leave' && useFormula == 0 && (!encashAmount || isNaN(encashAmount))) {
    //   return res.status(400).json({ 
    //     status: 'error', 
    //     code: 'encash_amount_required',
    //      message: 'Encashment amount is required' });
    // }

    // DB transactions
    const LeaveNo = await LeaveModel.getNextLeaveNo(CompanyId);
    const company = await LeaveModel.getCompanyLeaveApproval(CompanyId);

    let LeaveAppDate = null;
    let statusFinal = 0; // pending
    if (!company || !company.leave_approve) {
      LeaveAppDate = moment().format('YYYY-MM-DD');
      statusFinal = 1; // auto approved
    }

    const leaveData = {
      LeaveNo,
      LeaveTrDate: moment().format('YYYY-MM-DD'),
      LeaveAppDate,
      EmpId,
      LeaveTypeId: leaveTypeId,
      FromDate: fromDate,
      ToDate: toDate,
      NoOfDays: noOfDays,
      Remarks: remarks,
      Status: statusFinal,
      LeaveAction: "Proceed On Leave",
      EncashAmount: 0,
      CompanyId,
      CreatedBy: EmpId,
      UseFormula: useFormula
    };

    await LeaveModel.addLeaveTransaction(leaveData);
    res.json({ status: 'success', message: 'Leave request added successfully', data: { LeaveNo } });

  } catch (err) {
    res.status(500).json({ status: 'error', code: 'internal_error', message: err.message });
  }
};

// Get leave requests for a single employee
const getEmployeeLeaveRequests = async (req, res) => {
    const {companyId, EmployeeId} = req.query;
  try {
    const EmpId = EmployeeId || req.userid
    const CompanyId = companyId | req.companyId;
    //companyId
    //req.params
    //req.query
    // console.log(CompanyId)
    // return
    

    if (!EmpId)
      return res.status(400).json({
        status: 'error',
        code: 'emp_id_required',
        message: 'Employee ID is required',
      });

    const leaves = await LeaveModel.getEmployeeLeaveRequests(EmpId, CompanyId);

    if (!leaves || leaves.length === 0)
      return res.json({
        status: 'success',
        message: 'No leave requests found for this employee',
        data: [],
      });

    res.json({ status: 'success', data: leaves });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      code: 'internal_error',
      message: err.message,
    });
  }
};

// ✅ Leave Summary Report
const getLeaveSummary = async (req, res) => {
     const {companyId, EmployeeId} = req.query;
  try {
   
    const EmpId = EmployeeId || req.userid
    const CompanyId = companyId | req.companyId;
    const Status =1;

    if (!CompanyId)
      return res.status(400).json({ status: 'error', message: 'CompanyId is required' });

    const leaves = await LeaveModel.getLeaveSummaryReports({ CompanyId, EmpId, Status });

    if (!leaves || leaves.length === 0)
      return res.json({ status: 'success', message: 'No leave summary found', data: [] });

    res.json({ status: 'success', data: leaves });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};


module.exports = { getLeaveTypes, requestLeave,getEmployeeLeaveRequests,getLeaveSummary };
