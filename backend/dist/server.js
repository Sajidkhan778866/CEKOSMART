"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const PORT = process.env.PORT || 5000;
process.on('unhandledRejection', (reason, promise) => {
    console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('[Process] Uncaught Exception:', err);
});
// Start listening immediately on Passenger socket/port
const rawPort = process.env.PORT || 5000;
const isPassenger = typeof global.PhusionPassenger !== 'undefined' || rawPort === 'passenger';
const server = isPassenger
    ? app_1.default.listen('passenger', () => {
        console.log('[Server] Ekosmart API Server running under Phusion Passenger');
    })
    : app_1.default.listen(rawPort, () => {
        console.log(`[Server] Ekosmart API Server running on port ${rawPort}`);
    });
// Connect to MongoDB asynchronously without blocking HTTP listener
(0, db_1.default)()
    .then(() => {
    console.log('[Server] MongoDB connection initialized.');
})
    .catch((err) => {
    console.error('[Server] Initial MongoDB connection failed (will retry on incoming requests):', err.message || err);
});
const shutdown = async () => {
    console.log('[Server] Graceful shutdown initiated...');
    server.close(async () => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
    });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
