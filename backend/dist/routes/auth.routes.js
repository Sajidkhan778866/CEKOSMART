"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/admin/login', auth_controller_1.adminLogin);
router.post('/employee/login', auth_controller_1.employeeLogin);
router.get('/me', auth_1.protect, auth_controller_1.getMe);
exports.default = router;
