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
exports.Referral = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const referralSchema = new mongoose_1.Schema({
    referralId: { type: String, required: true, unique: true, index: true },
    referrer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    referrerId: { type: String, required: true, index: true },
    referrerName: { type: String, required: true },
    referrerEmail: { type: String, default: '' },
    referrerMobile: { type: String, default: '' },
    referrerCode: { type: String, required: true, index: true },
    referredCustomer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true, unique: true, index: true },
    referredCustomerId: { type: String, required: true, index: true },
    referredCustomerName: { type: String, required: true },
    referredCustomerEmail: { type: String, default: '' },
    referredCustomerMobile: { type: String, default: '' },
    referredCustomerCode: { type: String, default: '' },
    rewardAmountReferrer: { type: Number, default: 100 },
    rewardAmountReferred: { type: Number, default: 500 },
    status: {
        type: String,
        enum: ['Completed', 'Pending', 'Cancelled'],
        default: 'Completed',
        index: true,
    },
}, { timestamps: true });
exports.Referral = mongoose_1.default.model('Referral', referralSchema);
