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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const formFieldSchema = new mongoose_1.Schema({
    fieldKey: { type: String, required: true },
    label: { type: String, required: true },
    type: {
        type: String,
        enum: ['text', 'number', 'email', 'phone', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file'],
        default: 'text',
    },
    placeholder: { type: String, default: '' },
    defaultValue: { type: mongoose_1.Schema.Types.Mixed },
    options: { type: [String], default: [] },
    required: { type: Boolean, default: false },
    validation: {
        minLength: { type: Number },
        maxLength: { type: Number },
        pattern: { type: String },
        min: { type: Number },
        max: { type: Number },
    },
    width: { type: String, enum: ['full', '1/2', '1/3'], default: 'full' },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
    helpText: { type: String, default: '' },
}, { _id: false });
const formSchemaDefinition = new mongoose_1.Schema({
    formKey: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    fields: [formFieldSchema],
    submitButton: {
        label: { type: String, default: 'Submit' },
        color: { type: String, default: 'emerald' },
        icon: { type: String, default: 'Send' },
        size: { type: String, default: 'md' },
    },
    destinationWorkflow: {
        type: String,
        enum: ['contact_inquiry', 'ticket_submission', 'warranty_registration', 'custom_submission'],
        default: 'contact_inquiry',
    },
    successMessage: { type: String, default: 'Thank you! Your submission has been received successfully.' },
    errorMessage: { type: String, default: 'Failed to process your submission. Please try again.' },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.FormSchema = mongoose_1.default.model('FormSchema', formSchemaDefinition);
