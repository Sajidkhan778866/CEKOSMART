"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const page_controller_1 = require("../controllers/page.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/public', page_controller_1.getPublicNavPages);
router.get('/public/by-slug', page_controller_1.getPublicPage);
router.get('/public/*slug', page_controller_1.getPublicPage);
// Admin routes
router.get('/admin', auth_1.protect, page_controller_1.getAdminPages);
router.post('/admin', auth_1.protect, page_controller_1.createAdminPage);
router.get('/admin/:id', auth_1.protect, page_controller_1.getAdminPageById);
router.put('/admin/:id', auth_1.protect, page_controller_1.updateAdminPageDraft);
router.post('/admin/:id/publish', auth_1.protect, page_controller_1.publishAdminPage);
router.post('/admin/:id/revert/:revisionId', auth_1.protect, page_controller_1.revertAdminPage);
router.post('/admin/:id/duplicate', auth_1.protect, page_controller_1.duplicateAdminPage);
router.delete('/admin/:id', auth_1.protect, page_controller_1.deleteAdminPage);
exports.default = router;
