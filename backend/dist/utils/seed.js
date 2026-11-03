"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../config/db"));
const User_1 = require("../models/User");
const Employee_1 = require("../models/Employee");
const ComplaintForm_1 = require("../models/ComplaintForm");
const WarrantyForm_1 = require("../models/WarrantyForm");
const Content_1 = require("../models/Content");
const content_controller_1 = require("../controllers/content.controller");
const barcode_1 = require("./barcode");
dotenv_1.default.config();
const seed = async () => {
    await (0, db_1.default)();
    console.log('Database connected for seeding...');
    // 1. Seed Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'Smartdrive5640@gmail.com';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';
    let admin = await User_1.User.findOne({ email: adminEmail }).select('+password');
    if (!admin) {
        admin = await User_1.User.create({
            name: 'Super Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'SuperAdmin',
            status: 'Active',
        });
        console.log(`Admin user seeded: ${adminEmail} / ${adminPassword}`);
    }
    else {
        admin.password = adminPassword;
        await admin.save();
        console.log(`Admin password refreshed: ${adminEmail} / ${adminPassword}`);
    }
    // 2. Seed Default Forms for Complaint Divisions
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
            console.log(`Complaint Form seeded for: ${item.division}`);
        }
    }
    // 3. Seed Warranty Forms for Showroom & Plant
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
            console.log(`Warranty Form seeded for: ${item.category}`);
        }
    }
    // 4. Seed initial employees for testing
    const initialEmployees = [
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
        },
    ];
    for (const emp of initialEmployees) {
        const existing = await Employee_1.Employee.findOne({ employeeId: emp.employeeId });
        if (!existing) {
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(emp.password, salt);
            const barcode = (0, barcode_1.generateBarcodeSVG)(emp.employeeId);
            await Employee_1.Employee.create({
                employeeId: emp.employeeId,
                name: emp.name,
                email: emp.email,
                mobile: emp.mobile,
                department: emp.department,
                division: emp.division,
                designation: emp.designation,
                role: emp.role,
                password: hashedPassword,
                barcode,
                status: 'Active',
            });
            console.log(`Employee seeded: ${emp.employeeId} (${emp.name})`);
        }
    }
    // 5. Seed Default Content / CMS
    let content = await Content_1.Content.findOne({ key: 'global_cms' });
    if (!content) {
        await Content_1.Content.create({
            key: 'global_cms',
            serviceCards: content_controller_1.defaultServiceCards,
        });
        console.log('Global CMS content seeded with 6 default flash cards.');
    }
    else if (!content.serviceCards || content.serviceCards.length === 0) {
        content.serviceCards = content_controller_1.defaultServiceCards;
        await content.save();
        console.log('Global CMS service cards refreshed.');
    }
    console.log('Seeding completed successfully!');
    process.exit(0);
};
seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
