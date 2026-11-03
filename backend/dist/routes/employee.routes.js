"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const employee_controller_1 = require("../controllers/employee.controller");
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Employee Self-Service (Authenticated)
router.get('/me/payslips', auth_1.protect, employee_controller_1.getMyPayslips);
router.get('/me/payslips/:id', auth_1.protect, employee_controller_1.getMyPayslipById);
// Admin Payslip & Salary Endpoints
router.get('/payslips/all', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), employee_controller_1.getAllPayslips);
router.delete('/payslips/:payslipId', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), employee_controller_1.deletePayslip);
// Admin Employee CRUD Endpoints
router.get('/', auth_1.protect, employee_controller_1.getEmployees);
router.get('/export', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), employee_controller_1.exportEmployees);
router.post('/', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), upload_1.uploadEmployeePhoto.single('photo'), employee_controller_1.createEmployee);
router.get('/eligible/:division', auth_1.protect, employee_controller_1.getEligibleEmployees);
router.get('/:id', auth_1.protect, employee_controller_1.getEmployeeById);
router.get('/:id/tasks', auth_1.protect, employee_controller_1.getEmployeeTasks);
router.patch('/:id', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), upload_1.uploadEmployeePhoto.single('photo'), employee_controller_1.updateEmployee);
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), upload_1.uploadEmployeePhoto.single('photo'), employee_controller_1.updateEmployee);
router.patch('/:id/status', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), employee_controller_1.toggleEmployeeStatus);
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), employee_controller_1.deleteEmployee);
// Individual Salary Structure & Generation
router.get('/:id/salary', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), employee_controller_1.getEmployeeSalary);
router.put('/:id/salary', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'), employee_controller_1.updateEmployeeSalary);
router.post('/:id/generate-payslip', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), employee_controller_1.generateEmployeePayslip);
router.get('/:id/payslips', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'MANAGER'), employee_controller_1.getEmployeePayslips);
exports.default = router;
