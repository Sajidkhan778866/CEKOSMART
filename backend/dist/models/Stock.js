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
exports.Stock = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const stockHistorySchema = new mongoose_1.Schema({
    operation: { type: String, required: true },
    quantity: { type: Number, required: true },
    referenceNumber: { type: String, default: '' },
    employeeName: { type: String, default: '' },
    employeeId: { type: String, default: '' },
    notes: { type: String, default: '' },
    date: { type: Date, default: Date.now },
}, { _id: false });
const stockSchema = new mongoose_1.Schema({
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true, index: true },
    category: {
        type: String,
        default: 'Battery',
        index: true,
    },
    modelNumber: { type: String, default: '' },
    serialNumber: { type: String, default: '', index: true },
    batterySerialNumber: { type: String, default: '', index: true },
    images: [{ type: String }],
    photoUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    quantity: { type: Number, required: true, default: 1 },
    availableQuantity: { type: Number, default: 1 },
    soldQuantity: { type: Number, default: 0 },
    reservedQuantity: { type: Number, default: 0 },
    totalReceived: { type: Number, default: 1 },
    totalSold: { type: Number, default: 0 },
    purchasePrice: { type: Number, default: 0 },
    unitPrice: { type: Number, required: true, default: 0 },
    mrp: { type: Number, required: true, default: 0 },
    gstRate: { type: Number, default: 18 },
    location: { type: String, default: 'Kota Central Plant', index: true },
    status: {
        type: String,
        default: 'In Stock',
        index: true,
    },
    specifications: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    attributes: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    customFields: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    purchaseInfo: {
        supplier: { type: String, default: '' },
        purchaseDate: { type: Date },
        invoiceNumber: { type: String, default: '' },
        purchaseCost: { type: Number, default: 0 },
        billUrls: [{ type: String }],
    },
    billUrls: [{ type: String }],
    billPages: [
        {
            pageNumber: { type: Number, default: 1 },
            url: { type: String, required: true },
            name: { type: String, default: '' },
            fileType: { type: String, default: 'image' },
        },
    ],
    warrantyPeriodMonths: { type: Number, default: 36 },
    warrantyInfo: {
        warrantyPeriodMonths: { type: Number, default: 36 },
        terms: { type: String, default: '' },
    },
    history: [stockHistorySchema],
}, { timestamps: true, strict: false });
exports.Stock = mongoose_1.default.model('Stock', stockSchema);
