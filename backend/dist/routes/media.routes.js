"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const media_controller_1 = require("../controllers/media.controller");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Admin media routes
router.get('/admin', auth_1.protect, media_controller_1.getMediaAssets);
router.post('/admin/upload', auth_1.protect, upload_1.upload.single('file'), media_controller_1.uploadMediaAsset);
router.delete('/admin/:id', auth_1.protect, media_controller_1.deleteMediaAsset);
exports.default = router;
