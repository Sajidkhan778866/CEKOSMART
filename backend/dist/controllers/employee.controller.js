"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayslip = exports.getMyPayslipById = exports.getMyPayslips = exports.getAllPayslips = exports.getEmployeePayslips = exports.generateEmployeePayslip = exports.updateEmployeeSalary = exports.getEmployeeSalary = exports.convertNumberToWords = exports.exportEmployees = exports.deleteEmployee = exports.toggleEmployeeStatus = exports.updateEmployee = exports.getEmployeeTasks = exports.getEligibleEmployees = exports.getEmployeeById = exports.getEmployees = exports.createEmployee = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const Employee_1 = require("../models/Employee");
const Complaint_1 = require("../models/Complaint");
const PayrollRecord_1 = require("../models/PayrollRecord");
const barcode_1 = require("../utils/barcode");
const dateRange_1 = require("../utils/dateRange");
// Normalize helper for division, permissions, warrantyAccess, certificates
const parseJsonOrValue = (val, fallback = null) => {
    if (val === undefined || val === null)
        return fallback;
    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        }
        catch {
            return val;
        }
    }
    return val;
};
const createEmployee = async (req, res) => {
    try {
        const { employeeId, name, email, mobile, address, department, section, division, designation, role, password, permissions, certificates, issuedItems, warrantyAccess, status, } = req.body;
        // 1. Basic validation
        if (!employeeId || !name || !email || !mobile || !department || !role || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields (Employee ID, Name, Email, Mobile, Department, Role, Password).',
            });
        }
        // 2. Normalize divisions
        let divisionArray = [];
        const parsedDiv = parseJsonOrValue(division, []);
        if (Array.isArray(parsedDiv)) {
            divisionArray = parsedDiv.map((d) => String(d).trim()).filter(Boolean);
        }
        else if (typeof division === 'string') {
            divisionArray = division.split(',').map((d) => d.trim()).filter(Boolean);
        }
        // 3. Normalize warrantyAccess
        const rawWarranty = parseJsonOrValue(warrantyAccess, {});
        const parsedWarranty = {
            enabled: Boolean(rawWarranty?.enabled),
            accessType: rawWarranty?.accessType || (rawWarranty?.enabled ? 'Custom' : 'Disabled'),
            divisionScope: Array.isArray(rawWarranty?.divisionScope) ? rawWarranty.divisionScope : ['All'],
            permissions: {
                registration: Boolean(rawWarranty?.permissions?.registration),
                verification: Boolean(rawWarranty?.permissions?.verification),
                claim: Boolean(rawWarranty?.permissions?.claim),
                claimApproval: Boolean(rawWarranty?.permissions?.claimApproval),
                check: Boolean(rawWarranty?.permissions?.check),
                customerRecords: Boolean(rawWarranty?.permissions?.customerRecords),
                voidWarranty: Boolean(rawWarranty?.permissions?.voidWarranty),
            },
        };
        // 4. Normalize permissions
        let permissionsArray = [];
        const parsedPerms = parseJsonOrValue(permissions, []);
        if (Array.isArray(parsedPerms)) {
            permissionsArray = parsedPerms.map((p) => String(p).trim()).filter(Boolean);
        }
        // 5. Normalize certificates
        let certificatesArray = [];
        const parsedCerts = parseJsonOrValue(certificates, []);
        if (Array.isArray(parsedCerts)) {
            certificatesArray = parsedCerts.filter((c) => c && c.title);
        }
        // 5b. Normalize issuedItems / givings
        let issuedItemsArray = [];
        const rawItems = issuedItems !== undefined ? issuedItems : req.body.givings;
        const parsedItems = parseJsonOrValue(rawItems, []);
        if (Array.isArray(parsedItems)) {
            issuedItemsArray = parsedItems
                .filter((i) => i && (i.name || i.title))
                .map((i) => ({
                id: i.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: String(i.name || i.title).trim(),
                category: i.category ? String(i.category).trim() : 'Diagnostic Tool',
                serialNumber: i.serialNumber ? String(i.serialNumber).trim() : '',
                assetTag: i.assetTag ? String(i.assetTag).trim() : '',
                issueDate: i.issueDate ? String(i.issueDate).trim() : '',
                returnDate: i.returnDate ? String(i.returnDate).trim() : 'Returnable',
                condition: i.condition || 'Good',
                status: i.status || 'Issued',
                issuedBy: i.issuedBy || 'Admin',
                notes: i.notes ? String(i.notes).trim() : '',
            }));
        }
        // 6. Check duplicate Employee ID
        const existingId = await Employee_1.Employee.findOne({ employeeId: employeeId.trim() });
        if (existingId) {
            return res.status(409).json({
                success: false,
                message: `Employee ID "${employeeId}" already exists. Please choose a unique ID.`,
            });
        }
        // 7. Check duplicate Email
        const existingEmail = await Employee_1.Employee.findOne({ email: email.toLowerCase().trim() });
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: `Email "${email}" is already registered.`,
            });
        }
        // 8. Hash password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        // 9. Process photo
        let photoUrl = '';
        if (req.file) {
            if (req.file.buffer) {
                photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            }
            else if (req.file.filename) {
                photoUrl = `/uploads/employees/${req.file.filename}`;
            }
        }
        else if (req.body.photoUrl) {
            photoUrl = req.body.photoUrl;
        }
        // 10. Generate Barcode
        const barcode = (0, barcode_1.generateBarcodeSVG)(employeeId.trim());
        // 11. Create employee
        const employee = await Employee_1.Employee.create({
            employeeId: employeeId.trim(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            mobile: mobile.trim(),
            address: address ? address.trim() : '',
            department: department.trim(),
            section: section ? section.trim() : '',
            division: divisionArray.length > 0 ? divisionArray : [department.trim()],
            designation: designation ? designation.trim() : 'Staff',
            role: role.trim(),
            password: hashedPassword,
            plainPassword: password.trim(),
            photoUrl: photoUrl || undefined,
            barcode,
            permissions: permissionsArray,
            certificates: certificatesArray,
            issuedItems: issuedItemsArray,
            warrantyAccess: parsedWarranty,
            status: status === 'Inactive' ? 'Inactive' : 'Active',
        });
        // 12. Return safe employee data
        const safeEmployee = employee.toObject();
        delete safeEmployee.password;
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: safeEmployee,
        });
    }
    catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create employee',
        });
    }
};
exports.createEmployee = createEmployee;
const getEmployees = async (req, res) => {
    try {
        const { department, division, status, search } = req.query;
        const query = {};
        if (department && department !== 'All')
            query.department = department;
        if (division && division !== 'All')
            query.division = division;
        if (status && status !== 'All')
            query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } },
            ];
        }
        const employees = await Employee_1.Employee.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: employees,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employees',
        });
    }
};
exports.getEmployees = getEmployees;
const getEmployeeById = async (req, res) => {
    try {
        const id = String(req.params.id);
        let employee = null;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            employee = await Employee_1.Employee.findById(id);
        }
        if (!employee) {
            employee = await Employee_1.Employee.findOne({ employeeId: id });
        }
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.json({ success: true, data: employee });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch employee' });
    }
};
exports.getEmployeeById = getEmployeeById;
const getEligibleEmployees = async (req, res) => {
    try {
        const { division } = req.params;
        const employees = await Employee_1.Employee.find({
            status: 'Active',
            $or: [
                { division: division },
                { department: division },
                { role: 'Admin' },
            ],
        }).select('employeeId name email mobile department designation role division photoUrl warrantyAccess certificates');
        res.json({
            success: true,
            data: employees,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch eligible employees' });
    }
};
exports.getEligibleEmployees = getEligibleEmployees;
// GET /api/v1/admin/employees/:id/tasks (Assigned Task List Dossier)
const getEmployeeTasks = async (req, res) => {
    try {
        const id = String(req.params.id);
        let employee = null;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            employee = await Employee_1.Employee.findById(id);
        }
        if (!employee) {
            employee = await Employee_1.Employee.findOne({ employeeId: id });
        }
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        // Find all complaints assigned to this employee
        const tasks = await Complaint_1.Complaint.find({ assignedTo: employee._id })
            .populate('customer', 'name mobile email address city pincode')
            .sort({ updatedAt: -1, createdAt: -1 });
        // Calculate Task Metrics
        const total = tasks.length;
        const pending = tasks.filter((t) => ['New', 'Pending', 'Assigned'].includes(t.status)).length;
        const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
        const resolved = tasks.filter((t) => ['Resolved', 'Closed'].includes(t.status)).length;
        const urgent = tasks.filter((t) => ['Urgent', 'High'].includes(t.priority)).length;
        res.json({
            success: true,
            data: {
                employee: {
                    _id: employee._id,
                    employeeId: employee.employeeId,
                    name: employee.name,
                    email: employee.email,
                    mobile: employee.mobile,
                    department: employee.department,
                    designation: employee.designation,
                    division: employee.division,
                    photoUrl: employee.photoUrl,
                    certificates: employee.certificates || [],
                    issuedItems: employee.issuedItems || [],
                    warrantyAccess: employee.warrantyAccess,
                },
                stats: {
                    total,
                    pending,
                    inProgress,
                    resolved,
                    urgent,
                },
                tasks,
            },
        });
    }
    catch (error) {
        console.error('Error fetching employee tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assigned tasks for employee',
        });
    }
};
exports.getEmployeeTasks = getEmployeeTasks;
const updateEmployee = async (req, res) => {
    try {
        const id = String(req.params.id);
        const updates = { ...req.body };
        // Handle password update only if provided
        if (updates.password && updates.password.trim()) {
            const rawPass = updates.password.trim();
            const salt = await bcrypt_1.default.genSalt(10);
            updates.password = await bcrypt_1.default.hash(rawPass, salt);
            updates.plainPassword = rawPass;
        }
        else {
            delete updates.password;
        }
        // Handle photo file
        if (req.file) {
            if (req.file.buffer) {
                updates.photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            }
            else if (req.file.filename) {
                updates.photoUrl = `/uploads/employees/${req.file.filename}`;
            }
        }
        // Handle division parsing
        if (updates.division !== undefined) {
            const parsed = parseJsonOrValue(updates.division, []);
            updates.division = Array.isArray(parsed) ? parsed : updates.division.split(',').map((d) => d.trim()).filter(Boolean);
        }
        // Handle certificates parsing
        if (updates.certificates !== undefined) {
            const parsedCerts = parseJsonOrValue(updates.certificates, []);
            updates.certificates = Array.isArray(parsedCerts) ? parsedCerts.filter((c) => c && c.title) : [];
        }
        // Handle issuedItems / givings parsing
        if (updates.issuedItems !== undefined || updates.givings !== undefined) {
            const rawItems = updates.issuedItems !== undefined ? updates.issuedItems : updates.givings;
            const parsedItems = parseJsonOrValue(rawItems, []);
            updates.issuedItems = Array.isArray(parsedItems)
                ? parsedItems
                    .filter((i) => i && (i.name || i.title))
                    .map((i) => ({
                    id: i.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    name: String(i.name || i.title).trim(),
                    category: i.category ? String(i.category).trim() : 'Diagnostic Tool',
                    serialNumber: i.serialNumber ? String(i.serialNumber).trim() : '',
                    assetTag: i.assetTag ? String(i.assetTag).trim() : '',
                    issueDate: i.issueDate ? String(i.issueDate).trim() : '',
                    returnDate: i.returnDate ? String(i.returnDate).trim() : 'Returnable',
                    condition: i.condition || 'Good',
                    status: i.status || 'Issued',
                    issuedBy: i.issuedBy || 'Admin',
                    notes: i.notes ? String(i.notes).trim() : '',
                }))
                : [];
        }
        // Handle warranty access parsing
        if (updates.warrantyAccess !== undefined) {
            const rawWarranty = parseJsonOrValue(updates.warrantyAccess, {});
            updates.warrantyAccess = {
                enabled: Boolean(rawWarranty?.enabled),
                accessType: rawWarranty?.accessType || (rawWarranty?.enabled ? 'Custom' : 'Disabled'),
                divisionScope: Array.isArray(rawWarranty?.divisionScope) ? rawWarranty.divisionScope : ['All'],
                permissions: {
                    registration: Boolean(rawWarranty?.permissions?.registration),
                    verification: Boolean(rawWarranty?.permissions?.verification),
                    claim: Boolean(rawWarranty?.permissions?.claim),
                    claimApproval: Boolean(rawWarranty?.permissions?.claimApproval),
                    check: Boolean(rawWarranty?.permissions?.check),
                    customerRecords: Boolean(rawWarranty?.permissions?.customerRecords),
                    voidWarranty: Boolean(rawWarranty?.permissions?.voidWarranty),
                },
            };
        }
        // Handle permissions parsing
        if (updates.permissions !== undefined) {
            updates.permissions = parseJsonOrValue(updates.permissions, updates.permissions);
        }
        // Update barcode if employeeId changed
        if (updates.employeeId) {
            updates.barcode = (0, barcode_1.generateBarcodeSVG)(updates.employeeId.trim());
        }
        let employee = null;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            employee = await Employee_1.Employee.findByIdAndUpdate(id, updates, { new: true });
        }
        if (!employee) {
            employee = await Employee_1.Employee.findOneAndUpdate({ $or: [{ employeeId: id }, { email: id }] }, updates, { new: true });
        }
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        const safeEmployee = employee.toObject();
        delete safeEmployee.password;
        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: safeEmployee,
        });
    }
    catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to update employee' });
    }
};
exports.updateEmployee = updateEmployee;
const toggleEmployeeStatus = async (req, res) => {
    try {
        const id = String(req.params.id);
        let employee = null;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            employee = await Employee_1.Employee.findById(id);
        }
        if (!employee) {
            employee = await Employee_1.Employee.findOne({ $or: [{ employeeId: id }, { email: id }] });
        }
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        employee.status = employee.status === 'Active' ? 'Inactive' : 'Active';
        await employee.save();
        res.json({
            success: true,
            message: `Employee ${employee.status === 'Active' ? 'activated' : 'deactivated'} successfully`,
            data: employee,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle employee status' });
    }
};
exports.toggleEmployeeStatus = toggleEmployeeStatus;
const deleteEmployee = async (req, res) => {
    try {
        const id = String(req.params.id);
        let employee = null;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            employee = await Employee_1.Employee.findByIdAndDelete(id);
        }
        if (!employee) {
            employee = await Employee_1.Employee.findOneAndDelete({ $or: [{ employeeId: id }, { email: id }] });
        }
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.json({ success: true, message: 'Employee deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete employee' });
    }
};
exports.deleteEmployee = deleteEmployee;
// Excel / CSV Export Endpoint
const exportEmployees = async (req, res) => {
    try {
        const { department, division, status, search } = req.query;
        const query = {};
        if (department && department !== 'All')
            query.department = department;
        if (division && division !== 'All')
            query.division = division;
        if (status && status !== 'All')
            query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } },
            ];
        }
        const employees = await Employee_1.Employee.find(query).sort({ createdAt: -1 });
        // Format CSV lines
        const headers = [
            'Employee ID',
            'Employee Name',
            'Email',
            'Mobile',
            'Department',
            'Section',
            'Designation',
            'Role',
            'Status',
            'Certificates Count',
            'Certificates Details',
            'Equipment & Assets Given Count',
            'Equipment & Assets Given Details',
            'Warranty Access Tier',
            'Warranty Scope',
            'Warranty Permissions',
            'Address',
            'Date Added',
            'Last Updated',
        ];
        const escapeCsv = (str) => {
            if (str === null || str === undefined)
                return '""';
            const s = String(str).replace(/"/g, '""');
            return `"${s}"`;
        };
        const rows = employees.map((emp) => {
            const warrantyTier = emp.warrantyAccess?.enabled ? (emp.warrantyAccess?.accessType || 'Authorized') : 'Disabled';
            const scope = emp.warrantyAccess?.divisionScope?.join('; ') || 'All';
            const perms = [];
            if (emp.warrantyAccess?.permissions?.registration)
                perms.push('Registration');
            if (emp.warrantyAccess?.permissions?.verification)
                perms.push('Verification');
            if (emp.warrantyAccess?.permissions?.claim)
                perms.push('Claim Filing');
            if (emp.warrantyAccess?.permissions?.claimApproval)
                perms.push('Claim Approval');
            if (emp.warrantyAccess?.permissions?.check)
                perms.push('Serial Check');
            if (emp.warrantyAccess?.permissions?.customerRecords)
                perms.push('Customer Records');
            if (emp.warrantyAccess?.permissions?.voidWarranty)
                perms.push('Voiding');
            const certs = emp.certificates || [];
            const certTitles = certs.map((c) => `${c.title} (${c.verificationStatus || 'Verified'})`).join('; ');
            const items = emp.issuedItems || [];
            const itemTitles = items.map((i) => `${i.name} [${i.category || 'Asset'}${i.serialNumber ? ` - ${i.serialNumber}` : ''}] (${i.condition || 'Good'})`).join('; ');
            return [
                escapeCsv(emp.employeeId),
                escapeCsv(emp.name),
                escapeCsv(emp.email),
                escapeCsv(emp.mobile),
                escapeCsv(emp.department),
                escapeCsv(emp.section || ''),
                escapeCsv(emp.designation || ''),
                escapeCsv(emp.role),
                escapeCsv(emp.status),
                escapeCsv(certs.length),
                escapeCsv(certTitles || 'None'),
                escapeCsv(items.length),
                escapeCsv(itemTitles || 'None'),
                escapeCsv(warrantyTier),
                escapeCsv(scope),
                escapeCsv(perms.join(', ') || 'None'),
                escapeCsv(emp.address || ''),
                escapeCsv(emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : ''),
                escapeCsv(emp.updatedAt ? new Date(emp.updatedAt).toLocaleDateString() : ''),
            ].join(',');
        });
        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
        const filename = `Ekosmart_Employees_Export_${new Date().toISOString().slice(0, 10)}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(csvContent);
    }
    catch (error) {
        console.error('Error exporting employees:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export employee list',
        });
    }
};
exports.exportEmployees = exportEmployees;
// Number to Words Converter for Indian Rupee Payslips
const convertNumberToWords = (num) => {
    if (!num || isNaN(num))
        return 'Zero Rupees Only';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const inWords = (n) => {
        if (n < 20)
            return a[n];
        const digit = n % 10;
        if (n < 100)
            return b[Math.floor(n / 10)] + (digit ? '-' + a[digit] : ' ');
        if (n < 1000)
            return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 === 0 ? '' : 'and ' + inWords(n % 100));
        if (n < 100000)
            return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
        if (n < 10000000)
            return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
        return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
    };
    const integerPart = Math.floor(Math.abs(num));
    const words = inWords(integerPart).trim();
    return words ? `${words} Rupees Only` : 'Zero Rupees Only';
};
exports.convertNumberToWords = convertNumberToWords;
// ============================================================================
// SALARY & PAYSLIP CONTROLLERS (INDIVIDUAL & SOFT-CODED)
// ============================================================================
// GET /api/v1/employees/:id/salary - Get individual employee's salary structure
const getEmployeeSalary = async (req, res) => {
    try {
        const id = String(req.params.id);
        let employee = null;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            employee = await Employee_1.Employee.findById(id);
        }
        if (!employee) {
            employee = await Employee_1.Employee.findOne({ employeeId: id });
        }
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        const defaultSalaryStructure = {
            basicSalary: 25000,
            allowances: [
                { key: 'hra', label: 'House Rent Allowance (HRA)', amount: 10000 },
                { key: 'conveyance', label: 'Conveyance Allowance', amount: 3000 },
                { key: 'special', label: 'Special / Performance Allowance', amount: 5000 },
            ],
            deductions: [
                { key: 'pf', label: 'Provident Fund (EPF 12%)', amount: 1800 },
                { key: 'esi', label: 'ESI Contribution', amount: 500 },
                { key: 'pt', label: 'Professional Tax (PT)', amount: 200 },
            ],
            bonuses: [],
            bankDetails: {
                bankName: 'HDFC Bank Ltd',
                accountNumber: '',
                ifscCode: 'HDFC0001234',
                branch: 'Kota Industrial Area',
                upiId: '',
                pan: '',
                uan: '',
                pfNumber: '',
                esicNumber: '',
            },
            effectiveDate: employee.createdAt || new Date(),
        };
        const salaryStructure = employee.salaryStructure || defaultSalaryStructure;
        // Fetch recent payslips for this employee
        const recentPayslips = await PayrollRecord_1.PayrollRecord.find({
            $or: [{ employee: employee._id }, { employeeId: employee.employeeId }],
        }).sort({ payYear: -1, payMonth: -1 }).limit(12);
        res.json({
            success: true,
            data: {
                employee: {
                    _id: employee._id,
                    employeeId: employee.employeeId,
                    name: employee.name,
                    department: employee.department,
                    designation: employee.designation,
                    division: employee.division,
                    mobile: employee.mobile,
                    email: employee.email,
                },
                salaryStructure,
                recentPayslips,
            },
        });
    }
    catch (error) {
        console.error('Error fetching employee salary:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch salary details', error: error.message });
    }
};
exports.getEmployeeSalary = getEmployeeSalary;
// PUT /api/v1/employees/:id/salary - Update employee's salary structure (Admin only)
const updateEmployeeSalary = async (req, res) => {
    try {
        const id = String(req.params.id);
        const body = req.body || {};
        const salaryStructure = body.salaryStructure || body;
        if (!salaryStructure || typeof salaryStructure !== 'object') {
            return res.status(400).json({ success: false, message: 'Salary structure payload is required.' });
        }
        let employee = null;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            employee = await Employee_1.Employee.findById(id);
        }
        if (!employee) {
            employee = await Employee_1.Employee.findOne({ employeeId: id });
        }
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        const basicSalary = Number(salaryStructure.basicSalary ?? salaryStructure.earnings?.basicSalary ?? 24000);
        const allowList = [];
        if (Array.isArray(salaryStructure.allowances)) {
            salaryStructure.allowances.forEach((a) => {
                allowList.push({
                    key: a.key || a.label?.toLowerCase().replace(/\s+/g, '_') || 'allowance',
                    label: a.label || a.key || 'Allowance',
                    amount: Number(a.amount) || 0,
                });
            });
        }
        else if (salaryStructure.earnings && typeof salaryStructure.earnings === 'object') {
            const e = salaryStructure.earnings;
            if (e.hra !== undefined)
                allowList.push({ key: 'hra', label: 'House Rent Allowance (HRA)', amount: Number(e.hra) || 0 });
            if (e.conveyance !== undefined)
                allowList.push({ key: 'conveyance', label: 'Conveyance Allowance', amount: Number(e.conveyance) || 0 });
            if (e.specialAllowance !== undefined)
                allowList.push({ key: 'specialAllowance', label: 'Special / Tech Allowance', amount: Number(e.specialAllowance) || 0 });
            if (e.overtime !== undefined)
                allowList.push({ key: 'overtime', label: 'Overtime & Field Pay', amount: Number(e.overtime) || 0 });
            if (e.arrears !== undefined)
                allowList.push({ key: 'arrears', label: 'Arrears / Past Adjustments', amount: Number(e.arrears) || 0 });
        }
        const dedList = [];
        if (Array.isArray(salaryStructure.deductions)) {
            salaryStructure.deductions.forEach((d) => {
                dedList.push({
                    key: d.key || d.label?.toLowerCase().replace(/\s+/g, '_') || 'deduction',
                    label: d.label || d.key || 'Deduction',
                    amount: Number(d.amount) || 0,
                });
            });
        }
        else if (salaryStructure.deductions && typeof salaryStructure.deductions === 'object') {
            const d = salaryStructure.deductions;
            if (d.epf !== undefined)
                dedList.push({ key: 'epf', label: 'Provident Fund (EPF)', amount: Number(d.epf) || 0 });
            if (d.esi !== undefined)
                dedList.push({ key: 'esi', label: 'ESI Contribution', amount: Number(d.esi) || 0 });
            if (d.professionalTax !== undefined)
                dedList.push({ key: 'professionalTax', label: 'Professional Tax (PT)', amount: Number(d.professionalTax) || 0 });
            if (d.tds !== undefined)
                dedList.push({ key: 'tds', label: 'TDS / Income Tax', amount: Number(d.tds) || 0 });
            if (d.advance !== undefined)
                dedList.push({ key: 'advance', label: 'Salary Advance Recovery', amount: Number(d.advance) || 0 });
            if (d.lateDeduction !== undefined)
                dedList.push({ key: 'lateDeduction', label: 'Late / Absence Deduction', amount: Number(d.lateDeduction) || 0 });
            if (d.loan !== undefined)
                dedList.push({ key: 'loan', label: 'Loan / Asset EMI', amount: Number(d.loan) || 0 });
            if (d.otherDeductions !== undefined)
                dedList.push({ key: 'otherDeductions', label: 'Other Deductions', amount: Number(d.otherDeductions) || 0 });
        }
        const bonusList = [];
        if (Array.isArray(salaryStructure.bonuses)) {
            salaryStructure.bonuses.forEach((b) => {
                bonusList.push({
                    key: b.key || 'bonus',
                    label: b.label || 'Bonus',
                    amount: Number(b.amount) || 0,
                });
            });
        }
        else if (salaryStructure.earnings?.bonus) {
            bonusList.push({ key: 'bonus', label: 'Performance Bonus', amount: Number(salaryStructure.earnings.bonus) || 0 });
        }
        employee.salaryStructure = {
            basicSalary,
            allowances: allowList,
            deductions: dedList,
            bonuses: bonusList,
            bankDetails: salaryStructure.bankDetails || employee.salaryStructure?.bankDetails || {},
            effectiveDate: salaryStructure.effectiveDate ? new Date(salaryStructure.effectiveDate) : new Date(),
            notes: salaryStructure.notes || '',
        };
        await employee.save();
        res.json({
            success: true,
            message: `Salary structure for ${employee.name} updated successfully.`,
            data: employee.salaryStructure,
        });
    }
    catch (error) {
        console.error('Error updating employee salary:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to update salary structure', error: error.message });
    }
};
exports.updateEmployeeSalary = updateEmployeeSalary;
// POST /api/v1/employees/:id/generate-payslip - Generate official monthly payslip (Admin)
const generateEmployeePayslip = async (req, res) => {
    try {
        const id = String(req.params.id);
        const body = req.body || {};
        let employee = null;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            employee = await Employee_1.Employee.findById(id);
        }
        if (!employee) {
            employee = await Employee_1.Employee.findOne({ employeeId: id });
        }
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        // 1. Month & Year normalization
        const MONTH_MAP = {
            january: 1,
            jan: 1,
            february: 2,
            feb: 2,
            march: 3,
            mar: 3,
            april: 4,
            apr: 4,
            may: 5,
            june: 6,
            jun: 6,
            july: 7,
            jul: 7,
            august: 8,
            aug: 8,
            september: 9,
            sep: 9,
            sept: 9,
            october: 10,
            oct: 10,
            november: 11,
            nov: 11,
            december: 12,
            dec: 12,
        };
        const MONTH_NAMES = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        let monthNum = new Date().getMonth() + 1;
        let rawMonthStr = '';
        if (body.payMonth !== undefined && !isNaN(Number(body.payMonth))) {
            monthNum = Number(body.payMonth);
        }
        else if (body.month !== undefined) {
            if (typeof body.month === 'number') {
                monthNum = body.month;
            }
            else if (typeof body.month === 'string') {
                const cleanMonth = body.month.trim().toLowerCase();
                rawMonthStr = body.month.trim();
                if (MONTH_MAP[cleanMonth]) {
                    monthNum = MONTH_MAP[cleanMonth];
                }
                else if (!isNaN(Number(cleanMonth))) {
                    monthNum = Number(cleanMonth);
                }
            }
        }
        // Clamp month between 1 and 12
        if (monthNum < 1 || monthNum > 12)
            monthNum = new Date().getMonth() + 1;
        const monthName = rawMonthStr || MONTH_NAMES[monthNum - 1] || 'Current Month';
        const yearNum = Number(body.payYear || body.year) || new Date().getFullYear();
        const periodStr = body.payPeriod || `${monthName} ${yearNum}`;
        // 2. Working days and attendance
        const totalWorkingDays = Number(body.totalWorkingDays ?? body.workingDays ?? 30);
        const paidDays = Number(body.paidDays ?? body.presentDays ?? totalWorkingDays);
        const leaveDays = Number(body.leaveDays ?? Math.max(0, totalWorkingDays - paidDays));
        const overtimeHours = Number(body.overtimeHours ?? 0);
        // 3. Earnings & Basic Pay
        const base = Number(body.basicSalary ?? body.earnings?.basicSalary ?? employee.salaryStructure?.basicSalary ?? 24000);
        const allowList = [];
        const bonusList = [];
        const otherList = [];
        if (Array.isArray(body.allowances) && body.allowances.length > 0) {
            body.allowances.forEach((a) => {
                allowList.push({
                    key: a.key || a.label?.toLowerCase().replace(/\s+/g, '_') || 'allowance',
                    label: a.label || a.key || 'Allowance',
                    amount: Number(a.amount) || 0,
                });
            });
        }
        else if (body.earnings && typeof body.earnings === 'object') {
            const e = body.earnings;
            if (e.hra !== undefined)
                allowList.push({ key: 'hra', label: 'House Rent Allowance (HRA)', amount: Number(e.hra) || 0 });
            if (e.conveyance !== undefined)
                allowList.push({ key: 'conveyance', label: 'Conveyance Allowance', amount: Number(e.conveyance) || 0 });
            if (e.specialAllowance !== undefined)
                allowList.push({ key: 'specialAllowance', label: 'Special / Tech Allowance', amount: Number(e.specialAllowance) || 0 });
            if (e.overtime !== undefined)
                allowList.push({ key: 'overtime', label: 'Overtime & Field Pay', amount: Number(e.overtime) || 0 });
            if (e.arrears !== undefined)
                allowList.push({ key: 'arrears', label: 'Arrears / Past Adjustments', amount: Number(e.arrears) || 0 });
            if (e.bonus !== undefined && Number(e.bonus) > 0)
                bonusList.push({ key: 'bonus', label: 'Performance Bonus', amount: Number(e.bonus) || 0 });
            if (e.otherEarnings !== undefined && Number(e.otherEarnings) > 0)
                otherList.push({ key: 'otherEarnings', label: 'Other Earnings', amount: Number(e.otherEarnings) || 0 });
        }
        else if (Array.isArray(employee.salaryStructure?.allowances)) {
            employee.salaryStructure.allowances.forEach((a) => {
                allowList.push({
                    key: a.key || 'allowance',
                    label: a.label || 'Allowance',
                    amount: Number(a.amount) || 0,
                });
            });
        }
        if (Array.isArray(body.bonuses)) {
            body.bonuses.forEach((b) => {
                bonusList.push({
                    key: b.key || 'bonus',
                    label: b.label || 'Bonus',
                    amount: Number(b.amount) || 0,
                });
            });
        }
        if (Array.isArray(body.otherEarnings)) {
            body.otherEarnings.forEach((o) => {
                otherList.push({
                    key: o.key || 'other',
                    label: o.label || 'Other Earning',
                    amount: Number(o.amount) || 0,
                });
            });
        }
        const totalAllowances = allowList.reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
        const totalBonuses = bonusList.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
        const totalOther = otherList.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);
        const grossEarnings = base + totalAllowances + totalBonuses + totalOther;
        // 4. Deductions
        const dedList = [];
        if (Array.isArray(body.deductions) && body.deductions.length > 0) {
            body.deductions.forEach((d) => {
                dedList.push({
                    key: d.key || d.label?.toLowerCase().replace(/\s+/g, '_') || 'deduction',
                    label: d.label || d.key || 'Deduction',
                    amount: Number(d.amount) || 0,
                });
            });
        }
        else if (body.deductions && typeof body.deductions === 'object') {
            const d = body.deductions;
            if (d.epf !== undefined)
                dedList.push({ key: 'epf', label: 'Provident Fund (EPF)', amount: Number(d.epf) || 0 });
            if (d.esi !== undefined)
                dedList.push({ key: 'esi', label: 'ESI Contribution', amount: Number(d.esi) || 0 });
            if (d.professionalTax !== undefined)
                dedList.push({ key: 'professionalTax', label: 'Professional Tax (PT)', amount: Number(d.professionalTax) || 0 });
            if (d.tds !== undefined)
                dedList.push({ key: 'tds', label: 'TDS / Income Tax', amount: Number(d.tds) || 0 });
            if (d.advance !== undefined)
                dedList.push({ key: 'advance', label: 'Salary Advance Recovery', amount: Number(d.advance) || 0 });
            if (d.lateDeduction !== undefined)
                dedList.push({ key: 'lateDeduction', label: 'Late / Absence Deduction', amount: Number(d.lateDeduction) || 0 });
            if (d.loan !== undefined)
                dedList.push({ key: 'loan', label: 'Loan / Asset EMI', amount: Number(d.loan) || 0 });
            if (d.otherDeductions !== undefined)
                dedList.push({ key: 'otherDeductions', label: 'Other Deductions', amount: Number(d.otherDeductions) || 0 });
        }
        else if (Array.isArray(employee.salaryStructure?.deductions)) {
            employee.salaryStructure.deductions.forEach((d) => {
                dedList.push({
                    key: d.key || 'deduction',
                    label: d.label || 'Deduction',
                    amount: Number(d.amount) || 0,
                });
            });
        }
        const totalDeductions = dedList.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
        const netSalary = Math.max(0, grossEarnings - totalDeductions);
        const amountInWords = (0, exports.convertNumberToWords)(netSalary);
        // 5. Unique Payslip Number
        const dateCode = `${yearNum}${monthNum.toString().padStart(2, '0')}`;
        const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const payslipNumber = `EBS-PAY-${employee.employeeId}-${dateCode}-${randSuffix}`;
        const adminUser = req.user;
        const adminName = adminUser?.name || 'Super Admin';
        // 6. Bank Details normalization
        const mergedBank = {
            ...(employee.salaryStructure?.bankDetails || {}),
            ...(body.bankDetails || {}),
            bankName: body.bankDetails?.bankName || employee.salaryStructure?.bankDetails?.bankName || '',
            accountNumber: body.bankDetails?.accountNumber || body.bankDetails?.bankAccount || employee.salaryStructure?.bankDetails?.accountNumber || '',
            ifscCode: body.bankDetails?.ifscCode || employee.salaryStructure?.bankDetails?.ifscCode || '',
            pan: body.bankDetails?.pan || body.bankDetails?.panNumber || employee.salaryStructure?.bankDetails?.pan || '',
            panNumber: body.bankDetails?.panNumber || body.bankDetails?.pan || employee.salaryStructure?.bankDetails?.pan || '',
            uan: body.bankDetails?.uan || body.bankDetails?.uanNumber || employee.salaryStructure?.bankDetails?.uan || '',
            uanNumber: body.bankDetails?.uanNumber || body.bankDetails?.uan || employee.salaryStructure?.bankDetails?.uan || '',
            paymentMode: body.bankDetails?.paymentMode || body.paymentMode || 'Bank Transfer',
        };
        // Dictionary format for frontend compatibility
        const earningsDict = {
            basicSalary: base,
            hra: allowList.find((a) => a.key === 'hra')?.amount || 0,
            conveyance: allowList.find((a) => a.key === 'conveyance')?.amount || 0,
            specialAllowance: allowList.find((a) => a.key === 'specialAllowance')?.amount || 0,
            overtime: allowList.find((a) => a.key === 'overtime')?.amount || 0,
            arrears: allowList.find((a) => a.key === 'arrears')?.amount || 0,
            bonus: bonusList.reduce((acc, b) => acc + (b.amount || 0), 0),
            otherEarnings: otherList.reduce((acc, o) => acc + (o.amount || 0), 0),
        };
        const deductionsDict = {
            epf: dedList.find((d) => d.key === 'epf')?.amount || 0,
            esi: dedList.find((d) => d.key === 'esi')?.amount || 0,
            professionalTax: dedList.find((d) => d.key === 'professionalTax' || d.key === 'professional_tax')?.amount || 0,
            tds: dedList.find((d) => d.key === 'tds')?.amount || 0,
            advance: dedList.find((d) => d.key === 'advance' || d.key === 'salary_advance')?.amount || 0,
            lateDeduction: dedList.find((d) => d.key === 'lateDeduction' || d.key === 'late_deduction')?.amount || 0,
            loan: dedList.find((d) => d.key === 'loan' || d.key === 'loan_recovery')?.amount || 0,
            otherDeductions: dedList.find((d) => d.key === 'otherDeductions' || d.key === 'other_deductions')?.amount || 0,
        };
        // Create persistent historical payroll record
        const payslip = await PayrollRecord_1.PayrollRecord.create({
            payslipNumber,
            employeeId: employee.employeeId,
            employee: employee._id,
            employeeName: employee.name,
            department: employee.department || 'Technical',
            designation: employee.designation || 'Staff',
            division: (employee.division && employee.division[0]) || employee.department || 'Kota Plant',
            payPeriod: periodStr,
            payMonth: monthNum,
            payYear: yearNum,
            month: monthName,
            year: yearNum,
            payDate: new Date(),
            effectiveDate: new Date(),
            totalWorkingDays,
            workingDays: totalWorkingDays,
            paidDays,
            presentDays: paidDays,
            leaveDays,
            overtimeHours,
            basicSalary: base,
            allowances: allowList,
            deductions: dedList,
            bonuses: bonusList,
            otherEarnings: otherList,
            earnings: earningsDict,
            deductionsSummary: deductionsDict,
            grossEarnings,
            totalDeductions,
            netSalary,
            amountInWords,
            paymentMode: body.paymentMode || mergedBank.paymentMode || 'Bank Transfer',
            paymentStatus: body.paymentStatus || 'Paid',
            status: body.status || 'Issued',
            bankDetails: mergedBank,
            authorizedBy: body.authorizedBy || 'HR & Finance Director',
            notes: body.notes || '',
            isPublishedToEmployee: body.isPublishedToEmployee !== false,
            history: [
                {
                    action: 'Created & Issued',
                    updatedBy: adminName,
                    updatedAt: new Date(),
                    remarks: `Official salary payslip generated for ${periodStr} (Net: ₹${netSalary.toLocaleString('en-IN')})`,
                },
            ],
        });
        res.status(201).json({
            success: true,
            message: `Payslip generated successfully for ${employee.name} (${periodStr}).`,
            data: payslip,
        });
    }
    catch (error) {
        console.error('Error generating payslip:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to generate payslip', error: error.message });
    }
};
exports.generateEmployeePayslip = generateEmployeePayslip;
// GET /api/v1/employees/:id/payslips - Get payslip history for a single employee (Admin)
const getEmployeePayslips = async (req, res) => {
    try {
        const id = String(req.params.id);
        let employee = null;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            employee = await Employee_1.Employee.findById(id);
        }
        if (!employee) {
            employee = await Employee_1.Employee.findOne({ employeeId: id });
        }
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        const { dateFilter, startDate, endDate, year } = req.query;
        const query = {
            $or: [{ employee: employee._id }, { employeeId: employee.employeeId }],
        };
        if (year)
            query.payYear = Number(year);
        (0, dateRange_1.applyDateFilterToQuery)(query, 'payDate', dateFilter, startDate, endDate);
        const payslips = await PayrollRecord_1.PayrollRecord.find(query).sort({ payYear: -1, payMonth: -1, createdAt: -1 });
        res.json({
            success: true,
            data: payslips,
            employee: {
                _id: employee._id,
                employeeId: employee.employeeId,
                name: employee.name,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch payslips', error: error.message });
    }
};
exports.getEmployeePayslips = getEmployeePayslips;
// GET /api/v1/employees/payslips/all - List all payslips across employees (Admin)
const getAllPayslips = async (req, res) => {
    try {
        const { department, paymentStatus, search, dateFilter, startDate, endDate, year, limit } = req.query;
        const query = {};
        if (department && department !== 'All')
            query.department = department;
        if (paymentStatus && paymentStatus !== 'All')
            query.paymentStatus = paymentStatus;
        if (year)
            query.payYear = Number(year);
        (0, dateRange_1.applyDateFilterToQuery)(query, 'payDate', dateFilter, startDate, endDate);
        if (search) {
            const s = search.trim();
            query.$or = [
                { employeeName: { $regex: s, $options: 'i' } },
                { employeeId: { $regex: s, $options: 'i' } },
                { payslipNumber: { $regex: s, $options: 'i' } },
                { payPeriod: { $regex: s, $options: 'i' } },
            ];
        }
        const max = Math.min(200, Number(limit) || 100);
        const payslips = await PayrollRecord_1.PayrollRecord.find(query).sort({ createdAt: -1 }).limit(max);
        const totalDisbursed = payslips.reduce((acc, p) => acc + (p.netSalary || 0), 0);
        res.json({
            success: true,
            data: payslips,
            meta: {
                totalRecords: payslips.length,
                totalDisbursed,
            },
        });
    }
    catch (error) {
        console.error('Failed to get all payslips:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve payslip list', error: error.message });
    }
};
exports.getAllPayslips = getAllPayslips;
// GET /api/v1/employees/me/payslips - Employee self-service: View own payslips only
const getMyPayslips = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
        }
        // Resolve employee
        let employee = null;
        if (user.employeeId) {
            employee = await Employee_1.Employee.findOne({ employeeId: user.employeeId });
        }
        if (!employee && user.id && mongoose_1.default.Types.ObjectId.isValid(user.id)) {
            employee = await Employee_1.Employee.findById(user.id);
        }
        if (!employee && user.email) {
            employee = await Employee_1.Employee.findOne({ email: user.email });
        }
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }
        const { dateFilter, startDate, endDate, year } = req.query;
        const query = {
            $or: [{ employee: employee._id }, { employeeId: employee.employeeId }],
            isPublishedToEmployee: true,
        };
        if (year)
            query.payYear = Number(year);
        (0, dateRange_1.applyDateFilterToQuery)(query, 'payDate', dateFilter, startDate, endDate);
        const payslips = await PayrollRecord_1.PayrollRecord.find(query).sort({ payYear: -1, payMonth: -1, createdAt: -1 });
        res.json({
            success: true,
            data: payslips,
            employee: {
                _id: employee._id,
                employeeId: employee.employeeId,
                name: employee.name,
                department: employee.department,
                designation: employee.designation,
                division: employee.division,
            },
        });
    }
    catch (error) {
        console.error('Error fetching my payslips:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve your salary slips', error: error.message });
    }
};
exports.getMyPayslips = getMyPayslips;
// GET /api/v1/employees/me/payslips/:id - Get specific payslip with authorization
const getMyPayslipById = async (req, res) => {
    try {
        const user = req.user;
        const payslipId = String(req.params.id);
        let payslip = null;
        if (mongoose_1.default.Types.ObjectId.isValid(payslipId)) {
            payslip = await PayrollRecord_1.PayrollRecord.findById(payslipId);
        }
        if (!payslip) {
            payslip = await PayrollRecord_1.PayrollRecord.findOne({ payslipNumber: payslipId });
        }
        if (!payslip) {
            return res.status(404).json({ success: false, message: 'Payslip record not found' });
        }
        // Role check: If not Admin, ensure the payslip belongs to this employee
        const userRole = (user?.role || '').toUpperCase();
        const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'].includes(userRole);
        if (!isAdmin) {
            const matchEmpId = user.employeeId && user.employeeId === payslip.employeeId;
            const matchObjId = user.id && user.id === payslip.employee?.toString();
            if (!matchEmpId && !matchObjId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: You can only view your own salary slips.',
                });
            }
        }
        res.json({ success: true, data: payslip });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch payslip details', error: error.message });
    }
};
exports.getMyPayslipById = getMyPayslipById;
// DELETE /api/v1/employees/payslips/:payslipId - Delete a payslip (Admin only)
const deletePayslip = async (req, res) => {
    try {
        const rawPayslipId = req.params.payslipId;
        const payslipId = String(Array.isArray(rawPayslipId) ? rawPayslipId[0] : rawPayslipId || '');
        let deleted = null;
        if (mongoose_1.default.Types.ObjectId.isValid(payslipId)) {
            deleted = await PayrollRecord_1.PayrollRecord.findByIdAndDelete(payslipId);
        }
        if (!deleted) {
            deleted = await PayrollRecord_1.PayrollRecord.findOneAndDelete({ payslipNumber: payslipId });
        }
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Payslip not found' });
        }
        res.json({ success: true, message: 'Payslip record deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete payslip', error: error.message });
    }
};
exports.deletePayslip = deletePayslip;
