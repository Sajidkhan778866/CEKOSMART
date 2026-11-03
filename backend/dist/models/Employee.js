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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const certificateSchema = new mongoose_1.Schema({
    id: { type: String, default: () => `cert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` },
    title: { type: String, required: true },
    issuingAuthority: { type: String, default: 'Ekosmart Technical Academy' },
    certificateNumber: { type: String, default: '' },
    issueDate: { type: String, default: '' },
    expiryDate: { type: String, default: 'No Expiry' },
    verificationStatus: {
        type: String,
        enum: ['Verified', 'Pending', 'Master'],
        default: 'Verified',
    },
    certificateUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
}, { _id: false });
const issuedItemSchema = new mongoose_1.Schema({
    id: { type: String, default: () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` },
    name: { type: String, required: true },
    category: { type: String, default: 'Diagnostic Tool' },
    serialNumber: { type: String, default: '' },
    assetTag: { type: String, default: '' },
    issueDate: { type: String, default: '' },
    returnDate: { type: String, default: 'Returnable' },
    condition: {
        type: String,
        enum: ['New', 'Good', 'Refurbished', 'Needs Service'],
        default: 'Good',
    },
    status: {
        type: String,
        enum: ['Issued', 'Returned', 'Damaged', 'Audited'],
        default: 'Issued',
    },
    issuedBy: { type: String, default: 'Admin' },
    notes: { type: String, default: '' },
}, { _id: false });
const employeeSchema = new mongoose_1.Schema({
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    address: { type: String, default: '' },
    department: { type: String, required: true },
    section: { type: String, default: '' },
    division: [{ type: String }],
    designation: { type: String },
    role: { type: String, required: true },
    password: { type: String, required: true, select: false },
    plainPassword: { type: String, default: '' },
    photoUrl: { type: String },
    barcode: { type: String },
    permissions: [{ type: String }],
    certificates: [certificateSchema],
    issuedItems: [issuedItemSchema],
    warrantyAccess: {
        enabled: { type: Boolean, default: false },
        accessType: {
            type: String,
            enum: ['Disabled', 'View Only', 'Registrar', 'Inspector', 'Manager', 'Full Access', 'Custom'],
            default: 'Disabled',
        },
        divisionScope: [{ type: String, default: 'All' }],
        permissions: {
            registration: { type: Boolean, default: false },
            verification: { type: Boolean, default: false },
            claim: { type: Boolean, default: false },
            claimApproval: { type: Boolean, default: false },
            check: { type: Boolean, default: false },
            customerRecords: { type: Boolean, default: false },
            voidWarranty: { type: Boolean, default: false },
        },
    },
    salaryStructure: {
        basicSalary: { type: Number, default: 0 },
        allowances: { type: Array, default: [] },
        deductions: { type: Array, default: [] },
        bonuses: { type: Array, default: [] },
        bankDetails: {
            bankName: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            ifscCode: { type: String, default: '' },
            branch: { type: String, default: '' },
            upiId: { type: String, default: '' },
            pan: { type: String, default: '' },
            uan: { type: String, default: '' },
            pfNumber: { type: String, default: '' },
            esicNumber: { type: String, default: '' },
        },
        effectiveDate: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
    },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });
exports.Employee = mongoose_1.default.model('Employee', employeeSchema);
