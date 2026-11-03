"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_BASE = 'http://localhost:5000/api/v1';
const testCMS = async () => {
    console.log('🧪 Starting Soft-Coded CMS E2E Verification...\n');
    // 1. Test Public Content API
    console.log('1. Testing GET /api/v1/content/public');
    const pubRes = await axios_1.default.get(`${API_BASE}/content/public`);
    if (!pubRes.data.success || !pubRes.data.data.serviceCards) {
        throw new Error('Public content fetch failed');
    }
    console.log(`✅ Public content fetched successfully. Visible cards count: ${pubRes.data.data.serviceCards.length}`);
    console.log(`   Hero heading: "${pubRes.data.data.hero.heading.replace('\n', ' ')}"`);
    console.log(`   Footer company: "${pubRes.data.data.footer.companyName}"`);
    // 2. Admin Login
    console.log('\n2. Logging in as Admin...');
    const loginRes = await axios_1.default.post(`${API_BASE}/auth/admin/login`, {
        email: 'admin@ekosmart.com',
        password: 'admin123',
    });
    const token = loginRes.data.data.token;
    console.log('✅ Admin login successful, token retrieved.');
    const adminHeaders = { Authorization: `Bearer ${token}` };
    // 3. Admin Get Content
    console.log('\n3. Testing GET /api/v1/content/admin');
    const adminGetRes = await axios_1.default.get(`${API_BASE}/content/admin`, { headers: adminHeaders });
    if (!adminGetRes.data.success) {
        throw new Error('Admin content fetch failed');
    }
    console.log(`✅ Admin content fetched successfully. Total cards: ${adminGetRes.data.data.serviceCards.length}`);
    // 4. Admin Update Content (Soft-Coding test)
    console.log('\n4. Testing PUT /api/v1/content/admin (Updating hero and policy)');
    const originalData = adminGetRes.data.data;
    const updatePayload = {
        ...originalData,
        hero: {
            ...originalData.hero,
            heading: 'Smart Electric Mobility Solutions\nPowered by Ekosmart Central CMS',
        },
        privacyPolicy: {
            ...originalData.privacyPolicy,
            title: 'Ekosmart Privacy & Security Charter',
        },
    };
    const updateRes = await axios_1.default.put(`${API_BASE}/content/admin`, updatePayload, { headers: adminHeaders });
    if (!updateRes.data.success || updateRes.data.data.hero.heading !== updatePayload.hero.heading) {
        throw new Error('Admin content update failed');
    }
    console.log('✅ PUT /api/v1/content/admin succeeded.');
    // 5. Verify Public API immediately reflects the updated soft-coded values
    console.log('\n5. Verifying Public API reflects update in real time...');
    const verifyRes = await axios_1.default.get(`${API_BASE}/content/public`);
    if (verifyRes.data.data.hero.heading !== updatePayload.hero.heading) {
        throw new Error('Public API did not reflect CMS update!');
    }
    console.log(`✅ Verified! Public hero heading is now: "${verifyRes.data.data.hero.heading.replace('\n', ' ')}"`);
    console.log(`   Privacy policy title is now: "${verifyRes.data.data.privacyPolicy.title}"`);
    // 6. Reset back to clean default
    console.log('\n6. Restoring standard default hero & policy...');
    const resetPayload = {
        ...originalData,
        hero: {
            ...originalData.hero,
            heading: 'Powering Your Life,\nSupporting Your Journey',
        },
        privacyPolicy: {
            ...originalData.privacyPolicy,
            title: 'Privacy Policy',
        },
    };
    await axios_1.default.put(`${API_BASE}/content/admin`, resetPayload, { headers: adminHeaders });
    console.log('✅ CMS Content restored cleanly to default state.');
    console.log('\n🎉 ALL CMS SOFT-CODING TESTS PASSED 100%!\n');
};
testCMS().catch((err) => {
    console.error('❌ CMS Test failed:', err.response?.data || err.message);
    process.exit(1);
});
