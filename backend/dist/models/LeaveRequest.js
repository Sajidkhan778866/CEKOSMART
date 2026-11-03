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
exports.LeaveRequest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const leaveHistorySchema = new mongoose_1.Schema({
    action: { type: String, required: true },
    updatedBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    remarks: { type: String, default: '' },
}, { _id: false });
const leaveRequestSchema = new mongoose_1.Schema({
    employee: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee', required: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    division: [{ type: String }],
    leaveType: {
        type: String,
        enum: ['Casual', 'Sick', 'Earned', 'Emergency', 'Maternity/Paternity', 'Unpaid', 'Compensatory'],
        default: 'Casual',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isHalfDay: { type: Boolean, default: false },
    halfDaySession: {
        type: String,
        enum: ['first_half', 'second_half'],
        default: 'first_half',
    },
    calendarDays: { type: Number, required: true, min: 0.5 },
    workingDays: { type: Number, required: true, min: 0.5 },
    weeklyOffDay: { type: Number, default: 0 }, // 0 = Sunday (standard weekly off)
    reason: { type: String, required: true, trim: true },
    contactPhone: { type: String, default: '' },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending',
        index: true,
    },
    approvedBy: { type: String, default: '' },
    approvedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
    approvalRemarks: { type: String, default: '' },
    history: [leaveHistorySchema],
}, { timestamps: true });
exports.LeaveRequest = mongoose_1.default.model('LeaveRequest', leaveRequestSchema);
