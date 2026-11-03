"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWarrantyForm = exports.saveWarrantyForm = exports.deleteComplaintForm = exports.saveComplaintForm = exports.getAllWarrantyForms = exports.getWarrantyForm = exports.getAllComplaintForms = exports.getComplaintForm = exports.defaultWarrantyForms = exports.defaultComplaintForms = exports.getDynamicSections = void 0;
const ComplaintForm_1 = require("../models/ComplaintForm");
const WarrantyForm_1 = require("../models/WarrantyForm");
const Content_1 = require("../models/Content");
const ComplaintType_1 = require("../models/ComplaintType");
const extractDivisionFromCard = (c) => {
    if (c.linkUrl && c.linkUrl.includes('division=')) {
        try {
            const match = c.linkUrl.match(/division=([^&]+)/);
            if (match && match[1]) {
                return decodeURIComponent(match[1]).trim();
            }
        }
        catch { }
    }
    if (c.section && c.section.trim()) {
        return c.section.trim();
    }
    if (c.title && c.title.trim()) {
        return c.title.trim();
    }
    return '';
};
const getDynamicSections = async (_req, res) => {
    try {
        const content = (await Content_1.Content.findOne({ key: 'global_cms' })) || (await Content_1.Content.findOne());
        const sectionsSet = new Set();
        if (content?.serviceCards && Array.isArray(content.serviceCards)) {
            content.serviceCards
                .filter((c) => c.isVisible !== false)
                .forEach((c) => {
                const div = extractDivisionFromCard(c);
                if (div)
                    sectionsSet.add(div);
            });
        }
        const complaintForms = await ComplaintForm_1.ComplaintForm.find({ isActive: { $ne: false } }, 'division');
        complaintForms.forEach((f) => {
            const d = f.division?.trim();
            if (d)
                sectionsSet.add(d);
        });
        let sections = Array.from(sectionsSet);
        // Always guarantee the core 4 sections exist
        ['Showroom', 'Rental', 'Spare Parts', 'Battery'].forEach((s) => {
            if (!sections.some((x) => x.toLowerCase() === s.toLowerCase())) {
                sections.push(s);
            }
        });
        // Case-insensitive deduplication while preserving original casing
        const uniqueSections = [];
        const seenLower = new Set();
        for (const sec of sections) {
            const lower = sec.toLowerCase();
            if (!seenLower.has(lower)) {
                seenLower.add(lower);
                uniqueSections.push(sec);
            }
        }
        res.json({ success: true, data: uniqueSections });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getDynamicSections = getDynamicSections;
exports.defaultComplaintForms = [
    {
        division: 'Showroom',
        fields: [
            { name: 'customerName', label: 'Customer / Entity Name', type: 'Text', required: true, order: 1, isActive: true },
            { name: 'contactNumber', label: 'Contact Mobile Number', type: 'Mobile', required: true, order: 2, isActive: true },
            { name: 'email', label: 'Email Address', type: 'Email', required: false, order: 3, isActive: true },
            { name: 'dealershipName', label: 'Showroom / Dealership Location', type: 'Text', required: true, order: 4, isActive: true },
            { name: 'modelNumber', label: 'Vehicle Model / Chassis No', type: 'Text', required: true, order: 5, isActive: true },
            { name: 'invoiceNumber', label: 'Invoice / Booking Ref', type: 'Text', required: false, order: 6, isActive: true },
            {
                name: 'issueCategory',
                label: 'Inquiry / Issue Category',
                type: 'Dropdown',
                required: true,
                options: ['New Vehicle Booking', 'Delivery Delay', 'Documentation / RC', 'Sales Service Assistance', 'Other Showroom Query'],
                order: 7,
                isActive: true,
            },
            { name: 'description', label: 'Detailed Problem Description', type: 'Textarea', required: true, order: 8, isActive: true },
        ],
    },
    {
        division: 'Battery',
        fields: [
            { name: 'customerName', label: 'Customer Full Name', type: 'Text', required: true, order: 1, isActive: true },
            { name: 'contactNumber', label: 'Contact Mobile Number', type: 'Mobile', required: true, order: 2, isActive: true },
            { name: 'email', label: 'Email Address', type: 'Email', required: false, order: 3, isActive: true },
            { name: 'serialNumber', label: 'Battery Serial Number', type: 'Serial Number', required: true, order: 4, isActive: true },
            {
                name: 'batteryModel',
                label: 'Battery Pack Voltage / Spec',
                type: 'Dropdown',
                required: true,
                options: ['48V 28Ah / 32Ah LFP (3-Yr)', '48V 40Ah Lithium-Ion (3-Yr)', '60V 30Ah / 32Ah LFP (1.5-Yr)', '60V 40Ah Lithium-Ion (1.5-Yr)', '72V 32Ah / 40Ah Pack (1.5-Yr)', 'Custom Pack'],
                order: 5,
                isActive: true,
            },
            { name: 'purchaseDate', label: 'Purchase Date / Bill Date', type: 'Date', required: false, order: 6, isActive: true },
            {
                name: 'issueType',
                label: 'Battery Issue Category',
                type: 'Dropdown',
                required: true,
                options: ['Low Mileage / Quick Drain', 'Charging Failure / Charger Tripping', 'BMS Cutoff / No Voltage Output', 'Physical Casing / Terminal Damage', 'Warranty Inspection Request', 'AMC Health Checkup'],
                order: 7,
                isActive: true,
            },
            { name: 'description', label: 'Issue / Fault Details', type: 'Textarea', required: true, order: 8, isActive: true },
        ],
    },
    {
        division: 'Rental',
        fields: [
            { name: 'customerName', label: 'Rider / Customer Name', type: 'Text', required: true, order: 1, isActive: true },
            { name: 'contactNumber', label: 'Contact Mobile Number', type: 'Mobile', required: true, order: 2, isActive: true },
            { name: 'email', label: 'Email Address', type: 'Email', required: false, order: 3, isActive: true },
            { name: 'scooterId', label: 'Rental Vehicle / Scooter ID', type: 'Text', required: true, order: 4, isActive: true },
            {
                name: 'hubLocation',
                label: 'Rental Hub Location',
                type: 'Dropdown',
                required: true,
                options: ['Kota Central Hub', 'Showroom Hub 1', 'Main Bus Stand Station', 'Railway Station Kiosk'],
                order: 5,
                isActive: true,
            },
            {
                name: 'rentalIssue',
                label: 'Rental Issue Category',
                type: 'Dropdown',
                required: true,
                options: ['Battery Swap Station Issue', 'Vehicle Breakdown / Roadside Help', 'Rental Plan Renewal / Extension', 'Security Deposit Refund Query', 'App / Account Issue'],
                order: 6,
                isActive: true,
            },
            { name: 'description', label: 'Problem Description', type: 'Textarea', required: true, order: 7, isActive: true },
        ],
    },
    {
        division: 'Spare Parts',
        fields: [
            { name: 'customerName', label: 'Customer / Mechanic Name', type: 'Text', required: true, order: 1, isActive: true },
            { name: 'contactNumber', label: 'Contact Mobile Number', type: 'Mobile', required: true, order: 2, isActive: true },
            { name: 'email', label: 'Email Address', type: 'Email', required: false, order: 3, isActive: true },
            { name: 'partName', label: 'Part Name / Item Code', type: 'Text', required: true, order: 4, isActive: true },
            {
                name: 'partCategory',
                label: 'Spare Parts Category',
                type: 'Dropdown',
                required: true,
                options: ['Aluminium Fast Charger (67.2V / 72V)', 'Smart BMS & Wiring Harness', 'BLDC Motor & Controller', 'Throttle / Display Unit', 'Brake Assembly & Cables', 'OEM Connectors & Fuses'],
                order: 5,
                isActive: true,
            },
            { name: 'orderRef', label: 'Order / Invoice Ref Number', type: 'Text', required: false, order: 6, isActive: true },
            { name: 'description', label: 'Problem / Replacement Requirement', type: 'Textarea', required: true, order: 7, isActive: true },
        ],
    },
];
exports.defaultWarrantyForms = [
    {
        category: 'Showroom',
        fields: [
            { name: 'customerName', label: 'Customer Full Name', type: 'Text', required: true, order: 1, isActive: true },
            { name: 'mobile', label: 'Contact Mobile Number', type: 'Mobile', required: true, order: 2, isActive: true },
            { name: 'email', label: 'Email Address', type: 'Email', required: true, order: 3, isActive: true },
            { name: 'serialNumber', label: 'Product Serial Number', type: 'Serial Number', required: true, order: 4, isActive: true },
            { name: 'model', label: 'Battery / Vehicle Model', type: 'Text', required: true, order: 5, isActive: true },
            { name: 'dealerLocation', label: 'Showroom / Dealership Store', type: 'Text', required: true, order: 6, isActive: true },
            { name: 'purchaseDate', label: 'Date of Purchase', type: 'Date', required: true, order: 7, isActive: true },
            { name: 'billNumber', label: 'Invoice / Bill Number', type: 'Text', required: true, order: 8, isActive: true },
        ],
    },
    {
        category: 'Plant',
        fields: [
            { name: 'companyName', label: 'Organization / Company Name', type: 'Text', required: true, order: 1, isActive: true },
            { name: 'contactPerson', label: 'Authorized Person Name', type: 'Text', required: true, order: 2, isActive: true },
            { name: 'mobile', label: 'Contact Mobile Number', type: 'Mobile', required: true, order: 3, isActive: true },
            { name: 'email', label: 'Official Business Email', type: 'Email', required: true, order: 4, isActive: true },
            { name: 'serialNumber', label: 'Batch / Master Serial Number', type: 'Serial Number', required: true, order: 5, isActive: true },
            {
                name: 'packSpec',
                label: 'Commercial Battery Specification',
                type: 'Dropdown',
                required: true,
                options: ['48V 100Ah Industrial LFP', '60V 80Ah Commercial Fleet', '72V 100Ah E-Rickshaw Heavy Pack', 'Custom Solar Energy Storage ESS'],
                order: 6,
                isActive: true,
            },
            { name: 'challanNumber', label: 'Plant Delivery Challan / Invoice No', type: 'Text', required: true, order: 7, isActive: true },
            { name: 'dispatchDate', label: 'Commissioning / Dispatch Date', type: 'Date', required: true, order: 8, isActive: true },
        ],
    },
];
const getComplaintForm = async (req, res) => {
    try {
        const rawDivision = String(req.params.division || '').trim();
        let form = await ComplaintForm_1.ComplaintForm.findOne({
            division: { $regex: new RegExp(`^${rawDivision}$`, 'i') },
            isActive: true,
        });
        if (!form || !form.fields || form.fields.length === 0) {
            const matchedDefault = exports.defaultComplaintForms.find((d) => d.division.toLowerCase() === rawDivision.toLowerCase());
            if (matchedDefault) {
                form = await ComplaintForm_1.ComplaintForm.findOneAndUpdate({ division: matchedDefault.division }, { $set: { fields: matchedDefault.fields, isActive: true } }, { upsert: true, new: true });
            }
            else {
                // Automatically provide and persist standard fields for any new/custom division!
                const defaultFields = [
                    { name: 'customerName', label: 'Customer / Entity Name', type: 'Text', required: true, order: 1, isActive: true },
                    { name: 'contactNumber', label: 'Contact Mobile Number', type: 'Mobile', required: true, order: 2, isActive: true },
                    { name: 'email', label: 'Email Address', type: 'Email', required: false, order: 3, isActive: true },
                    { name: 'serviceIdentifier', label: `${rawDivision} Reference / Serial No.`, type: 'Text', required: true, order: 4, isActive: true },
                    {
                        name: 'issueType',
                        label: 'Issue / Inquiry Category',
                        type: 'Dropdown',
                        required: true,
                        options: ['General Inquiry', 'Breakdown / Malfunction', 'Maintenance Request', 'Billing / Account Issue', 'Other'],
                        order: 5,
                        isActive: true,
                    },
                    { name: 'description', label: 'Detailed Description of Request', type: 'Textarea', required: true, order: 6, isActive: true },
                ];
                form = await ComplaintForm_1.ComplaintForm.findOneAndUpdate({ division: rawDivision }, { $set: { fields: defaultFields, isActive: true } }, { upsert: true, new: true });
            }
        }
        res.json({ success: true, data: form });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getComplaintForm = getComplaintForm;
const getAllComplaintForms = async (_req, res) => {
    try {
        let forms = await ComplaintForm_1.ComplaintForm.find();
        // Auto-seed or fill empty forms with standard basic fields
        let needsRefresh = false;
        for (const def of exports.defaultComplaintForms) {
            const existing = forms.find((f) => f.division.toLowerCase() === def.division.toLowerCase());
            if (!existing) {
                await ComplaintForm_1.ComplaintForm.create({ division: def.division, fields: def.fields, isActive: true, version: 1 });
                needsRefresh = true;
            }
            else if (!existing.fields || existing.fields.length === 0) {
                existing.fields = def.fields;
                await existing.save();
                needsRefresh = true;
            }
        }
        if (needsRefresh) {
            forms = await ComplaintForm_1.ComplaintForm.find();
        }
        res.json({ success: true, data: forms });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAllComplaintForms = getAllComplaintForms;
const getWarrantyForm = async (req, res) => {
    try {
        const category = req.params.category;
        let form = await WarrantyForm_1.WarrantyForm.findOne({ category, isActive: true });
        if (!form || !form.fields || form.fields.length === 0) {
            const matchedDefault = exports.defaultWarrantyForms.find((d) => d.category.toLowerCase() === String(category).toLowerCase());
            if (matchedDefault) {
                form = await WarrantyForm_1.WarrantyForm.findOneAndUpdate({ category: matchedDefault.category }, { $set: { fields: matchedDefault.fields, isActive: true } }, { upsert: true, new: true });
            }
            else if (!form) {
                return res.status(404).json({ success: false, message: 'Form not found for this category' });
            }
        }
        res.json({ success: true, data: form });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getWarrantyForm = getWarrantyForm;
const getAllWarrantyForms = async (_req, res) => {
    try {
        let forms = await WarrantyForm_1.WarrantyForm.find();
        let needsRefresh = false;
        for (const def of exports.defaultWarrantyForms) {
            const existing = forms.find((f) => f.category.toLowerCase() === def.category.toLowerCase());
            if (!existing) {
                await WarrantyForm_1.WarrantyForm.create({ category: def.category, fields: def.fields, isActive: true, version: 1 });
                needsRefresh = true;
            }
            else if (!existing.fields || existing.fields.length === 0) {
                existing.fields = def.fields;
                await existing.save();
                needsRefresh = true;
            }
        }
        if (needsRefresh) {
            forms = await WarrantyForm_1.WarrantyForm.find();
        }
        res.json({ success: true, data: forms });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAllWarrantyForms = getAllWarrantyForms;
// Admin routes
const saveComplaintForm = async (req, res) => {
    try {
        const { division, fields } = req.body;
        let form = await ComplaintForm_1.ComplaintForm.findOne({
            division: { $regex: new RegExp(`^${division.trim()}$`, 'i') },
        });
        if (form) {
            form.division = division;
            form.fields = fields;
            form.isActive = true;
            form.version = (form.version || 0) + 1;
            await form.save();
        }
        else {
            form = await ComplaintForm_1.ComplaintForm.create({ division, fields, isActive: true, version: 1 });
        }
        res.json({ success: true, data: form });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.saveComplaintForm = saveComplaintForm;
const deleteComplaintForm = async (req, res) => {
    try {
        const divisionParam = req.params.division || '';
        const cleanDiv = divisionParam.trim();
        // 1. Delete complaint form configuration
        await ComplaintForm_1.ComplaintForm.deleteMany({
            division: { $regex: new RegExp(`^${cleanDiv}$`, 'i') },
        });
        // 2. Cascade remove matching service card from CMS Content
        const content = (await Content_1.Content.findOne({ key: 'global_cms' })) || (await Content_1.Content.findOne());
        if (content && content.serviceCards) {
            content.serviceCards = content.serviceCards.filter((c) => (c.section || c.title || '').trim().toLowerCase() !== cleanDiv.toLowerCase());
            content.markModified('serviceCards');
            await content.save();
        }
        // 3. Cascade remove matching complaint types
        await ComplaintType_1.ComplaintType.deleteMany({
            division: { $regex: new RegExp(`^${cleanDiv}$`, 'i') },
        });
        res.json({
            success: true,
            message: `Service "${cleanDiv}" and form deleted successfully from forms, CMS, and complaint types`,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteComplaintForm = deleteComplaintForm;
const saveWarrantyForm = async (req, res) => {
    try {
        const { category, fields } = req.body;
        let form = await WarrantyForm_1.WarrantyForm.findOne({
            category: { $regex: new RegExp(`^${category.trim()}$`, 'i') },
        });
        if (form) {
            form.category = category;
            form.fields = fields;
            form.isActive = true;
            form.version = (form.version || 0) + 1;
            await form.save();
        }
        else {
            form = await WarrantyForm_1.WarrantyForm.create({ category, fields, isActive: true, version: 1 });
        }
        res.json({ success: true, data: form });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.saveWarrantyForm = saveWarrantyForm;
const deleteWarrantyForm = async (req, res) => {
    try {
        const { category } = req.params;
        await WarrantyForm_1.WarrantyForm.findOneAndDelete({ category });
        res.json({ success: true, message: `Form for ${category} deleted successfully` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteWarrantyForm = deleteWarrantyForm;
