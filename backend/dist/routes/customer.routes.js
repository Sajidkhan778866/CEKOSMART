"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_controller_1 = require("../controllers/customer.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// ============================================================================
// 1. PUBLIC CUSTOMER AUTHENTICATION (OTP BASED)
// ============================================================================
router.post('/auth/send-register-otp', customer_controller_1.sendRegisterOtp);
router.post('/auth/verify-register-otp', customer_controller_1.verifyRegisterOtp);
router.post('/auth/send-login-otp', customer_controller_1.sendLoginOtp);
router.post('/auth/verify-login-otp', customer_controller_1.verifyLoginOtp);
router.post('/auth/send-complaint-otp', customer_controller_1.sendComplaintOtp);
router.post('/auth/verify-complaint-otp', customer_controller_1.verifyComplaintOtp);
router.get('/auth/test-smtp', customer_controller_1.testSmtpConnectionController);
router.post('/auth/test-smtp', customer_controller_1.testSmtpConnectionController);
router.get('/referral-settings/public', customer_controller_1.getReferralSettings);
router.get('/eligible-services', customer_controller_1.getEligibleServices);
// ============================================================================
// 2. CUSTOMER SELF-SERVICE PORTAL (PROTECTED)
// ============================================================================
router.get('/me', auth_1.protectCustomer, customer_controller_1.getCustomerProfile);
router.put('/me', auth_1.protectCustomer, customer_controller_1.updateCustomerProfile);
router.get('/me/wallet', auth_1.protectCustomer, customer_controller_1.getMyWallet);
router.post('/me/wallet/redeem-service', auth_1.protectCustomer, customer_controller_1.redeemServiceCoins);
router.get('/me/referrals', auth_1.protectCustomer, customer_controller_1.getMyReferrals);
router.get('/me/purchases', auth_1.protectCustomer, customer_controller_1.getMyPurchases);
router.get('/me/warranties', auth_1.protectCustomer, customer_controller_1.getMyWarranties);
router.get('/me/complaints', auth_1.protectCustomer, customer_controller_1.getMyComplaints);
// ============================================================================
// 3. ADMIN MANAGEMENT ROUTES (PROTECTED)
// ============================================================================
// Referral & Wallet Management
router.get('/smtp-settings', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), customer_controller_1.getSmtpSettingsController);
router.put('/smtp-settings', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), customer_controller_1.saveSmtpSettingsController);
router.post('/smtp-settings/test', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), customer_controller_1.testSmtpConnectionController);
router.get('/referral-settings', auth_1.protect, customer_controller_1.getReferralSettings);
router.put('/referral-settings', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), customer_controller_1.updateReferralSettings);
router.get('/referrals/all', auth_1.protect, customer_controller_1.getAllReferrals);
router.get('/referrals/export/csv', auth_1.protect, customer_controller_1.exportReferrals);
router.get('/wallet-transactions/all', auth_1.protect, customer_controller_1.getAllWalletTransactions);
router.get('/wallet/export/csv', auth_1.protect, customer_controller_1.exportWalletTransactions);
// Customer Directory & Dossier
router.get('/export/csv', auth_1.protect, customer_controller_1.exportCustomers);
router.get('/', auth_1.protect, customer_controller_1.getCustomers);
router.get('/:id', auth_1.protect, customer_controller_1.getCustomerById);
router.post('/', auth_1.protect, customer_controller_1.createCustomer);
router.put('/:id', auth_1.protect, customer_controller_1.updateCustomer);
router.post('/:id/wallet/adjust', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), customer_controller_1.adjustCustomerWallet);
exports.default = router;
