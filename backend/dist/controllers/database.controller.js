"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconnectDatabaseController = exports.saveDatabaseConfiguration = exports.testDatabaseConnection = exports.getDatabaseConfigAndStatus = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = __importStar(require("../config/db"));
const autoSeed_1 = require("../utils/autoSeed");
const Bill_1 = require("../models/Bill");
const Stock_1 = require("../models/Stock");
const Complaint_1 = require("../models/Complaint");
const Warranty_1 = require("../models/Warranty");
const Customer_1 = require("../models/Customer");
const Employee_1 = require("../models/Employee");
const User_1 = require("../models/User");
/**
 * Safely parses a MongoDB connection URI without ever returning or exposing the password.
 */
const parseSafeMongoConfig = () => {
    const rawUri = process.env.DATABASE_URL ||
        process.env.MONGODB_URI ||
        process.env.MONGO_URI ||
        process.env.MONGODB_URL ||
        '';
    if (!rawUri.trim() && process.env.DB_HOST) {
        const host = (process.env.DB_HOST || '').trim();
        const isSrv = process.env.DB_SSL === 'srv' || host.includes('.mongodb.net');
        return {
            dbType: isSrv ? 'mongodb+srv' : 'mongodb',
            host,
            port: isSrv ? '' : (process.env.DB_PORT || '27017'),
            dbName: process.env.DB_NAME || 'ekosmart',
            username: process.env.DB_USER || '',
            securityMode: isSrv ? 'tls-srv' : (process.env.DB_SSL === 'true' ? 'tls' : 'standard'),
            authSource: 'admin',
            hasPassword: Boolean(process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim()),
            isConfigured: Boolean(host),
        };
    }
    const trimmed = rawUri.trim();
    if (!trimmed || trimmed.includes('<cluster') || trimmed.includes('<username>') || trimmed.includes('<password>')) {
        return {
            dbType: 'mongodb',
            host: '127.0.0.1',
            port: '27017',
            dbName: 'ekosmart',
            username: '',
            securityMode: 'standard',
            authSource: 'admin',
            hasPassword: false,
            isConfigured: false,
        };
    }
    try {
        const isSrv = trimmed.startsWith('mongodb+srv://');
        const withoutProto = trimmed.replace(/^mongodb(\+srv)?:\/\//, '');
        const atIndex = withoutProto.lastIndexOf('@');
        let authPart = '';
        let hostAndPath = withoutProto;
        if (atIndex !== -1) {
            authPart = withoutProto.slice(0, atIndex);
            hostAndPath = withoutProto.slice(atIndex + 1);
        }
        let username = '';
        let hasPassword = false;
        if (authPart) {
            const colonIdx = authPart.indexOf(':');
            if (colonIdx !== -1) {
                username = decodeURIComponent(authPart.slice(0, colonIdx));
                hasPassword = Boolean(authPart.slice(colonIdx + 1));
            }
            else {
                username = decodeURIComponent(authPart);
            }
        }
        const slashIndex = hostAndPath.indexOf('/');
        const queryIndex = hostAndPath.indexOf('?');
        let hostPort = hostAndPath;
        let dbName = 'ekosmart';
        if (slashIndex !== -1) {
            hostPort = hostAndPath.slice(0, slashIndex);
            const pathAfterSlash = queryIndex !== -1
                ? hostAndPath.slice(slashIndex + 1, queryIndex)
                : hostAndPath.slice(slashIndex + 1);
            if (pathAfterSlash.trim()) {
                dbName = pathAfterSlash.trim();
            }
        }
        else if (queryIndex !== -1) {
            hostPort = hostAndPath.slice(0, queryIndex);
        }
        let host = hostPort;
        let port = isSrv ? '' : '27017';
        if (!isSrv && hostPort.includes(':')) {
            const parts = hostPort.split(':');
            host = parts[0];
            port = parts[1] || '27017';
        }
        const queryStr = queryIndex !== -1 ? hostAndPath.slice(queryIndex + 1) : '';
        const params = new URLSearchParams(queryStr);
        const tlsParam = params.get('tls') === 'true' || params.get('ssl') === 'true';
        return {
            dbType: isSrv ? 'mongodb+srv' : 'mongodb',
            host: host || '127.0.0.1',
            port,
            dbName: dbName || 'ekosmart',
            username,
            securityMode: isSrv ? 'tls-srv' : (tlsParam ? 'tls' : 'standard'),
            authSource: params.get('authSource') || 'admin',
            hasPassword,
            isConfigured: true,
        };
    }
    catch {
        return {
            dbType: 'mongodb',
            host: '127.0.0.1',
            port: '27017',
            dbName: 'ekosmart',
            username: '',
            securityMode: 'standard',
            authSource: 'admin',
            hasPassword: false,
            isConfigured: false,
        };
    }
};
/**
 * Validates and constructs a safe MongoDB connection URI, preventing SSRF, arbitrary port scanning,
 * and connection-string injection.
 */
const buildAndValidateMongoUri = (params) => {
    const dbType = (params.dbType || 'mongodb+srv').trim();
    if (dbType === 'mysql' || dbType === 'mariadb' || dbType === 'mysql-notice') {
        return {
            valid: false,
            error: 'Architecture Notice: This platform uses Mongoose / MongoDB document schemas (Bills, Stock, Dynamic Forms, CMS, Warranties, Complaints). MySQL/MariaDB credentials cannot connect to the MongoDB driver. Please select MongoDB Atlas (SRV) or Standard MongoDB Host.',
        };
    }
    if (dbType !== 'mongodb+srv' && dbType !== 'mongodb') {
        return { valid: false, error: 'Unsupported database type selected.' };
    }
    const host = (params.host || '').trim();
    if (!host) {
        return { valid: false, error: 'Database Host is required.' };
    }
    // Validate hostname format & prevent SSRF against internal cloud metadata or invalid characters
    const hostRegex = /^[a-zA-Z0-9.-]+(,[a-zA-Z0-9.:-]+)*$/;
    if (!hostRegex.test(host) || host.includes('..') || host.startsWith('169.254.')) {
        return {
            valid: false,
            error: 'Invalid Database Host format or restricted network address.',
        };
    }
    // Block private LAN scanning in production (allow 127.0.0.1 / localhost for local dev or local mongod)
    const isPrivateScan = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host) &&
        process.env.NODE_ENV === 'production';
    if (isPrivateScan) {
        return {
            valid: false,
            error: 'Private network IP ranges are not permitted in production.',
        };
    }
    const dbName = (params.dbName || 'ekosmart').trim();
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(dbName)) {
        return {
            valid: false,
            error: 'Database Name must be 1-64 characters and contain only letters, numbers, hyphens, or underscores.',
        };
    }
    const isSrv = dbType === 'mongodb+srv' || params.securityMode === 'tls-srv';
    let portPart = '';
    if (!isSrv) {
        const portNum = Number(params.port || 27017);
        if (!Number.isInteger(portNum) || portNum < 1024 || portNum > 65535) {
            return {
                valid: false,
                error: 'Database Port must be a valid port number between 1024 and 65535 (default: 27017).',
            };
        }
        // Block non-database ports (e.g. HTTP/SSH/SMTP) to prevent port scanning
        const blockedPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995, 2082, 2083, 2086, 2087, 3306];
        if (blockedPorts.includes(portNum)) {
            return {
                valid: false,
                error: `Port ${portNum} is reserved for another service (e.g., MySQL 3306 or HTTP/SMTP). Standard MongoDB port is 27017.`,
            };
        }
        portPart = `:${portNum}`;
    }
    const username = (params.username || '').trim();
    let password = params.password !== undefined ? String(params.password) : '';
    // If admin didn't type a new password and asked to keep existing stored password
    if (!password && params.useStoredPassword) {
        const existingRaw = process.env.DATABASE_URL ||
            process.env.MONGODB_URI ||
            process.env.MONGO_URI ||
            process.env.MONGODB_URL ||
            '';
        const withoutProto = existingRaw.replace(/^mongodb(\+srv)?:\/\//, '');
        const atIdx = withoutProto.lastIndexOf('@');
        if (atIdx !== -1) {
            const auth = withoutProto.slice(0, atIdx);
            const colonIdx = auth.indexOf(':');
            if (colonIdx !== -1) {
                password = decodeURIComponent(auth.slice(colonIdx + 1));
            }
        }
        else if (process.env.DB_PASSWORD) {
            password = process.env.DB_PASSWORD;
        }
    }
    if (isSrv && (!username || !password)) {
        return {
            valid: false,
            error: 'MongoDB Atlas (mongodb+srv) requires both a Database Username and Password.',
        };
    }
    let authSection = '';
    if (username) {
        authSection = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
    }
    const protocol = isSrv ? 'mongodb+srv' : 'mongodb';
    const queryParams = new URLSearchParams();
    if (isSrv) {
        queryParams.set('retryWrites', 'true');
        queryParams.set('w', 'majority');
    }
    else if (params.securityMode === 'tls') {
        queryParams.set('tls', 'true');
    }
    if (params.authSource && params.authSource.trim() && params.authSource.trim() !== 'admin') {
        queryParams.set('authSource', params.authSource.trim());
    }
    const queryString = queryParams.toString();
    const uri = `${protocol}://${authSection}${host}${portPart}/${dbName}${queryString ? `?${queryString}` : ''}`;
    return { valid: true, uri };
};
/**
 * Helper to update key=value pairs in backend/.env on disk when writable.
 */
const persistEnvVariablesToDisk = (updates) => {
    const candidatePaths = [
        path_1.default.resolve(process.cwd(), '.env'),
        path_1.default.resolve(__dirname, '../../.env'),
    ];
    const targetPath = candidatePaths.find((p) => fs_1.default.existsSync(p)) || candidatePaths[0];
    try {
        let content = '';
        if (fs_1.default.existsSync(targetPath)) {
            content = fs_1.default.readFileSync(targetPath, 'utf8');
        }
        const lines = content ? content.split(/\r?\n/) : [];
        const updatedKeys = new Set();
        const newLines = lines.map((line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                return line;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx === -1)
                return line;
            const key = trimmed.slice(0, eqIdx).trim();
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
                updatedKeys.add(key);
                return `${key}=${updates[key]}`;
            }
            return line;
        });
        for (const [k, v] of Object.entries(updates)) {
            if (!updatedKeys.has(k)) {
                newLines.push(`${k}=${v}`);
            }
        }
        fs_1.default.writeFileSync(targetPath, newLines.join('\n') + '\n', { encoding: 'utf8', mode: 0o600 });
        return { persistedToFile: true, envFilePath: path_1.default.basename(targetPath) };
    }
    catch {
        return { persistedToFile: false, envFilePath: '.env' };
    }
};
// ============================================================================
// 1. GET /api/v1/database/status — View Connection & Configuration Status
// ============================================================================
const getDatabaseConfigAndStatus = async (_req, res) => {
    try {
        const status = (0, db_1.getDbStatus)();
        const config = parseSafeMongoConfig();
        // Gather live collection document counts if connected
        let stats = {
            bills: 0,
            stock: 0,
            complaints: 0,
            warranties: 0,
            customers: 0,
            employees: 0,
            admins: 0,
        };
        if (status.readyState === 1) {
            const [bills, stock, complaints, warranties, customers, employees, admins] = await Promise.all([
                Bill_1.Bill.countDocuments().catch(() => 0),
                Stock_1.Stock.countDocuments().catch(() => 0),
                Complaint_1.Complaint.countDocuments().catch(() => 0),
                Warranty_1.Warranty.countDocuments().catch(() => 0),
                Customer_1.Customer.countDocuments().catch(() => 0),
                Employee_1.Employee.countDocuments().catch(() => 0),
                User_1.User.countDocuments().catch(() => 0),
            ]);
            stats = { bills, stock, complaints, warranties, customers, employees, admins };
        }
        return res.json({
            success: true,
            data: {
                connection: {
                    state: status.state,
                    readyState: status.readyState,
                    host: status.host,
                    port: status.port,
                    databaseName: status.name,
                    isCloud: status.isCloud,
                    lastError: status.lastError,
                },
                configuration: {
                    dbType: config.dbType,
                    host: config.host,
                    port: config.port,
                    dbName: config.dbName,
                    username: config.username,
                    securityMode: config.securityMode,
                    authSource: config.authSource,
                    hasPassword: config.hasPassword,
                    isConfigured: config.isConfigured,
                },
                collections: stats,
                supportedDrivers: [
                    {
                        id: 'mongodb+srv',
                        label: 'MongoDB Atlas Cloud (SRV / TLS)',
                        recommendedForCpanel: true,
                        defaultPort: 'SRV (Auto)',
                    },
                    {
                        id: 'mongodb',
                        label: 'Standard MongoDB Server / VPS / Localhost',
                        recommendedForCpanel: true,
                        defaultPort: '27017',
                    },
                ],
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve database configuration status.',
        });
    }
};
exports.getDatabaseConfigAndStatus = getDatabaseConfigAndStatus;
// ============================================================================
// 2. POST /api/v1/database/test — Test Database Connectivity Safely
// ============================================================================
const testDatabaseConnection = async (req, res) => {
    try {
        const { dbType, host, port, dbName, username, password, securityMode, authSource, useStoredPassword, } = req.body;
        const validation = buildAndValidateMongoUri({
            dbType,
            host,
            port,
            dbName,
            username,
            password,
            securityMode,
            authSource,
            useStoredPassword: Boolean(useStoredPassword),
        });
        if (!validation.valid || !validation.uri) {
            return res.status(400).json({
                success: false,
                message: validation.error || 'Invalid database connection parameters.',
            });
        }
        // Create an isolated, short-lived test connection with strict timeouts
        const startMs = Date.now();
        const tempConn = mongoose_1.default.createConnection(validation.uri, {
            serverSelectionTimeoutMS: 6000,
            connectTimeoutMS: 6000,
            socketTimeoutMS: 10000,
            maxPoolSize: 1,
        });
        await tempConn.asPromise();
        const latencyMs = Date.now() - startMs;
        const connectedHost = tempConn.host || host;
        const connectedDbName = tempConn.name || dbName || 'ekosmart';
        await tempConn.close().catch(() => { });
        return res.json({
            success: true,
            message: `Connection verified successfully (${latencyMs}ms) to database "${connectedDbName}" on ${connectedHost}.`,
            data: {
                reachable: true,
                latencyMs,
                databaseName: connectedDbName,
                host: connectedHost,
            },
        });
    }
    catch (error) {
        // Sanitize error message so credentials or internal stack traces are never exposed
        const rawMsg = String(error?.message || 'Connection test failed');
        const sanitizedMsg = rawMsg.replace(/mongodb(\+srv)?:\/\/[^\s@]+@/gi, 'mongodb://***:***@');
        return res.status(400).json({
            success: false,
            message: `Database connection test failed: ${sanitizedMsg}. Verify host, credentials, and IP whitelist (0.0.0.0/0).`,
        });
    }
};
exports.testDatabaseConnection = testDatabaseConnection;
// ============================================================================
// 3. POST /api/v1/database/save — Save & Apply Database Configuration
// ============================================================================
const saveDatabaseConfiguration = async (req, res) => {
    try {
        const { dbType, host, port, dbName, username, password, securityMode, authSource, useStoredPassword, } = req.body;
        const validation = buildAndValidateMongoUri({
            dbType,
            host,
            port,
            dbName,
            username,
            password,
            securityMode,
            authSource,
            useStoredPassword: Boolean(useStoredPassword),
        });
        if (!validation.valid || !validation.uri) {
            return res.status(400).json({
                success: false,
                message: validation.error || 'Invalid database configuration parameters.',
            });
        }
        // 1. Test connectivity before applying so a bad config cannot break the live server
        const tempConn = mongoose_1.default.createConnection(validation.uri, {
            serverSelectionTimeoutMS: 6000,
            connectTimeoutMS: 6000,
            socketTimeoutMS: 10000,
            maxPoolSize: 1,
        });
        try {
            await tempConn.asPromise();
            await tempConn.close().catch(() => { });
        }
        catch (connErr) {
            const cleanErr = String(connErr?.message || 'Connection failed').replace(/mongodb(\+srv)?:\/\/[^\s@]+@/gi, 'mongodb://***:***@');
            return res.status(400).json({
                success: false,
                message: `Cannot save configuration because connection test failed: ${cleanErr}`,
            });
        }
        // 2. Persist to server runtime environment and .env file (if writable on cPanel)
        const envUpdates = {
            DATABASE_URL: validation.uri,
            MONGODB_URI: validation.uri,
            DB_HOST: String(host || '').trim(),
            DB_PORT: dbType === 'mongodb+srv' ? '' : String(port || '27017').trim(),
            DB_NAME: String(dbName || 'ekosmart').trim(),
            DB_USER: String(username || '').trim(),
            DB_SSL: dbType === 'mongodb+srv' ? 'srv' : (securityMode === 'tls' ? 'true' : 'false'),
        };
        if (password && String(password).trim()) {
            envUpdates.DB_PASSWORD = String(password);
        }
        for (const [k, v] of Object.entries(envUpdates)) {
            process.env[k] = v;
        }
        const persistResult = persistEnvVariablesToDisk(envUpdates);
        // 3. Reconnect active Mongoose pool and ensure idempotent schema/seed initialization
        await (0, db_1.reconnectDB)(validation.uri);
        await (0, autoSeed_1.ensureDefaultSeedData)().catch(() => { });
        const updatedStatus = (0, db_1.getDbStatus)();
        const updatedConfig = parseSafeMongoConfig();
        return res.json({
            success: true,
            message: persistResult.persistedToFile
                ? `Database configuration saved to server environment (${persistResult.envFilePath}) and connected to "${updatedStatus.name}".`
                : `Database configuration applied to active server runtime and connected to "${updatedStatus.name}". Note: Update DATABASE_URL in cPanel Node.js App settings to persist across server restarts.`,
            data: {
                persistedToFile: persistResult.persistedToFile,
                connection: updatedStatus,
                configuration: updatedConfig,
            },
        });
    }
    catch (error) {
        const cleanErr = String(error?.message || 'Failed to save database configuration').replace(/mongodb(\+srv)?:\/\/[^\s@]+@/gi, 'mongodb://***:***@');
        return res.status(500).json({
            success: false,
            message: cleanErr,
        });
    }
};
exports.saveDatabaseConfiguration = saveDatabaseConfiguration;
// ============================================================================
// 4. POST /api/v1/database/reconnect — Reconnect & Initialize Default Seed/Schemas
// ============================================================================
const reconnectDatabaseController = async (_req, res) => {
    try {
        await (0, db_1.reconnectDB)();
        await (0, db_1.default)();
        await (0, autoSeed_1.ensureDefaultSeedData)();
        const status = (0, db_1.getDbStatus)();
        return res.json({
            success: true,
            message: `Database reconnected and schema/seed verification completed (${status.host}/${status.name}).`,
            data: {
                connection: status,
            },
        });
    }
    catch (error) {
        const cleanErr = String(error?.message || 'Reconnection failed').replace(/mongodb(\+srv)?:\/\/[^\s@]+@/gi, 'mongodb://***:***@');
        return res.status(503).json({
            success: false,
            message: `Database reconnection failed: ${cleanErr}`,
            data: {
                connection: (0, db_1.getDbStatus)(),
            },
        });
    }
};
exports.reconnectDatabaseController = reconnectDatabaseController;
