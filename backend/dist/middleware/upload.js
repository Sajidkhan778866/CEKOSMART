"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEmployeePhoto = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Use memoryStorage for 100% compatibility with Vercel Serverless Functions & Local Node
const storage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file format. Only image files and PDFs are allowed.'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter,
});
exports.uploadEmployeePhoto = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter,
});
exports.default = exports.upload;
