"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_controller_1 = require("../controllers/database.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Strictly protect all database configuration routes for Admin / SuperAdmin only
router.use(auth_1.protect, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'));
router.get('/status', database_controller_1.getDatabaseConfigAndStatus);
router.post('/test', database_controller_1.testDatabaseConnection);
router.post('/save', database_controller_1.saveDatabaseConfiguration);
router.put('/save', database_controller_1.saveDatabaseConfiguration);
router.post('/reconnect', database_controller_1.reconnectDatabaseController);
exports.default = router;
