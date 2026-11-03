"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const complaintType_controller_1 = require("../controllers/complaintType.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', complaintType_controller_1.getComplaintTypes);
router.post('/', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), complaintType_controller_1.createComplaintType);
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), complaintType_controller_1.updateComplaintType);
router.patch('/:id', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), complaintType_controller_1.updateComplaintType);
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), complaintType_controller_1.deleteComplaintType);
exports.default = router;
