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
exports.ReferralSettings = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const referralSettingsSchema = new mongoose_1.Schema({
    key: { type: String, default: 'global_referral_settings', unique: true },
    enabled: { type: Boolean, default: true },
    welcomeRewardCoins: { type: Number, default: 0 },
    newCustomerReward: { type: Number, default: 500 },
    referrerReward: { type: Number, default: 500 },
    purchaseReward: { type: Number, default: 500 },
    showroomCoins: { type: Number, default: 250 },
    batteryCoins: { type: Number, default: 500 },
    serviceReward: { type: Number, default: 250 },
    serviceRedemptionValue: { type: Number, default: 200 },
    qualifyingMinPurchase: { type: Number, default: 0 },
    coinConversionRate: { type: Number, default: 1 },
    termsAndConditions: {
        type: [String],
        default: [
            '1. Customer registration starts with 0 coins. Reward coins are awarded strictly on showroom purchases.',
            '2. Every qualifying showroom & EV battery product purchase awards reward coins directly to the customer digital wallet.',
            '3. The referring friend receives referral bonus coins once their referred customer completes their first qualifying purchase.',
            '4. Accumulated coins can be redeemed for EV battery servicing, maintenance charges, and accessories.',
            '5. Referral codes are permanent, unique, non-guessable, and linked to the customer account.',
        ],
    },
}, { timestamps: true });
exports.ReferralSettings = mongoose_1.default.model('ReferralSettings', referralSettingsSchema);
