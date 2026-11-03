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
exports.ensureDefaultSeedData = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const Employee_1 = require("../models/Employee");
const ComplaintForm_1 = require("../models/ComplaintForm");
const WarrantyForm_1 = require("../models/WarrantyForm");
const Content_1 = require("../models/Content");
const content_controller_1 = require("../controllers/content.controller");
const barcode_1 = require("./barcode");
let seedPromise = null;
let seedCompleted = false;
/**
 * Ensures all default admin accounts, demo employee accounts, form schemas,
 * and CMS content exist in the database (critical for fresh Vercel / MongoDB Atlas deployments).
 * Completely safe and idempotent — never deletes or overwrites existing production data.
 */
const ensureDefaultSeedData = async () => {
    if (seedCompleted) {
        return;
    }
    if (seedPromise) {
        return seedPromise;
    }
    seedPromise = (async () => {
        try {
            // 1. Ensure SuperAdmin exists
            const adminEmail = (process.env.ADMIN_EMAIL || 'Smartdrive5640@gmail.com').toLowerCase().trim();
            const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Shoyab@1516';
            const existingAdmin = await User_1.User.findOne({
                email: { $regex: `^${adminEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
            });
            if (!existingAdmin) {
                await User_1.User.create({
                    name: 'Super Admin',
                    email: adminEmail,
                    password: adminPassword,
                    role: 'SuperAdmin',
                    status: 'Active',
                });
                console.log(`[AutoSeed] Default SuperAdmin created: ${adminEmail}`);
            }
            // 2. Ensure Demo Employees exist
            const demoEmployees = [
                {
                    employeeId: 'TEST-EMP-001',
                    name: 'Rajesh Sharma',
                    email: 'rajesh.tech@ekosmart.com',
                    mobile: '9876543210',
                    department: 'Technical',
                    division: ['Battery', 'Showroom'],
                    designation: 'Senior Service Engineer',
                    role: 'Technician',
                    password: 'employee123',
                    status: 'Active',
                    permissions: [
                        'billing:create',
                        'billing:view',
                        'stock:view',
                        'stock:manage',
                        'warranty:manage',
                        'complaints:manage',
                        'idcard:view',
                    ],
                    warrantyAccess: {
                        enabled: true,
                        accessType: 'Full Access',
                        divisionScope: ['All'],
                        permissions: {
                            registration: true,
                            verification: true,
                            claim: true,
                            claimApproval: true,
                            check: true,
                            customerRecords: true,
                            voidWarranty: true,
                        },
                    },
                },
                {
                    employeeId: 'EMP-REN-002',
                    name: 'Amit Patel',
                    email: 'amit.rental@ekosmart.com',
                    mobile: '9876543211',
                    department: 'Operations',
                    division: ['Rental', 'Spare Parts'],
                    designation: 'Field Operations Specialist',
                    role: 'Staff',
                    password: 'employee123',
                    status: 'Active',
                    permissions: [
                        'billing:create',
                        'billing:view',
                        'stock:view',
                        'stock:manage',
                        'warranty:manage',
                        'complaints:manage',
                        'idcard:view',
                    ],
                    warrantyAccess: {
                        enabled: true,
                        accessType: 'Registrar',
                        divisionScope: ['Rental', 'Spare Parts'],
                        permissions: {
                            registration: true,
                            verification: false,
                            claim: false,
                            claimApproval: false,
                            check: true,
                            customerRecords: true,
                            voidWarranty: false,
                        },
                    },
                },
            ];
            for (const emp of demoEmployees) {
                const existingEmp = await Employee_1.Employee.findOne({
                    $or: [
                        { employeeId: { $regex: `^${emp.employeeId}$`, $options: 'i' } },
                        { email: { $regex: `^${emp.email}$`, $options: 'i' } },
                    ],
                });
                if (!existingEmp) {
                    const salt = await bcrypt_1.default.genSalt(10);
                    const hashedPassword = await bcrypt_1.default.hash(emp.password, salt);
                    const barcode = (0, barcode_1.generateBarcodeSVG)(emp.employeeId);
                    await Employee_1.Employee.create({
                        ...emp,
                        password: hashedPassword,
                        plainPassword: emp.password,
                        barcode,
                    });
                    console.log(`[AutoSeed] Default Employee created: ${emp.employeeId} (${emp.name})`);
                }
                else {
                    let changed = false;
                    if (!existingEmp.plainPassword) {
                        existingEmp.plainPassword = emp.password;
                        changed = true;
                    }
                    if (!existingEmp.permissions || existingEmp.permissions.length === 0) {
                        existingEmp.permissions = emp.permissions;
                        changed = true;
                    }
                    if (changed) {
                        await existingEmp.save();
                    }
                }
            }
            // Backfill any other employees that lack plainPassword or permissions
            try {
                await Employee_1.Employee.updateMany({ $or: [{ plainPassword: { $exists: false } }, { plainPassword: '' }, { plainPassword: null }] }, { $set: { plainPassword: 'employee123' } });
                await Employee_1.Employee.updateMany({ $or: [{ permissions: { $exists: false } }, { permissions: { $size: 0 } }] }, {
                    $set: {
                        permissions: [
                            'billing:create',
                            'billing:view',
                            'stock:view',
                            'stock:manage',
                            'warranty:manage',
                            'complaints:manage',
                            'idcard:view',
                        ],
                    },
                });
            }
            catch {
                // Ignore
            }
            // 3. Ensure Default Complaint Forms exist
            const defaultDivisions = [
                {
                    division: 'Showroom',
                    fields: [
                        { name: 'customerName', label: 'Customer Full Name', type: 'Text', required: true, order: 1, isActive: true },
                        { name: 'customerMobile', label: 'Mobile Number', type: 'Mobile', required: true, order: 2, isActive: true },
                        { name: 'customerEmail', label: 'Email Address', type: 'Email', required: false, order: 3, isActive: true },
                        { name: 'vehicleModel', label: 'EkoRide Vehicle Model', type: 'Dropdown', options: ['EkoRide City', 'EkoRide Pro', 'EkoRide Delivery', 'EkoRide Eco'], required: true, order: 4, isActive: true },
                        { name: 'chassisNumber', label: 'Chassis / Frame Number', type: 'Text', required: true, order: 5, isActive: true },
                        { name: 'issueDescription', label: 'Detailed Description of Issue', type: 'Textarea', required: true, order: 6, isActive: true },
                    ],
                },
                {
                    division: 'Battery',
                    fields: [
                        { name: 'customerName', label: 'Customer Full Name', type: 'Text', required: true, order: 1, isActive: true },
                        { name: 'customerMobile', label: 'Mobile Number', type: 'Mobile', required: true, order: 2, isActive: true },
                        { name: 'batterySerial', label: 'Battery Serial Number', type: 'Serial Number', required: true, order: 3, isActive: true },
                        { name: 'batteryCapacity', label: 'Battery Type / Ah', type: 'Dropdown', options: ['48V 24Ah Lithium', '60V 30Ah Lithium', '72V 40Ah Lithium', '12V Lead Acid'], required: true, order: 4, isActive: true },
                        { name: 'issueType', label: 'Issue Category', type: 'Dropdown', options: ['Not Charging', 'Low Mileage / Range', 'Sudden Cutoff', 'Swelling / Heating', 'Other'], required: true, order: 5, isActive: true },
                        { name: 'issueDescription', label: 'Issue Details', type: 'Textarea', required: true, order: 6, isActive: true },
                    ],
                },
                {
                    division: 'Rental',
                    fields: [
                        { name: 'customerName', label: 'Renter Name', type: 'Text', required: true, order: 1, isActive: true },
                        { name: 'customerMobile', label: 'Registered Mobile', type: 'Mobile', required: true, order: 2, isActive: true },
                        { name: 'agreementNumber', label: 'Rental Agreement Number', type: 'Text', required: true, order: 3, isActive: true },
                        { name: 'vehicleNumber', label: 'Assigned Vehicle Reg No', type: 'Text', required: true, order: 4, isActive: true },
                        { name: 'issueDescription', label: 'Breakdown / Maintenance Details', type: 'Textarea', required: true, order: 5, isActive: true },
                    ],
                },
                {
                    division: 'Spare Parts',
                    fields: [
                        { name: 'customerName', label: 'Customer Name / Dealer', type: 'Text', required: true, order: 1, isActive: true },
                        { name: 'customerMobile', label: 'Contact Number', type: 'Mobile', required: true, order: 2, isActive: true },
                        { name: 'partNumber', label: 'Part Number / SKU', type: 'Text', required: true, order: 3, isActive: true },
                        { name: 'partName', label: 'Part Description', type: 'Text', required: true, order: 4, isActive: true },
                        { name: 'defectReason', label: 'Reason for Replacement / Defect', type: 'Textarea', required: true, order: 5, isActive: true },
                    ],
                },
            ];
            for (const item of defaultDivisions) {
                const existingForm = await ComplaintForm_1.ComplaintForm.findOne({ division: item.division });
                if (!existingForm) {
                    await ComplaintForm_1.ComplaintForm.create({
                        division: item.division,
                        fields: item.fields,
                        version: 1,
                        isActive: true,
                    });
                    console.log(`[AutoSeed] Complaint Form created for: ${item.division}`);
                }
            }
            // 4. Ensure Default Warranty Forms exist
            const defaultWarrantyForms = [
                {
                    category: 'Showroom',
                    fields: [
                        { name: 'customerName', label: 'Customer Full Name', type: 'Text', required: true, order: 1, isActive: true },
                        { name: 'customerMobile', label: 'Mobile Number', type: 'Mobile', required: true, order: 2, isActive: true },
                        { name: 'product', label: 'Vehicle / Product Model', type: 'Text', required: true, order: 3, isActive: true },
                        { name: 'serialNumber', label: 'Product / VIN Serial No', type: 'Serial Number', required: true, order: 4, isActive: true },
                        { name: 'billNumber', label: 'Invoice / Bill Number', type: 'Text', required: true, order: 5, isActive: true },
                        { name: 'purchaseDate', label: 'Date of Purchase', type: 'Date', required: true, order: 6, isActive: true },
                    ],
                },
                {
                    category: 'Plant',
                    fields: [
                        { name: 'customerName', label: 'Plant Client / Enterprise Name', type: 'Text', required: true, order: 1, isActive: true },
                        { name: 'customerMobile', label: 'Authorized Person Mobile', type: 'Mobile', required: true, order: 2, isActive: true },
                        { name: 'product', label: 'Industrial Battery / Inverter Unit', type: 'Text', required: true, order: 3, isActive: true },
                        { name: 'serialNumber', label: 'Plant Unit Serial Number', type: 'Serial Number', required: true, order: 4, isActive: true },
                        { name: 'billNumber', label: 'Commercial Invoice No', type: 'Text', required: true, order: 5, isActive: true },
                        { name: 'purchaseDate', label: 'Commissioning Date', type: 'Date', required: true, order: 6, isActive: true },
                    ],
                },
            ];
            for (const item of defaultWarrantyForms) {
                const existingForm = await WarrantyForm_1.WarrantyForm.findOne({ category: item.category });
                if (!existingForm) {
                    await WarrantyForm_1.WarrantyForm.create({
                        category: item.category,
                        fields: item.fields,
                        version: 1,
                        isActive: true,
                    });
                    console.log(`[AutoSeed] Warranty Form created for: ${item.category}`);
                }
            }
            // 5. Ensure Default CMS exists
            let content = await Content_1.Content.findOne({ key: 'global_cms' });
            if (!content) {
                await Content_1.Content.create({
                    key: 'global_cms',
                    serviceCards: content_controller_1.defaultServiceCards,
                });
                console.log('[AutoSeed] Global CMS default service cards created.');
            }
            // 6. Ensure Default Bill Templates exist
            try {
                const { BillTemplate } = await Promise.resolve().then(() => __importStar(require('../models/BillTemplate')));
                const { defaultBillTemplate } = await Promise.resolve().then(() => __importStar(require('../controllers/billing.controller')));
                const existingTemplatesCount = await BillTemplate.countDocuments();
                if (existingTemplatesCount === 0) {
                    await BillTemplate.create([
                        defaultBillTemplate,
                        {
                            ...defaultBillTemplate,
                            templateName: 'Plant Commercial Dispatch Invoice',
                            templateType: 'Plant',
                            description: 'Commercial invoice for industrial battery packs and factory dispatches',
                            isActive: false,
                            warrantyConfig: {
                                ...defaultBillTemplate.warrantyConfig,
                                title: 'Ekosmart Commercial & Plant Warranty Terms',
                                badgeText: 'INDUSTRIAL GRADE WARRANTY',
                            },
                        },
                        {
                            ...defaultBillTemplate,
                            templateName: 'EV Rental Mobility Subscription Bill',
                            templateType: 'Rental',
                            description: 'Subscription billing for EV rental plans and battery swap usage',
                            isActive: false,
                            warrantyConfig: {
                                ...defaultBillTemplate.warrantyConfig,
                                title: 'Rental Roadside & Battery Swap Assurance',
                                badgeText: 'RENTAL COVERAGE',
                            },
                        },
                        {
                            ...defaultBillTemplate,
                            templateName: 'Warranty Replacement Voucher',
                            templateType: 'Warranty',
                            description: 'Zero-rated replacement and service handover voucher',
                            isActive: false,
                            warrantyConfig: {
                                ...defaultBillTemplate.warrantyConfig,
                                title: 'Warranty Repair & Replacement Certificate',
                                badgeText: 'VERIFIED REPLACEMENT',
                            },
                        },
                    ]);
                    console.log('[AutoSeed] Default Bill Templates created (Showroom, Plant, Rental, Warranty).');
                }
            }
            catch (e) {
                console.warn('[AutoSeed] BillTemplate seed notice:', e.message);
            }
            seedCompleted = true;
        }
        catch (error) {
            console.error('[AutoSeed] Error during auto-seeding:', error.message || error);
        }
        finally {
            seedPromise = null;
        }
    })();
    return seedPromise;
};
exports.ensureDefaultSeedData = ensureDefaultSeedData;
