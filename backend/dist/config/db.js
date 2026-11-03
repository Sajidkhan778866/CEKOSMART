"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconnectDB = exports.getDbStatus = exports.isDbConnected = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const autoSeed_1 = require("../utils/autoSeed");
const cpanelDbEngine_1 = require("./cpanelDbEngine");
const isPlaceholderUri = (val) => {
    if (!val || !val.trim())
        return true;
    const v = val.trim();
    return v.includes('<cluster') || v.includes('<username>') || v.includes('<password>') || v.includes('<db_');
};
const getMongoUri = () => {
    const explicitUri = process.env.DATABASE_URL ||
        process.env.MONGODB_URI ||
        process.env.MONGO_URI ||
        process.env.MONGODB_URL;
    if (explicitUri && !isPlaceholderUri(explicitUri)) {
        return explicitUri.trim();
    }
    // Support structured DB_* environment variables if provided
    if (process.env.DB_HOST && !isPlaceholderUri(process.env.DB_HOST)) {
        const host = process.env.DB_HOST.trim();
        const port = (process.env.DB_PORT || '').trim();
        const dbName = (process.env.DB_NAME || 'ekosmart').trim();
        const user = (process.env.DB_USER || '').trim();
        const pass = process.env.DB_PASSWORD || '';
        const isSrv = process.env.DB_SSL === 'srv' || host.includes('.mongodb.net');
        const protocol = isSrv ? 'mongodb+srv' : 'mongodb';
        const authPart = user ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : '';
        const portPart = !isSrv && port ? `:${port}` : '';
        const queryPart = isSrv ? '?retryWrites=true&w=majority' : (process.env.DB_SSL === 'true' ? '?tls=true' : '');
        return `${protocol}://${authPart}${host}${portPart}/${dbName}${queryPart}`;
    }
    return 'mongodb://127.0.0.1:27017/ekosmart';
};
let cached = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
    global.mongooseCache = cached;
}
let lastConnectionError = null;
let listenersConfigured = false;
const setupConnectionListeners = () => {
    if (listenersConfigured)
        return;
    listenersConfigured = true;
    mongoose_1.default.connection.on('connected', () => {
        lastConnectionError = null;
        console.log(`[MongoDB] Connected successfully to: ${mongoose_1.default.connection.host}/${mongoose_1.default.connection.name}`);
        // Run idempotent auto-seeding on fresh connection
        (0, autoSeed_1.ensureDefaultSeedData)().catch((err) => {
            console.error('[MongoDB] Auto-seeding error:', err);
        });
    });
    mongoose_1.default.connection.on('error', (err) => {
        lastConnectionError = err.message || String(err);
        console.error(`[MongoDB] Connection error:`, lastConnectionError);
    });
    mongoose_1.default.connection.on('disconnected', () => {
        console.warn('[MongoDB] Disconnected from database server.');
        if (cached) {
            cached.conn = null;
            cached.promise = null;
        }
    });
    mongoose_1.default.connection.on('reconnected', () => {
        lastConnectionError = null;
        console.log('[MongoDB] Reconnected to database server.');
    });
};
// Set bufferCommands to false so Mongoose fails fast with informative errors instead of hanging for 10s
mongoose_1.default.set('bufferCommands', false);
const connectDB = async () => {
    // 1. If already connected, return existing connection
    if (mongoose_1.default.connection.readyState === 1) {
        // If connected but not seeded yet, trigger seed check in background
        (0, autoSeed_1.ensureDefaultSeedData)().catch(() => { });
        return mongoose_1.default;
    }
    // 2. If cached connection exists and is ready
    if (cached.conn && mongoose_1.default.connection.readyState === 1) {
        return cached.conn;
    }
    setupConnectionListeners();
    let uri = getMongoUri();
    if (uri.includes('127.0.0.1:27017') || uri.includes('ekosmart_Feedback')) {
        uri = await (0, cpanelDbEngine_1.startCpanelDbServer)();
    }
    // 3. If a connection promise is already in flight, reuse it
    if (!cached.promise) {
        const opts = {
            maxPoolSize: 10,
            minPoolSize: 1,
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            heartbeatFrequencyMS: 10000,
            autoIndex: true,
        };
        console.log(`[MongoDB] Connecting to database (${uri.includes('mongodb+srv') ? 'MongoDB Atlas Cloud' : 'Local MongoDB'})...`);
        cached.promise = mongoose_1.default.connect(uri, opts).then((m) => {
            lastConnectionError = null;
            console.log(`[MongoDB] Connection pool established with ${m.connection.host}`);
            // Clean up obsolete indexes safely if they exist
            try {
                const customerCollection = m.connection.collection('customers');
                customerCollection.indexes().then((indexes) => {
                    if (indexes.some((idx) => idx.name === 'phone_1')) {
                        customerCollection.dropIndex('phone_1').catch(() => { });
                    }
                }).catch(() => { });
            }
            catch {
                // Ignore
            }
            // Run auto-seeding
            (0, autoSeed_1.ensureDefaultSeedData)().catch((err) => {
                console.error('[MongoDB] Auto-seeding background error:', err);
            });
            return m;
        }).catch((err) => {
            lastConnectionError = err.message || String(err);
            cached.promise = null;
            cached.conn = null;
            console.error(`[MongoDB] Connection failed: ${lastConnectionError}`);
            throw err;
        });
    }
    try {
        cached.conn = await cached.promise;
        return cached.conn;
    }
    catch (err) {
        lastConnectionError = err.message || String(err);
        cached.promise = null;
        cached.conn = null;
        throw err;
    }
};
const isDbConnected = () => {
    return mongoose_1.default.connection.readyState === 1;
};
exports.isDbConnected = isDbConnected;
const getDbStatus = () => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    const activeUri = getMongoUri();
    return {
        state: states[mongoose_1.default.connection.readyState] || 'unknown',
        readyState: mongoose_1.default.connection.readyState,
        host: mongoose_1.default.connection.host || 'unknown',
        port: mongoose_1.default.connection.port || (activeUri.includes('mongodb+srv') ? 27017 : 27017),
        name: mongoose_1.default.connection.name || 'ekosmart',
        isCloud: activeUri.includes('mongodb+srv'),
        lastError: lastConnectionError,
    };
};
exports.getDbStatus = getDbStatus;
const reconnectDB = async (newUri) => {
    if (newUri && newUri.trim()) {
        process.env.DATABASE_URL = newUri.trim();
        process.env.MONGODB_URI = newUri.trim();
    }
    try {
        if (mongoose_1.default.connection.readyState !== 0) {
            await mongoose_1.default.disconnect();
        }
    }
    catch {
        // ignore disconnect errors
    }
    cached.conn = null;
    cached.promise = null;
    lastConnectionError = null;
    return await connectDB();
};
exports.reconnectDB = reconnectDB;
exports.default = connectDB;
