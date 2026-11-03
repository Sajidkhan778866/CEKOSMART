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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeConfig = exports.defaultFooter = exports.defaultHeader = exports.defaultEffects = exports.defaultDimensions = exports.defaultTypography = exports.defaultColors = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const defaultColors = {
    primary: '#059669',
    primaryHover: '#047857',
    primaryLight: '#d1fae5',
    primaryDark: '#064e3b',
    secondary: '#0284c7',
    secondaryHover: '#0369a1',
    secondaryLight: '#e0f2fe',
    accent: '#f59e0b',
    accentHover: '#d97706',
    accentLight: '#fef3c7',
    neutral: '#64748b',
    surface: '#ffffff',
    background: '#f8fafc',
    surfaceDark: '#0f172a',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
};
exports.defaultColors = defaultColors;
const defaultTypography = {
    fontFamilySans: 'Inter, system-ui, -apple-system, sans-serif',
    fontFamilyHeading: 'Inter, system-ui, -apple-system, sans-serif',
    fontFamilyMono: 'Consolas, Menlo, monospace',
    h1Size: '2.25rem',
    h2Size: '1.75rem',
    h3Size: '1.375rem',
    h4Size: '1.125rem',
    bodySize: '0.9375rem',
    captionSize: '0.8125rem',
    baseLineHeight: '1.5',
    headingLineHeight: '1.2',
};
exports.defaultTypography = defaultTypography;
const defaultDimensions = {
    containerMaxWidth: '1280px',
    spacingScale: '1rem',
    borderRadius: '0.75rem',
    buttonRadius: '0.75rem',
    buttonPadding: '0.625rem 1.25rem',
    inputRadius: '0.625rem',
    inputHeight: '2.625rem',
    shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
};
exports.defaultDimensions = defaultDimensions;
const defaultEffects = {
    enableTransitions: true,
    enableHoverAnimations: true,
    enableEntranceAnimations: true,
    transitionSpeed: '200ms',
};
exports.defaultEffects = defaultEffects;
const defaultHeader = {
    logoText: 'EKOSMART',
    logoSubtitle: 'EV Battery Solution & Spare Parts',
    logoType: 'preset',
    height: '72px',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    isSticky: true,
    isTransparent: false,
    navItems: [
        { id: 'nav-1', label: 'Home', url: '/', icon: 'Home', isVisible: true, order: 1 },
        { id: 'nav-2', label: 'Services', url: '/services', icon: 'BatteryCharging', isVisible: true, order: 2 },
        { id: 'nav-3', label: 'Book Complaint', url: '/complaint/register', icon: 'Wrench', isVisible: true, order: 3 },
        { id: 'nav-4', label: 'Track Ticket', url: '/complaint/track', icon: 'Search', isVisible: true, order: 4 },
        { id: 'nav-5', label: 'Warranty Check', url: '/warranty/check', icon: 'ShieldCheck', isVisible: true, order: 5 },
        { id: 'nav-6', label: 'Contact', url: '/contact', icon: 'Phone', isVisible: true, order: 6 },
    ],
    ctaButton: {
        text: 'Register Complaint',
        link: '/complaint/register',
        isVisible: true,
        variant: 'primary',
    },
    showEmergencyCall: true,
    emergencyPhone: '+91 8949049003',
};
exports.defaultHeader = defaultHeader;
const defaultFooter = {
    showFooter: true,
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
    copyrightText: '© 2026 Ekosmart EV Battery Solution & Spare Parts. All Rights Reserved.',
    columns: [
        {
            title: 'EV Battery Services',
            links: [
                { label: 'Lithium Battery Diagnostics', url: '/services' },
                { label: 'BMS Testing & Balancing', url: '/services' },
                { label: 'Drive Rental Fleet Support', url: '/services' },
                { label: 'OEM Spare Parts Catalog', url: '/services' },
            ],
        },
        {
            title: 'Customer Support',
            links: [
                { label: 'Register Grievance', url: '/complaint/register' },
                { label: 'Track Service Ticket', url: '/complaint/track' },
                { label: 'Warranty Coverage Check', url: '/warranty/check' },
                { label: 'Self Warranty Registration', url: '/warranty/register' },
            ],
        },
        {
            title: 'Company & Compliance',
            links: [
                { label: 'About Ekosmart', url: '/about' },
                { label: 'Privacy Policy', url: '/privacy-policy' },
                { label: 'Terms & Conditions', url: '/terms-conditions' },
                { label: 'Refund & Warranty SLA', url: '/refund-policy' },
            ],
        },
    ],
    socialLinks: [
        { platform: 'whatsapp', url: 'https://wa.me/918949049003', isVisible: true },
        { platform: 'phone', url: 'tel:+918949049003', isVisible: true },
        { platform: 'mail', url: 'mailto:Smartdrive5640@gmail.com', isVisible: true },
    ],
    badges: [
        { title: 'ISO 9001:2015', subtitle: 'Certified Manufacturing & Servicing', icon: 'Award' },
        { title: 'AIS-156 & AIS-038', subtitle: 'EV Battery Safety Compliant', icon: 'ShieldCheck' },
        { title: '100% Genuine Cells', subtitle: 'Grade-A Tested Lithium Packs', icon: 'CheckCircle' },
    ],
};
exports.defaultFooter = defaultFooter;
const ThemeConfigSchema = new mongoose_1.Schema({
    key: { type: String, required: true, unique: true, default: 'global_theme' },
    colors: { type: mongoose_1.Schema.Types.Mixed, default: defaultColors },
    typography: { type: mongoose_1.Schema.Types.Mixed, default: defaultTypography },
    dimensions: { type: mongoose_1.Schema.Types.Mixed, default: defaultDimensions },
    effects: { type: mongoose_1.Schema.Types.Mixed, default: defaultEffects },
    header: { type: mongoose_1.Schema.Types.Mixed, default: defaultHeader },
    footer: { type: mongoose_1.Schema.Types.Mixed, default: defaultFooter },
    draftConfig: { type: mongoose_1.Schema.Types.Mixed, default: null },
    revisions: [mongoose_1.Schema.Types.Mixed],
    customGlobalCss: { type: String, default: '' },
    lastPublishedAt: { type: Date },
    lastEditedBy: { type: String, default: 'Admin' },
}, { timestamps: true });
const ThemeConfig = mongoose_1.default.models.ThemeConfig ||
    mongoose_1.default.model('ThemeConfig', ThemeConfigSchema);
exports.ThemeConfig = ThemeConfig;
exports.default = ThemeConfig;
