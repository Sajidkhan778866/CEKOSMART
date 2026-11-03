"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leave_controller_1 = require("../controllers/leave.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Preview calculation without saving
router.post('/calculate', auth_1.protect, leave_controller_1.previewLeaveDuration);
// Employee actions
router.post('/apply', auth_1.protect, leave_controller_1.applyLeave);
router.get('/my', auth_1.protect, leave_controller_1.getMyLeaves);
// Admin actions
router.get('/', auth_1.protect, leave_controller_1.getAdminLeaves);
router.patch('/:id/status', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), leave_controller_1.updateLeaveStatus);
router.put('/:id/status', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), leave_controller_1.updateLeaveStatus);
exports.default = router;
