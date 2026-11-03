"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminPage = exports.duplicateAdminPage = exports.revertAdminPage = exports.publishAdminPage = exports.updateAdminPageDraft = exports.getAdminPageById = exports.createAdminPage = exports.getAdminPages = exports.getPublicPage = exports.getPublicNavPages = exports.seedDefaultPagesIfEmpty = void 0;
const Page_1 = __importDefault(require("../models/Page"));
const FrontendAuditLog_1 = __importDefault(require("../models/FrontendAuditLog"));
const pageTemplates_1 = require("../utils/pageTemplates");
// Helper: normalize slug
const normalizeSlug = (slug) => {
    if (!slug || slug === '/' || slug === 'home')
        return '/';
    let clean = slug.trim().toLowerCase();
    if (!clean.startsWith('/'))
        clean = `/${clean}`;
    return clean;
};
// Seed default core pages if collection is empty
const seedDefaultPagesIfEmpty = async () => {
    try {
        const count = await Page_1.default.countDocuments();
        if (count === 0) {
            console.log('[PageSeeder] Seeding default soft-coded pages in MongoDB...');
            const homeSections = (0, pageTemplates_1.getHomepageTemplate)();
            const servicesSections = (0, pageTemplates_1.getServicesTemplate)();
            const aboutSections = (0, pageTemplates_1.getAboutTemplate)();
            const contactSections = (0, pageTemplates_1.getContactTemplate)();
            await Page_1.default.create([
                {
                    slug: '/',
                    title: 'Home — Ekosmart EV Battery Solution',
                    metaDescription: 'Official EV Battery Diagnostics, BMS Repair, and Certified Spare Parts Hub in Rajasthan.',
                    isHomepage: true,
                    isPublished: true,
                    status: 'published',
                    sections: homeSections,
                    draftSections: homeSections,
                    order: 1,
                    lastPublishedAt: new Date(),
                    revisions: [
                        {
                            revisionId: `rev_${Date.now()}_init`,
                            title: 'Initial Factory Published Version',
                            sections: homeSections,
                            publishedAt: new Date(),
                            publishedBy: 'System',
                            note: 'Initial factory default layout',
                        },
                    ],
                },
                {
                    slug: '/services',
                    title: 'Services & Diagnostics — Ekosmart',
                    metaDescription: 'Lithium battery cell testing, BMS firmware tuning, and drive rental support.',
                    isHomepage: false,
                    isPublished: true,
                    status: 'published',
                    sections: servicesSections,
                    draftSections: servicesSections,
                    order: 2,
                    lastPublishedAt: new Date(),
                    revisions: [
                        {
                            revisionId: `rev_${Date.now()}_init_serv`,
                            title: 'Initial Factory Version',
                            sections: servicesSections,
                            publishedAt: new Date(),
                            publishedBy: 'System',
                            note: 'Initial services layout',
                        },
                    ],
                },
                {
                    slug: '/about',
                    title: 'About Us — Ekosmart EV Battery Solution',
                    metaDescription: 'Learn about our ISO certified manufacturing facility and battery engineering team.',
                    isHomepage: false,
                    isPublished: true,
                    status: 'published',
                    sections: aboutSections,
                    draftSections: aboutSections,
                    order: 3,
                    lastPublishedAt: new Date(),
                    revisions: [
                        {
                            revisionId: `rev_${Date.now()}_init_about`,
                            title: 'Initial Factory Version',
                            sections: aboutSections,
                            publishedAt: new Date(),
                            publishedBy: 'System',
                            note: 'Initial about layout',
                        },
                    ],
                },
                {
                    slug: '/contact',
                    title: 'Contact Us — Ekosmart Central Lab',
                    metaDescription: 'Plant coordinates, emergency helpline numbers, and location map.',
                    isHomepage: false,
                    isPublished: true,
                    sections: contactSections,
                    draftSections: contactSections,
                    order: 4,
                    lastPublishedAt: new Date(),
                    revisions: [
                        {
                            revisionId: `rev_${Date.now()}_init_contact`,
                            title: 'Initial Factory Version',
                            sections: contactSections,
                            publishedAt: new Date(),
                            publishedBy: 'System',
                            note: 'Initial contact layout',
                        },
                    ],
                },
            ]);
            console.log('[PageSeeder] Successfully seeded 4 default core pages.');
        }
    }
    catch (err) {
        console.error('[PageSeeder] Error checking/seeding pages:', err.message);
    }
};
exports.seedDefaultPagesIfEmpty = seedDefaultPagesIfEmpty;
// GET /api/v1/pages/public (List public pages)
const getPublicNavPages = async (_req, res) => {
    try {
        await (0, exports.seedDefaultPagesIfEmpty)();
        const pages = await Page_1.default.find({ isPublished: true, status: 'published' })
            .select('slug title isHomepage order')
            .sort({ order: 1, createdAt: 1 });
        res.json({
            success: true,
            data: pages,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getPublicNavPages = getPublicNavPages;
// GET /api/v1/pages/public/by-slug?path=/slug or /api/v1/pages/public/:slug(*)
const getPublicPage = async (req, res) => {
    try {
        await (0, exports.seedDefaultPagesIfEmpty)();
        const queryPath = typeof req.query.path === 'string' ? req.query.path : undefined;
        const paramSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : (req.params.slug || req.params[0]);
        const rawSlug = queryPath || (typeof paramSlug === 'string' ? paramSlug : '/');
        const cleanSlug = normalizeSlug(rawSlug);
        let page = null;
        if (cleanSlug === '/') {
            page = await Page_1.default.findOne({ isHomepage: true, isPublished: true });
            if (!page) {
                page = await Page_1.default.findOne({ slug: '/', isPublished: true });
            }
        }
        else {
            page = await Page_1.default.findOne({ slug: cleanSlug, isPublished: true });
        }
        if (!page) {
            return res.status(404).json({
                success: false,
                message: `Page not found for path: ${cleanSlug}`,
                isDynamicPage: false,
            });
        }
        res.json({
            success: true,
            data: {
                id: page._id,
                slug: page.slug,
                title: page.title,
                metaDescription: page.metaDescription,
                keywords: page.keywords,
                ogImage: page.ogImage,
                isHomepage: page.isHomepage,
                sections: page.sections.filter((s) => s.isVisible !== false),
                customCss: page.customCss,
                designTokensOverride: page.designTokensOverride,
                lastPublishedAt: page.lastPublishedAt,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getPublicPage = getPublicPage;
// GET /api/v1/pages/admin (List all admin pages)
const getAdminPages = async (_req, res) => {
    try {
        await (0, exports.seedDefaultPagesIfEmpty)();
        const pages = await Page_1.default.find()
            .select('slug title isHomepage isPublished status accessLevel order updatedAt lastPublishedAt revisions')
            .sort({ order: 1, updatedAt: -1 });
        const formatted = pages.map((p) => ({
            id: p._id,
            slug: p.slug,
            title: p.title,
            isHomepage: p.isHomepage,
            isPublished: p.isPublished,
            status: p.status,
            accessLevel: p.accessLevel,
            order: p.order,
            revisionCount: p.revisions ? p.revisions.length : 0,
            updatedAt: p.updatedAt,
            lastPublishedAt: p.lastPublishedAt,
        }));
        res.json({
            success: true,
            data: formatted,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAdminPages = getAdminPages;
// POST /api/v1/pages/admin (Create page)
const createAdminPage = async (req, res) => {
    try {
        const { title, slug, template = 'blank', isHomepage = false, accessLevel = 'public' } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Page title is required' });
        }
        const cleanSlug = normalizeSlug(slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        // Check unique slug
        const existing = await Page_1.default.findOne({ slug: cleanSlug });
        if (existing) {
            return res.status(400).json({ success: false, message: `A page with route "${cleanSlug}" already exists.` });
        }
        let initialSections = [];
        if (template === 'home')
            initialSections = (0, pageTemplates_1.getHomepageTemplate)();
        else if (template === 'services')
            initialSections = (0, pageTemplates_1.getServicesTemplate)();
        else if (template === 'about')
            initialSections = (0, pageTemplates_1.getAboutTemplate)();
        else if (template === 'contact')
            initialSections = (0, pageTemplates_1.getContactTemplate)();
        else {
            // Default blank section
            initialSections = [
                {
                    id: `sec_${Date.now()}`,
                    name: 'Main Section',
                    type: 'standard',
                    layout: { width: 'boxed', columns: 1, gap: '1.5rem' },
                    styling: { paddingY: '3rem', paddingX: '1.5rem', bgColor: '#ffffff' },
                    responsive: {},
                    isVisible: true,
                    order: 1,
                    components: [
                        {
                            id: `comp_${Date.now()}_head`,
                            type: 'text_heading',
                            name: 'Heading',
                            props: {
                                title: title,
                                subtitle: 'Enter your custom page description here.',
                                align: 'left',
                            },
                        },
                    ],
                },
            ];
        }
        if (isHomepage) {
            await Page_1.default.updateMany({ isHomepage: true }, { isHomepage: false });
        }
        const newPage = await Page_1.default.create({
            title,
            slug: cleanSlug,
            isHomepage: Boolean(isHomepage),
            isPublished: true,
            status: 'published',
            accessLevel,
            sections: initialSections,
            draftSections: initialSections,
            order: 10,
            lastPublishedAt: new Date(),
            lastEditedBy: req.user?.name || 'Admin',
            revisions: [
                {
                    revisionId: `rev_${Date.now()}_init`,
                    title: `Created "${title}"`,
                    sections: initialSections,
                    publishedAt: new Date(),
                    publishedBy: req.user?.name || 'Admin',
                    note: `Page created with ${template} template`,
                },
            ],
        });
        await FrontendAuditLog_1.default.create({
            action: 'create_page',
            targetType: 'page',
            targetId: String(newPage._id),
            targetName: title,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { slug: cleanSlug, template },
        });
        res.status(201).json({
            success: true,
            message: 'Page created successfully',
            data: newPage,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createAdminPage = createAdminPage;
// GET /api/v1/pages/admin/:id
const getAdminPageById = async (req, res) => {
    try {
        const page = await Page_1.default.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        // Ensure draftSections is populated
        if (!page.draftSections || page.draftSections.length === 0) {
            page.draftSections = page.sections;
        }
        res.json({
            success: true,
            data: page,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAdminPageById = getAdminPageById;
// PUT /api/v1/pages/admin/:id (Save draft)
const updateAdminPageDraft = async (req, res) => {
    try {
        const { title, slug, metaDescription, keywords, ogImage, isHomepage, accessLevel, draftSections, customCss, designTokensOverride } = req.body;
        const page = await Page_1.default.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        if (slug && slug !== page.slug) {
            const cleanSlug = normalizeSlug(slug);
            const conflict = await Page_1.default.findOne({ slug: cleanSlug, _id: { $ne: page._id } });
            if (conflict) {
                return res.status(400).json({ success: false, message: `Route "${cleanSlug}" is already in use by another page.` });
            }
            page.slug = cleanSlug;
        }
        if (title)
            page.title = title;
        if (metaDescription !== undefined)
            page.metaDescription = metaDescription;
        if (keywords !== undefined)
            page.keywords = keywords;
        if (ogImage !== undefined)
            page.ogImage = ogImage;
        if (accessLevel)
            page.accessLevel = accessLevel;
        if (customCss !== undefined)
            page.customCss = customCss;
        if (designTokensOverride !== undefined)
            page.designTokensOverride = designTokensOverride;
        if (isHomepage && !page.isHomepage) {
            await Page_1.default.updateMany({ _id: { $ne: page._id }, isHomepage: true }, { isHomepage: false });
            page.isHomepage = true;
        }
        else if (isHomepage === false) {
            page.isHomepage = false;
        }
        if (draftSections) {
            page.draftSections = draftSections;
            page.status = 'draft';
        }
        page.lastEditedBy = req.user?.name || 'Admin';
        await page.save();
        await FrontendAuditLog_1.default.create({
            action: 'update_draft',
            targetType: 'page',
            targetId: String(page._id),
            targetName: page.title,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { slug: page.slug, sectionCount: page.draftSections.length },
        });
        res.json({
            success: true,
            message: 'Page draft saved successfully',
            data: page,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateAdminPageDraft = updateAdminPageDraft;
// POST /api/v1/pages/admin/:id/publish (Publish draft to live)
const publishAdminPage = async (req, res) => {
    try {
        const { note = 'Published changes from Visual Frontend Builder' } = req.body;
        const page = await Page_1.default.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        const sectionsToPublish = page.draftSections && page.draftSections.length > 0 ? page.draftSections : page.sections;
        page.sections = sectionsToPublish;
        page.draftSections = sectionsToPublish;
        page.isPublished = true;
        page.status = 'published';
        page.lastPublishedAt = new Date();
        page.lastEditedBy = req.user?.name || 'Admin';
        // Push revision snapshot (keep up to last 25 revisions)
        const newRevision = {
            revisionId: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            title: page.title,
            sections: JSON.parse(JSON.stringify(sectionsToPublish)),
            designTokensOverride: page.designTokensOverride,
            publishedAt: new Date(),
            publishedBy: req.user?.name || 'Admin',
            note,
        };
        if (!page.revisions)
            page.revisions = [];
        page.revisions.unshift(newRevision);
        if (page.revisions.length > 25) {
            page.revisions = page.revisions.slice(0, 25);
        }
        await page.save();
        await FrontendAuditLog_1.default.create({
            action: 'publish_page',
            targetType: 'page',
            targetId: String(page._id),
            targetName: page.title,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { revisionId: newRevision.revisionId, note },
        });
        res.json({
            success: true,
            message: 'Page published live to frontend successfully!',
            data: page,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.publishAdminPage = publishAdminPage;
// POST /api/v1/pages/admin/:id/revert/:revisionId (Rollback revision)
const revertAdminPage = async (req, res) => {
    try {
        const { id, revisionId } = req.params;
        const page = await Page_1.default.findById(id);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        const rev = page.revisions.find((r) => r.revisionId === revisionId);
        if (!rev) {
            return res.status(404).json({ success: false, message: 'Revision snapshot not found' });
        }
        page.sections = JSON.parse(JSON.stringify(rev.sections));
        page.draftSections = JSON.parse(JSON.stringify(rev.sections));
        if (rev.designTokensOverride) {
            page.designTokensOverride = rev.designTokensOverride;
        }
        page.status = 'published';
        page.lastPublishedAt = new Date();
        page.lastEditedBy = req.user?.name || 'Admin';
        // Record rollback action in revisions
        page.revisions.unshift({
            revisionId: `rev_${Date.now()}_rollback`,
            title: `Rollback to "${rev.title}"`,
            sections: page.sections,
            publishedAt: new Date(),
            publishedBy: req.user?.name || 'Admin',
            note: `Rolled back to revision ID ${revisionId} (${rev.publishedAt.toISOString()})`,
        });
        await page.save();
        await FrontendAuditLog_1.default.create({
            action: 'revert_page',
            targetType: 'page',
            targetId: String(page._id),
            targetName: page.title,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { revertedToRevisionId: revisionId },
        });
        res.json({
            success: true,
            message: `Successfully restored page layout to revision from ${new Date(rev.publishedAt).toLocaleDateString()}`,
            data: page,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.revertAdminPage = revertAdminPage;
// POST /api/v1/pages/admin/:id/duplicate
const duplicateAdminPage = async (req, res) => {
    try {
        const sourcePage = await Page_1.default.findById(req.params.id);
        if (!sourcePage) {
            return res.status(404).json({ success: false, message: 'Source page not found' });
        }
        const newSlug = `${sourcePage.slug}-copy-${Date.now().toString().slice(-4)}`;
        const newTitle = `${sourcePage.title} (Copy)`;
        const duplicated = await Page_1.default.create({
            title: newTitle,
            slug: newSlug,
            metaDescription: sourcePage.metaDescription,
            keywords: sourcePage.keywords,
            isHomepage: false,
            isPublished: false,
            status: 'draft',
            accessLevel: sourcePage.accessLevel,
            sections: sourcePage.sections,
            draftSections: sourcePage.sections,
            customCss: sourcePage.customCss,
            order: sourcePage.order + 1,
            lastEditedBy: req.user?.name || 'Admin',
            revisions: [],
        });
        await FrontendAuditLog_1.default.create({
            action: 'duplicate_page',
            targetType: 'page',
            targetId: String(duplicated._id),
            targetName: newTitle,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { originalSlug: sourcePage.slug, newSlug },
        });
        res.status(201).json({
            success: true,
            message: 'Page duplicated successfully as draft',
            data: duplicated,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.duplicateAdminPage = duplicateAdminPage;
// DELETE /api/v1/pages/admin/:id
const deleteAdminPage = async (req, res) => {
    try {
        const page = await Page_1.default.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        if (page.isHomepage || page.slug === '/') {
            return res.status(400).json({ success: false, message: 'Cannot delete the designated homepage.' });
        }
        await Page_1.default.findByIdAndDelete(req.params.id);
        await FrontendAuditLog_1.default.create({
            action: 'delete_page',
            targetType: 'page',
            targetId: String(page._id),
            targetName: page.title,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { slug: page.slug },
        });
        res.json({
            success: true,
            message: `Page "${page.title}" deleted successfully`,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteAdminPage = deleteAdminPage;
