"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.deleteAdminMedia = exports.createAdminMedia = exports.getAdminMedia = exports.deleteAdminForm = exports.saveAdminForm = exports.getAdminForms = exports.updateAdminTheme = exports.getAdminTheme = exports.deleteAdminPage = exports.duplicateAdminPage = exports.rollbackAdminPage = exports.publishAdminPage = exports.updateAdminPageDraft = exports.createAdminPage = exports.getAdminPageById = exports.getAdminPages = exports.submitPublicForm = exports.getPublicFormSchema = exports.getPublicPageBySlug = exports.getPublicPages = exports.getPublicTheme = exports.seedDefaultContent = void 0;
const Page_1 = require("../models/Page");
const ThemeConfig_1 = require("../models/ThemeConfig");
const FormSchema_1 = require("../models/FormSchema");
const MediaAsset_1 = require("../models/MediaAsset");
const FrontendAuditLog_1 = require("../models/FrontendAuditLog");
const Complaint_1 = require("../models/Complaint");
const Warranty_1 = require("../models/Warranty");
const Customer_1 = require("../models/Customer");
const complaint_controller_1 = require("./complaint.controller");
const pageTemplates_1 = require("../utils/pageTemplates");
// Helper: Normalize slug
const normalizeSlug = (slug) => {
    if (!slug || slug === '/' || slug === 'home')
        return '/';
    let clean = slug.trim().toLowerCase();
    if (!clean.startsWith('/'))
        clean = `/${clean}`;
    return clean;
};
// Seed default content
const seedDefaultContent = async (_req, res) => {
    try {
        const pageCount = await Page_1.Page.countDocuments();
        if (pageCount === 0) {
            const homeSections = (0, pageTemplates_1.getHomepageTemplate)();
            const servicesSections = (0, pageTemplates_1.getServicesTemplate)();
            const aboutSections = (0, pageTemplates_1.getAboutTemplate)();
            const contactSections = (0, pageTemplates_1.getContactTemplate)();
            await Page_1.Page.create([
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
                    revisions: [{ revisionId: `rev_${Date.now()}_init`, title: 'Initial Factory Version', sections: homeSections, publishedAt: new Date(), publishedBy: 'System', note: 'Initial layout' }],
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
                    revisions: [{ revisionId: `rev_${Date.now()}_serv`, title: 'Initial Version', sections: servicesSections, publishedAt: new Date(), publishedBy: 'System' }],
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
                    revisions: [{ revisionId: `rev_${Date.now()}_about`, title: 'Initial Version', sections: aboutSections, publishedAt: new Date(), publishedBy: 'System' }],
                },
                {
                    slug: '/contact',
                    title: 'Contact Us — Ekosmart Central Lab',
                    metaDescription: 'Plant coordinates, emergency helpline numbers, and location map.',
                    isHomepage: false,
                    isPublished: true,
                    status: 'published',
                    sections: contactSections,
                    draftSections: contactSections,
                    order: 4,
                    lastPublishedAt: new Date(),
                    revisions: [{ revisionId: `rev_${Date.now()}_contact`, title: 'Initial Version', sections: contactSections, publishedAt: new Date(), publishedBy: 'System' }],
                },
            ]);
        }
        let theme = await ThemeConfig_1.ThemeConfig.findOne({ key: 'global_theme' });
        if (!theme) {
            theme = await ThemeConfig_1.ThemeConfig.create({
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
        if (res) {
            return res.json({ success: true, message: 'Default content seeded successfully' });
        }
    }
    catch (err) {
        if (res) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
};
exports.seedDefaultContent = seedDefaultContent;
// ==========================================
// PUBLIC CONTROLLER METHODS
// ==========================================
const getPublicTheme = async (_req, res) => {
    try {
        let theme = await ThemeConfig_1.ThemeConfig.findOne({ key: 'global_theme' });
        if (!theme) {
            await (0, exports.seedDefaultContent)();
            theme = await ThemeConfig_1.ThemeConfig.findOne({ key: 'global_theme' });
        }
        res.json({
            success: true,
            data: {
                colors: theme?.colors || ThemeConfig_1.defaultColors,
                typography: theme?.typography || ThemeConfig_1.defaultTypography,
                dimensions: theme?.dimensions || ThemeConfig_1.defaultDimensions,
                effects: theme?.effects || ThemeConfig_1.defaultEffects,
                header: theme?.header || ThemeConfig_1.defaultHeader,
                footer: theme?.footer || ThemeConfig_1.defaultFooter,
                customGlobalCss: theme?.customGlobalCss || '',
                lastPublishedAt: theme?.lastPublishedAt,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getPublicTheme = getPublicTheme;
const getPublicPages = async (_req, res) => {
    try {
        await (0, exports.seedDefaultContent)();
        const pages = await Page_1.Page.find({ isPublished: true, status: 'published' })
            .select('slug title isHomepage order')
            .sort({ order: 1, createdAt: 1 });
        res.json({ success: true, data: pages });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getPublicPages = getPublicPages;
const getPublicPageBySlug = async (req, res) => {
    try {
        await (0, exports.seedDefaultContent)();
        const queryPath = typeof req.query.path === 'string' ? req.query.path : undefined;
        const paramSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : (req.params.slug || req.params[0]);
        const rawSlug = queryPath || paramSlug || '/';
        const cleanSlug = normalizeSlug(rawSlug);
        let page = null;
        if (cleanSlug === '/') {
            page = await Page_1.Page.findOne({ isHomepage: true, isPublished: true });
            if (!page)
                page = await Page_1.Page.findOne({ slug: '/', isPublished: true });
        }
        else {
            page = await Page_1.Page.findOne({ slug: cleanSlug, isPublished: true });
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
exports.getPublicPageBySlug = getPublicPageBySlug;
const getPublicFormSchema = async (req, res) => {
    try {
        const { formKey } = req.params;
        const form = await FormSchema_1.FormSchema.findOne({ formKey, isActive: true });
        if (!form) {
            return res.status(404).json({ success: false, message: `Form "${formKey}" not found` });
        }
        res.json({ success: true, data: form });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getPublicFormSchema = getPublicFormSchema;
const submitPublicForm = async (req, res) => {
    try {
        const { formKey } = req.params;
        const formData = req.body;
        const form = await FormSchema_1.FormSchema.findOne({ formKey, isActive: true });
        if (!form) {
            return res.status(404).json({ success: false, message: `Form "${formKey}" not found` });
        }
        // Validate required fields
        for (const field of form.fields) {
            if (field.required && !formData[field.fieldKey]) {
                return res.status(400).json({
                    success: false,
                    message: `Field "${field.label}" is required.`,
                });
            }
        }
        // Handle workflow destination
        if (form.destinationWorkflow === 'ticket_submission') {
            const division = formData.division || formData.complaintType || 'Battery';
            const cleanMobile = String(formData.customerMobile || formData.phone || formData.mobile || '0000000000').trim();
            const cleanName = String(formData.customerName || formData.name || 'Website Customer').trim();
            let customer = await Customer_1.Customer.findOne({ mobile: cleanMobile });
            if (!customer) {
                customer = await Customer_1.Customer.create({
                    customerId: `CUST-${Date.now().toString().slice(-6)}`,
                    name: cleanName,
                    mobile: cleanMobile,
                    email: formData.email,
                    customerType: 'General',
                });
            }
            const ticketNumber = await (0, complaint_controller_1.generateTicketNumber)(division);
            const newComplaint = await Complaint_1.Complaint.create({
                ticketNumber,
                customer: customer._id,
                division,
                complaintType: formData.complaintType || division,
                description: formData.description || JSON.stringify(formData),
                formData,
                status: 'Pending',
                priority: 'Medium',
            });
            return res.status(201).json({
                success: true,
                message: form.successMessage || 'Service ticket submitted successfully',
                ticketNumber,
                data: newComplaint,
            });
        }
        if (form.destinationWorkflow === 'warranty_registration') {
            const serialNumber = formData.serialNumber || formData.batterySerialNumber;
            if (serialNumber) {
                const cleanMobile = String(formData.customerMobile || formData.phone || formData.mobile || '0000000000').trim();
                const cleanName = String(formData.customerName || formData.name || 'Website Customer').trim();
                let customer = await Customer_1.Customer.findOne({ mobile: cleanMobile });
                if (!customer) {
                    customer = await Customer_1.Customer.create({
                        customerId: `CUST-${Date.now().toString().slice(-6)}`,
                        name: cleanName,
                        mobile: cleanMobile,
                        customerType: 'General',
                    });
                }
                const warrantyNumber = `WRN-${Date.now().toString().slice(-6)}`;
                const pDate = formData.purchaseDate ? new Date(formData.purchaseDate) : new Date();
                const durationMonths = Number(formData.durationMonths || 36);
                const expDate = new Date(pDate);
                expDate.setMonth(expDate.getMonth() + durationMonths);
                await Warranty_1.Warranty.create({
                    warrantyNumber,
                    serialNumber,
                    category: formData.category || 'Battery',
                    customer: customer._id,
                    product: formData.product || 'Lithium Battery Pack',
                    billNumber: formData.billNumber || `INV-${Date.now().toString().slice(-6)}`,
                    purchaseDate: pDate,
                    warrantyStartDate: pDate,
                    warrantyExpiryDate: expDate,
                    status: 'Active',
                    formData,
                });
            }
        }
        res.json({
            success: true,
            message: form.successMessage || 'Form submitted successfully',
            data: formData,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.submitPublicForm = submitPublicForm;
// ==========================================
// ADMIN CONTROLLER METHODS
// ==========================================
const getAdminPages = async (_req, res) => {
    try {
        await (0, exports.seedDefaultContent)();
        const pages = await Page_1.Page.find().sort({ order: 1, updatedAt: -1 });
        const formatted = pages.map((p) => {
            const activeSections = p.sections || [];
            const activeDraftSections = p.draftSections && p.draftSections.length > 0 ? p.draftSections : activeSections;
            return {
                _id: String(p._id),
                id: String(p._id),
                pageId: String(p._id),
                slug: p.slug,
                title: p.title,
                description: p.metaDescription || '',
                metaDescription: p.metaDescription || '',
                keywords: p.keywords || '',
                ogImage: p.ogImage || '',
                isHomepage: p.isHomepage,
                isHome: p.isHomepage,
                isPublished: p.isPublished,
                status: p.status || (p.isPublished ? 'published' : 'draft'),
                accessLevel: p.accessLevel || 'public',
                access: p.accessLevel || 'public',
                order: p.order || 0,
                sections: activeSections,
                draftSections: activeDraftSections,
                currentVersion: p.revisions ? p.revisions.length : 1,
                revisionCount: p.revisions ? p.revisions.length : 0,
                revisions: p.revisions || [],
                customCss: p.customCss || '',
                designTokensOverride: p.designTokensOverride || {},
                updatedAt: p.updatedAt,
                lastPublishedAt: p.lastPublishedAt,
            };
        });
        res.json({ success: true, data: formatted });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAdminPages = getAdminPages;
const getAdminPageById = async (req, res) => {
    try {
        const page = await Page_1.Page.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        if (!page.draftSections || page.draftSections.length === 0) {
            page.draftSections = page.sections || [];
        }
        const formatted = {
            _id: String(page._id),
            id: String(page._id),
            pageId: String(page._id),
            slug: page.slug,
            title: page.title,
            description: page.metaDescription || '',
            metaDescription: page.metaDescription || '',
            keywords: page.keywords || '',
            ogImage: page.ogImage || '',
            isHomepage: page.isHomepage,
            isHome: page.isHomepage,
            isPublished: page.isPublished,
            status: page.status || 'published',
            accessLevel: page.accessLevel || 'public',
            access: page.accessLevel || 'public',
            order: page.order || 0,
            sections: page.sections || [],
            draftSections: page.draftSections || page.sections || [],
            currentVersion: page.revisions ? page.revisions.length : 1,
            revisionCount: page.revisions ? page.revisions.length : 0,
            revisions: page.revisions || [],
            customCss: page.customCss || '',
            designTokensOverride: page.designTokensOverride || {},
            updatedAt: page.updatedAt,
            lastPublishedAt: page.lastPublishedAt,
        };
        res.json({ success: true, data: formatted });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAdminPageById = getAdminPageById;
const createAdminPage = async (req, res) => {
    try {
        const { title, slug, template = 'blank', isHomepage = false, accessLevel = 'public' } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Page title is required' });
        }
        const cleanSlug = normalizeSlug(slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        const existing = await Page_1.Page.findOne({ slug: cleanSlug });
        if (existing) {
            return res.status(400).json({ success: false, message: `Route "${cleanSlug}" already exists.` });
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
                            props: { title, subtitle: 'Enter custom description', align: 'left' },
                        },
                    ],
                },
            ];
        }
        if (isHomepage) {
            await Page_1.Page.updateMany({ isHomepage: true }, { isHomepage: false });
        }
        const newPage = await Page_1.Page.create({
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
                    note: `Created from ${template} template`,
                },
            ],
        });
        await FrontendAuditLog_1.FrontendAuditLog.create({
            action: 'create_page',
            targetType: 'page',
            targetId: String(newPage._id),
            targetName: title,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { slug: cleanSlug, template },
        });
        res.status(201).json({ success: true, message: 'Page created successfully', data: newPage });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createAdminPage = createAdminPage;
const updateAdminPageDraft = async (req, res) => {
    try {
        const { title, slug, metaDescription, keywords, ogImage, isHomepage, accessLevel, draftSections, customCss, designTokensOverride } = req.body;
        const page = await Page_1.Page.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        if (slug && slug !== page.slug) {
            const cleanSlug = normalizeSlug(slug);
            const conflict = await Page_1.Page.findOne({ slug: cleanSlug, _id: { $ne: page._id } });
            if (conflict) {
                return res.status(400).json({ success: false, message: `Route "${cleanSlug}" is already in use.` });
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
            await Page_1.Page.updateMany({ _id: { $ne: page._id }, isHomepage: true }, { isHomepage: false });
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
        await FrontendAuditLog_1.FrontendAuditLog.create({
            action: 'update_draft',
            targetType: 'page',
            targetId: String(page._id),
            targetName: page.title,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { slug: page.slug, sectionCount: page.draftSections.length },
        });
        res.json({ success: true, message: 'Draft saved successfully', data: page });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateAdminPageDraft = updateAdminPageDraft;
const publishAdminPage = async (req, res) => {
    try {
        const { note = 'Published changes from Visual Frontend Builder' } = req.body;
        const page = await Page_1.Page.findById(req.params.id);
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
        if (page.revisions.length > 25)
            page.revisions = page.revisions.slice(0, 25);
        await page.save();
        await FrontendAuditLog_1.FrontendAuditLog.create({
            action: 'publish_page',
            targetType: 'page',
            targetId: String(page._id),
            targetName: page.title,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { revisionId: newRevision.revisionId, note },
        });
        res.json({ success: true, message: 'Page published live successfully!', data: page });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.publishAdminPage = publishAdminPage;
const rollbackAdminPage = async (req, res) => {
    try {
        const { id, version } = req.params;
        const page = await Page_1.Page.findById(id);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        const rev = page.revisions.find((r) => r.revisionId === version);
        if (!rev) {
            return res.status(404).json({ success: false, message: 'Revision snapshot not found' });
        }
        page.sections = JSON.parse(JSON.stringify(rev.sections));
        page.draftSections = JSON.parse(JSON.stringify(rev.sections));
        if (rev.designTokensOverride)
            page.designTokensOverride = rev.designTokensOverride;
        page.status = 'published';
        page.lastPublishedAt = new Date();
        page.lastEditedBy = req.user?.name || 'Admin';
        page.revisions.unshift({
            revisionId: `rev_${Date.now()}_rollback`,
            title: `Rollback to "${rev.title}"`,
            sections: page.sections,
            publishedAt: new Date(),
            publishedBy: req.user?.name || 'Admin',
            note: `Rolled back to revision ID ${version}`,
        });
        await page.save();
        await FrontendAuditLog_1.FrontendAuditLog.create({
            action: 'revert_page',
            targetType: 'page',
            targetId: String(page._id),
            targetName: page.title,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { revertedToRevisionId: version },
        });
        res.json({ success: true, message: 'Page rolled back to selected revision', data: page });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.rollbackAdminPage = rollbackAdminPage;
const duplicateAdminPage = async (req, res) => {
    try {
        const sourcePage = await Page_1.Page.findById(req.params.id);
        if (!sourcePage) {
            return res.status(404).json({ success: false, message: 'Source page not found' });
        }
        const newSlug = `${sourcePage.slug}-copy-${Date.now().toString().slice(-4)}`;
        const newTitle = `${sourcePage.title} (Copy)`;
        const duplicated = await Page_1.Page.create({
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
        await FrontendAuditLog_1.FrontendAuditLog.create({
            action: 'duplicate_page',
            targetType: 'page',
            targetId: String(duplicated._id),
            targetName: newTitle,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { originalSlug: sourcePage.slug, newSlug },
        });
        res.status(201).json({ success: true, message: 'Page duplicated as draft', data: duplicated });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.duplicateAdminPage = duplicateAdminPage;
const deleteAdminPage = async (req, res) => {
    try {
        const page = await Page_1.Page.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        if (page.isHomepage || page.slug === '/') {
            return res.status(400).json({ success: false, message: 'Cannot delete homepage' });
        }
        await Page_1.Page.findByIdAndDelete(req.params.id);
        await FrontendAuditLog_1.FrontendAuditLog.create({
            action: 'delete_page',
            targetType: 'page',
            targetId: String(page._id),
            targetName: page.title,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
            details: { slug: page.slug },
        });
        res.json({ success: true, message: `Page "${page.title}" deleted successfully` });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteAdminPage = deleteAdminPage;
const getAdminTheme = async (_req, res) => {
    try {
        let theme = await ThemeConfig_1.ThemeConfig.findOne({ key: 'global_theme' });
        if (!theme) {
            await (0, exports.seedDefaultContent)();
            theme = await ThemeConfig_1.ThemeConfig.findOne({ key: 'global_theme' });
        }
        res.json({ success: true, data: theme });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAdminTheme = getAdminTheme;
const updateAdminTheme = async (req, res) => {
    try {
        const { colors, typography, dimensions, effects, header, footer, customGlobalCss, isPublish = true } = req.body;
        let theme = await ThemeConfig_1.ThemeConfig.findOne({ key: 'global_theme' });
        if (!theme) {
            await (0, exports.seedDefaultContent)();
            theme = await ThemeConfig_1.ThemeConfig.findOne({ key: 'global_theme' });
        }
        if (theme) {
            if (colors)
                theme.colors = colors;
            if (typography)
                theme.typography = typography;
            if (dimensions)
                theme.dimensions = dimensions;
            if (effects)
                theme.effects = effects;
            if (header)
                theme.header = header;
            if (footer)
                theme.footer = footer;
            if (customGlobalCss !== undefined)
                theme.customGlobalCss = customGlobalCss;
            if (isPublish)
                theme.lastPublishedAt = new Date();
            theme.lastEditedBy = req.user?.name || 'Admin';
            await theme.save();
            await FrontendAuditLog_1.FrontendAuditLog.create({
                action: 'publish_theme',
                targetType: 'theme',
                targetName: 'Global Theme Tokens',
                adminEmail: req.user?.email || 'admin@ekosmart.com',
            });
        }
        res.json({ success: true, message: 'Theme updated successfully', data: theme });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateAdminTheme = updateAdminTheme;
const getAdminForms = async (_req, res) => {
    try {
        const forms = await FormSchema_1.FormSchema.find().sort({ createdAt: -1 });
        res.json({ success: true, data: forms });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAdminForms = getAdminForms;
const saveAdminForm = async (req, res) => {
    try {
        const { formKey, title, description, fields, submitButton, destinationWorkflow, successMessage, errorMessage, isActive = true } = req.body;
        if (!formKey || !title) {
            return res.status(400).json({ success: false, message: 'Form Key and Title are required' });
        }
        const form = await FormSchema_1.FormSchema.findOneAndUpdate({ formKey }, {
            formKey,
            title,
            description,
            fields: fields || [],
            submitButton: submitButton || { label: 'Submit', color: 'emerald', icon: 'Send' },
            destinationWorkflow: destinationWorkflow || 'contact_inquiry',
            successMessage: successMessage || 'Thank you! Submitted successfully.',
            errorMessage: errorMessage || 'Submission failed. Please try again.',
            isActive,
        }, { upsert: true, new: true });
        res.json({ success: true, message: 'Form schema saved successfully', data: form });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.saveAdminForm = saveAdminForm;
const deleteAdminForm = async (req, res) => {
    try {
        const { formKey } = req.params;
        await FormSchema_1.FormSchema.findOneAndDelete({ formKey });
        res.json({ success: true, message: `Form "${formKey}" deleted successfully` });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteAdminForm = deleteAdminForm;
const getAdminMedia = async (req, res) => {
    try {
        const { category, search } = req.query;
        const query = {};
        if (category && category !== 'all')
            query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: String(search), $options: 'i' } },
                { altText: { $regex: String(search), $options: 'i' } },
            ];
        }
        const assets = await MediaAsset_1.MediaAsset.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: assets });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAdminMedia = getAdminMedia;
const createAdminMedia = async (req, res) => {
    try {
        const { name, category = 'general', url, altText, fileSize, mimeType } = req.body;
        if (!name || !url) {
            return res.status(400).json({ success: false, message: 'Name and URL are required' });
        }
        const asset = await MediaAsset_1.MediaAsset.create({
            name,
            category,
            url,
            altText: altText || name,
            fileSize: fileSize || 0,
            mimeType: mimeType || 'image/png',
            uploadedBy: req.user?.name || 'Admin',
        });
        await FrontendAuditLog_1.FrontendAuditLog.create({
            action: 'upload_media',
            targetType: 'media',
            targetId: String(asset._id),
            targetName: name,
            adminEmail: req.user?.email || 'admin@ekosmart.com',
        });
        res.status(201).json({ success: true, message: 'Media asset registered successfully', data: asset });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createAdminMedia = createAdminMedia;
const deleteAdminMedia = async (req, res) => {
    try {
        const { assetId } = req.params;
        await MediaAsset_1.MediaAsset.findByIdAndDelete(assetId);
        res.json({ success: true, message: 'Media asset deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteAdminMedia = deleteAdminMedia;
const getAuditLogs = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 50;
        const logs = await FrontendAuditLog_1.FrontendAuditLog.find().sort({ timestamp: -1 }).limit(limit);
        res.json({ success: true, data: logs });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAuditLogs = getAuditLogs;
