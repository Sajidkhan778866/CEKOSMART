"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const billing_controller_1 = require("../controllers/billing.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// 1. Bill Template Routes (Accessible by Admin and POS renderers)
router.get('/template', billing_controller_1.getActiveBillTemplate);
router.get('/templates', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), billing_controller_1.getAllBillTemplates);
router.get('/templates/:id', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), billing_controller_1.getBillTemplateById);
router.post('/templates', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), billing_controller_1.createBillTemplate);
router.put('/templates/:id', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), billing_controller_1.updateBillTemplate);
router.patch('/templates/:id/activate', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), billing_controller_1.activateBillTemplate);
router.delete('/templates/:id', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), billing_controller_1.deleteBillTemplate);
// 2. Invoices & Billing Routes
router.get('/export/csv', auth_1.protect, (0, auth_1.checkPermission)('billing:view', 'billing:create'), billing_controller_1.exportBills);
router.get('/', auth_1.protect, (0, auth_1.checkPermission)('billing:view', 'billing:create'), billing_controller_1.getAllBills);
router.get('/:id', auth_1.protect, (0, auth_1.checkPermission)('billing:view', 'billing:create'), billing_controller_1.getBillById);
router.post('/:id/email', auth_1.protect, (0, auth_1.checkPermission)('billing:view', 'billing:create'), billing_controller_1.sendBillEmail);
router.post('/', auth_1.protect, (0, auth_1.checkPermission)('billing:create'), billing_controller_1.createBill);
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), billing_controller_1.deleteBill);
exports.default = router;
