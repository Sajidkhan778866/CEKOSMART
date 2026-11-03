"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportWarranties = exports.getAdminWarranties = exports.checkPublicWarranty = exports.registerPublicWarranty = exports.verifyWarrantyStaff = exports.generateWarrantyNumber = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const Warranty_1 = require("../models/Warranty");
const Customer_1 = require("../models/Customer");
const Employee_1 = require("../models/Employee");
const generateWarrantyNumber = async (category) => {
    const prefix = category === 'Showroom' ? 'WAR-SHR' : 'WAR-PLT';
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Warranty_1.Warranty.countDocuments({ category });
    const seq = (count + 1).toString().padStart(4, '0');
    return `${prefix}-${dateStr}-${seq}`;
};
exports.generateWarrantyNumber = generateWarrantyNumber;
const verifyWarrantyStaff = async (req, res) => {
    try {
        const { employeeId, password } = req.body;
        if (!employeeId || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both Employee ID and Password to verify warranty authorization.',
            });
        }
        const cleanId = String(employeeId).trim();
        const escapedId = cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let employee = await Employee_1.Employee.findOne({
            $or: [
                { employeeId: { $regex: `^${escapedId}$`, $options: 'i' } },
                { email: { $regex: `^${escapedId}$`, $options: 'i' } },
            ],
        }).select('+password');
        // If demo employee not found in fresh DB, trigger seed and re-check
        if (!employee) {
            const { ensureDefaultSeedData } = await Promise.resolve().then(() => __importStar(require('../utils/autoSeed')));
            await ensureDefaultSeedData().catch(() => { });
            employee = await Employee_1.Employee.findOne({
                $or: [
                    { employeeId: { $regex: `^${escapedId}$`, $options: 'i' } },
                    { email: { $regex: `^${escapedId}$`, $options: 'i' } },
                ],
            }).select('+password');
        }
        if (!employee || !employee.password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Employee ID or password. Please check your credentials.',
            });
        }
        if (employee.status === 'Inactive') {
            return res.status(403).json({
                success: false,
                message: 'This employee account is deactivated. Please contact your system administrator.',
            });
        }
        const isMatch = (await bcrypt_1.default.compare(password, employee.password)) ||
            employee.password === password;
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password. Please check your credentials.',
            });
        }
        // Check Warranty Access in Admin Portal
        const wAccess = employee.warrantyAccess;
        const isEnabled = Boolean(wAccess?.enabled);
        const hasRegPerm = Boolean(wAccess?.permissions?.registration);
        const isAuthorizedTier = ['Registrar', 'Manager', 'Full Access', 'Inspector'].includes(wAccess?.accessType || '');
        const hasGeneralPerm = employee.permissions?.includes('warranty:manage') ||
            employee.permissions?.includes('warranty:register') ||
            employee.permissions?.includes('billing:create') ||
            employee.permissions?.includes('*') ||
            employee.role === 'Admin' ||
            employee.role === 'SuperAdmin' ||
            employee.role === 'Staff' ||
            employee.role === 'Technician';
        if (!isEnabled && !hasRegPerm && !isAuthorizedTier && !hasGeneralPerm) {
            return res.status(403).json({
                success: false,
                authorized: false,
                accessTier: wAccess?.accessType || 'Disabled',
                message: `Access Denied: Staff member "${employee.name}" (${employee.employeeId}) does not have Warranty Registration privileges enabled in Admin Portal. Access Tier: "${wAccess?.accessType || 'Disabled'}".`,
            });
        }
        return res.json({
            success: true,
            authorized: true,
            data: {
                _id: employee._id,
                employeeId: employee.employeeId,
                name: employee.name,
                email: employee.email,
                mobile: employee.mobile,
                department: employee.department,
                designation: employee.designation,
                division: employee.division,
                role: employee.role,
                warrantyAccess: employee.warrantyAccess,
            },
        });
    }
    catch (err) {
        console.error('verifyWarrantyStaff error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error during staff verification.' });
    }
};
exports.verifyWarrantyStaff = verifyWarrantyStaff;
const registerPublicWarranty = async (req, res) => {
    try {
        const { category, customerName, customerMobile, customerEmail, product, serialNumber, billNumber, billUrls, billDocuments, purchaseDate, durationMonths, formData, registeredBy, } = req.body;
        if (!category || !customerName || !customerMobile || !product || !serialNumber || !billNumber) {
            return res.status(400).json({
                success: false,
                message: 'Please provide Category (Showroom/Plant), Customer Name, Mobile, Product, Serial No, and Bill No.',
            });
        }
        if (!['Showroom', 'Plant'].includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid warranty category. Must be Showroom or Plant.',
            });
        }
        // 1. Find or create Customer
        let customer = await Customer_1.Customer.findOne({ mobile: customerMobile.trim() });
        if (!customer) {
            const customerId = `CUST-${Date.now().toString().slice(-6)}`;
            customer = await Customer_1.Customer.create({
                customerId,
                name: customerName.trim(),
                mobile: customerMobile.trim(),
                email: customerEmail ? customerEmail.trim() : undefined,
                customerType: category,
            });
        }
        // 2. Dates calculation
        const pDate = new Date(purchaseDate || Date.now());
        const startDate = new Date(pDate);
        const months = parseInt(durationMonths) || 24; // Default 24 months
        const expiryDate = new Date(startDate);
        expiryDate.setMonth(expiryDate.getMonth() + months);
        // 3. Generate Warranty Number
        const warrantyNumber = await (0, exports.generateWarrantyNumber)(category);
        const now = new Date();
        let status = 'Active';
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry < 0) {
            status = 'Expired';
        }
        else if (daysUntilExpiry <= 30) {
            status = 'Expiring Soon';
        }
        const billList = Array.isArray(billUrls) ? billUrls : [];
        const formattedDocs = Array.isArray(billDocuments) && billDocuments.length > 0
            ? billDocuments
            : billList.map((url, i) => ({
                pageNumber: i + 1,
                url,
                name: `Invoice Page ${i + 1}`,
                fileType: url.startsWith('data:application/pdf') ? 'pdf' : 'image',
            }));
        const warranty = await Warranty_1.Warranty.create({
            warrantyNumber,
            category,
            customer: customer._id,
            product: product.trim(),
            serialNumber: serialNumber.trim(),
            billNumber: billNumber.trim(),
            billUrls: billList,
            billDocuments: formattedDocs,
            purchaseDate: pDate,
            warrantyStartDate: startDate,
            warrantyExpiryDate: expiryDate,
            status,
            formData: formData || {},
            registeredBy: registeredBy || undefined,
        });
        res.status(201).json({
            success: true,
            message: 'Warranty registered successfully!',
            data: {
                warrantyNumber: warranty.warrantyNumber,
                product: warranty.product,
                category: warranty.category,
                expiryDate: warranty.warrantyExpiryDate,
                status: warranty.status,
                registeredBy: warranty.registeredBy,
            },
        });
    }
    catch (error) {
        console.error('Warranty register error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to register warranty' });
    }
};
exports.registerPublicWarranty = registerPublicWarranty;
const checkPublicWarranty = async (req, res) => {
    try {
        const { identifier } = req.query;
        if (!identifier) {
            return res.status(400).json({ success: false, message: 'Please provide a search identifier.' });
        }
        const searchStr = identifier.trim();
        // Search by warrantyNumber, serialNumber, billNumber, or customer mobile
        const customer = await Customer_1.Customer.findOne({ mobile: searchStr });
        const query = {
            $or: [
                { warrantyNumber: { $regex: searchStr, $options: 'i' } },
                { serialNumber: { $regex: searchStr, $options: 'i' } },
                { billNumber: { $regex: searchStr, $options: 'i' } },
            ],
        };
        if (customer) {
            query.$or.push({ customer: customer._id });
        }
        const warranties = await Warranty_1.Warranty.find(query)
            .populate('customer', 'name mobile')
            .sort({ createdAt: -1 });
        if (warranties.length === 0) {
            return res.status(404).json({ success: false, message: 'No warranty record found matching your query.' });
        }
        const results = warranties.map((w) => {
            const now = new Date();
            const expiry = new Date(w.warrantyExpiryDate);
            const remainingDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            let computedStatus = w.status;
            if (remainingDays < 0)
                computedStatus = 'Expired';
            else if (remainingDays <= 30)
                computedStatus = 'Expiring Soon';
            else
                computedStatus = 'Active';
            return {
                warrantyNumber: w.warrantyNumber,
                category: w.category,
                product: w.product,
                serialNumber: w.serialNumber,
                purchaseDate: w.purchaseDate,
                warrantyStartDate: w.warrantyStartDate,
                warrantyExpiryDate: w.warrantyExpiryDate,
                status: computedStatus,
                remainingDays: Math.max(0, remainingDays),
                customerName: w.customer?.name,
            };
        });
        res.json({ success: true, data: results });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error checking warranty' });
    }
};
exports.checkPublicWarranty = checkPublicWarranty;
const getAdminWarranties = async (req, res) => {
    try {
        const { category, status, search, startDate, endDate } = req.query;
        const query = {};
        if (category && category !== 'All')
            query.category = category;
        if (status && status !== 'All')
            query.status = status;
        if (startDate || endDate) {
            query.purchaseDate = {};
            if (startDate) {
                query.purchaseDate.$gte = new Date(startDate);
            }
            if (endDate) {
                const e = new Date(endDate);
                e.setHours(23, 59, 59, 999);
                query.purchaseDate.$lte = e;
            }
        }
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
                { warrantyNumber: { $regex: searchStr, $options: 'i' } },
                { serialNumber: { $regex: searchStr, $options: 'i' } },
                { billNumber: { $regex: searchStr, $options: 'i' } },
                { product: { $regex: searchStr, $options: 'i' } },
                { category: { $regex: searchStr, $options: 'i' } },
                { status: { $regex: searchStr, $options: 'i' } },
            ];
            if (customerIds.length > 0) {
                searchConditions.push({ customer: { $in: customerIds } });
            }
            query.$or = searchConditions;
        }
        const warranties = await Warranty_1.Warranty.find(query)
            .populate('customer', 'customerId name mobile email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: warranties });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch warranties' });
    }
};
exports.getAdminWarranties = getAdminWarranties;
const exportWarranties = async (req, res) => {
    try {
        const { category, status, search, startDate, endDate, datePreset } = req.query;
        const query = {};
        if (category && category !== 'All')
            query.category = category;
        if (status && status !== 'All')
            query.status = status;
        // Date range filtering
        if (startDate || endDate) {
            query.purchaseDate = {};
            if (startDate) {
                query.purchaseDate.$gte = new Date(startDate);
            }
            if (endDate) {
                const e = new Date(endDate);
                e.setHours(23, 59, 59, 999);
                query.purchaseDate.$lte = e;
            }
        }
        else if (datePreset) {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (datePreset === 'today') {
                const endOfDay = new Date(startOfDay);
                endOfDay.setHours(23, 59, 59, 999);
                query.purchaseDate = { $gte: startOfDay, $lte: endOfDay };
            }
            else if (datePreset === 'yesterday') {
                const yStart = new Date(startOfDay);
                yStart.setDate(yStart.getDate() - 1);
                const yEnd = new Date(yStart);
                yEnd.setHours(23, 59, 59, 999);
                query.purchaseDate = { $gte: yStart, $lte: yEnd };
            }
            else if (datePreset === 'last7days' || datePreset === '7days') {
                const past = new Date(startOfDay);
                past.setDate(past.getDate() - 7);
                query.purchaseDate = { $gte: past };
            }
            else if (datePreset === 'last30days' || datePreset === '30days') {
                const past = new Date(startOfDay);
                past.setDate(past.getDate() - 30);
                query.purchaseDate = { $gte: past };
            }
            else if (datePreset === 'thismonth' || datePreset === 'thisMonth') {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                query.purchaseDate = { $gte: firstDay };
            }
        }
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
                { warrantyNumber: { $regex: searchStr, $options: 'i' } },
                { serialNumber: { $regex: searchStr, $options: 'i' } },
                { billNumber: { $regex: searchStr, $options: 'i' } },
                { product: { $regex: searchStr, $options: 'i' } },
                { category: { $regex: searchStr, $options: 'i' } },
                { status: { $regex: searchStr, $options: 'i' } },
            ];
            if (customerIds.length > 0) {
                searchConditions.push({ customer: { $in: customerIds } });
            }
            query.$or = searchConditions;
        }
        const warranties = await Warranty_1.Warranty.find(query)
            .populate('customer', 'customerId name mobile email')
            .sort({ createdAt: -1 });
        const headers = [
            'Warranty Number',
            'Category',
            'Product Model',
            'Serial Number',
            'Bill Number',
            'Customer ID',
            'Customer Name',
            'Customer Mobile',
            'Customer Email',
            'Purchase Date',
            'Warranty Start Date',
            'Warranty Expiry Date',
            'Status',
            'Registered By',
            'Created Date',
        ];
        const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
        const rows = warranties.map((w) => [
            escapeCsv(w.warrantyNumber),
            escapeCsv(w.category),
            escapeCsv(w.product),
            escapeCsv(w.serialNumber),
            escapeCsv(w.billNumber),
            escapeCsv(w.customer?.customerId || ''),
            escapeCsv(w.customer?.name || ''),
            escapeCsv(w.customer?.mobile || ''),
            escapeCsv(w.customer?.email || ''),
            escapeCsv(w.purchaseDate ? new Date(w.purchaseDate).toLocaleDateString('en-IN') : ''),
            escapeCsv(w.warrantyStartDate ? new Date(w.warrantyStartDate).toLocaleDateString('en-IN') : ''),
            escapeCsv(w.warrantyExpiryDate ? new Date(w.warrantyExpiryDate).toLocaleDateString('en-IN') : ''),
            escapeCsv(w.status || 'Active'),
            escapeCsv(w.registeredBy || 'Direct / System'),
            escapeCsv(w.createdAt ? new Date(w.createdAt).toLocaleDateString('en-IN') : ''),
        ]);
        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const timestamp = new Date().toISOString().slice(0, 10);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="ekosmart_warranties_export_${timestamp}.csv"`);
        return res.status(200).send(csvContent);
    }
    catch (error) {
        console.error('Export warranties error:', error);
        res.status(500).json({ success: false, message: 'Failed to export warranties' });
    }
};
exports.exportWarranties = exportWarranties;
