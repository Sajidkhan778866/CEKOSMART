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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetAdminTheme = exports.publishAdminTheme = exports.updateAdminThemeDraft = exports.getAdminTheme = exports.getPublicTheme = exports.getOrCreateTheme = void 0;
const ThemeConfig_1 = __importStar(require("../models/ThemeConfig"));
const FrontendAuditLog_1 = __importDefault(require("../models/FrontendAuditLog"));
// Helper: Ensure theme exists
const getOrCreateTheme = async () => {
    let theme = await ThemeConfig_1.default.findOne({ key: 'global_theme' });
    if (!theme) {
        console.log('[Theme] Initializing default global design tokens in MongoDB...');
        theme = await ThemeConfig_1.default.create({
            key: 'global_theme',
            colors: ThemeConfig_1.defaultColors,
            typography: ThemeConfig_1.defaultTypography,
            dimensions: ThemeConfig_1.defaultDimensions,
            effects: ThemeConfig_1.defaultEffects,
            header: ThemeConfig_1.defaultHeader,
            footer: ThemeConfig_1.defaultFooter,
            lastPublishedAt: new Date(),
        });
    }
    return theme;
};
exports.getOrCreateTheme = getOrCreateTheme;
// GET /api/v1/theme/public (Get published global design tokens & navigation)
const getPublicTheme = async (_req, res) => {
    try {
        const theme = await (0, exports.getOrCreateTheme)();
        res.json({
            success: true,
            data: {
                colors: theme.colors,
                typography: theme.typography,
                dimensions: theme.dimensions,
                effects: theme.effects,
                header: theme.header,
                footer: theme.footer,
                customGlobalCss: theme.customGlobalCss,
                lastPublishedAt: theme.lastPublishedAt,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getPublicTheme = getPublicTheme;
// GET /api/v1/theme/admin (Get admin full theme with draft)
const getAdminTheme = async (_req, res) => {
    try {
        const theme = await (0, exports.getOrCreateTheme)();
        res.json({
            success: true,
            data: theme,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAdminTheme = getAdminTheme;
// PUT /api/v1/theme/admin/draft (Save draft design tokens)
const updateAdminThemeDraft = async (req, res) => {
    try {
        const { colors, typography, dimensions, effects, header, footer, customGlobalCss } = req.body;
        const theme = await (0, exports.getOrCreateTheme)();
        theme.draftConfig = {
            colors: colors || theme.draftConfig?.colors || theme.colors,
            typography: typography || theme.draftConfig?.typography || theme.typography,
            dimensions: dimensions || theme.draftConfig?.dimensions || theme.dimensions,
            effects: effects || theme.draftConfig?.effects || theme.effects,
            header: header || theme.draftConfig?.header || theme.header,
            footer: footer || theme.draftConfig?.footer || theme.footer,
        };
        if (customGlobalCss !== undefined) {
            theme.customGlobalCss = customGlobalCss;
        }
        theme.lastEditedBy = req.user?.name || 'Admin';
        await theme.save();
        await FrontendAuditLog_1.default.create({
            action: 'update_theme_draft',
            targetType: 'theme',
            targetName: 'Global Design Tokens & Layout',
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { hasHeader: Boolean(header), hasColors: Boolean(colors) },
        });
        res.json({
            success: true,
            message: 'Theme draft saved successfully',
            data: theme,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateAdminThemeDraft = updateAdminThemeDraft;
// POST /api/v1/theme/admin/publish (Publish draft tokens live)
const publishAdminTheme = async (req, res) => {
    try {
        const { note = 'Published global design tokens & layout' } = req.body;
        const theme = await (0, exports.getOrCreateTheme)();
        if (theme.draftConfig) {
            theme.colors = theme.draftConfig.colors;
            theme.typography = theme.draftConfig.typography;
            theme.dimensions = theme.draftConfig.dimensions;
            theme.effects = theme.draftConfig.effects;
            theme.header = theme.draftConfig.header;
            theme.footer = theme.draftConfig.footer;
        }
        theme.lastPublishedAt = new Date();
        theme.lastEditedBy = req.user?.name || 'Admin';
        // Record revision
        const revision = {
            revisionId: `theme_rev_${Date.now()}`,
            publishedAt: new Date(),
            publishedBy: req.user?.name || 'Admin',
            colors: theme.colors,
            typography: theme.typography,
            dimensions: theme.dimensions,
            effects: theme.effects,
            header: theme.header,
            footer: theme.footer,
            note,
        };
        if (!theme.revisions)
            theme.revisions = [];
        theme.revisions.unshift(revision);
        if (theme.revisions.length > 20) {
            theme.revisions = theme.revisions.slice(0, 20);
        }
        await theme.save();
        await FrontendAuditLog_1.default.create({
            action: 'publish_theme',
            targetType: 'theme',
            targetName: 'Global Design Tokens & Layout',
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { revisionId: revision.revisionId, note },
        });
        res.json({
            success: true,
            message: 'Global design tokens and layout published live to the frontend!',
            data: theme,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.publishAdminTheme = publishAdminTheme;
// POST /api/v1/theme/admin/reset (Reset tokens to default)
const resetAdminTheme = async (req, res) => {
    try {
        const theme = await (0, exports.getOrCreateTheme)();
        theme.colors = ThemeConfig_1.defaultColors;
        theme.typography = ThemeConfig_1.defaultTypography;
        theme.dimensions = ThemeConfig_1.defaultDimensions;
        theme.effects = ThemeConfig_1.defaultEffects;
        theme.header = ThemeConfig_1.defaultHeader;
        theme.footer = ThemeConfig_1.defaultFooter;
        theme.draftConfig = null;
        theme.lastPublishedAt = new Date();
        theme.lastEditedBy = req.user?.name || 'Admin';
        theme.revisions.unshift({
            revisionId: `theme_rev_${Date.now()}_reset`,
            publishedAt: new Date(),
            publishedBy: req.user?.name || 'Admin',
            colors: ThemeConfig_1.defaultColors,
            typography: ThemeConfig_1.defaultTypography,
            dimensions: ThemeConfig_1.defaultDimensions,
            effects: ThemeConfig_1.defaultEffects,
            header: ThemeConfig_1.defaultHeader,
            footer: ThemeConfig_1.defaultFooter,
            note: 'Factory reset to default enterprise theme',
        });
        await theme.save();
        await FrontendAuditLog_1.default.create({
            action: 'reset_theme',
            targetType: 'theme',
            targetName: 'Global Design Tokens & Layout',
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { note: 'Reset to factory defaults' },
        });
        res.json({
            success: true,
            message: 'Reset theme to factory default tokens successfully',
            data: theme,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.resetAdminTheme = resetAdminTheme;
