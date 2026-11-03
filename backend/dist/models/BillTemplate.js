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
exports.BillTemplate = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const templateFieldSchema = new mongoose_1.Schema({
    key: { type: String, required: true },
    label: { type: String, required: true },
    visible: { type: Boolean, default: true },
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
}, { _id: false });
const productColumnSchema = new mongoose_1.Schema({
    key: { type: String, required: true },
    label: { type: String, required: true },
    visible: { type: Boolean, default: true },
    width: { type: String, default: 'auto' },
    align: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
    order: { type: Number, default: 0 },
}, { _id: false });
const billTemplateSchema = new mongoose_1.Schema({
    templateName: { type: String, trim: true },
    name: { type: String, trim: true },
    templateType: {
        type: String,
        enum: ['Showroom', 'Plant', 'Rental', 'Warranty', 'Salary', 'Custom'],
        default: 'Showroom',
    },
    type: {
        type: String,
        enum: ['Showroom', 'Plant', 'Rental', 'Warranty', 'Salary', 'Custom'],
        default: 'Showroom',
    },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    company: { type: mongoose_1.Schema.Types.Mixed },
    companyProfile: { type: mongoose_1.Schema.Types.Mixed },
    header: { type: mongoose_1.Schema.Types.Mixed },
    customerFields: [mongoose_1.Schema.Types.Mixed],
    invoiceFields: [mongoose_1.Schema.Types.Mixed],
    productColumns: [mongoose_1.Schema.Types.Mixed],
    salaryConfig: { type: mongoose_1.Schema.Types.Mixed },
    warrantyConfig: { type: mongoose_1.Schema.Types.Mixed },
    totalsConfig: { type: mongoose_1.Schema.Types.Mixed },
    softBillEmailConfig: { type: mongoose_1.Schema.Types.Mixed },
    footer: { type: mongoose_1.Schema.Types.Mixed },
    theme: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true, strict: false });
exports.BillTemplate = mongoose_1.default.model('BillTemplate', billTemplateSchema);
