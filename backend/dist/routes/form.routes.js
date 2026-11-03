"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const form_controller_1 = require("../controllers/form.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/public/sections', form_controller_1.getDynamicSections);
router.get('/public/complaint/:division', form_controller_1.getComplaintForm);
router.get('/public/warranty/:category', form_controller_1.getWarrantyForm);
// Admin routes
router.get('/admin/complaints', auth_1.protect, form_controller_1.getAllComplaintForms);
router.post('/admin/complaint', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), form_controller_1.saveComplaintForm);
router.delete('/admin/complaint/:division', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), form_controller_1.deleteComplaintForm);
router.get('/admin/warranties', auth_1.protect, form_controller_1.getAllWarrantyForms);
router.post('/admin/warranty', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), form_controller_1.saveWarrantyForm);
router.delete('/admin/warranty/:category', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), form_controller_1.deleteWarrantyForm);
exports.default = router;
