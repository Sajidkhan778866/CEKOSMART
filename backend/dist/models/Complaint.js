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
exports.Complaint = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const complaintSchema = new mongoose_1.Schema({
    ticketNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    division: {
        type: String,
        required: true,
        index: true,
    },
    complaintType: { type: String, default: '' },
    description: { type: String, default: '' },
    billUrls: [{ type: String }],
    attachments: [
        {
            pageNumber: { type: Number, default: 1 },
            url: { type: String, required: true },
            name: { type: String, default: '' },
            fileType: { type: String, default: 'image' },
        },
    ],
    formData: { type: mongoose_1.Schema.Types.Mixed },
    status: {
        type: String,
        enum: ['New', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
        default: 'Pending',
        index: true,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium',
    },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee' },
    remarks: {
        employee: { type: String, default: '' },
        admin: { type: String, default: '' },
        resolutionDetails: { type: String, default: '' },
    },
    timeline: [
        {
            status: { type: String, required: true },
            note: { type: String, default: '' },
            updatedBy: { type: String, default: '' },
            updatedAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
exports.Complaint = mongoose_1.default.model('Complaint', complaintSchema);
