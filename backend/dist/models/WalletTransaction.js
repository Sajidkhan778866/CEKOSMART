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
exports.WalletTransaction = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const walletTransactionSchema = new mongoose_1.Schema({
    transactionId: { type: String, required: true, unique: true, index: true },
    customer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: '' },
    customerMobile: { type: String, default: '' },
    type: { type: String, enum: ['Credit', 'Debit'], required: true, index: true },
    category: {
        type: String,
        enum: [
            'Welcome Reward',
            'Referral Reward',
            'Referrer Reward',
            'Purchase Reward',
            'Redemption',
            'Service Redemption',
            'Admin Adjustment',
            'Refund',
        ],
        required: true,
        index: true,
    },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true, default: 0 },
    balanceAfter: { type: Number, required: true, default: 0 },
    description: { type: String, required: true },
    reference: { type: String, default: '', index: true },
    referenceType: {
        type: String,
        enum: ['Referral', 'Bill', 'Registration', 'Admin', 'Redemption', 'None'],
        default: 'None',
    },
    status: {
        type: String,
        enum: ['Completed', 'Pending', 'Failed', 'Reversed'],
        default: 'Completed',
        index: true,
    },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
exports.WalletTransaction = mongoose_1.default.model('WalletTransaction', walletTransactionSchema);
