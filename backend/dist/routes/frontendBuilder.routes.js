"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const frontendBuilder_controller_1 = require("../controllers/frontendBuilder.controller");
const router = (0, express_1.Router)();
// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/public/theme', frontendBuilder_controller_1.getPublicTheme);
router.get('/public/pages', frontendBuilder_controller_1.getPublicPages);
router.get('/public/forms/:formKey', frontendBuilder_controller_1.getPublicFormSchema);
router.post('/public/forms/:formKey/submit', frontendBuilder_controller_1.submitPublicForm);
router.get('/public/form/:formKey', frontendBuilder_controller_1.getPublicFormSchema);
router.post('/public/form/:formKey/submit', frontendBuilder_controller_1.submitPublicForm);
router.get('/public/page/:slug', frontendBuilder_controller_1.getPublicPageBySlug);
router.get('/public/page/*slug', frontendBuilder_controller_1.getPublicPageBySlug);
router.get('/public/page', frontendBuilder_controller_1.getPublicPageBySlug);
// ==========================================
// ADMIN PROTECTED ROUTES
// ==========================================
router.use(auth_1.protect);
// Pages
router.get('/pages', frontendBuilder_controller_1.getAdminPages);
router.post('/pages', frontendBuilder_controller_1.createAdminPage);
router.get('/pages/:id', frontendBuilder_controller_1.getAdminPageById);
router.put('/pages/:id/draft', frontendBuilder_controller_1.updateAdminPageDraft);
router.post('/pages/:id/publish', frontendBuilder_controller_1.publishAdminPage);
router.post('/pages/:id/rollback/:version', frontendBuilder_controller_1.rollbackAdminPage);
router.post('/pages/:id/duplicate', frontendBuilder_controller_1.duplicateAdminPage);
router.delete('/pages/:id', frontendBuilder_controller_1.deleteAdminPage);
// Theme & Tokens
router.get('/theme', frontendBuilder_controller_1.getAdminTheme);
router.put('/theme', frontendBuilder_controller_1.updateAdminTheme);
// Forms
router.get('/forms', frontendBuilder_controller_1.getAdminForms);
router.post('/forms', frontendBuilder_controller_1.saveAdminForm);
router.delete('/forms/:formKey', frontendBuilder_controller_1.deleteAdminForm);
// Media
router.get('/media', frontendBuilder_controller_1.getAdminMedia);
router.post('/media', frontendBuilder_controller_1.createAdminMedia);
router.delete('/media/:assetId', frontendBuilder_controller_1.deleteAdminMedia);
// Audit Logs
router.get('/audit-logs', frontendBuilder_controller_1.getAuditLogs);
// Seed Defaults
router.post('/seed-defaults', frontendBuilder_controller_1.seedDefaultContent);
exports.default = router;
