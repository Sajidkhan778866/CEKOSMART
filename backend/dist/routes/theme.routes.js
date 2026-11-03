"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const theme_controller_1 = require("../controllers/theme.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/public', theme_controller_1.getPublicTheme);
// Admin routes
router.get('/admin', auth_1.protect, theme_controller_1.getAdminTheme);
router.put('/admin/draft', auth_1.protect, theme_controller_1.updateAdminThemeDraft);
router.post('/admin/publish', auth_1.protect, theme_controller_1.publishAdminTheme);
router.post('/admin/reset', auth_1.protect, theme_controller_1.resetAdminTheme);
exports.default = router;
