"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stock_controller_1 = require("../controllers/stock.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Soft-coded configuration
router.get('/config', auth_1.protect, (0, auth_1.checkPermission)('stock:view', 'stock:manage'), stock_controller_1.getStockConfig);
router.put('/config', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'MANAGER'), stock_controller_1.updateStockConfig);
// Scanner & Audit routes (accessible by stock viewers, managers, and billing cashiers)
router.get('/serial/:serial', auth_1.protect, (0, auth_1.checkPermission)('stock:view', 'stock:manage', 'billing:create'), stock_controller_1.getStockBySerial);
router.get('/movements/audit', auth_1.protect, (0, auth_1.checkPermission)('stock:view', 'stock:manage'), stock_controller_1.getStockMovements);
// Main Stock CRUD
router.get('/export/csv', auth_1.protect, (0, auth_1.checkPermission)('stock:view', 'stock:manage'), stock_controller_1.exportStock);
router.get('/', auth_1.protect, (0, auth_1.checkPermission)('stock:view', 'stock:manage'), stock_controller_1.getAllStock);
router.get('/:id', auth_1.protect, (0, auth_1.checkPermission)('stock:view', 'stock:manage'), stock_controller_1.getStockById);
router.post('/', auth_1.protect, (0, auth_1.checkPermission)('stock:manage', 'stock:view', 'stock:create'), stock_controller_1.createStock);
router.put('/:id', auth_1.protect, (0, auth_1.checkPermission)('stock:manage', 'stock:view', 'stock:update'), stock_controller_1.updateStock);
router.post('/movement', auth_1.protect, (0, auth_1.checkPermission)('stock:manage', 'stock:view'), stock_controller_1.recordStockMovement);
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), stock_controller_1.deleteStock);
exports.default = router;
