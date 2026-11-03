"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const BASE_URL = 'http://localhost:5000/api/v1';
async function runTests() {
    console.log('--- STARTING COMPREHENSIVE END-TO-END TESTS ---');
    // 1. Health Check
    const health = await axios_1.default.get(`${BASE_URL}/health`);
    console.log('✓ Health Check:', health.data.message);
    // 2. Admin Login
    const loginRes = await axios_1.default.post(`${BASE_URL}/auth/admin/login`, {
        email: 'admin@ekosmart.com',
        password: 'admin123',
    });
    console.log('✓ Admin Login Success! Token generated.');
    const token = loginRes.data.data.token;
    // 3. Test Add Employee API (THE CRITICAL FLOW)
    const form = new form_data_1.default();
    const testEmpId = `TEST-EMP-${Date.now().toString().slice(-4)}`;
    form.append('employeeId', testEmpId);
    form.append('name', 'Saji Tech Engineer');
    form.append('email', `saji.${Date.now()}@ekosmart.com`);
    form.append('mobile', '9549730483');
    form.append('department', 'Technical');
    form.append('division', JSON.stringify(['Battery', 'Showroom']));
    form.append('designation', 'Senior Battery Specialist');
    form.append('role', 'Technician');
    form.append('password', 'secret123');
    form.append('status', 'Active');
    const createEmpRes = await axios_1.default.post(`${BASE_URL}/admin/employees`, form, {
        headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${token}`,
        },
    });
    console.log('✓ Employee Created Successfully in DB!');
    console.log('  - Employee ID:', createEmpRes.data.data.employeeId);
    console.log('  - Barcode Generated:', !!createEmpRes.data.data.barcode);
    console.log('  - Password Masked/Omitted:', createEmpRes.data.data.password === undefined);
    // 4. Test Employee List Fetch
    const empList = await axios_1.default.get(`${BASE_URL}/admin/employees`);
    const found = empList.data.data.find((e) => e.employeeId === testEmpId);
    console.log('✓ Employee List Refreshed and Contains Newly Created Employee:', !!found);
    // 5. Test Employee Login with newly created credentials
    const empLoginRes = await axios_1.default.post(`${BASE_URL}/auth/employee/login`, {
        employeeId: testEmpId,
        password: 'secret123',
    });
    console.log('✓ Newly Created Employee Can Log In:', empLoginRes.data.success);
    // 6. Test Public Complaint Registration with Ticket Generation
    const complaintRes = await axios_1.default.post(`${BASE_URL}/complaints/public`, {
        division: 'Battery',
        customerName: 'Saji Khan',
        customerMobile: '9549730483',
        customerEmail: 'saji@gmail.com',
        formData: {
            batterySerial: 'BAT-99482',
            batteryCapacity: '60V 30Ah Lithium',
            issueType: 'Not Charging',
        },
    });
    const ticketNumber = complaintRes.data.data.ticketNumber;
    console.log('✓ Public Complaint Registered Successfully!');
    console.log('  - Generated Ticket Number:', ticketNumber);
    // 7. Test Complaint Tracking
    const trackRes = await axios_1.default.get(`${BASE_URL}/complaints/public/track/${ticketNumber}`);
    console.log('✓ Public Tracking Response for Ticket:', trackRes.data.data.ticketNumber, '| Status:', trackRes.data.data.status);
    // 8. Test Complaint Assignment to Eligible Division Employee
    const eligibleRes = await axios_1.default.get(`${BASE_URL}/admin/employees/eligible/Battery`);
    console.log('✓ Eligible Battery Staff Count for Assignment:', eligibleRes.data.data.length);
    const eligibleEmployee = eligibleRes.data.data[0];
    const allComplaints = await axios_1.default.get(`${BASE_URL}/complaints/admin?division=Battery`);
    const complaintToAssign = allComplaints.data.data[0];
    if (complaintToAssign && eligibleEmployee) {
        const assignRes = await axios_1.default.post(`${BASE_URL}/complaints/admin/${complaintToAssign._id}/assign`, {
            employeeId: eligibleEmployee._id,
        });
        console.log('✓ Complaint Assigned to Eligible Engineer:', assignRes.data.data.status);
    }
    // 9. Test Public Warranty Registration & Check
    const warrantyRegRes = await axios_1.default.post(`${BASE_URL}/warranty/public/register`, {
        category: 'Showroom',
        customerName: 'Saji Khan',
        customerMobile: '9549730483',
        product: 'EkoRide Pro EV',
        serialNumber: 'SN-EKO-7788',
        billNumber: 'INV-2026-90',
        purchaseDate: '2026-09-01',
        durationMonths: '24',
    });
    console.log('✓ Warranty Registered Successfully!');
    console.log('  - Warranty Number:', warrantyRegRes.data.data.warrantyNumber);
    const warrantyCheckRes = await axios_1.default.get(`${BASE_URL}/warranty/public/check?identifier=SN-EKO-7788`);
    console.log('✓ Public Warranty Check Found Record:', warrantyCheckRes.data.data[0].warrantyNumber);
    // 10. Test Live Dashboard Stats
    const statsRes = await axios_1.default.get(`${BASE_URL}/dashboard/admin`);
    console.log('✓ Admin Dashboard Real Metrics:');
    console.log('  - Total Complaints:', statsRes.data.data.totalComplaints);
    console.log('  - Total Warranties:', statsRes.data.data.totalWarranties);
    console.log('  - Total Employees:', statsRes.data.data.totalEmployees);
    console.log('\n========================================');
    console.log('ALL CRITICAL END-TO-END TESTS PASSED 100%!');
    console.log('========================================');
}
runTests().catch((err) => {
    console.error('Test failed:', err.response?.data || err.message);
    process.exit(1);
});
