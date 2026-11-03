"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const content_controller_1 = require("../controllers/content.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Content routes
router.get('/public', content_controller_1.getPublicContent);
router.get('/admin', content_controller_1.getAdminContent);
router.get('/', content_controller_1.getAdminContent);
router.put('/admin', auth_1.protect, (0, auth_1.authorize)('Admin', 'SuperAdmin', 'ADMIN', 'SUPER_ADMIN', 'Staff', 'Technician'), content_controller_1.updateAdminContent);
router.post('/admin', auth_1.protect, (0, auth_1.authorize)('Admin', 'SuperAdmin', 'ADMIN', 'SUPER_ADMIN', 'Staff', 'Technician'), content_controller_1.updateAdminContent);
router.put('/', auth_1.protect, (0, auth_1.authorize)('Admin', 'SuperAdmin', 'ADMIN', 'SUPER_ADMIN', 'Staff', 'Technician'), content_controller_1.updateAdminContent);
router.post('/', auth_1.protect, (0, auth_1.authorize)('Admin', 'SuperAdmin', 'ADMIN', 'SUPER_ADMIN', 'Staff', 'Technician'), content_controller_1.updateAdminContent);
router.post('/reset-defaults', auth_1.protect, (0, auth_1.authorize)('Admin', 'SuperAdmin', 'ADMIN', 'SUPER_ADMIN', 'Staff', 'Technician'), content_controller_1.resetContentToDefaults);
router.post('/admin/reset-defaults', auth_1.protect, (0, auth_1.authorize)('Admin', 'SuperAdmin', 'ADMIN', 'SUPER_ADMIN', 'Staff', 'Technician'), content_controller_1.resetContentToDefaults);
exports.default = router;
