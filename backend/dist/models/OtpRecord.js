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
exports.OtpRecord = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const OtpRecordSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    purpose: {
        type: String,
        enum: ['Registration', 'Login', 'Complaint', 'General'],
        required: true,
    },
    hashedOtp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 300 }, // Auto-cleanup 5 minutes after expiry
    },
    attempts: {
        type: Number,
        default: 0,
    },
    payload: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    lastRequestedAt: {
        type: Date,
        default: Date.now,
    },
    requestCount: {
        type: Number,
        default: 1,
    },
    rateLimitResetAt: {
        type: Date,
        default: () => new Date(Date.now() + 5 * 60 * 1000),
    },
}, { timestamps: true });
OtpRecordSchema.index({ email: 1, purpose: 1 }, { unique: true });
exports.OtpRecord = mongoose_1.default.models.OtpRecord ||
    mongoose_1.default.model('OtpRecord', OtpRecordSchema);
