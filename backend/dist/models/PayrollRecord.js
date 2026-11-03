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
exports.PayrollRecord = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const salaryComponentSchema = new mongoose_1.Schema({
    key: { type: String, default: 'item' },
    label: { type: String, default: 'Item' },
    amount: { type: Number, default: 0 },
}, { _id: false, strict: false });
const payrollRecordSchema = new mongoose_1.Schema({
    payslipNumber: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    employee: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    employeeName: { type: String, required: true },
    department: { type: String, default: 'Technical' },
    designation: { type: String, default: 'Service Engineer' },
    division: { type: String, default: 'Showroom' },
    payPeriod: { type: String, required: true, index: true },
    payMonth: { type: Number, default: 1 },
    payYear: { type: Number, default: 2026 },
    month: { type: String, default: '' },
    year: { type: Number, default: 2026 },
    payDate: { type: Date, default: Date.now },
    effectiveDate: { type: Date, default: Date.now },
    totalWorkingDays: { type: Number, default: 30 },
    workingDays: { type: Number, default: 30 },
    paidDays: { type: Number, default: 30 },
    presentDays: { type: Number, default: 30 },
    leaveDays: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    basicSalary: { type: Number, required: true, default: 0 },
    allowances: [salaryComponentSchema],
    deductions: [salaryComponentSchema],
    bonuses: [salaryComponentSchema],
    otherEarnings: [salaryComponentSchema],
    earnings: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    deductionsSummary: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    grossEarnings: { type: Number, required: true, default: 0 },
    totalDeductions: { type: Number, required: true, default: 0 },
    netSalary: { type: Number, required: true, default: 0 },
    amountInWords: { type: String, default: '' },
    paymentMode: { type: String, default: 'Bank Transfer' },
    paymentStatus: {
        type: String,
        default: 'Paid',
        index: true,
    },
    status: { type: String, default: 'Issued' },
    bankDetails: {
        bankName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        ifscCode: { type: String, default: '' },
        branch: { type: String, default: '' },
        upiId: { type: String, default: '' },
        pan: { type: String, default: '' },
        panNumber: { type: String, default: '' },
        uan: { type: String, default: '' },
        uanNumber: { type: String, default: '' },
        pfNumber: { type: String, default: '' },
        esicNumber: { type: String, default: '' },
        paymentMode: { type: String, default: 'Bank Transfer' },
    },
    authorizedBy: { type: String, default: 'HR & Finance Director' },
    notes: { type: String, default: '' },
    isPublishedToEmployee: { type: Boolean, default: true },
    history: [
        {
            action: { type: String, default: 'Generated' },
            updatedBy: { type: String, default: 'Admin' },
            updatedAt: { type: Date, default: Date.now },
            remarks: { type: String, default: '' },
        },
    ],
}, { timestamps: true, strict: false });
exports.PayrollRecord = mongoose_1.default.model('PayrollRecord', payrollRecordSchema);
