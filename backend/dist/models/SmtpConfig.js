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
exports.SmtpConfig = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SmtpConfigSchema = new mongoose_1.Schema({
    key: {
        type: String,
        default: 'global_smtp_config',
        unique: true,
        index: true,
    },
    host: {
        type: String,
        default: 'server62.hostingraja.org',
        trim: true,
    },
    port: {
        type: Number,
        default: 465,
    },
    secure: {
        type: Boolean,
        default: true,
    },
    user: {
        type: String,
        default: 'support_otp_email@ekosmartdrivecomplain.in',
        trim: true,
    },
    pass: {
        type: String,
        default: '',
        select: false,
    },
    from: {
        type: String,
        default: '"Ekosmart Verification" <support_otp_email@ekosmartdrivecomplain.in>',
        trim: true,
    },
    rejectUnauthorized: {
        type: Boolean,
        default: false,
    },
    updatedBy: {
        type: String,
        default: 'system',
    },
}, { timestamps: true });
exports.SmtpConfig = mongoose_1.default.models.SmtpConfig ||
    mongoose_1.default.model('SmtpConfig', SmtpConfigSchema);
