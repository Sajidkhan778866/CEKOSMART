"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComplaintType = exports.updateComplaintType = exports.createComplaintType = exports.getComplaintTypes = exports.seedDefaultComplaintTypes = exports.DEFAULT_COMPLAINT_TYPES = void 0;
const ComplaintType_1 = require("../models/ComplaintType");
exports.DEFAULT_COMPLAINT_TYPES = [
    // Battery
    { division: 'Battery', name: 'Battery Not Charging', description: 'Battery pack does not charge when connected to charger', order: 1 },
    { division: 'Battery', name: 'Battery Heating', description: 'Excessive heat generated during charging or vehicle operation', order: 2 },
    { division: 'Battery', name: 'Low Backup / Range Issue', description: 'Mileage or operational hours significantly below rated specification', order: 3 },
    { division: 'Battery', name: 'Battery Damage', description: 'Casing crack, terminal corrosion, or mechanical damage', order: 4 },
    { division: 'Battery', name: 'Battery Performance', description: 'Voltage drop under load or abnormal discharge rate', order: 5 },
    { division: 'Battery', name: 'BMS Fault / Communication Error', description: 'BMS trip or communication failure with charger/vehicle', order: 6 },
    // Rental
    { division: 'Rental', name: 'Vehicle Breakdown', description: 'EV scooter stopped working during active rental ride', order: 1 },
    { division: 'Rental', name: 'Booking Issue', description: 'App booking failure, schedule clash, or vehicle allocation delay', order: 2 },
    { division: 'Rental', name: 'Payment Issue', description: 'Security deposit refund delay or rental payment deduction error', order: 3 },
    { division: 'Rental', name: 'Vehicle Damage', description: 'Pre-existing or accidental vehicle damage reported by rider', order: 4 },
    { division: 'Rental', name: 'Battery Swap Issue', description: 'Difficulty during battery pack swap at rental hub', order: 5 },
    // Spare Parts
    { division: 'Spare Parts', name: 'Wrong Part', description: 'Received part model or serial does not match order', order: 1 },
    { division: 'Spare Parts', name: 'Damaged Part', description: 'Physical damage or broken packaging on arrival', order: 2 },
    { division: 'Spare Parts', name: 'Missing Part', description: 'Incomplete kit or missing accessories from shipment', order: 3 },
    { division: 'Spare Parts', name: 'Part Fitment / Compatibility', description: 'Component does not fit target EV vehicle specification', order: 4 },
    // Showroom
    { division: 'Showroom', name: 'Product Issue', description: 'Defect or cosmetic concern noticed upon delivery of new vehicle', order: 1 },
    { division: 'Showroom', name: 'Billing Issue', description: 'GST invoice discrepancy, subsidy calculation, or discount error', order: 2 },
    { division: 'Showroom', name: 'Service Issue', description: 'Dealership after-sales service or periodic maintenance request', order: 3 },
    { division: 'Showroom', name: 'Delivery Delay', description: 'Vehicle handover delayed beyond promised SLA date', order: 4 },
    // Warranty
    { division: 'Warranty', name: 'Warranty Claim', description: 'Claim submission for defective battery or parts under active warranty', order: 1 },
    { division: 'Warranty', name: 'Warranty Verification', description: 'Verification of warranty certificate or transfer ownership inquiry', order: 2 },
    { division: 'Warranty', name: 'Warranty Expiry Issue', description: 'Dispute regarding warranty validity period or registration date', order: 3 },
    { division: 'Warranty', name: 'Commercial Plant Warranty Inspection', description: 'On-site technical inspection request for factory/commercial unit', order: 4 },
];
const seedDefaultComplaintTypes = async () => {
    try {
        const count = await ComplaintType_1.ComplaintType.countDocuments();
        if (count === 0) {
            console.log('[ComplaintType] Seeding default complaint types...');
            await ComplaintType_1.ComplaintType.insertMany(exports.DEFAULT_COMPLAINT_TYPES.map((t) => ({ ...t, isActive: true })));
            console.log(`[ComplaintType] Seeded ${exports.DEFAULT_COMPLAINT_TYPES.length} default complaint types.`);
        }
    }
    catch (error) {
        console.warn('[ComplaintType] Seed check skipped or completed:', error.message);
    }
};
exports.seedDefaultComplaintTypes = seedDefaultComplaintTypes;
// GET /api/v1/complaint-types
const getComplaintTypes = async (req, res) => {
    try {
        await (0, exports.seedDefaultComplaintTypes)();
        const { division, activeOnly, search } = req.query;
        const query = {};
        if (division && division !== 'All') {
            query.division = { $regex: new RegExp(`^${division}$`, 'i') };
        }
        if (activeOnly === 'true' || activeOnly === '1') {
            query.isActive = true;
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        const complaintTypes = await ComplaintType_1.ComplaintType.find(query).sort({ order: 1, createdAt: 1 });
        res.status(200).json({
            success: true,
            data: complaintTypes,
        });
    }
    catch (error) {
        console.error('Error fetching complaint types:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint types',
            error: error.message,
        });
    }
};
exports.getComplaintTypes = getComplaintTypes;
// POST /api/v1/complaint-types
const createComplaintType = async (req, res) => {
    try {
        const { name, division, description, isActive, order } = req.body;
        if (!name || !division) {
            return res.status(400).json({
                success: false,
                message: 'Complaint type name and division are required.',
            });
        }
        const existing = await ComplaintType_1.ComplaintType.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            division: { $regex: new RegExp(`^${division.trim()}$`, 'i') },
        });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: `Complaint type "${name}" already exists for division "${division}".`,
            });
        }
        const complaintType = await ComplaintType_1.ComplaintType.create({
            name: name.trim(),
            division: division.trim(),
            description: description ? description.trim() : '',
            isActive: isActive !== false,
            order: order ? Number(order) : 1,
        });
        res.status(201).json({
            success: true,
            message: 'Complaint type created successfully',
            data: complaintType,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create complaint type',
            error: error.message,
        });
    }
};
exports.createComplaintType = createComplaintType;
// PUT /api/v1/complaint-types/:id
const updateComplaintType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, division, description, isActive, order } = req.body;
        const updates = {};
        if (name !== undefined)
            updates.name = name.trim();
        if (division !== undefined)
            updates.division = division.trim();
        if (description !== undefined)
            updates.description = description.trim();
        if (isActive !== undefined)
            updates.isActive = Boolean(isActive);
        if (order !== undefined)
            updates.order = Number(order);
        const complaintType = await ComplaintType_1.ComplaintType.findByIdAndUpdate(id, updates, { new: true });
        if (!complaintType) {
            return res.status(404).json({
                success: false,
                message: 'Complaint type not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Complaint type updated successfully',
            data: complaintType,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update complaint type',
            error: error.message,
        });
    }
};
exports.updateComplaintType = updateComplaintType;
// DELETE /api/v1/complaint-types/:id
const deleteComplaintType = async (req, res) => {
    try {
        const { id } = req.params;
        const complaintType = await ComplaintType_1.ComplaintType.findByIdAndDelete(id);
        if (!complaintType) {
            return res.status(404).json({
                success: false,
                message: 'Complaint type not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Complaint type deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete complaint type',
            error: error.message,
        });
    }
};
exports.deleteComplaintType = deleteComplaintType;
