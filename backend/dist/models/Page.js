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
exports.Page = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ComponentSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, default: 'Component' },
    props: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    styling: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    responsive: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    animation: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    action: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    children: { type: [mongoose_1.Schema.Types.Mixed], default: [] },
}, { _id: false });
const SectionSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, default: 'Section' },
    type: { type: String, default: 'standard' },
    layout: { type: mongoose_1.Schema.Types.Mixed, default: { width: 'boxed', columns: 1, gap: '1.5rem' } },
    styling: { type: mongoose_1.Schema.Types.Mixed, default: { paddingY: '3rem', paddingX: '1.5rem' } },
    responsive: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    components: { type: [ComponentSchema], default: [] },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { _id: false });
const PageRevisionSchema = new mongoose_1.Schema({
    revisionId: { type: String, required: true },
    title: { type: String, required: true },
    sections: { type: [SectionSchema], default: [] },
    designTokensOverride: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    publishedAt: { type: Date, default: Date.now },
    publishedBy: { type: String, default: 'Admin' },
    note: { type: String, default: 'Published revision' },
}, { _id: false });
const PageSchema = new mongoose_1.Schema({
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true },
    metaDescription: { type: String, default: '' },
    keywords: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    isHomepage: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    accessLevel: { type: String, enum: ['public', 'customer', 'employee', 'admin'], default: 'public' },
    sections: { type: [SectionSchema], default: [] },
    draftSections: { type: [SectionSchema], default: [] },
    revisions: { type: [PageRevisionSchema], default: [] },
    designTokensOverride: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    customCss: { type: String, default: '' },
    order: { type: Number, default: 0 },
    lastPublishedAt: { type: Date },
    lastEditedBy: { type: String, default: 'Admin' },
}, { timestamps: true });
PageSchema.index({ slug: 1, isPublished: 1 });
const Page = mongoose_1.default.models.Page || mongoose_1.default.model('Page', PageSchema);
exports.Page = Page;
exports.default = Page;
