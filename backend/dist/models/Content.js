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
exports.Content = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const serviceCardSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    description: { type: String, required: true },
    section: { type: String, default: 'General' },
    badge: { type: String, default: '' },
    features: { type: [String], default: [] },
    linkUrl: { type: String, required: true },
    buttonText: { type: String, required: true },
    color: { type: String, default: 'emerald' },
    icon: { type: String, default: 'FileText' },
    iconType: { type: String, enum: ['icon', 'image'], default: 'icon' },
    iconImage: { type: String, default: '' },
    bgType: { type: String, enum: ['color', 'image'], default: 'color' },
    bgImage: { type: String, default: '' },
    bgOverlayOpacity: { type: Number, default: 70 },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
});
const divisionContactSchema = new mongoose_1.Schema({
    id: { type: String, default: () => `div-contact-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` },
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    inCharge: { type: String, default: '' },
    officeHours: { type: String, default: '' },
    address: { type: String, default: '' },
}, { _id: false });
const contentSchema = new mongoose_1.Schema({
    key: { type: String, default: 'global_cms', unique: true },
    topBar: {
        isVisible: { type: Boolean, default: true },
        phone: { type: String, default: '+91 8949049003' },
        phoneLabel: { type: String, default: 'Helpline:' },
        showPhone: { type: Boolean, default: true },
        officeHours: { type: String, default: '10:00 AM to 6:30 PM (Mon - Sat)' },
        showOfficeHours: { type: Boolean, default: true },
        gstin: { type: String, default: '08DTUPM4205B1Z0' },
        showGstin: { type: Boolean, default: true },
        location: { type: String, default: 'Kota, Rajasthan' },
        showLocation: { type: Boolean, default: true },
        bgColor: { type: String, default: '#0f172a' },
        textColor: { type: String, default: '#cbd5e1' },
        accentColor: { type: String, default: '#34d399' },
    },
    headerNav: {
        brandTitle: { type: String, default: 'EBS EKOSMART' },
        brandSubtitle: { type: String, default: 'Battery Solution • Li-ion & LFP' },
        logoType: { type: String, enum: ['preset', 'image'], default: 'preset' },
        logoImage: { type: String, default: '' },
        logoLink: { type: String, default: '/' },
        faviconType: { type: String, enum: ['preset', 'image'], default: 'preset' },
        faviconImage: { type: String, default: '' },
        customerTabTitle: { type: String, default: 'EBS Ekosmart | Battery Solution & Support' },
        adminTabTitle: { type: String, default: 'EBS Ekosmart | Admin Portal' },
        employeeTabTitle: { type: String, default: 'EBS Ekosmart | Employee Workspace' },
        adminBrandTitle: { type: String, default: 'EBS EKOSMART' },
        adminBrandSubtitle: { type: String, default: 'Battery Solution • Admin Portal' },
        adminLogoType: { type: String, enum: ['inherit', 'preset', 'image'], default: 'inherit' },
        adminLogoImage: { type: String, default: '' },
        employeeBrandTitle: { type: String, default: 'EBS EKOSMART' },
        employeeBrandSubtitle: { type: String, default: 'Battery Solution • Staff Portal' },
        employeeLogoType: { type: String, enum: ['inherit', 'preset', 'image'], default: 'inherit' },
        employeeLogoImage: { type: String, default: '' },
        homeLabel: { type: String, default: 'Home' },
        showHome: { type: Boolean, default: true },
        homeHref: { type: String, default: '/' },
        homeIcon: { type: String, default: 'Home' },
        walletLabel: { type: String, default: 'Wallet & Coins' },
        showWallet: { type: Boolean, default: true },
        walletHref: { type: String, default: '/customer/wallet' },
        showWalletBadge: { type: Boolean, default: true },
        walletBgColor: { type: String, default: '' },
        walletTextColor: { type: String, default: '' },
        walletBorderColor: { type: String, default: '' },
        walletIcon: { type: String, default: 'Coins' },
        referLabel: { type: String, default: 'Refer & Earn' },
        showRefer: { type: Boolean, default: true },
        referHref: { type: String, default: '/customer/referrals' },
        showReferBonus: { type: Boolean, default: true },
        referBonusAmount: { type: Number, default: 500 },
        referBgColor: { type: String, default: '' },
        referTextColor: { type: String, default: '' },
        referBorderColor: { type: String, default: '' },
        referIcon: { type: String, default: 'Gift' },
        showShowroomBilling: { type: Boolean, default: true },
        showroomBillingLabel: { type: String, default: 'Showroom Bills' },
        showroomBillingHref: { type: String, default: '/showroom-billing' },
        showroomBillingIcon: { type: String, default: 'Receipt' },
        showWarrantyCheck: { type: Boolean, default: true },
        warrantyCheckLabel: { type: String, default: 'Check Warranty' },
        warrantyCheckHref: { type: String, default: '/warranty/check' },
        warrantyCheckIcon: { type: String, default: 'ShieldCheck' },
        showTrackTicket: { type: Boolean, default: true },
        trackTicketLabel: { type: String, default: 'Track Ticket' },
        trackTicketHref: { type: String, default: '/complaint/track' },
        trackTicketIcon: { type: String, default: 'Search' },
        showSupportTicket: { type: Boolean, default: false },
        supportTicketLabel: { type: String, default: 'Support Ticket' },
        supportTicketHref: { type: String, default: '/complaint/register' },
        supportTicketIcon: { type: String, default: 'FileText' },
        contactLabel: { type: String, default: 'Contact & Helpline' },
        showContactDropdown: { type: Boolean, default: true },
        contactIcon: { type: String, default: 'Phone' },
        accountLabel: { type: String, default: 'Account / Login' },
        showAccount: { type: Boolean, default: true },
        accountHref: { type: String, default: '/customer/login' },
        accountBtnBg: { type: String, default: '#059669' },
        accountBtnText: { type: String, default: '#ffffff' },
        accountIcon: { type: String, default: 'User' },
        navBgColor: { type: String, default: '#ffffff' },
        navBorderColor: { type: String, default: '#e2e8f0' },
        isSticky: { type: Boolean, default: true },
        customNavItems: { type: Array, default: [] },
    },
    hero: {
        heading: { type: String, default: 'Ekosmart Battery Solution (EBS)\nHigh Power Lithium-Ion & LFP Battery Packs' },
        subheading: {
            type: String,
            default: 'High Charging Power • Long Life • Low Maintenance. Official support portal for EV scooter & E-rickshaw batteries, genuine spare parts, and warranty verification.',
        },
        primaryButtonText: { type: String, default: 'Register Complaint' },
        primaryButtonLink: { type: String, default: '/complaint/register' },
        primaryButtonTarget: { type: String, enum: ['_self', '_blank'], default: '_self' },
        primaryButtonVisible: { type: Boolean, default: true },
        primaryButtonBgColor: { type: String, default: '#10b981' },
        primaryButtonTextColor: { type: String, default: '#020617' },
        secondaryButtonText: { type: String, default: 'Check Battery Warranty' },
        secondaryButtonLink: { type: String, default: '/warranty/check' },
        secondaryButtonTarget: { type: String, enum: ['_self', '_blank'], default: '_blank' },
        secondaryButtonVisible: { type: Boolean, default: true },
        secondaryButtonBgColor: { type: String, default: 'rgba(255, 255, 255, 0.1)' },
        secondaryButtonTextColor: { type: String, default: '#ffffff' },
        secondaryButtonBorderColor: { type: String, default: 'rgba(255, 255, 255, 0.2)' },
        secondaryButtonShowIcon: { type: Boolean, default: true },
        logoType: { type: String, enum: ['preset', 'image'], default: 'preset' },
        logoImage: { type: String, default: '' },
        complaintLogoType: { type: String, enum: ['preset', 'image'], default: 'preset' },
        complaintLogoImage: { type: String, default: '' },
        bgType: { type: String, enum: ['gradient', 'solid', 'image'], default: 'gradient' },
        bgGradientPreset: { type: String, default: 'ebs-emerald' },
        bgGradientStart: { type: String, default: '#022c22' },
        bgGradientMiddle: { type: String, default: '#064e3b' },
        bgGradientEnd: { type: String, default: '#115e59' },
        bgGradientDirection: { type: String, default: 'to-r' },
        bgSolidColor: { type: String, default: '#064e3b' },
        bgImage: { type: String, default: '' },
        bgOverlayOpacity: { type: Number, default: 0.8 },
        bgOverlayColor: { type: String, default: '#000000' },
        bgPosition: { type: String, default: 'center' },
        bgSize: { type: String, default: 'cover' },
        bgAttachment: { type: String, default: 'scroll' },
        bgBlur: { type: Number, default: 0 },
        showHeroLogo: { type: Boolean, default: false },
        bgPattern: { type: String, default: 'mesh' },
        badgeText: { type: String, default: 'Official EBS Battery Solution Portal • Kota, Rajasthan' },
        badgeIcon: { type: String, default: 'Sparkles' },
        badgeVisible: { type: Boolean, default: true },
        badgeBgColor: { type: String, default: 'rgba(6, 78, 59, 0.6)' },
        badgeTextColor: { type: String, default: '#6ee7b7' },
        badgeBorderColor: { type: String, default: 'rgba(16, 185, 129, 0.4)' },
        highlight1Text: { type: String, default: 'High Charging Power' },
        highlight1Icon: { type: String, default: 'Zap' },
        highlight1Color: { type: String, default: '#facc15' },
        highlight1Visible: { type: Boolean, default: true },
        highlight2Text: { type: String, default: 'Long Life (3 & 1.5 Year Warranty)' },
        highlight2Icon: { type: String, default: 'Battery' },
        highlight2Color: { type: String, default: '#4ade80' },
        highlight2Visible: { type: Boolean, default: true },
        highlight3Text: { type: String, default: 'Low Maintenance' },
        highlight3Icon: { type: String, default: 'Wrench' },
        highlight3Color: { type: String, default: '#5eead4' },
        highlight3Visible: { type: Boolean, default: true },
        textColor: { type: String, default: '#ffffff' },
    },
    serviceCards: [serviceCardSchema],
    contactInfo: {
        heading: { type: String, default: 'Get in Touch With Us' },
        subheading: {
            type: String,
            default: 'Need technical assistance with your Lithium-Ion / LFP battery pack, genuine EV spare parts, warranty verification, or showroom dealership inquiries? Our Kota Central Plant engineering team is here to help.',
        },
        badgeText: { type: String, default: 'Official Ekosmart Support & Contact Directory' },
        helplinePhone: { type: String, default: '+91 8949049003' },
        alternatePhone: { type: String, default: '+91 9549730483' },
        whatsappNumber: { type: String, default: '+91 8949049003' },
        supportEmail: { type: String, default: 'Smartdrive5640@gmail.com' },
        salesEmail: { type: String, default: 'sales@ekosmartdrive.in' },
        plantAddress: { type: String, default: 'Rang Talab, Near by Star Kids School, Kota, Rajasthan - 324002' },
        officeHours: { type: String, default: '10:00 AM to 6:30 PM (Mon - Sat)' },
        gstin: { type: String, default: '08DTUPM4205B1Z0' },
        website: { type: String, default: 'www.ekosmartdrive.in' },
        mapUrl: { type: String, default: 'https://maps.google.com/?q=Kota,Rajasthan' },
        dropdownOptions: {
            type: [String],
            default: [
                'Lithium Battery Solution (EBS)',
                'EV Spare Parts Wholesale/Retail',
                'Drive Rental Assistance',
                'Showroom & Dealership Inquiries',
                'Plant Commercial Warranty Inspection',
            ],
        },
        divisionContacts: [divisionContactSchema],
        isPublished: { type: Boolean, default: true },
        // Softcoded Contact Cards
        cardHelplineTitle: { type: String, default: 'Direct Helpline' },
        cardHelplineSubtitle: { type: String, default: 'Customer support & battery technician hotline' },
        cardHelplineCallBtnText: { type: String, default: 'Call Now' },
        cardHelplineWhatsappBtnText: { type: String, default: 'WhatsApp Us' },
        cardEmailTitle: { type: String, default: 'Official Email' },
        cardEmailSubtitle: { type: String, default: 'Direct technical query & corporate warranty inbox' },
        cardEmailBtnText: { type: String, default: 'Send Email' },
        cardAddressTitle: { type: String, default: 'Manufacturing Plant' },
        cardAddressFacility: { type: String, default: 'Kota Central Facility' },
        cardAddressBtnText: { type: String, default: 'View on Map' },
        cardHoursTitle: { type: String, default: 'Office & Plant Hours' },
        cardHoursSubtitle: { type: String, default: 'Technical dispatch & customer reception' },
        cardHoursNote: { type: String, default: 'Mon - Sat (Sun Closed)' },
        // Plant Dossier Card
        dossierTitle: { type: String, default: 'EBS EKOSMART' },
        dossierSubtitle: { type: String, default: 'BATTERY SOLUTION • LI-ION & LFP' },
        dossierDescription: {
            type: String,
            default: 'Ekosmart Battery Solution (EBS) & Ekosmart EV Spare Parts operates a state-of-the-art battery assembly, testing, and laboratory diagnostics facility in Kota, Rajasthan.',
        },
        corporateEntity: { type: String, default: 'Ekosmart Battery Solution (EBS)' },
        dossierBadgeText: {
            type: String,
            default: 'Pan-India technical assistance, battery replacement logistics, and warranty coverage active.',
        },
        // Inquiry Form
        formTitle: { type: String, default: 'Send an Official Inquiry' },
        formSubtitle: {
            type: String,
            default: 'Have questions regarding dealership, bulk battery orders, or spare parts? Fill out the form below.',
        },
        formQuickSelectLabel: { type: String, default: 'QUICK SELECT DIVISION / CONCERN:' },
        formButtonText: { type: String, default: 'SUBMIT INQUIRY TO KOTA PLANT' },
        formSuccessTitle: { type: String, default: 'Inquiry Received!' },
        formSuccessMessage: {
            type: String,
            default: 'Thank you. Our customer response team in Kota has received your message and will contact you shortly.',
        },
        // Division Section Directory
        divisionSectionBadge: { type: String, default: 'Department & Division Directory' },
        divisionSectionTitle: { type: String, default: 'Direct Contact Channels by Division' },
        divisionSectionSubtitle: {
            type: String,
            default: 'Connect directly with our dedicated division engineers, parts managers, and franchise officers in Kota.',
        },
    },
    footer: {
        companyName: { type: String, default: 'Ekosmart Battery Solution (EBS) & EV Spare Parts' },
        copyrightText: { type: String, default: '2026 Ekosmart Battery Solution. All rights reserved. GSTIN: 08DTUPM4205B1Z0' },
        disclaimer: { type: String, default: 'Official customer support, complaint tracking & battery warranty verification portal' },
        address: { type: String, default: 'Rang Talab, Near by Star Kids School, Kota, Rajasthan - 324002' },
        phone: { type: String, default: '+91 8949049003' },
        email: { type: String, default: 'Smartdrive5640@gmail.com' },
        website: { type: String, default: 'www.ekosmartdrive.in' },
        gstin: { type: String, default: '08DTUPM4205B1Z0' },
        officeHours: { type: String, default: '10:00 AM to 6:30 PM (Mon - Sat)' },
        showPrivacyPolicy: { type: Boolean, default: true },
        showTermsConditions: { type: Boolean, default: true },
        showRefundPolicy: { type: Boolean, default: true },
        logoType: { type: String, enum: ['preset', 'image'], default: 'preset' },
        logoImage: { type: String, default: '' },
        // Social Media & WhatsApp Suite
        instagramUrl: { type: String, default: 'https://instagram.com/ekosmartdrive' },
        showInstagram: { type: Boolean, default: true },
        facebookUrl: { type: String, default: 'https://facebook.com/ekosmartdrive' },
        showFacebook: { type: Boolean, default: true },
        whatsappNumber: { type: String, default: '+91 8949049003' },
        showWhatsapp: { type: Boolean, default: true },
        whatsappText: { type: String, default: 'Hello Ekosmart Support Team, I need assistance with EV battery & services.' },
        mapUrl: { type: String, default: 'https://maps.google.com/?q=Kota,Rajasthan' },
        showContactDropdown: { type: Boolean, default: true },
        contactDropdownTitle: { type: String, default: 'Quick Department Contacts' },
        columns: { type: Array, default: [] },
    },
    privacyPolicy: {
        title: { type: String, default: 'Privacy Policy & Battery Data Protection' },
        content: {
            type: String,
            default: `1. Information We Collect
When you register a service complaint or product warranty on the Ekosmart Platform, we collect necessary personal details including your name, contact mobile number (+91 8949049003 helpline verification), email address, product serial number, and invoice details.

2. Specific Privacy & Data Handling for Battery Service:
- Battery Telemetry & Serial Traceability: Battery serial numbers and charging cycle logs collected during diagnostic checkups are used strictly to validate active 3-Year (48V) or 1.5-Year (60V/72V) warranty status and calculate state-of-health (SoH).
- Location & Service Dispatch: Geolocation data and service address in Kota or Pan-India regions are shared only with assigned certified field engineers for on-site diagnostic service.
- OTP Authentication: Email OTPs are generated to authenticate customer identity before registering complaints or warranty transfers.

3. Statutory Compliance & GST Governance:
Our operations comply with the Indian Information Technology Act, 2000, and GST statutory compliance rules under GSTIN: 08DTUPM4205B1Z0 (Ekosmart Battery Solution, Rang Talab, Kota, Rajasthan - 324002).

4. Contact & Support Division:
For privacy inquiries or technical support:
- Email: Smartdrive5640@gmail.com
- Phone: +91 8949049003
- Address: Rang Talab, Near by Star Kids School, Kota, Rajasthan - 324002
- Office Timings: 10:00 AM to 6:30 PM (Mon - Sat)`,
        },
        isPublished: { type: Boolean, default: true },
    },
    termsConditions: {
        title: { type: String, default: 'Terms & Conditions (Battery & Spare Parts Policy)' },
        content: {
            type: String,
            default: `1. Service & Warranty Registration Terms:
By submitting a complaint, spare parts request, or warranty registration on this portal (www.ekosmartdrive.in), you confirm that all details provided (serial number, bill number, and issue descriptions) are accurate and authentic.

2. EBS EV Battery Warranty Specifications:
- 48V Series Lithium-Ion & LFP Batteries (48V 28Ah, 32Ah, 36Ah, 40Ah): Covered by a 3-Year Official Replacement & Service Warranty with Pan-India technical support.
- 60V Series EV Batteries (60V 28Ah, 32Ah, 36Ah, 40Ah): Covered by a 1.5-Year Official Warranty.
- 72V Series EV Batteries (72V 28Ah, 32Ah, 36Ah): Covered by a 1.5-Year Official Warranty.
- Aluminium Body Lithium Fast Chargers (67.2V / 72V, 6A - 10A): Covered by a 1-Year Official Warranty.

3. Pan-India Service & Transportation Policy:
- Ekosmart Battery Solution provides technical service support across all Indian states.
- In cases requiring factory laboratory inspection or battery pack replacement dispatch from Kota Plant, transportation & freight charges are extra as per standard logistics rates.

4. Warranty Exclusions & Safety Guidelines:
- Battery warranty remains void if the protective seal is broken, casing is tampered with by unauthorized personnel, or if the unit suffers from deep over-discharge, mechanical crush, or direct water immersion.
- Customers must strictly use authorized EBS aluminium body chargers matching rated voltage/amperage specifications.

5. Authorized Divisions:
Service complaints are categorized and handled under four designated divisions: Battery, Rental, Showroom, and Spare Parts. Warranty claims for commercial industrial units fall under the Plant category.`,
        },
        isPublished: { type: Boolean, default: true },
    },
    refundPolicy: {
        title: { type: String, default: 'Refund & Battery Replacement Policy' },
        content: {
            type: String,
            default: `1. Battery & Spare Parts Replacement:
Defective battery cells, BMS circuit boards, and genuine spare parts verified under valid active warranty (3 Years for 48V, 1.5 Years for 60V/72V, 1 Year for Aluminium Chargers) will be repaired or replaced free of charge by authorized Ekosmart service engineers within standard SLA timelines. Pan-India transport charges are extra as applicable.

2. Rental Security Deposit Refunds:
Security deposits for EV rental plans are refunded to the original payment source within 5-7 business days following vehicle return and technical handover clearance.

3. Bulk & Wholesale MOQ Orders:
Bulk battery orders applicable as per Minimum Order Quantity (MOQ 5 / MOQ 10) terms with dispatch clearance from Kota Central Plant.`,
        },
        isPublished: { type: Boolean, default: true },
    },
    navigation: [
        {
            id: { type: String, required: true },
            label: { type: String, required: true },
            url: { type: String, required: true },
            icon: { type: String, default: 'FileText' },
            isVisible: { type: Boolean, default: true },
            order: { type: Number, default: 1 },
            isExternal: { type: Boolean, default: false },
            roleVisibility: [{ type: String }],
        },
    ],
    idCardConfig: {
        template: { type: String, default: 'emerald' },
        templateName: { type: String, default: 'emerald' },
        companyName: { type: String, default: 'Ekosmart Battery Solution (EBS)' },
        companySubtitle: { type: String, default: 'High Power Lithium-Ion & LFP Technologies' },
        companyAddress: { type: String, default: 'Rang Talab, Near by Star Kids School, Kota - 324002' },
        logoType: { type: String, enum: ['preset', 'image'], default: 'preset' },
        logoImage: { type: String, default: '' },
        primaryColor: { type: String, default: '#064e3b' },
        secondaryColor: { type: String, default: '#059669' },
        customColors: { type: Object, default: () => ({}) },
        fields: [
            {
                fieldKey: { type: String, required: true },
                label: { type: String, required: true },
                isVisible: { type: Boolean, default: true },
                order: { type: Number, default: 1 },
            },
        ],
        showBarcode: { type: Boolean, default: true },
        showQrCode: { type: Boolean, default: true },
        authorizedSignatoryText: { type: String, default: 'Authorized Signatory (Kota Plant)' },
        termsText: { type: String, default: 'This card is non-transferable property of Ekosmart Battery Solution.' },
    },
    themeColors: { type: Object, default: () => ({}) },
    sectionLayouts: { type: Object, default: () => ({}) },
    billingConfig: {
        invoicePrefix: { type: String, default: 'EBS-INV' },
        defaultTaxRate: { type: Number, default: 18 },
        termsAndConditions: { type: String, default: 'Goods once sold will be serviced under official Ekosmart warranty terms.' },
        currencySymbol: { type: String, default: '₹' },
        showroomLocations: {
            type: [String],
            default: ['Showroom Counter', 'Kota Central Plant Store', 'Rental Dispatch Hub', 'Main Service Center'],
        },
        paymentModes: {
            type: [String],
            default: ['UPI', 'Cash', 'Card', 'Bank Transfer', 'Finance', 'Credit'],
        },
    },
    portalLinks: {
        adminPortalUrl: { type: String, default: '' },
        employeePortalUrl: { type: String, default: '' },
        customerFrontendUrl: { type: String, default: '' },
    },
    customerLoginTimer: {
        enabled: { type: Boolean, default: true },
        durationSeconds: { type: Number, default: 20 },
        title: { type: String, default: 'Login to Continue' },
        message: {
            type: String,
            default: 'Please login with your email to access your customer account, wallet, referrals, bills and personalized services.',
        },
    },
    batteryBanner: {
        isVisible: { type: Boolean, default: true },
        badgeText: { type: String, default: 'GET HIGH POWER OF LITHIUM' },
        badgeIcon: { type: String, default: 'Sparkles' },
        showBadge: { type: Boolean, default: true },
        badgeBgColor: { type: String, default: 'rgba(16, 185, 129, 0.2)' },
        badgeTextColor: { type: String, default: '#34d399' },
        badgeBorderColor: { type: String, default: 'rgba(16, 185, 129, 0.3)' },
        heading: { type: String, default: 'Genuine Li-ion & LFP Batteries For E-Scooter & E-Rickshaw' },
        headingColor: { type: String, default: '#ffffff' },
        subheading: {
            type: String,
            default: 'Engineered with advanced Smart BMS, thermal protection, and high energy density cells. Tested at our Kota plant with Pan-India dispatch & replacement support.',
        },
        subheadingColor: { type: String, default: '#94a3b8' },
        highlight1: { type: String, default: '48V Series (3 Year Warranty)' },
        highlight1Icon: { type: String, default: 'CheckCircle2' },
        highlight1Color: { type: String, default: '#34d399' },
        highlight2: { type: String, default: '60V / 72V Series (1.5 Year Warranty)' },
        highlight2Icon: { type: String, default: 'CheckCircle2' },
        highlight2Color: { type: String, default: '#34d399' },
        highlight3: { type: String, default: 'Tested at Kota Plant with Smart BMS' },
        highlight3Icon: { type: String, default: 'CheckCircle2' },
        highlight3Color: { type: String, default: '#38bdf8' },
        highlight4: { type: String, default: 'Pan-India Dispatch & Technical Support' },
        highlight4Icon: { type: String, default: 'CheckCircle2' },
        highlight4Color: { type: String, default: '#facc15' },
        bgType: { type: String, enum: ['gradient', 'solid', 'image', 'transparent'], default: 'gradient' },
        bgSolidColor: { type: String, default: '#0f172a' },
        bgGradientStart: { type: String, default: '#0f172a' },
        bgGradientEnd: { type: String, default: '#020617' },
        bgGradientDirection: { type: String, default: 'to-br' },
        bgImage: { type: String, default: '' },
        bgOverlayOpacity: { type: Number, default: 0.85 },
        bgOverlayColor: { type: String, default: '#000000' },
        bgPosition: { type: String, default: 'center' },
        bgSize: { type: String, default: 'cover' },
        bgBlur: { type: Number, default: 0 },
        cardBorderColor: { type: String, default: '#1e293b' },
        cardBorderRadius: { type: String, default: 'rounded-3xl' },
        cardShadow: { type: String, default: 'shadow-xl' },
        showContactCard: { type: Boolean, default: true },
        contactCardTitle: { type: String, default: 'Need Battery Assistance?' },
        contactCardSubtitle: { type: String, default: 'Contact our factory technical engineers in Kota, Rajasthan' },
        contactCardBgColor: { type: String, default: 'rgba(30, 41, 59, 0.8)' },
        contactCardBorderColor: { type: String, default: 'rgba(51, 65, 85, 0.8)' },
        contactLogoType: { type: String, enum: ['preset', 'text', 'image'], default: 'preset' },
        contactLogoText: { type: String, default: 'EBS' },
        contactLogoImage: { type: String, default: '' },
        contactLogoBgColor: { type: String, default: '#064e3b' },
        contactLogoTextColor: { type: String, default: '#ffffff' },
        helplinePhone: { type: String, default: '8949049003' },
        helplineBtnText: { type: String, default: 'Call +91 8949049003' },
        helplineBtnBg: { type: String, default: '#059669' },
        helplineBtnTextColor: { type: String, default: '#ffffff' },
        plantBtnText: { type: String, default: 'View Plant Contact Details' },
        plantBtnLink: { type: String, default: '/contact' },
        plantBtnTarget: { type: String, enum: ['_self', '_blank'], default: '_self' },
        plantBtnBg: { type: String, default: 'rgba(255, 255, 255, 0.1)' },
        plantBtnTextColor: { type: String, default: '#e2e8f0' },
        showWhatsappBtn: { type: Boolean, default: true },
        whatsappNumber: { type: String, default: '8949049003' },
        whatsappBtnText: { type: String, default: 'WhatsApp Chat Assistance' },
        whatsappBtnBg: { type: String, default: '#25D366' },
        whatsappBtnTextColor: { type: String, default: '#ffffff' },
        alternatePhone: { type: String, default: '+91 9549730483' },
        supportEmail: { type: String, default: 'Smartdrive5640@gmail.com' },
    },
    quickActionsConfig: {
        isVisible: { type: Boolean, default: true },
        sectionBadge: { type: String, default: 'QUICK UTILITIES' },
        showSectionBadge: { type: Boolean, default: false },
        sectionTitle: { type: String, default: 'Quick Access Directory' },
        sectionSubtitle: { type: String, default: 'Essential customer services and warranty utilities' },
        showSectionHeader: { type: Boolean, default: false },
        bgType: { type: String, enum: ['color', 'gradient', 'image', 'transparent'], default: 'color' },
        bgColor: { type: String, default: '#ffffff' },
        bgGradientStart: { type: String, default: '#0f172a' },
        bgGradientEnd: { type: String, default: '#1e293b' },
        bgGradientDirection: { type: String, default: 'to-r' },
        bgImage: { type: String, default: '' },
        bgOverlayOpacity: { type: Number, default: 0.8 },
        bgOverlayColor: { type: String, default: '#000000' },
        bgPosition: { type: String, default: 'center' },
        bgSize: { type: String, default: 'cover' },
        bgBlur: { type: Number, default: 0 },
        cardBgColor: { type: String, default: '#ffffff' },
        cardBorderColor: { type: String, default: '#e2e8f0' },
        cardBorderRadius: { type: String, default: 'rounded-3xl' },
        cardShadow: { type: String, default: 'shadow-sm' },
        showDividers: { type: Boolean, default: true },
        dividerColor: { type: String, default: '#e2e8f0' },
        textColor: { type: String, default: '#1e293b' },
        subtitleColor: { type: String, default: '#64748b' },
        layoutStyle: { type: String, enum: ['horizontal', 'grid'], default: 'horizontal' },
    },
    quickActions: [
        {
            id: { type: String, default: 'act-track' },
            title: { type: String, default: 'Track Ticket' },
            subtitle: { type: String, default: 'Live complaint inspection status' },
            url: { type: String, default: '/complaint/track' },
            icon: { type: String, default: 'Search' },
            iconType: { type: String, enum: ['icon', 'image'], default: 'icon' },
            iconImage: { type: String, default: '' },
            color: { type: String, default: 'blue' },
            customColor: { type: String, default: '' },
            customBg: { type: String, default: '' },
            customTextColor: { type: String, default: '' },
            isVisible: { type: Boolean, default: true },
            order: { type: Number, default: 1 },
            target: { type: String, enum: ['_self', '_blank'], default: '_self' },
            showExternalIcon: { type: Boolean, default: false },
            badge: { type: String, default: '' },
            badgeColor: { type: String, default: '' },
        },
        {
            id: { type: String, default: 'act-warranty-reg' },
            title: { type: String, default: 'Warranty Registration' },
            subtitle: { type: String, default: 'Register new sales & serial number' },
            url: { type: String, default: '/warranty/register' },
            icon: { type: String, default: 'ShieldCheck' },
            iconType: { type: String, enum: ['icon', 'image'], default: 'icon' },
            iconImage: { type: String, default: '' },
            color: { type: String, default: 'amber' },
            customColor: { type: String, default: '' },
            customBg: { type: String, default: '' },
            customTextColor: { type: String, default: '' },
            isVisible: { type: Boolean, default: true },
            order: { type: Number, default: 2 },
            target: { type: String, enum: ['_self', '_blank'], default: '_blank' },
            showExternalIcon: { type: Boolean, default: true },
            badge: { type: String, default: '' },
            badgeColor: { type: String, default: '' },
        },
        {
            id: { type: String, default: 'act-warranty-check' },
            title: { type: String, default: 'Check Warranty' },
            subtitle: { type: String, default: '3-Yr (48V) & 1.5-Yr (60V/72V) status' },
            url: { type: String, default: '/warranty/check' },
            icon: { type: String, default: 'ShieldAlert' },
            iconType: { type: String, enum: ['icon', 'image'], default: 'icon' },
            iconImage: { type: String, default: '' },
            color: { type: String, default: 'emerald' },
            customColor: { type: String, default: '' },
            customBg: { type: String, default: '' },
            customTextColor: { type: String, default: '' },
            isVisible: { type: Boolean, default: true },
            order: { type: Number, default: 3 },
            target: { type: String, enum: ['_self', '_blank'], default: '_blank' },
            showExternalIcon: { type: Boolean, default: true },
            badge: { type: String, default: '' },
            badgeColor: { type: String, default: '' },
        },
        {
            id: { type: String, default: 'act-contact' },
            title: { type: String, default: 'Contact Directory' },
            subtitle: { type: String, default: 'Kota Plant +91 8949049003' },
            url: { type: String, default: '/contact' },
            icon: { type: String, default: 'Phone' },
            iconType: { type: String, enum: ['icon', 'image'], default: 'icon' },
            iconImage: { type: String, default: '' },
            color: { type: String, default: 'purple' },
            customColor: { type: String, default: '' },
            customBg: { type: String, default: '' },
            customTextColor: { type: String, default: '' },
            isVisible: { type: Boolean, default: true },
            order: { type: Number, default: 4 },
            target: { type: String, enum: ['_self', '_blank'], default: '_self' },
            showExternalIcon: { type: Boolean, default: false },
            badge: { type: String, default: '' },
            badgeColor: { type: String, default: '' },
        },
    ],
}, { timestamps: true });
exports.Content = mongoose_1.default.model('Content', contentSchema);
