"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_BASE = 'http://localhost:5000/api/v1';
const testCMSImages = async () => {
    console.log('🧪 Testing CMS Image Upload & Save functionality...');
    // Admin Login
    const loginRes = await axios_1.default.post(`${API_BASE}/auth/admin/login`, {
        email: 'admin@ekosmart.com',
        password: 'admin123',
    });
    const token = loginRes.data.data.token;
    const adminHeaders = { Authorization: `Bearer ${token}` };
    // Fetch Admin CMS Content
    const adminGetRes = await axios_1.default.get(`${API_BASE}/content/admin`, { headers: adminHeaders });
    const originalData = adminGetRes.data.data;
    // Create a sample base64 png string (100KB dummy data)
    const sampleBase64Image = 'data:image/png;base64,' + 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='.repeat(500);
    const payloadWithImages = {
        ...originalData,
        hero: {
            ...originalData.hero,
            logoType: 'image',
            logoImage: sampleBase64Image,
            complaintLogoType: 'image',
            complaintLogoImage: sampleBase64Image,
        },
        footer: {
            ...originalData.footer,
            logoType: 'image',
            logoImage: sampleBase64Image,
        },
    };
    console.log(`Sending PUT /api/v1/content/admin with base64 images (${JSON.stringify(payloadWithImages).length} bytes)...`);
    const putRes = await axios_1.default.put(`${API_BASE}/content/admin`, payloadWithImages, { headers: adminHeaders });
    if (!putRes.data.success) {
        throw new Error('Failed to save CMS with images');
    }
    console.log('✅ CMS PUT with images succeeded with 200 OK!');
    // Verify in public endpoint
    const pubRes = await axios_1.default.get(`${API_BASE}/content/public`);
    if (pubRes.data.data.hero.logoImage !== sampleBase64Image) {
        throw new Error('Public endpoint did not return saved base64 image');
    }
    console.log('✅ Verified public endpoint serves saved base64 image!');
    // Clean reset
    console.log('Restoring clean default logos...');
    await axios_1.default.put(`${API_BASE}/content/admin`, originalData, { headers: adminHeaders });
    console.log('✅ Clean state restored successfully.');
};
testCMSImages().catch(err => {
    console.error('❌ Test failed:', err.response?.data || err.message);
    process.exit(1);
});
