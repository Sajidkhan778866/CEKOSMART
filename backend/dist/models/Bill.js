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
exports.Bill = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const billItemSchema = new mongoose_1.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    category: { type: String, default: 'Battery' },
    productSerial: { type: String, default: '' },
    batterySerial: { type: String, default: '' },
    productImage: { type: String, default: '' },
    images: [{ type: String }],
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 18 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    warrantyPeriodMonths: { type: Number, default: 36 },
}, { _id: false });
const billSchema = new mongoose_1.Schema({
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    customerId: { type: String, default: '', index: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String, required: true, index: true },
    customerEmail: { type: String, default: '' },
    customerAddress: { type: String, default: '' },
    items: [billItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
    paymentMode: {
        type: String,
        enum: ['Cash', 'UPI', 'Wallet', 'Card', 'Bank Transfer', 'Finance', 'Credit'],
        default: 'UPI',
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending', 'Partial'],
        default: 'Paid',
    },
    showroom: { type: String, default: 'Showroom Counter', index: true },
    employeeId: { type: String, default: '' },
    employeeName: { type: String, default: '' },
    notes: { type: String, default: '' },
    billUrls: [{ type: String }],
    attachments: [
        {
            pageNumber: { type: Number, default: 1 },
            url: { type: String, required: true },
            name: { type: String, default: '' },
            fileType: { type: String, default: 'image' },
        },
    ],
    warrantyGenerated: { type: Boolean, default: false },
    warrantyIds: [{ type: String }],
    purchaseRewardAwarded: { type: Boolean, default: false },
    rewardCoinsAwarded: { type: Number, default: 0 },
    customerReferralCode: { type: String, default: '' },
    referralCodeUsed: { type: String, default: '' },
    referralCoinsAwarded: { type: Number, default: 0 },
    softCopyEmailed: { type: Boolean, default: false },
    softCopyEmailedAt: { type: Date },
    softCopyRecipient: { type: String, default: '' },
}, { timestamps: true });
exports.Bill = mongoose_1.default.model('Bill', billSchema);
