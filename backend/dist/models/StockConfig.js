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
exports.StockConfig = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const stockCustomFieldSchema = new mongoose_1.Schema({
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
        type: String,
        enum: ['text', 'number', 'select', 'date', 'boolean', 'textarea'],
        default: 'text',
    },
    required: { type: Boolean, default: false },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
    options: { type: [String], default: [] },
    placeholder: { type: String, default: '' },
    defaultValue: { type: mongoose_1.Schema.Types.Mixed, default: '' },
}, { _id: false });
const stockTableColumnSchema = new mongoose_1.Schema({
    key: { type: String, required: true },
    label: { type: String, required: true },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
    widthPercent: { type: Number, default: 10 },
}, { _id: false });
const stockConfigSchema = new mongoose_1.Schema({
    key: { type: String, required: true, unique: true, default: 'global_stock_config' },
    categories: {
        type: [String],
        default: [
            'Battery',
            'Spare Parts',
            'Scooter',
            'Charger',
            'BMS & Harness',
            'Motor & Controller',
            'Accessory',
            'Raw Material',
            'Other',
        ],
    },
    statuses: {
        type: [String],
        default: [
            'In Stock',
            'Sold',
            'Reserved',
            'Under Service',
            'Defective',
            'Returned',
            'In Transit',
            'Quarantine',
        ],
    },
    locations: {
        type: [String],
        default: [
            'Kota Central Plant',
            'Main Showroom Counter',
            'Rental Dispatch Hub',
            'Service Center Desk',
            'Warehouse A (Kota)',
            'Warehouse B (Jaipur)',
        ],
    },
    movementTypes: {
        type: [String],
        default: [
            'Received',
            'Sold',
            'Issued',
            'Returned',
            'Transferred',
            'Adjusted',
            'Damaged / Scrapped',
            'Audit Reconciliation',
        ],
    },
    customFields: {
        type: [stockCustomFieldSchema],
        default: [
            { key: 'voltage', label: 'Battery Voltage (V)', type: 'text', required: false, visible: true, order: 1, placeholder: 'e.g. 48V / 60V / 72V' },
            { key: 'capacity', label: 'Capacity (Ah)', type: 'text', required: false, visible: true, order: 2, placeholder: 'e.g. 28Ah / 30Ah / 32Ah' },
            { key: 'chemistry', label: 'Cell Chemistry', type: 'select', required: false, visible: true, order: 3, options: ['LFP (Lithium Iron Phosphate)', 'NMC (Lithium Nickel Manganese Cobalt)', 'Lead Acid', 'Other'] },
            { key: 'batchNumber', label: 'Manufacturing Batch #', type: 'text', required: false, visible: true, order: 4, placeholder: 'e.g. BATCH-2026-09' },
            { key: 'purchasePrice', label: 'Purchase Cost / Unit (₹)', type: 'number', required: false, visible: true, order: 5, placeholder: '0' },
            { key: 'supplierName', label: 'Supplier / Vendor Name', type: 'text', required: false, visible: true, order: 6, placeholder: 'e.g. Cell Supplier Pvt Ltd' },
            { key: 'reorderLevel', label: 'Low Stock Alert Threshold', type: 'number', required: false, visible: true, order: 7, placeholder: '5' },
        ],
    },
    tableColumns: {
        type: [stockTableColumnSchema],
        default: [
            { key: 'productId', label: 'Product ID', visible: true, order: 1, widthPercent: 12 },
            { key: 'productName', label: 'Product Description', visible: true, order: 2, widthPercent: 22 },
            { key: 'category', label: 'Category', visible: true, order: 3, widthPercent: 12 },
            { key: 'serialNumber', label: 'Serial # / Battery Serial', visible: true, order: 4, widthPercent: 18 },
            { key: 'quantity', label: 'Qty / Avail', visible: true, order: 5, widthPercent: 10 },
            { key: 'unitPrice', label: 'Rate (₹)', visible: true, order: 6, widthPercent: 10 },
            { key: 'location', label: 'Location', visible: true, order: 7, widthPercent: 14 },
            { key: 'status', label: 'Status', visible: true, order: 8, widthPercent: 10 },
        ],
    },
}, { timestamps: true });
exports.StockConfig = mongoose_1.default.model('StockConfig', stockConfigSchema);
