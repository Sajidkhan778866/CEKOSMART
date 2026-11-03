"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplaintStatus = exports.assignComplaint = exports.getComplaintById = exports.exportComplaints = exports.getAdminComplaints = exports.trackPublicComplaint = exports.submitPublicComplaint = exports.generateTicketNumber = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Complaint_1 = require("../models/Complaint");
const Customer_1 = require("../models/Customer");
const Employee_1 = require("../models/Employee");
const dateRange_1 = require("../utils/dateRange");
const DIVISION_PREFIXES = {
    Battery: 'BAT',
    Rental: 'REN',
    Showroom: 'SHR',
    'Spare Parts': 'SPR',
    Warranty: 'WRN',
    Plant: 'PLN',
};
const generateTicketNumber = async (division) => {
    const prefix = DIVISION_PREFIXES[division] || (division ? division.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, '') : 'CMP');
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    // Count complaints today for this division
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    let count = 0;
    try {
        count = await Complaint_1.Complaint.countDocuments({
            division: division,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
        });
    }
    catch {
        count = Math.floor(Math.random() * 50);
    }
    const seq = (count + 1).toString().padStart(4, '0');
    const candidate = `${prefix}-${dateStr}-${seq}`;
    // Guarantee uniqueness
    try {
        const exists = await Complaint_1.Complaint.findOne({ ticketNumber: candidate });
        if (exists) {
            const rand = Math.floor(1000 + Math.random() * 9000);
            return `${prefix}-${dateStr}-${seq}-${rand}`;
        }
    }
    catch {
        // ignore
    }
    return candidate;
};
exports.generateTicketNumber = generateTicketNumber;
const submitPublicComplaint = async (req, res) => {
    try {
        const { division, complaintType, customerName, customerMobile, customerEmail, address, description, formData, priority, } = req.body;
        if (!division || !customerName || !customerMobile) {
            return res.status(400).json({
                success: false,
                message: 'Division, Customer Name, and Mobile Number are required.',
            });
        }
        const cleanMobile = String(customerMobile).trim();
        const cleanName = String(customerName).trim();
        const cleanEmail = customerEmail ? String(customerEmail).trim() : undefined;
        const cleanAddress = address ? String(address).trim() : undefined;
        const cleanDivision = String(division).trim();
        // 1. Find or create Customer with upsert protection
        let customer = await Customer_1.Customer.findOne({ mobile: cleanMobile });
        if (!customer) {
            const customerId = `CUST-${Date.now().toString().slice(-6)}`;
            try {
                customer = await Customer_1.Customer.create({
                    customerId,
                    name: cleanName,
                    mobile: cleanMobile,
                    email: cleanEmail,
                    address: cleanAddress,
                    customerType: cleanDivision === 'Showroom' ? 'Showroom' : 'General',
                });
            }
            catch (custErr) {
                customer = await Customer_1.Customer.findOne({ mobile: cleanMobile });
                if (!customer) {
                    throw new Error(`Failed to initialize customer record: ${custErr.message}`);
                }
            }
        }
        else {
            let updated = false;
            if (cleanName && customer.name !== cleanName) {
                customer.name = cleanName;
                updated = true;
            }
            if (cleanEmail && !customer.email) {
                customer.email = cleanEmail;
                updated = true;
            }
            if (cleanAddress && !customer.address) {
                customer.address = cleanAddress;
                updated = true;
            }
            if (updated) {
                await customer.save().catch(() => { });
            }
        }
        // 2. Generate Ticket Number
        const ticketNumber = await (0, exports.generateTicketNumber)(cleanDivision);
        // 3. Create Complaint
        const desc = description ? String(description).trim() : (formData?.complaintDescription ? String(formData.complaintDescription).trim() : '');
        const complaint = await Complaint_1.Complaint.create({
            ticketNumber,
            customer: customer._id,
            division: cleanDivision,
            complaintType: complaintType ? String(complaintType).trim() : 'General Issue',
            description: desc,
            formData: formData || {},
            status: 'Pending',
            priority: priority || 'Medium',
            timeline: [
                {
                    status: 'Pending',
                    note: 'Customer submitted complaint ticket online.',
                    updatedBy: cleanName,
                    updatedAt: new Date(),
                },
            ],
        });
        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully!',
            data: {
                ticketNumber: complaint.ticketNumber,
                status: complaint.status,
                division: complaint.division,
                complaintType: complaint.complaintType,
                createdAt: complaint.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Complaint submission error:', error);
        const msg = error.message || String(error);
        const isDbErr = msg.includes('buffering timed out') || msg.includes('ECONNREFUSED') || msg.includes('Server selection timed out');
        res.status(isDbErr ? 503 : 500).json({
            success: false,
            message: isDbErr
                ? 'Database is currently connecting. Please try submitting again in a few moments.'
                : (error.message || 'Failed to submit complaint'),
        });
    }
};
exports.submitPublicComplaint = submitPublicComplaint;
const trackPublicComplaint = async (req, res) => {
    try {
        const ticketNumber = (req.params.ticketNumber || '').trim();
        const complaint = await Complaint_1.Complaint.findOne({ ticketNumber })
            .populate('customer', 'name mobile email address')
            .populate('assignedTo', 'name designation employeeId mobile');
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'No complaint found with this ticket number.',
            });
        }
        res.json({
            success: true,
            data: {
                ticketNumber: complaint.ticketNumber,
                division: complaint.division,
                complaintType: complaint.complaintType,
                description: complaint.description || complaint.formData?.complaintDescription,
                status: complaint.status,
                priority: complaint.priority,
                createdAt: complaint.createdAt,
                updatedAt: complaint.updatedAt,
                formData: complaint.formData,
                customerName: complaint.customer?.name,
                customerMobile: complaint.customer?.mobile,
                assignedEngineer: complaint.assignedTo?.name || 'Pending Assignment',
                assignedEmployeeId: complaint.assignedTo?.employeeId,
                timeline: complaint.timeline,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error tracking complaint' });
    }
};
exports.trackPublicComplaint = trackPublicComplaint;
const resolveEmployeeScope = async (req) => {
    let empId = req.query.employeeId || req.user?.employeeId;
    if (!empId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.decode(token);
            if (decoded && decoded.employeeId) {
                empId = decoded.employeeId;
            }
        }
        catch {
            // ignore
        }
    }
    if (!empId) {
        return { isScoped: false };
    }
    const emp = await Employee_1.Employee.findOne({ employeeId: String(empId).trim() });
    if (!emp) {
        return { isScoped: false };
    }
    if (emp.role === 'admin' ||
        emp.role === 'SuperAdmin' ||
        (emp.permissions && emp.permissions.includes('complaints:view_all'))) {
        return { isScoped: false, employee: emp };
    }
    const authorizedDivisions = (Array.isArray(emp.division) && emp.division.length > 0)
        ? emp.division
        : emp.department ? [emp.department] : [];
    return {
        isScoped: true,
        employee: emp,
        authorizedDivisions,
    };
};
// GET /api/v1/complaints/admin OR /api/v1/tickets
const getAdminComplaints = async (req, res) => {
    try {
        const { tab, scope, division, status, priority, complaintType, assignedTo, search, dateFilter, startDate, endDate } = req.query;
        const query = {};
        // Check employee department & permission authorization
        const empScope = await resolveEmployeeScope(req);
        if (empScope.isScoped && empScope.employee) {
            const { employee, authorizedDivisions = [] } = empScope;
            if (division && division !== 'All') {
                if (!authorizedDivisions.includes(division)) {
                    query.division = '__UNAUTHORIZED_SCOPE__';
                }
                else {
                    query.division = division;
                }
            }
            else {
                query.$or = [
                    { assignedTo: employee._id },
                    { division: { $in: authorizedDivisions } },
                    { department: employee.department },
                    { 'formData.assignedEmployeeId': employee.employeeId },
                    { 'formData.assignedTo': employee.name },
                ];
            }
        }
        else if (division && division !== 'All') {
            query.division = division;
        }
        // Handle Tab/Scope Filtering: 'active' vs 'resolved' vs 'all'
        const activeTab = (tab || scope || '').toString().toLowerCase();
        if (status && status !== 'All') {
            query.status = status;
        }
        else if (activeTab === 'active') {
            query.status = { $in: ['New', 'Pending', 'Assigned', 'In Progress'] };
        }
        else if (activeTab === 'resolved' || activeTab === 'closed' || activeTab === 'history') {
            query.status = { $in: ['Resolved', 'Closed'] };
        }
        if (priority && priority !== 'All')
            query.priority = priority;
        if (complaintType && complaintType !== 'All')
            query.complaintType = complaintType;
        if (assignedTo && assignedTo !== 'All')
            query.assignedTo = assignedTo;
        (0, dateRange_1.applyDateFilterToQuery)(query, 'createdAt', dateFilter, startDate, endDate);
        if (search) {
            const searchStr = search.trim();
            const matchingCustomers = await Customer_1.Customer.find({
                $or: [
                    { name: { $regex: searchStr, $options: 'i' } },
                    { mobile: { $regex: searchStr, $options: 'i' } },
                    { email: { $regex: searchStr, $options: 'i' } },
                    { customerId: { $regex: searchStr, $options: 'i' } },
                ],
            }).select('_id');
            const customerIds = matchingCustomers.map((c) => c._id);
            const searchConditions = [
                { ticketNumber: { $regex: searchStr, $options: 'i' } },
                { complaintType: { $regex: searchStr, $options: 'i' } },
                { description: { $regex: searchStr, $options: 'i' } },
                { division: { $regex: searchStr, $options: 'i' } },
                { status: { $regex: searchStr, $options: 'i' } },
                { priority: { $regex: searchStr, $options: 'i' } },
            ];
            if (customerIds.length > 0) {
                searchConditions.push({ customer: { $in: customerIds } });
            }
            query.$or = searchConditions;
        }
        const complaints = await Complaint_1.Complaint.find(query)
            .populate('customer', 'customerId name mobile email address customerType')
            .populate('assignedTo', 'employeeId name designation division mobile photoUrl')
            .sort({ createdAt: -1 });
        // Calculate active vs resolved counts for fast tab badge rendering
        const baseCountQuery = {};
        if (division && division !== 'All')
            baseCountQuery.division = division;
        (0, dateRange_1.applyDateFilterToQuery)(baseCountQuery, 'createdAt', dateFilter, startDate, endDate);
        const [activeCount, resolvedCount, allCount] = await Promise.all([
            Complaint_1.Complaint.countDocuments({ ...baseCountQuery, status: { $in: ['New', 'Pending', 'Assigned', 'In Progress'] } }),
            Complaint_1.Complaint.countDocuments({ ...baseCountQuery, status: { $in: ['Resolved', 'Closed'] } }),
            Complaint_1.Complaint.countDocuments(baseCountQuery),
        ]);
        res.json({
            success: true,
            data: complaints,
            meta: {
                total: complaints.length,
                activeCount,
                resolvedCount,
                allCount,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
    }
};
exports.getAdminComplaints = getAdminComplaints;
// GET /api/v1/complaints/export - Export complaints to CSV / Excel
const exportComplaints = async (req, res) => {
    try {
        const { tab, scope, division, status, priority, complaintType, assignedTo, search, dateFilter, startDate, endDate } = req.query;
        const query = {};
        // Check employee department & permission authorization
        const empScope = await resolveEmployeeScope(req);
        if (empScope.isScoped && empScope.employee) {
            const { employee, authorizedDivisions = [] } = empScope;
            if (division && division !== 'All') {
                if (!authorizedDivisions.includes(division)) {
                    query.division = '__UNAUTHORIZED_SCOPE__';
                }
                else {
                    query.division = division;
                }
            }
            else {
                query.$or = [
                    { assignedTo: employee._id },
                    { division: { $in: authorizedDivisions } },
                    { department: employee.department },
                    { 'formData.assignedEmployeeId': employee.employeeId },
                    { 'formData.assignedTo': employee.name },
                ];
            }
        }
        else if (division && division !== 'All') {
            query.division = division;
        }
        const activeTab = (tab || scope || '').toString().toLowerCase();
        if (status && status !== 'All') {
            query.status = status;
        }
        else if (activeTab === 'active') {
            query.status = { $in: ['New', 'Pending', 'Assigned', 'In Progress'] };
        }
        else if (activeTab === 'resolved' || activeTab === 'closed' || activeTab === 'history') {
            query.status = { $in: ['Resolved', 'Closed'] };
        }
        if (priority && priority !== 'All')
            query.priority = priority;
        if (complaintType && complaintType !== 'All')
            query.complaintType = complaintType;
        if (assignedTo && assignedTo !== 'All')
            query.assignedTo = assignedTo;
        (0, dateRange_1.applyDateFilterToQuery)(query, 'createdAt', dateFilter, startDate, endDate);
        if (search) {
            const searchStr = search.trim();
            const matchingCustomers = await Customer_1.Customer.find({
                $or: [
                    { name: { $regex: searchStr, $options: 'i' } },
                    { mobile: { $regex: searchStr, $options: 'i' } },
                    { email: { $regex: searchStr, $options: 'i' } },
                    { customerId: { $regex: searchStr, $options: 'i' } },
                ],
            }).select('_id');
            const customerIds = matchingCustomers.map((c) => c._id);
            const searchConditions = [
                { ticketNumber: { $regex: searchStr, $options: 'i' } },
                { complaintType: { $regex: searchStr, $options: 'i' } },
                { description: { $regex: searchStr, $options: 'i' } },
                { division: { $regex: searchStr, $options: 'i' } },
                { status: { $regex: searchStr, $options: 'i' } },
                { priority: { $regex: searchStr, $options: 'i' } },
            ];
            if (customerIds.length > 0) {
                searchConditions.push({ customer: { $in: customerIds } });
            }
            query.$or = searchConditions;
        }
        const complaints = await Complaint_1.Complaint.find(query)
            .populate('customer', 'customerId name mobile email address')
            .populate('assignedTo', 'employeeId name designation division')
            .sort({ createdAt: -1 });
        const headers = [
            'Ticket Number',
            'Division',
            'Complaint Type',
            'Status',
            'Priority',
            'Customer Name',
            'Customer Mobile',
            'Customer Email',
            'Assigned Engineer',
            'Engineer ID',
            'Description',
            'Resolution Details',
            'Created Date',
            'Last Updated',
        ];
        const escapeCsv = (str) => {
            if (str === null || str === undefined)
                return '""';
            const s = String(str).replace(/"/g, '""');
            return `"${s}"`;
        };
        const rows = complaints.map((c) => [
            escapeCsv(c.ticketNumber),
            escapeCsv(c.division),
            escapeCsv(c.complaintType),
            escapeCsv(c.status),
            escapeCsv(c.priority),
            escapeCsv(c.customer?.name || ''),
            escapeCsv(c.customer?.mobile || ''),
            escapeCsv(c.customer?.email || ''),
            escapeCsv(c.assignedTo?.name || 'Unassigned'),
            escapeCsv(c.assignedTo?.employeeId || ''),
            escapeCsv(c.description || c.formData?.complaintDescription || ''),
            escapeCsv(c.remarks?.resolutionDetails || c.remarks?.admin || ''),
            escapeCsv(c.createdAt ? new Date(c.createdAt).toLocaleString() : ''),
            escapeCsv(c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''),
        ].join(','));
        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
        const filename = `Ekosmart_Complaints_Export_${new Date().toISOString().slice(0, 10)}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(csvContent);
    }
    catch (error) {
        console.error('Error exporting complaints:', error);
        res.status(500).json({ success: false, message: 'Failed to export complaints' });
    }
};
exports.exportComplaints = exportComplaints;
// GET /api/v1/complaints/:id OR /api/v1/tickets/:id OR /api/v1/complaints/ticket/:ticketNumber
const getComplaintById = async (req, res) => {
    try {
        const rawId = req.params.id;
        const id = (Array.isArray(rawId) ? rawId[0] : rawId || '').trim();
        let complaint;
        if (id && mongoose_1.default.Types.ObjectId.isValid(id)) {
            complaint = await Complaint_1.Complaint.findById(id)
                .populate('customer', 'customerId name mobile email address customerType')
                .populate('assignedTo', 'employeeId name designation division mobile email photoUrl');
        }
        if (!complaint && id) {
            complaint = await Complaint_1.Complaint.findOne({ ticketNumber: id })
                .populate('customer', 'customerId name mobile email address customerType')
                .populate('assignedTo', 'employeeId name designation division mobile email photoUrl');
        }
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint ticket not found' });
        }
        res.json({ success: true, data: complaint });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch complaint details', error: error.message });
    }
};
exports.getComplaintById = getComplaintById;
const assignComplaint = async (req, res) => {
    try {
        const rawId = req.params.id;
        const id = (Array.isArray(rawId) ? rawId[0] : rawId || '').trim();
        const { employeeId } = req.body;
        const complaint = await Complaint_1.Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }
        const employee = await Employee_1.Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        complaint.assignedTo = employee._id;
        complaint.status = 'Assigned';
        if (!complaint.timeline)
            complaint.timeline = [];
        complaint.timeline.push({
            status: 'Assigned',
            note: `Assigned to ${employee.name} (${employee.employeeId} - ${employee.designation})`,
            updatedBy: 'Admin',
            updatedAt: new Date(),
        });
        await complaint.save();
        const updated = await Complaint_1.Complaint.findById(id)
            .populate('customer', 'customerId name mobile email address')
            .populate('assignedTo', 'employeeId name designation division mobile photoUrl');
        res.json({
            success: true,
            message: `Complaint assigned to ${employee.name} successfully`,
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to assign complaint' });
    }
};
exports.assignComplaint = assignComplaint;
const updateComplaintStatus = async (req, res) => {
    try {
        const rawId = req.params.id;
        const id = (Array.isArray(rawId) ? rawId[0] : rawId || '').trim();
        const { status, priority, remarks, employeeRemarks, adminRemarks, resolutionDetails, updatedBy } = req.body;
        const complaint = await Complaint_1.Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }
        if (status && status !== complaint.status) {
            complaint.status = status;
            if (!complaint.timeline)
                complaint.timeline = [];
            complaint.timeline.push({
                status: status,
                note: resolutionDetails || remarks || `Status changed to ${status}`,
                updatedBy: updatedBy || 'Staff',
                updatedAt: new Date(),
            });
        }
        if (priority)
            complaint.priority = priority;
        if (remarks !== undefined || employeeRemarks !== undefined || adminRemarks !== undefined || resolutionDetails !== undefined) {
            complaint.remarks = {
                employee: employeeRemarks !== undefined ? employeeRemarks : (complaint.remarks?.employee || ''),
                admin: adminRemarks !== undefined ? adminRemarks : (complaint.remarks?.admin || ''),
                resolutionDetails: resolutionDetails !== undefined ? resolutionDetails : (complaint.remarks?.resolutionDetails || ''),
            };
        }
        await complaint.save();
        const updated = await Complaint_1.Complaint.findById(id)
            .populate('customer', 'customerId name mobile email address')
            .populate('assignedTo', 'employeeId name designation division mobile photoUrl');
        res.json({ success: true, message: 'Complaint updated successfully', data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update complaint' });
    }
};
exports.updateComplaintStatus = updateComplaintStatus;
