"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployeeDashboardStats = exports.getCurrentApplications = exports.getAdminDashboardStats = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Complaint_1 = require("../models/Complaint");
const Warranty_1 = require("../models/Warranty");
const Employee_1 = require("../models/Employee");
const Customer_1 = require("../models/Customer");
const Bill_1 = require("../models/Bill");
const StockMovement_1 = require("../models/StockMovement");
const Stock_1 = require("../models/Stock");
const dateRange_1 = require("../utils/dateRange");
const getAdminDashboardStats = async (req, res) => {
    try {
        const { dateFilter = 'today', startDate, endDate } = req.query;
        const { startDate: start, endDate: end } = (0, dateRange_1.getDateFilterBounds)(dateFilter, startDate, endDate);
        const dateQuery = {};
        if (start || end) {
            dateQuery.createdAt = {};
            if (start)
                dateQuery.createdAt.$gte = start;
            if (end)
                dateQuery.createdAt.$lte = end;
        }
        // Filtered counts for selected date range (default TODAY)
        const [rangeComplaints, rangeNewComplaints, rangePendingComplaints, rangeAssignedComplaints, rangeInProgressComplaints, rangeResolvedComplaints, rangeClosedComplaints, rangeCustomers, rangeBills, rangeWarranties, rangeStockMovements,] = await Promise.all([
            Complaint_1.Complaint.countDocuments(dateQuery),
            Complaint_1.Complaint.countDocuments({ ...dateQuery, status: 'New' }),
            Complaint_1.Complaint.countDocuments({ ...dateQuery, status: { $in: ['Pending', 'New'] } }),
            Complaint_1.Complaint.countDocuments({ ...dateQuery, status: 'Assigned' }),
            Complaint_1.Complaint.countDocuments({ ...dateQuery, status: 'In Progress' }),
            Complaint_1.Complaint.countDocuments({ ...dateQuery, status: 'Resolved' }),
            Complaint_1.Complaint.countDocuments({ ...dateQuery, status: 'Closed' }),
            Customer_1.Customer.countDocuments(dateQuery),
            Bill_1.Bill.find(dateQuery).select('grandTotal paymentStatus'),
            Warranty_1.Warranty.countDocuments(dateQuery),
            StockMovement_1.StockMovement.countDocuments(dateQuery),
        ]);
        const rangeRevenue = rangeBills.reduce((acc, b) => acc + (b.grandTotal || 0), 0);
        // Cumulative / All-Time Counts
        const [totalComplaints, totalEmployees, activeEmployees, totalCustomers, totalWarranties, activeWarranties, expiringWarranties, expiredWarranties, allBills, totalStockItems,] = await Promise.all([
            Complaint_1.Complaint.countDocuments(),
            Employee_1.Employee.countDocuments(),
            Employee_1.Employee.countDocuments({ status: 'Active' }),
            Customer_1.Customer.countDocuments(),
            Warranty_1.Warranty.countDocuments(),
            Warranty_1.Warranty.countDocuments({ status: 'Active' }),
            Warranty_1.Warranty.countDocuments({ status: 'Expiring Soon' }),
            Warranty_1.Warranty.countDocuments({ status: 'Expired' }),
            Bill_1.Bill.find().select('grandTotal'),
            Stock_1.Stock.countDocuments(),
        ]);
        const totalRevenue = allBills.reduce((acc, b) => acc + (b.grandTotal || 0), 0);
        // Division breakdown for the selected date range
        const divisions = ['Battery', 'Rental', 'Showroom', 'Spare Parts', 'Warranty', 'Plant'];
        const divisionBreakdown = await Promise.all(divisions.map(async (div) => {
            const count = await Complaint_1.Complaint.countDocuments({ ...dateQuery, division: div });
            return { name: div, complaints: count };
        }));
        // 7-day Activity Chart
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const now = new Date();
        const weeklyActivity = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const nextD = new Date(d);
            nextD.setDate(nextD.getDate() + 1);
            const dayName = days[d.getDay()];
            const [cCount, wCount, bCount] = await Promise.all([
                Complaint_1.Complaint.countDocuments({ createdAt: { $gte: d, $lt: nextD } }),
                Warranty_1.Warranty.countDocuments({ createdAt: { $gte: d, $lt: nextD } }),
                Bill_1.Bill.countDocuments({ createdAt: { $gte: d, $lt: nextD } }),
            ]);
            weeklyActivity.push({
                name: dayName,
                date: d.toISOString().split('T')[0],
                complaints: cCount,
                warranties: wCount,
                bills: bCount,
            });
        }
        // Recent complaints feed
        const recentComplaints = await Complaint_1.Complaint.find(dateQuery)
            .populate('customer', 'customerId name mobile email address')
            .populate('assignedTo', 'employeeId name designation division mobile photoUrl')
            .sort({ createdAt: -1 })
            .limit(15);
        res.json({
            success: true,
            data: {
                filter: dateFilter,
                dateRange: {
                    startDate: start,
                    endDate: end,
                },
                // Active Date Range Stats (Default TODAY)
                todayStats: {
                    complaints: rangeComplaints,
                    newComplaints: rangeNewComplaints,
                    pendingComplaints: rangePendingComplaints,
                    assignedComplaints: rangeAssignedComplaints,
                    inProgressComplaints: rangeInProgressComplaints,
                    resolvedComplaints: rangeResolvedComplaints,
                    closedComplaints: rangeClosedComplaints,
                    resolvedAndClosed: rangeResolvedComplaints + rangeClosedComplaints,
                    customers: rangeCustomers,
                    bills: rangeBills.length,
                    revenue: rangeRevenue,
                    warranties: rangeWarranties,
                    stockMovements: rangeStockMovements,
                },
                // Range metrics
                totalComplaints: rangeComplaints,
                newComplaints: rangeNewComplaints,
                pendingComplaints: rangePendingComplaints,
                assignedComplaints: rangeAssignedComplaints,
                inProgressComplaints: rangeInProgressComplaints,
                resolvedComplaints: rangeResolvedComplaints,
                closedComplaints: rangeClosedComplaints,
                totalCustomers: rangeCustomers,
                totalWarranties: rangeWarranties,
                billsCount: rangeBills.length,
                totalRevenue: rangeRevenue,
                stockMovementsCount: rangeStockMovements,
                // All Time Cumulative Overview
                allTimeStats: {
                    totalComplaints,
                    totalCustomers,
                    totalEmployees,
                    activeEmployees,
                    totalWarranties,
                    activeWarranties,
                    totalRevenue,
                    totalStockItems,
                },
                totalEmployees,
                activeEmployees,
                activeWarranties,
                expiringWarranties,
                expiredWarranties,
                weeklyActivity,
                recentComplaints,
                divisionBreakdown,
                warrantyBreakdown: [
                    { name: 'Active', value: activeWarranties, color: '#3b82f6' },
                    { name: 'Expiring Soon', value: expiringWarranties, color: '#f59e0b' },
                    { name: 'Expired', value: expiredWarranties, color: '#ef4444' },
                ],
            },
        });
    }
    catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: error.message });
    }
};
exports.getAdminDashboardStats = getAdminDashboardStats;
// GET /api/v1/dashboard/current-applications
const getCurrentApplications = async (req, res) => {
    try {
        const { department, division, complaintType, status, assignedTo, priority, dateFilter, startDate, endDate, search, limit = 50, page = 1, } = req.query;
        const query = {};
        const targetDivision = division || department;
        if (targetDivision && targetDivision !== 'All') {
            query.division = targetDivision;
        }
        if (complaintType && complaintType !== 'All') {
            query.complaintType = complaintType;
        }
        if (status && status !== 'All') {
            query.status = status;
        }
        if (priority && priority !== 'All') {
            query.priority = priority;
        }
        if (assignedTo && assignedTo !== 'All') {
            query.assignedTo = assignedTo;
        }
        (0, dateRange_1.applyDateFilterToQuery)(query, 'createdAt', dateFilter, startDate, endDate);
        if (search) {
            query.$or = [
                { ticketNumber: { $regex: search, $options: 'i' } },
                { complaintType: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Math.min(100, Number(limit)));
        const skip = (pageNum - 1) * limitNum;
        const [applications, total] = await Promise.all([
            Complaint_1.Complaint.find(query)
                .populate('customer', 'customerId name mobile email address')
                .populate('assignedTo', 'employeeId name designation division mobile photoUrl')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Complaint_1.Complaint.countDocuments(query),
        ]);
        res.json({
            success: true,
            data: {
                applications,
                total,
                page: pageNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Error fetching current applications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch current applications', error: error.message });
    }
};
exports.getCurrentApplications = getCurrentApplications;
// GET /api/v1/dashboard/employee/:employeeId
const getEmployeeDashboardStats = async (req, res) => {
    try {
        const rawEmployeeId = req.params.employeeId;
        const employeeId = String(Array.isArray(rawEmployeeId) ? rawEmployeeId[0] : rawEmployeeId || '');
        const { dateFilter = 'today', startDate, endDate } = req.query;
        let employee = null;
        if (mongoose_1.default.Types.ObjectId.isValid(employeeId)) {
            employee = await Employee_1.Employee.findById(employeeId);
        }
        if (!employee) {
            employee = await Employee_1.Employee.findOne({ employeeId });
        }
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        const { startDate: start, endDate: end } = (0, dateRange_1.getDateFilterBounds)(dateFilter, startDate, endDate);
        const isSuperOrAll = employee.role === 'admin' ||
            employee.role === 'Manager' ||
            (employee.permissions && employee.permissions.includes('complaints:view_all'));
        const empDivisions = Array.isArray(employee.division) && employee.division.length > 0
            ? employee.division
            : employee.department ? [employee.department] : [];
        const baseQuery = isSuperOrAll
            ? {}
            : {
                $or: [
                    { assignedTo: employee._id },
                    { division: { $in: empDivisions } },
                    { 'formData.assignedEmployeeId': employee.employeeId },
                    { 'formData.assignedTo': employee.name },
                ],
            };
        let dateQuery = baseQuery;
        if (start || end) {
            dateQuery = {
                $and: [
                    baseQuery,
                    {
                        $or: [
                            {
                                createdAt: {
                                    ...(start ? { $gte: start } : {}),
                                    ...(end ? { $lte: end } : {}),
                                },
                            },
                            {
                                updatedAt: {
                                    ...(start ? { $gte: start } : {}),
                                    ...(end ? { $lte: end } : {}),
                                },
                            },
                        ],
                    },
                ],
            };
        }
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        // Active queue: Unresolved tickets (any date) OR tickets touched/created Today
        const activeQuery = {
            $and: [
                baseQuery,
                {
                    $or: [
                        { status: { $in: ['New', 'Pending', 'Assigned', 'In Progress'] } },
                        { createdAt: { $gte: todayStart, $lte: todayEnd } },
                        { updatedAt: { $gte: todayStart, $lte: todayEnd } },
                    ],
                },
            ],
        };
        // Closed / Resolved history: tickets that are resolved/closed/rejected
        const closedQuery = {
            $and: [
                baseQuery,
                { status: { $in: ['Resolved', 'Closed', 'Rejected'] } },
            ],
        };
        // Range-filtered metrics
        const [assignedComplaints, pendingComplaints, inProgressComplaints, resolvedComplaints] = await Promise.all([
            Complaint_1.Complaint.countDocuments(dateQuery),
            Complaint_1.Complaint.countDocuments({ ...dateQuery, status: { $in: ['Assigned', 'Pending', 'New'] } }),
            Complaint_1.Complaint.countDocuments({ ...dateQuery, status: 'In Progress' }),
            Complaint_1.Complaint.countDocuments({ ...dateQuery, status: { $in: ['Resolved', 'Closed'] } }),
        ]);
        // All-time & Queue totals
        const totalAllTime = await Complaint_1.Complaint.countDocuments(baseQuery);
        const resolvedAllTime = await Complaint_1.Complaint.countDocuments(closedQuery);
        const unresolvedAllTime = await Complaint_1.Complaint.countDocuments({ ...baseQuery, status: { $in: ['Assigned', 'Pending', 'New', 'In Progress'] } });
        const inProgressAllTime = await Complaint_1.Complaint.countDocuments({ ...baseQuery, status: 'In Progress' });
        const todayTotal = await Complaint_1.Complaint.countDocuments({
            $and: [
                baseQuery,
                {
                    $or: [
                        { createdAt: { $gte: todayStart, $lte: todayEnd } },
                        { updatedAt: { $gte: todayStart, $lte: todayEnd } },
                    ],
                },
            ],
        });
        // 1. Active & Today's Queue (DEFAULT)
        const activeAssignments = await Complaint_1.Complaint.find(activeQuery)
            .populate('customer', 'customerId name mobile email address')
            .populate('assignedTo', 'employeeId name designation division photoUrl')
            .sort({ updatedAt: -1, createdAt: -1 })
            .limit(100);
        // 2. Closed / Resolved History (shown on clicking)
        const closedAssignments = await Complaint_1.Complaint.find(closedQuery)
            .populate('customer', 'customerId name mobile email address')
            .populate('assignedTo', 'employeeId name designation division photoUrl')
            .sort({ updatedAt: -1, createdAt: -1 })
            .limit(100);
        // 3. Period assignments (matching date filter)
        const periodAssignments = await Complaint_1.Complaint.find(dateQuery)
            .populate('customer', 'customerId name mobile email address')
            .populate('assignedTo', 'employeeId name designation division photoUrl')
            .sort({ updatedAt: -1, createdAt: -1 })
            .limit(100);
        // 4. All-time assignments
        const allTimeAssignments = await Complaint_1.Complaint.find(baseQuery)
            .populate('customer', 'customerId name mobile email address')
            .populate('assignedTo', 'employeeId name designation division photoUrl')
            .sort({ updatedAt: -1, createdAt: -1 })
            .limit(100);
        res.json({
            success: true,
            data: {
                filter: dateFilter,
                dateRange: {
                    startDate: start,
                    endDate: end,
                },
                employee: {
                    _id: employee._id,
                    name: employee.name,
                    employeeId: employee.employeeId,
                    department: employee.department,
                    division: employee.division,
                    designation: employee.designation,
                    photoUrl: employee.photoUrl,
                    barcode: employee.barcode,
                    warrantyAccess: employee.warrantyAccess,
                },
                stats: {
                    assignedComplaints,
                    pendingComplaints,
                    inProgressComplaints,
                    resolvedComplaints,
                    totalAllTime,
                    resolvedAllTime,
                    unresolvedAllTime,
                    inProgressAllTime,
                    todayTotal,
                    activeQueueCount: activeAssignments.length,
                    closedQueueCount: closedAssignments.length,
                },
                activeAssignments,
                closedAssignments,
                periodAssignments,
                allTimeAssignments,
                recentAssignments: activeAssignments.length > 0 ? activeAssignments : allTimeAssignments,
            },
        });
    }
    catch (error) {
        console.error('Error fetching employee dashboard data:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch employee dashboard data', error: error.message });
    }
};
exports.getEmployeeDashboardStats = getEmployeeDashboardStats;
