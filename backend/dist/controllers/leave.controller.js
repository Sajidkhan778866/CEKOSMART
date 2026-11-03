"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeaveStatus = exports.getAdminLeaves = exports.getMyLeaves = exports.applyLeave = exports.previewLeaveDuration = exports.calculateLeaveDays = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const LeaveRequest_1 = require("../models/LeaveRequest");
const Employee_1 = require("../models/Employee");
const calculateLeaveDays = (startStr, endStr, isHalfDay = false, weeklyOffDay = 0 // 0 = Sunday
) => {
    if (!startStr || !endStr) {
        return {
            calendarDays: 0,
            workingDays: 0,
            weeklyOffDaysCount: 0,
            startDate: '',
            endDate: '',
            isHalfDay,
            isValid: false,
            errorMessage: 'Start date and end date are both required.',
        };
    }
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return {
            calendarDays: 0,
            workingDays: 0,
            weeklyOffDaysCount: 0,
            startDate: '',
            endDate: '',
            isHalfDay,
            isValid: false,
            errorMessage: 'Invalid date format provided.',
        };
    }
    // Normalize time to midnight UTC for pure calendar day comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (end.getTime() < start.getTime()) {
        return {
            calendarDays: 0,
            workingDays: 0,
            weeklyOffDaysCount: 0,
            startDate: start.toISOString().slice(0, 10),
            endDate: end.toISOString().slice(0, 10),
            isHalfDay,
            isValid: false,
            errorMessage: 'End date cannot be earlier than start date.',
        };
    }
    if (isHalfDay) {
        return {
            calendarDays: 0.5,
            workingDays: 0.5,
            weeklyOffDaysCount: 0,
            startDate: start.toISOString().slice(0, 10),
            endDate: end.toISOString().slice(0, 10),
            isHalfDay: true,
            isValid: true,
        };
    }
    let calendarCount = 0;
    let workingCount = 0;
    let weeklyOffCount = 0;
    const current = new Date(start);
    while (current.getTime() <= end.getTime()) {
        calendarCount++;
        const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek === weeklyOffDay) {
            weeklyOffCount++;
        }
        else {
            workingCount++;
        }
        current.setDate(current.getDate() + 1);
    }
    return {
        calendarDays: calendarCount,
        workingDays: workingCount,
        weeklyOffDaysCount: weeklyOffCount,
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        isHalfDay: false,
        isValid: true,
    };
};
exports.calculateLeaveDays = calculateLeaveDays;
// POST /api/v1/leaves/calculate - Live automatic calculation endpoint for UI
const previewLeaveDuration = async (req, res) => {
    try {
        const { startDate, endDate, isHalfDay, weeklyOffDay } = req.body;
        const result = (0, exports.calculateLeaveDays)(startDate, endDate, !!isHalfDay, Number(weeklyOffDay ?? 0));
        if (!result.isValid) {
            return res.status(400).json({
                success: false,
                message: result.errorMessage || 'Invalid date range.',
                data: result,
            });
        }
        return res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        console.error('Error previewing leave duration:', error);
        return res.status(500).json({ success: false, message: 'Failed to calculate leave days', error: error.message });
    }
};
exports.previewLeaveDuration = previewLeaveDuration;
// POST /api/v1/leaves/apply - Submit a leave request with server-side validation
const applyLeave = async (req, res) => {
    try {
        const { employeeId, leaveType = 'Casual', startDate, endDate, isHalfDay = false, halfDaySession = 'first_half', reason, contactPhone, weeklyOffDay = 0, } = req.body;
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Both start date and end date are required.',
            });
        }
        if (!reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Reason for leave is required.',
            });
        }
        // Verify employee
        const targetEmpId = employeeId || req.user?.employeeId;
        if (!targetEmpId) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID is required.',
            });
        }
        let employee = await Employee_1.Employee.findOne({ employeeId: targetEmpId });
        if (!employee && mongoose_1.default.Types.ObjectId.isValid(targetEmpId)) {
            employee = await Employee_1.Employee.findById(targetEmpId);
        }
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee record not found.',
            });
        }
        // Recalculate duration server-side (DO NOT TRUST FRONTEND)
        const calculation = (0, exports.calculateLeaveDays)(startDate, endDate, !!isHalfDay, Number(weeklyOffDay));
        if (!calculation.isValid) {
            return res.status(400).json({
                success: false,
                message: calculation.errorMessage || 'Invalid leave dates.',
            });
        }
        const leaveRequest = await LeaveRequest_1.LeaveRequest.create({
            employee: employee._id,
            employeeId: employee.employeeId,
            employeeName: employee.name,
            department: employee.department,
            division: employee.division || [],
            leaveType,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            isHalfDay: !!isHalfDay,
            halfDaySession: isHalfDay ? halfDaySession : undefined,
            calendarDays: calculation.calendarDays,
            workingDays: calculation.workingDays,
            weeklyOffDay: Number(weeklyOffDay),
            reason: reason.trim(),
            contactPhone: contactPhone || employee.mobile,
            status: 'Pending',
            history: [
                {
                    action: 'Applied',
                    updatedBy: employee.name,
                    updatedAt: new Date(),
                    remarks: `Submitted leave request for ${calculation.workingDays} working days (${calculation.calendarDays} calendar days)`,
                },
            ],
        });
        return res.status(201).json({
            success: true,
            message: `Leave application submitted successfully for ${calculation.workingDays} working days.`,
            data: leaveRequest,
        });
    }
    catch (error) {
        console.error('Error applying for leave:', error);
        return res.status(500).json({ success: false, message: 'Failed to submit leave request', error: error.message });
    }
};
exports.applyLeave = applyLeave;
// GET /api/v1/leaves/my - Get authenticated employee's leave records
const getMyLeaves = async (req, res) => {
    try {
        const rawEmpId = req.query.employeeId || req.user?.employeeId;
        if (!rawEmpId) {
            return res.status(400).json({ success: false, message: 'Employee ID is required' });
        }
        const leaves = await LeaveRequest_1.LeaveRequest.find({ employeeId: String(rawEmpId) }).sort({ createdAt: -1 });
        const totalApprovedWorkingDays = leaves
            .filter((l) => l.status === 'Approved')
            .reduce((acc, curr) => acc + curr.workingDays, 0);
        const pendingRequestsCount = leaves.filter((l) => l.status === 'Pending').length;
        return res.json({
            success: true,
            data: leaves,
            summary: {
                totalLeaves: leaves.length,
                approvedWorkingDays: totalApprovedWorkingDays,
                pendingCount: pendingRequestsCount,
            },
        });
    }
    catch (error) {
        console.error('Error fetching employee leaves:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch leave records', error: error.message });
    }
};
exports.getMyLeaves = getMyLeaves;
// GET /api/v1/leaves - Get all leaves for Admin Portal
const getAdminLeaves = async (req, res) => {
    try {
        const { status, department, employeeId, startDate, endDate } = req.query;
        const query = {};
        if (status && status !== 'All') {
            query.status = status;
        }
        if (department && department !== 'All') {
            query.department = department;
        }
        if (employeeId) {
            query.employeeId = employeeId;
        }
        if (startDate || endDate) {
            query.startDate = {};
            if (startDate)
                query.startDate.$gte = new Date(startDate);
            if (endDate)
                query.startDate.$lte = new Date(endDate);
        }
        const leaves = await LeaveRequest_1.LeaveRequest.find(query).sort({ createdAt: -1 });
        const totalPending = await LeaveRequest_1.LeaveRequest.countDocuments({ status: 'Pending' });
        const totalApproved = await LeaveRequest_1.LeaveRequest.countDocuments({ status: 'Approved' });
        const totalRejected = await LeaveRequest_1.LeaveRequest.countDocuments({ status: 'Rejected' });
        return res.json({
            success: true,
            data: leaves,
            summary: {
                total: leaves.length,
                totalPending,
                totalApproved,
                totalRejected,
            },
        });
    }
    catch (error) {
        console.error('Error fetching admin leaves:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch admin leaves', error: error.message });
    }
};
exports.getAdminLeaves = getAdminLeaves;
// PATCH /api/v1/leaves/:id/status - Approve or reject leave
const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks = '', approvedBy = 'HR Manager' } = req.body;
        if (!['Approved', 'Rejected', 'Cancelled', 'Pending'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid leave status.',
            });
        }
        const leave = await LeaveRequest_1.LeaveRequest.findById(id);
        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave request not found.' });
        }
        leave.status = status;
        if (status === 'Approved') {
            leave.approvedBy = approvedBy;
            leave.approvedAt = new Date();
            leave.approvalRemarks = remarks;
        }
        else if (status === 'Rejected') {
            leave.rejectionReason = remarks;
        }
        leave.history.push({
            action: `Status changed to ${status}`,
            updatedBy: approvedBy,
            updatedAt: new Date(),
            remarks: remarks || `Leave status updated to ${status}`,
        });
        await leave.save();
        return res.json({
            success: true,
            message: `Leave request ${status.toLowerCase()} successfully.`,
            data: leave,
        });
    }
    catch (error) {
        console.error('Error updating leave status:', error);
        return res.status(500).json({ success: false, message: 'Failed to update leave status', error: error.message });
    }
};
exports.updateLeaveStatus = updateLeaveStatus;
