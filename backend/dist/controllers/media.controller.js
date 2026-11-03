"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMediaAsset = exports.uploadMediaAsset = exports.getMediaAssets = void 0;
const MediaAsset_1 = __importDefault(require("../models/MediaAsset"));
const FrontendAuditLog_1 = __importDefault(require("../models/FrontendAuditLog"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// GET /api/v1/media/admin (List media library assets)
const getMediaAssets = async (req, res) => {
    try {
        const { category, search } = req.query;
        const query = {};
        if (category && category !== 'all') {
            query.category = category;
        }
        if (search) {
            query.$or = [
                { name: { $regex: String(search), $options: 'i' } },
                { altText: { $regex: String(search), $options: 'i' } },
                { tags: { $in: [new RegExp(String(search), 'i')] } },
            ];
        }
        const assets = await MediaAsset_1.default.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: assets,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getMediaAssets = getMediaAssets;
// POST /api/v1/media/admin/upload (Upload asset)
const uploadMediaAsset = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const { name, category = 'general', altText = '', tags = '' } = req.body;
        const cleanTags = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
        let fileUrl = '';
        if (req.file.buffer) {
            fileUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }
        else if (req.file.filename) {
            fileUrl = `/uploads/${req.file.filename}`;
        }
        const asset = await MediaAsset_1.default.create({
            name: name || req.file.originalname,
            category,
            url: fileUrl,
            altText: altText || name || req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            tags: cleanTags,
            uploadedBy: req.user?.name || 'Admin',
        });
        await FrontendAuditLog_1.default.create({
            action: 'upload_media',
            targetType: 'media',
            targetId: String(asset._id),
            targetName: asset.name,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { url: fileUrl, category, size: req.file.size },
        });
        res.status(201).json({
            success: true,
            message: 'Media asset uploaded successfully',
            data: asset,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.uploadMediaAsset = uploadMediaAsset;
// DELETE /api/v1/media/admin/:id
const deleteMediaAsset = async (req, res) => {
    try {
        const asset = await MediaAsset_1.default.findById(req.params.id);
        if (!asset) {
            return res.status(404).json({ success: false, message: 'Media asset not found' });
        }
        // Attempt local file cleanup
        try {
            const filename = path_1.default.basename(asset.url);
            const filePath = path_1.default.join(process.cwd(), 'uploads', filename);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (e) {
            // ignore file removal failure
        }
        await MediaAsset_1.default.findByIdAndDelete(req.params.id);
        await FrontendAuditLog_1.default.create({
            action: 'delete_media',
            targetType: 'media',
            targetId: String(asset._id),
            targetName: asset.name,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { url: asset.url },
        });
        res.json({
            success: true,
            message: `Media asset "${asset.name}" deleted successfully`,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteMediaAsset = deleteMediaAsset;
