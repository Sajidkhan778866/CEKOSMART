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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_1 = __importStar(require("./config/db"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const employee_routes_1 = __importDefault(require("./routes/employee.routes"));
const complaint_routes_1 = __importDefault(require("./routes/complaint.routes"));
const complaintType_routes_1 = __importDefault(require("./routes/complaintType.routes"));
const warranty_routes_1 = __importDefault(require("./routes/warranty.routes"));
const form_routes_1 = __importDefault(require("./routes/form.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const content_routes_1 = __importDefault(require("./routes/content.routes"));
const stock_routes_1 = __importDefault(require("./routes/stock.routes"));
const billing_routes_1 = __importDefault(require("./routes/billing.routes"));
const frontendBuilder_routes_1 = __importDefault(require("./routes/frontendBuilder.routes"));
const page_routes_1 = __importDefault(require("./routes/page.routes"));
const theme_routes_1 = __importDefault(require("./routes/theme.routes"));
const media_routes_1 = __importDefault(require("./routes/media.routes"));
const leave_routes_1 = __importDefault(require("./routes/leave.routes"));
const database_routes_1 = __importDefault(require("./routes/database.routes"));
const app = (0, express_1.default)();
// Allowed Origins Parser
const configuredOrigins = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    'https://ekosmartfeedback.in',
    'https://www.ekosmartfeedback.in',
    'https://ekosmartfeedback.in.ekosmartdrive.in',
    'https://www.ekosmartdrive.in',
    'https://ekosmartdrive.in',
    'https://www.ekosmartdrivecomplain.in',
    'https://ekosmartdrivecomplain.in',
]
    .filter(Boolean)
    .join(',')
    .split(',')
    .map((s) => s.trim().toLowerCase().replace(/\/+$/, ''))
    .filter(Boolean);
const corsOptions = {
    origin: (requestOrigin, callback) => {
        // 1. Allow server-to-server, curl, mobile apps, or same-origin requests (no origin header)
        if (!requestOrigin) {
            return callback(null, true);
        }
        const originLower = requestOrigin.toLowerCase().replace(/\/+$/, '');
        // 2. Allow if wildcard or in configured list
        if (configuredOrigins.includes('*') ||
            configuredOrigins.includes(originLower) ||
            originLower.endsWith('.ekosmartdrive.in') ||
            originLower.endsWith('.ekosmartdrivecomplain.in') ||
            originLower.endsWith('.vercel.app') ||
            originLower.includes('localhost') ||
            originLower.includes('127.0.0.1') ||
            process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        // Default: allow and reflect the requesting origin
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
    ],
    exposedHeaders: ['Content-Disposition'],
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Serverless DB auto-connection middleware
app.use(async (req, res, next) => {
    // Allow health check, root ping, database setup routes, and static uploads to bypass DB block if needed
    if (req.path === '/' ||
        req.path === '/api' ||
        req.path === '/api/v1' ||
        req.path === '/v1' ||
        req.path.endsWith('/health') ||
        req.path.includes('/database') ||
        req.path.startsWith('/uploads') ||
        req.path.startsWith('/api/v1/uploads') ||
        req.path.startsWith('/api/uploads') ||
        req.path.startsWith('/v1/uploads')) {
        return next();
    }
    try {
        await (0, db_1.default)();
        next();
    }
    catch (err) {
        console.error('[Middleware] Database connection error during request:', err.message || err);
        return res.status(503).json({
            success: false,
            message: `Database connection unavailable: ${err.message || 'Connection failed'}. Please check MongoDB Atlas connection string (DATABASE_URL / MONGODB_URI) and IP access whitelist (0.0.0.0/0).`,
            error: err.message,
        });
    }
});
// Root ping (supports /, /api, /api/v1, /v1)
const rootPingHandler = (_req, res) => {
    res.json({
        success: true,
        message: 'Ekosmart EV & Battery Management API Server',
        status: 'online',
        version: '1.0.0',
        database: (0, db_1.getDbStatus)(),
        healthCheck: '/api/v1/health',
    });
};
app.get('/', rootPingHandler);
app.get('/api/v1', rootPingHandler);
app.get('/api', rootPingHandler);
app.get('/v1', rootPingHandler);
// Serve uploaded files statically across all routes with no-stale cache headers
const staticUploadOptions = {
    maxAge: 0,
    setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    },
};
const uploadDirs = [
    path_1.default.join(__dirname, '../uploads'),
    path_1.default.join(__dirname, '../../uploads'),
    path_1.default.join(process.cwd(), 'uploads'),
    path_1.default.join(process.cwd(), 'backend/uploads'),
];
for (const dir of uploadDirs) {
    app.use('/uploads', express_1.default.static(dir, staticUploadOptions));
    app.use('/api/v1/uploads', express_1.default.static(dir, staticUploadOptions));
    app.use('/api/uploads', express_1.default.static(dir, staticUploadOptions));
    app.use('/v1/uploads', express_1.default.static(dir, staticUploadOptions));
}
// Health Check with Database Status
const healthCheckHandler = async (_req, res) => {
    if (!(0, db_1.isDbConnected)()) {
        (0, db_1.default)().catch(() => { });
    }
    const dbStatus = (0, db_1.getDbStatus)();
    const healthy = (0, db_1.isDbConnected)();
    res.status(200).json({
        success: true,
        server: 'online',
        message: healthy ? 'Ekosmart API Server & Database operational' : 'API Server online, database connecting/pending',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
    });
};
app.get('/api/v1/health', healthCheckHandler);
app.get('/api/health', healthCheckHandler);
app.get('/v1/health', healthCheckHandler);
app.get('/health', healthCheckHandler);
// Mount Centralized API Routes (supports both /api/v1 and /api prefixes)
const mountRoutes = (prefix) => {
    app.use(`${prefix}/auth`, auth_routes_1.default);
    app.use(`${prefix}/admin/employees`, employee_routes_1.default);
    app.use(`${prefix}/employees`, employee_routes_1.default);
    app.use(`${prefix}/complaint-types`, complaintType_routes_1.default);
    app.use(`${prefix}/complaints`, complaint_routes_1.default);
    app.use(`${prefix}/tickets`, complaint_routes_1.default);
    app.use(`${prefix}/warranty`, warranty_routes_1.default);
    app.use(`${prefix}/warranties`, warranty_routes_1.default);
    app.use(`${prefix}/forms`, form_routes_1.default);
    app.use(`${prefix}/dashboard`, dashboard_routes_1.default);
    app.use(`${prefix}/customers`, customer_routes_1.default);
    app.use(`${prefix}/content`, content_routes_1.default);
    app.use(`${prefix}/cms`, content_routes_1.default);
    app.use(`${prefix}/stock`, stock_routes_1.default);
    app.use(`${prefix}/billing`, billing_routes_1.default);
    app.use(`${prefix}/frontend-builder`, frontendBuilder_routes_1.default);
    app.use(`${prefix}/builder`, frontendBuilder_routes_1.default);
    app.use(`${prefix}/pages`, page_routes_1.default);
    app.use(`${prefix}/theme`, theme_routes_1.default);
    app.use(`${prefix}/media`, media_routes_1.default);
    app.use(`${prefix}/leaves`, leave_routes_1.default);
    app.use(`${prefix}/database`, database_routes_1.default);
};
mountRoutes('/api/v1');
mountRoutes('/api');
mountRoutes('/v1');
mountRoutes('');
// Catch-all 404 JSON response for unmatched API routes (prevents returning HTML)
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
        });
    }
    next();
});
// Centralized error handler returning clean JSON
app.use((err, _req, res, _next) => {
    console.error('[AppError]', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error occurred.',
    });
});
exports.default = app;
