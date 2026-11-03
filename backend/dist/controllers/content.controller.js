"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetContentToDefaults = exports.updateAdminContent = exports.getAdminContent = exports.getPublicContent = exports.getOrCreateDefaultContent = exports.defaultCustomerLoginTimer = exports.defaultBatteryBanner = exports.defaultQuickActions = exports.defaultQuickActionsConfig = exports.defaultRefundPolicyData = exports.defaultContactData = exports.defaultDivisionContacts = exports.defaultTermsConditionsData = exports.defaultPrivacyPolicyData = exports.defaultFooterData = exports.defaultPortalLinks = exports.defaultBillingConfig = exports.defaultIdCardConfig = exports.defaultNavigation = exports.defaultHeroData = exports.defaultHeaderNavData = exports.defaultTopBarData = exports.defaultServiceCards = void 0;
const Content_1 = require("../models/Content");
const ReferralSettings_1 = require("../models/ReferralSettings");
exports.defaultServiceCards = [
    {
        id: 'div-showroom',
        title: 'Showroom Support',
        subtitle: 'EV Sales & Dealership Network',
        description: 'Sales, dealership service inquiries, and new EV vehicle delivery assistance',
        section: 'Showroom',
        badge: 'NEW BOOKINGS',
        features: ['EV Vehicle Registration', 'Dealership Franchise Support', 'Test Drive & Delivery Assistance'],
        linkUrl: '/complaint/register?division=Showroom',
        buttonText: 'Select Showroom',
        color: 'emerald',
        icon: 'Store',
        iconType: 'icon',
        iconImage: '',
        isVisible: true,
        order: 1,
    },
    {
        id: 'div-rental',
        title: 'Drive Rental',
        subtitle: 'Daily & Monthly EV Mobility',
        description: 'EV scooter booking assistance, battery swaps, and rider issue reports.',
        section: 'Rental',
        badge: 'FLEXIBLE PLANS',
        features: ['Quick Battery Swap Network', 'Flexible Daily/Monthly Subscriptions', '24/7 Roadside Assistance'],
        linkUrl: '/complaint/register?division=Rental',
        buttonText: 'Select Rental',
        color: 'blue',
        icon: 'Bike',
        iconType: 'icon',
        iconImage: '',
        isVisible: true,
        order: 2,
    },
    {
        id: 'div-spare-parts',
        title: 'Spare Parts',
        subtitle: 'OEM Components & Accessories',
        description: 'Genuine Ekosmart replacement parts and warranty claim ticket logs',
        section: 'Spare Parts',
        badge: 'GENUINE OEM',
        features: ['Aluminium Fast Chargers (67.2V/72V)', 'Smart BMS & Harness Kits', 'Motor, Controller & Throttle Units'],
        linkUrl: '/complaint/register?division=Spare%20Parts',
        buttonText: 'Select Parts',
        color: 'purple',
        icon: 'Settings',
        iconType: 'icon',
        iconImage: '',
        isVisible: true,
        order: 3,
    },
    {
        id: 'div-battery',
        title: 'Lithium Battery',
        subtitle: 'High Performance LFP & Li-Ion',
        description: 'Battery health diagnostics, cell voltage inspection, and AMC requests',
        section: 'Battery',
        badge: '3-YEAR WARRANTY',
        features: ['48V / 60V / 72V Custom Packs', 'State-of-Health (SoH) Diagnostic', 'Kota Plant Rapid Repair / Swap'],
        linkUrl: '/complaint/register?division=Battery',
        buttonText: 'Select Battery',
        color: 'teal',
        icon: 'Battery',
        iconType: 'icon',
        iconImage: '',
        isVisible: true,
        order: 4,
    },
];
exports.defaultTopBarData = {
    isVisible: true,
    phone: '+91 8949049003',
    phoneLabel: 'Helpline:',
    showPhone: true,
    officeHours: '10:00 AM to 6:30 PM (Mon - Sat)',
    showOfficeHours: true,
    gstin: '08DTUPM4205B1Z0',
    showGstin: true,
    location: 'Kota, Rajasthan',
    showLocation: true,
    bgColor: '#0f172a',
    textColor: '#cbd5e1',
    accentColor: '#34d399',
};
exports.defaultHeaderNavData = {
    brandTitle: 'EBS EKOSMART',
    brandSubtitle: 'Battery Solution • Li-ion & LFP',
    logoType: 'preset',
    logoImage: '',
    logoLink: '/',
    faviconType: 'preset',
    faviconImage: '',
    customerTabTitle: 'EBS Ekosmart | Battery Solution & Support',
    adminTabTitle: 'EBS Ekosmart | Admin Portal',
    employeeTabTitle: 'EBS Ekosmart | Employee Workspace',
    adminBrandTitle: 'EBS EKOSMART',
    adminBrandSubtitle: 'Battery Solution • Admin Portal',
    adminLogoType: 'inherit',
    adminLogoImage: '',
    employeeBrandTitle: 'EBS EKOSMART',
    employeeBrandSubtitle: 'Battery Solution • Staff Portal',
    employeeLogoType: 'inherit',
    employeeLogoImage: '',
    homeLabel: 'Home',
    showHome: true,
    homeHref: '/',
    homeIcon: 'Home',
    walletLabel: 'Wallet & Coins',
    showWallet: false,
    walletHref: '/customer/wallet',
    showWalletBadge: false,
    walletBgColor: '',
    walletTextColor: '',
    walletBorderColor: '',
    walletIcon: 'Coins',
    referLabel: 'Refer & Earn',
    showRefer: false,
    referHref: '/customer/referrals',
    showReferBonus: false,
    referBonusAmount: 500,
    referBgColor: '',
    referTextColor: '',
    referBorderColor: '',
    referIcon: 'Gift',
    showShowroomBilling: false,
    showroomBillingLabel: 'Showroom Bills',
    showroomBillingHref: '/showroom-billing',
    showroomBillingIcon: 'Receipt',
    showWarrantyCheck: false,
    warrantyCheckLabel: 'Check Warranty',
    warrantyCheckHref: '/warranty/check',
    warrantyCheckIcon: 'ShieldCheck',
    showTrackTicket: true,
    trackTicketLabel: 'Track Ticket',
    trackTicketHref: '/complaint/track',
    trackTicketIcon: 'Search',
    showSupportTicket: true,
    supportTicketLabel: 'Register Complaint',
    supportTicketHref: '/complaint/register',
    supportTicketIcon: 'FileText',
    contactLabel: 'Contact & Helpline',
    showContactDropdown: true,
    contactIcon: 'Phone',
    accountLabel: 'Account / Login',
    showAccount: true,
    accountHref: '/customer/login',
    accountBtnBg: '#059669',
    accountBtnText: '#ffffff',
    accountIcon: 'User',
    navBgColor: '#ffffff',
    navBorderColor: '#e2e8f0',
    isSticky: true,
    customNavItems: [
        { id: 'nav-track', label: 'Track Ticket', href: '/complaint/track', isVisible: true, order: 1, isExternal: false, itemType: 'link', icon: 'Search' },
    ],
};
exports.defaultHeroData = {
    heading: 'Ekosmart Battery Solution (EBS)\nHigh Power Lithium-Ion & LFP Battery Packs',
    subheading: 'High Charging Power • Long Life • Low Maintenance. Official customer support portal for EV scooter & E-rickshaw batteries and genuine spare parts.',
    primaryButtonText: 'Register Complaint',
    primaryButtonLink: '/complaint/register',
    primaryButtonTarget: '_self',
    primaryButtonVisible: true,
    primaryButtonBgColor: '#10b981',
    primaryButtonTextColor: '#020617',
    secondaryButtonText: 'Track Ticket Status',
    secondaryButtonLink: '/complaint/track',
    secondaryButtonTarget: '_self',
    secondaryButtonVisible: false,
    secondaryButtonBgColor: 'rgba(255, 255, 255, 0.1)',
    secondaryButtonTextColor: '#ffffff',
    secondaryButtonBorderColor: 'rgba(255, 255, 255, 0.2)',
    secondaryButtonShowIcon: true,
    logoType: 'preset',
    logoImage: '',
    complaintLogoType: 'preset',
    complaintLogoImage: '',
    bgType: 'gradient',
    bgGradientPreset: 'ebs-emerald',
    bgGradientStart: '#022c22',
    bgGradientMiddle: '#064e3b',
    bgGradientEnd: '#115e59',
    bgGradientDirection: 'to-r',
    bgSolidColor: '#064e3b',
    bgImage: '',
    bgOverlayOpacity: 0.8,
    bgOverlayColor: '#000000',
    bgPosition: 'center',
    bgSize: 'cover',
    bgAttachment: 'scroll',
    bgBlur: 0,
    showHeroLogo: false,
    bgPattern: 'mesh',
    badgeText: 'Official EBS Battery Solution Portal • Kota, Rajasthan',
    badgeIcon: 'Sparkles',
    badgeVisible: true,
    badgeBgColor: 'rgba(6, 78, 59, 0.6)',
    badgeTextColor: '#6ee7b7',
    badgeBorderColor: 'rgba(16, 185, 129, 0.4)',
    highlight1Text: 'High Charging Power',
    highlight1Icon: 'Zap',
    highlight1Color: '#facc15',
    highlight1Visible: true,
    highlight2Text: 'Long Life (3 & 1.5 Year Warranty)',
    highlight2Icon: 'Battery',
    highlight2Color: '#4ade80',
    highlight2Visible: true,
    highlight3Text: 'Low Maintenance',
    highlight3Icon: 'Wrench',
    highlight3Color: '#5eead4',
    highlight3Visible: true,
    textColor: '#ffffff',
};
exports.defaultNavigation = [
    { id: 'nav-home', label: 'Home', url: '/', icon: 'Home', isVisible: true, order: 1, roleVisibility: ['public', 'employee', 'admin'] },
    { id: 'nav-support', label: 'Support (Register Complaint)', url: '/complaint/register', icon: 'FileText', isVisible: true, order: 2, roleVisibility: ['public', 'employee', 'admin'] },
    { id: 'nav-track', label: 'Track Ticket Status', url: '/complaint/track', icon: 'Search', isVisible: true, order: 3, roleVisibility: ['public', 'employee', 'admin'] },
    { id: 'nav-contact', label: 'Contact Us & Helpline', url: '/contact', icon: 'Phone', isVisible: true, order: 4, roleVisibility: ['public', 'employee', 'admin'] },
    { id: 'nav-terms', label: 'Terms & Battery Policy', url: '/terms-conditions', icon: 'Shield', isVisible: true, order: 5, roleVisibility: ['public'] },
    { id: 'nav-privacy', label: 'Privacy Policy', url: '/privacy-policy', icon: 'Lock', isVisible: true, order: 6, roleVisibility: ['public'] },
    { id: 'nav-admin', label: 'Admin Portal', url: 'https://ekosmartadminportal.vercel.app', icon: 'Lock', isVisible: true, order: 7, isExternal: true, roleVisibility: ['public', 'admin'] },
    { id: 'nav-emp', label: 'Employee Workspace', url: 'https://ekosmartemployeeportal.vercel.app', icon: 'UserCheck', isVisible: true, order: 8, isExternal: true, roleVisibility: ['public', 'employee'] },
];
exports.defaultIdCardConfig = {
    templateName: 'emerald',
    companyName: 'Ekosmart Battery Solution (EBS)',
    companySubtitle: 'High Power Lithium-Ion & LFP Technologies',
    companyAddress: 'Rang Talab, Near by Star Kids School, Kota, Rajasthan - 324002',
    logoType: 'preset',
    logoImage: '',
    primaryColor: '#064e3b',
    secondaryColor: '#059669',
    fields: [
        { fieldKey: 'name', label: 'Employee Full Name', isVisible: true, order: 1 },
        { fieldKey: 'employeeId', label: 'Employee ID No.', isVisible: true, order: 2 },
        { fieldKey: 'designation', label: 'Designation / Title', isVisible: true, order: 3 },
        { fieldKey: 'department', label: 'Department', isVisible: true, order: 4 },
        { fieldKey: 'division', label: 'Division Scope', isVisible: true, order: 5 },
        { fieldKey: 'mobile', label: 'Contact Mobile', isVisible: true, order: 6 },
        { fieldKey: 'email', label: 'Official Email', isVisible: true, order: 7 },
        { fieldKey: 'joiningDate', label: 'Date of Joining / Issue', isVisible: true, order: 8 },
    ],
    showBarcode: true,
    showQrCode: true,
    authorizedSignatoryText: 'Authorized Signatory (Kota Central Plant)',
    termsText: 'This card remains the property of Ekosmart Battery Solution. If found, please return to Kota Plant.',
};
exports.defaultBillingConfig = {
    invoicePrefix: 'EBS-INV',
    defaultTaxRate: 18,
    termsAndConditions: '1. Batteries covered by official Ekosmart warranty. 2. Physical damage or water immersion voids warranty. 3. Transport charges extra for factory repairs.',
    currencySymbol: '₹',
    showroomLocations: ['Showroom Counter', 'Kota Central Plant Store', 'Rental Dispatch Hub', 'Main Service Center'],
    paymentModes: ['UPI', 'Cash', 'Card', 'Bank Transfer', 'Finance', 'Credit'],
};
exports.defaultPortalLinks = {
    adminPortalUrl: 'https://ekosmartadminportal.vercel.app',
    employeePortalUrl: 'https://ekosmartemployeeportal.vercel.app',
    customerFrontendUrl: 'https://ekosmartcustomersite.vercel.app',
};
exports.defaultFooterData = {
    companyName: 'Ekosmart Battery Solution (EBS) & EV Spare Parts',
    copyrightText: '2026 Ekosmart Battery Solution. All rights reserved. GSTIN: 08DTUPM4205B1Z0',
    disclaimer: 'Official customer support, complaint tracking & battery warranty verification portal',
    address: 'Rang Talab, Near by Star Kids School, Kota, Rajasthan - 324002',
    phone: '+91 8949049003',
    email: 'Smartdrive5640@gmail.com',
    website: 'www.ekosmartdrive.in',
    gstin: '08DTUPM4205B1Z0',
    officeHours: '10:00 AM to 6:30 PM (Mon - Sat)',
    showPrivacyPolicy: true,
    showTermsConditions: true,
    showRefundPolicy: true,
    logoType: 'preset',
    logoImage: '',
    instagramUrl: 'https://www.instagram.com/ekosmartdrive',
    showInstagram: true,
    facebookUrl: 'https://www.facebook.com/ekosmartdrive',
    showFacebook: true,
    whatsappNumber: '+91 8949049003',
    showWhatsapp: true,
    whatsappText: 'Hello Ekosmart, I would like to inquire about battery service & support.',
    mapUrl: 'https://maps.google.com/?q=Rang+Talab,+Near+by+Star+Kids+School,+Kota,+Rajasthan+324002',
    showContactDropdown: true,
    contactDropdownTitle: 'Quick Department & Helpline Directory',
};
exports.defaultPrivacyPolicyData = {
    title: 'Privacy Policy & Battery Data Protection',
    content: `1. Information We Collect
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
    isPublished: true,
};
exports.defaultTermsConditionsData = {
    title: 'Terms & Conditions (Battery & Spare Parts Policy)',
    content: `1. Service & Warranty Registration Terms:
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
    isPublished: true,
};
exports.defaultDivisionContacts = [
    {
        id: 'div-contact-1',
        name: 'Lithium Battery Solution (EBS)',
        phone: '+91 8949049003',
        email: 'battery@ekosmartdrive.in',
        whatsapp: '+91 8949049003',
        inCharge: 'Lead Battery Diagnostic Engineer',
        officeHours: '10:00 AM - 6:30 PM (Mon - Sat)',
        address: 'Kota Central Plant - Testing Bay 1',
    },
    {
        id: 'div-contact-2',
        name: 'EV Spare Parts Wholesale/Retail',
        phone: '+91 8949049003',
        email: 'parts@ekosmartdrive.in',
        whatsapp: '+91 8949049003',
        inCharge: 'Parts Logistics Manager',
        officeHours: '10:00 AM - 6:30 PM (Mon - Sat)',
        address: 'Kota Central Plant - Warehouse A',
    },
    {
        id: 'div-contact-3',
        name: 'Drive Rental Assistance',
        phone: '+91 8949049003',
        email: 'rental@ekosmartdrive.in',
        whatsapp: '+91 8949049003',
        inCharge: 'Fleet Mobility Lead',
        officeHours: '24/7 Helpline Support',
        address: 'Kota Mobility Desk',
    },
    {
        id: 'div-contact-4',
        name: 'Showroom & Dealership Inquiries',
        phone: '+91 8949049003',
        email: 'showroom@ekosmartdrive.in',
        whatsapp: '+91 8949049003',
        inCharge: 'Dealership Franchise Head',
        officeHours: '10:00 AM - 7:00 PM (Mon - Sat)',
        address: 'Kota Flagship Experience Center',
    },
    {
        id: 'div-contact-5',
        name: 'Plant Commercial Warranty Inspection',
        phone: '+91 8949049003',
        email: 'warranty@ekosmartdrive.in',
        whatsapp: '+91 8949049003',
        inCharge: 'Chief Quality & Warranty Officer',
        officeHours: '10:00 AM - 6:00 PM (Mon - Sat)',
        address: 'Kota Plant - Quality Control Bay',
    },
];
exports.defaultContactData = {
    heading: 'Get in Touch With Us',
    subheading: 'Need technical assistance with your Lithium-Ion / LFP battery pack, genuine EV spare parts, warranty verification, or showroom dealership inquiries? Our Kota Central Plant engineering team is here to help.',
    badgeText: 'Official Ekosmart Support & Contact Directory',
    helplinePhone: '+91 8949049003',
    supportEmail: 'Smartdrive5640@gmail.com',
    plantAddress: 'Rang Talab, Near by Star Kids School, Kota, Rajasthan - 324002',
    officeHours: '10:00 AM to 6:30 PM (Mon - Sat)',
    gstin: '08DTUPM4205B1Z0',
    website: 'www.ekosmartdrive.in',
    mapUrl: 'https://maps.google.com/?q=Rang+Talab,+Near+by+Star+Kids+School,+Kota,+Rajasthan+324002',
    dropdownOptions: [
        'Lithium Battery Solution (EBS)',
        'EV Spare Parts Wholesale/Retail',
        'Drive Rental Assistance',
        'Showroom & Dealership Inquiries',
        'Plant Commercial Warranty Inspection',
    ],
    divisionContacts: exports.defaultDivisionContacts,
    isPublished: true,
    // Softcoded Contact Cards
    cardHelplineTitle: 'Direct Helpline',
    cardHelplineSubtitle: 'Customer support & battery technician hotline',
    cardHelplineCallBtnText: 'Call Now',
    cardHelplineWhatsappBtnText: 'WhatsApp Us',
    cardEmailTitle: 'Official Email',
    cardEmailSubtitle: 'Direct technical query & corporate warranty inbox',
    cardEmailBtnText: 'Send Email',
    cardAddressTitle: 'Manufacturing Plant',
    cardAddressFacility: 'Kota Central Facility',
    cardAddressBtnText: 'View on Map',
    cardHoursTitle: 'Office & Plant Hours',
    cardHoursSubtitle: 'Technical dispatch & customer reception',
    cardHoursNote: 'Mon - Sat (Sun Closed)',
    // Plant Dossier Card
    dossierTitle: 'EBS EKOSMART',
    dossierSubtitle: 'BATTERY SOLUTION • LI-ION & LFP',
    dossierDescription: 'Ekosmart Battery Solution (EBS) & Ekosmart EV Spare Parts operates a state-of-the-art battery assembly, testing, and laboratory diagnostics facility in Kota, Rajasthan.',
    corporateEntity: 'Ekosmart Battery Solution (EBS)',
    dossierBadgeText: 'Pan-India technical assistance, battery replacement logistics, and warranty coverage active.',
    // Inquiry Form
    formTitle: 'Send an Official Inquiry',
    formSubtitle: 'Have questions regarding dealership, bulk battery orders, or spare parts? Fill out the form below.',
    formQuickSelectLabel: 'QUICK SELECT DIVISION / CONCERN:',
    formButtonText: 'SUBMIT INQUIRY TO KOTA PLANT',
    formSuccessTitle: 'Inquiry Received!',
    formSuccessMessage: 'Thank you. Our customer response team in Kota has received your message and will contact you shortly.',
    // Division Section Directory
    divisionSectionBadge: 'Department & Division Directory',
    divisionSectionTitle: 'Direct Contact Channels by Division',
    divisionSectionSubtitle: 'Connect directly with our dedicated division engineers, parts managers, and franchise officers in Kota.',
};
exports.defaultRefundPolicyData = {
    title: 'Refund & Battery Replacement Policy',
    content: `1. Battery & Spare Parts Replacement:
Defective battery cells, BMS circuit boards, and genuine spare parts verified under valid active warranty (3 Years for 48V, 1.5 Years for 60V/72V, 1 Year for Aluminium Chargers) will be repaired or replaced free of charge by authorized Ekosmart service engineers within standard SLA timelines. Pan-India transport charges are extra as applicable.

2. Rental Security Deposit Refunds:
Security deposits for EV rental plans are refunded to the original payment source within 5-7 business days following vehicle return and technical handover clearance.

3. Bulk & Wholesale MOQ Orders:
Bulk battery orders applicable as per Minimum Order Quantity (MOQ 5 / MOQ 10) terms with dispatch clearance from Kota Central Plant.`,
    isPublished: true,
};
exports.defaultQuickActionsConfig = {
    isVisible: true,
    sectionBadge: 'QUICK UTILITIES',
    showSectionBadge: false,
    sectionTitle: 'Quick Access Directory',
    sectionSubtitle: 'Essential customer services and warranty utilities',
    showSectionHeader: false,
    bgType: 'color',
    bgColor: '#ffffff',
    bgGradientStart: '#0f172a',
    bgGradientEnd: '#1e293b',
    bgGradientDirection: 'to-r',
    bgImage: '',
    bgOverlayOpacity: 0.8,
    bgOverlayColor: '#000000',
    bgPosition: 'center',
    bgSize: 'cover',
    bgBlur: 0,
    cardBgColor: '#ffffff',
    cardBorderColor: '#e2e8f0',
    cardBorderRadius: 'rounded-3xl',
    cardShadow: 'shadow-sm',
    showDividers: true,
    dividerColor: '#e2e8f0',
    textColor: '#1e293b',
    subtitleColor: '#64748b',
    layoutStyle: 'horizontal',
};
exports.defaultQuickActions = [
    {
        id: 'act-register',
        title: 'Register Complaint',
        subtitle: 'Raise a new battery or EV support ticket',
        url: '/complaint/register',
        icon: 'FileText',
        iconType: 'icon',
        iconImage: '',
        color: 'emerald',
        customColor: '',
        customBg: '',
        customTextColor: '',
        isVisible: true,
        order: 1,
        target: '_self',
        showExternalIcon: false,
        badge: '',
        badgeColor: '',
    },
    {
        id: 'act-track',
        title: 'Track Ticket',
        subtitle: 'Live complaint inspection status',
        url: '/complaint/track',
        icon: 'Search',
        iconType: 'icon',
        iconImage: '',
        color: 'blue',
        customColor: '',
        customBg: '',
        customTextColor: '',
        isVisible: true,
        order: 2,
        target: '_self',
        showExternalIcon: false,
        badge: '',
        badgeColor: '',
    },
    {
        id: 'act-contact',
        title: 'Contact Directory',
        subtitle: 'Kota Plant +91 8949049003',
        url: '/contact',
        icon: 'Phone',
        iconType: 'icon',
        iconImage: '',
        color: 'purple',
        customColor: '',
        customBg: '',
        customTextColor: '',
        isVisible: true,
        order: 3,
        target: '_self',
        showExternalIcon: false,
        badge: '',
        badgeColor: '',
    },
];
exports.defaultBatteryBanner = {
    isVisible: true,
    badgeText: 'GET HIGH POWER OF LITHIUM',
    badgeIcon: 'Zap',
    showBadge: true,
    badgeBgColor: '#059669',
    badgeTextColor: '#ecfdf5',
    badgeBorderColor: 'rgba(52, 211, 153, 0.4)',
    heading: 'Genuine Li-ion & LFP Batteries For E-Scooter & E-Rickshaw',
    headingColor: '#ffffff',
    subheading: 'Engineered with advanced Smart BMS, thermal protection, and high energy density cells. Tested at our Kota plant with Pan-India dispatch & replacement support.',
    subheadingColor: '#93c5fd',
    highlight1: '48V Series (3 Year Warranty)',
    highlight1Icon: 'ShieldCheck',
    highlight1Color: '#34d399',
    highlight2: '60V / 72V Series (1.5 Year Warranty)',
    highlight2Icon: 'CheckCircle2',
    highlight2Color: '#38bdf8',
    highlight3: '100% Genuine Cells & Kota Plant Support',
    highlight3Icon: 'Award',
    highlight3Color: '#fbbf24',
    highlight4: 'Pan-India Replacement & Express Dispatch',
    highlight4Icon: 'Truck',
    highlight4Color: '#a78bfa',
    // Background Image Suite
    bgType: 'gradient',
    bgSolidColor: '#0f172a',
    bgGradientStart: '#0f172a',
    bgGradientEnd: '#1e3a8a',
    bgGradientDirection: 'to-br',
    bgImage: '',
    bgOverlayOpacity: 0.85,
    bgOverlayColor: '#090d16',
    bgPosition: 'center',
    bgSize: 'cover',
    bgBlur: 0,
    cardBorderColor: 'rgba(59, 130, 246, 0.3)',
    cardBorderRadius: 'rounded-2xl',
    cardShadow: 'shadow-xl',
    // Contacts & Assistance Card
    showContactCard: true,
    contactCardTitle: 'Need Battery Assistance?',
    contactCardSubtitle: 'Contact our factory technical engineers in Kota, Rajasthan',
    contactCardBgColor: 'rgba(255, 255, 255, 0.08)',
    contactCardBorderColor: 'rgba(255, 255, 255, 0.15)',
    contactLogoType: 'preset',
    contactLogoText: 'EBS KOTA PLANT',
    contactLogoImage: '',
    contactLogoBgColor: '#059669',
    contactLogoTextColor: '#ffffff',
    helplinePhone: '8949049003',
    helplineBtnText: 'Call +91 8949049003',
    helplineBtnBg: '#2563eb',
    helplineBtnTextColor: '#ffffff',
    plantBtnText: 'View Plant Contact Details',
    plantBtnLink: '/contact',
    plantBtnTarget: '_self',
    plantBtnBg: 'rgba(255, 255, 255, 0.12)',
    plantBtnTextColor: '#ffffff',
    showWhatsappBtn: true,
    whatsappNumber: '8949049003',
    whatsappBtnText: 'Chat on WhatsApp',
    whatsappBtnBg: '#25D366',
    whatsappBtnTextColor: '#ffffff',
    alternatePhone: '+91 8949049003',
    supportEmail: 'Smartdrive5640@gmail.com',
};
exports.defaultCustomerLoginTimer = {
    enabled: true,
    durationSeconds: 20,
    title: 'Welcome to Ekosmart',
    message: 'Login with your email to access your customer wallet, showroom bills, warranty certificates & rewards.',
};
const getOrCreateDefaultContent = async () => {
    let content = await Content_1.Content.findOne({ key: 'global_cms' });
    if (!content) {
        content = await Content_1.Content.create({
            key: 'global_cms',
            topBar: exports.defaultTopBarData,
            headerNav: exports.defaultHeaderNavData,
            hero: exports.defaultHeroData,
            serviceCards: exports.defaultServiceCards,
            navigation: exports.defaultNavigation,
            idCardConfig: exports.defaultIdCardConfig,
            billingConfig: exports.defaultBillingConfig,
            portalLinks: exports.defaultPortalLinks,
            customerLoginTimer: exports.defaultCustomerLoginTimer,
            batteryBanner: exports.defaultBatteryBanner,
            quickActionsConfig: exports.defaultQuickActionsConfig,
            quickActions: exports.defaultQuickActions,
            contactInfo: exports.defaultContactData,
            footer: exports.defaultFooterData,
            privacyPolicy: exports.defaultPrivacyPolicyData,
            termsConditions: exports.defaultTermsConditionsData,
            refundPolicy: exports.defaultRefundPolicyData,
        });
    }
    else {
        let modified = false;
        if (!content.topBar || !content.topBar.phone) {
            content.topBar = exports.defaultTopBarData;
            modified = true;
        }
        if (!content.headerNav || !content.headerNav.brandTitle) {
            content.headerNav = exports.defaultHeaderNavData;
            modified = true;
        }
        else {
            const existingNav = content.headerNav.toObject ? content.headerNav.toObject() : content.headerNav;
            content.headerNav = {
                ...exports.defaultHeaderNavData,
                ...existingNav,
                showWallet: false,
                showRefer: false,
                showShowroomBilling: false,
                showWarrantyCheck: false,
                showTrackTicket: typeof existingNav.showTrackTicket !== 'undefined' ? existingNav.showTrackTicket : true,
                showSupportTicket: typeof existingNav.showSupportTicket !== 'undefined' ? existingNav.showSupportTicket : true,
                customNavItems: existingNav.customNavItems && existingNav.customNavItems.length > 0
                    ? existingNav.customNavItems.filter((item) => !/warranty|wallet|referral|showroom-billing/i.test(item?.href || ''))
                    : exports.defaultHeaderNavData.customNavItems,
            };
            content.markModified('headerNav');
        }
        if (!content.serviceCards || content.serviceCards.length === 0) {
            content.serviceCards = exports.defaultServiceCards;
            modified = true;
        }
        if (!content.navigation || content.navigation.length === 0) {
            content.navigation = exports.defaultNavigation;
            modified = true;
        }
        if (!content.idCardConfig || !content.idCardConfig.companyName) {
            content.idCardConfig = exports.defaultIdCardConfig;
            modified = true;
        }
        if (!content.billingConfig || !content.billingConfig.invoicePrefix) {
            content.billingConfig = exports.defaultBillingConfig;
            modified = true;
        }
        if (!content.portalLinks || !content.portalLinks.adminPortalUrl) {
            content.portalLinks = exports.defaultPortalLinks;
            modified = true;
        }
        if (!content.customerLoginTimer || typeof content.customerLoginTimer.enabled === 'undefined') {
            content.customerLoginTimer = exports.defaultCustomerLoginTimer;
            modified = true;
        }
        if (!content.contactInfo ||
            !content.contactInfo.dropdownOptions ||
            content.contactInfo.dropdownOptions.length === 0 ||
            !content.contactInfo.divisionContacts ||
            content.contactInfo.divisionContacts.length === 0) {
            const existingInfo = content.contactInfo
                ? (content.contactInfo.toObject
                    ? content.contactInfo.toObject()
                    : content.contactInfo)
                : {};
            content.contactInfo = {
                ...exports.defaultContactData,
                ...existingInfo,
                dropdownOptions: existingInfo.dropdownOptions && existingInfo.dropdownOptions.length > 0
                    ? existingInfo.dropdownOptions
                    : exports.defaultContactData.dropdownOptions,
                divisionContacts: existingInfo.divisionContacts && existingInfo.divisionContacts.length > 0
                    ? existingInfo.divisionContacts
                    : exports.defaultDivisionContacts,
            };
            content.markModified('contactInfo');
            modified = true;
        }
        if (!content.footer?.phone || !content.footer?.address || typeof content.footer?.whatsappNumber === 'undefined') {
            content.footer = { ...exports.defaultFooterData, ...(content.footer ? (content.footer.toObject ? content.footer.toObject() : content.footer) : {}) };
            modified = true;
        }
        if (!content.privacyPolicy?.content?.includes('8949049003')) {
            content.privacyPolicy = exports.defaultPrivacyPolicyData;
            content.termsConditions = exports.defaultTermsConditionsData;
            content.refundPolicy = exports.defaultRefundPolicyData;
            content.hero = exports.defaultHeroData;
            modified = true;
        }
        if (!content.quickActionsConfig || typeof content.quickActionsConfig.isVisible === 'undefined') {
            content.quickActionsConfig = exports.defaultQuickActionsConfig;
            modified = true;
        }
        if (!content.quickActions || content.quickActions.length === 0) {
            content.quickActions = exports.defaultQuickActions;
            modified = true;
        }
        if (!content.batteryBanner || !content.batteryBanner.heading) {
            content.batteryBanner = exports.defaultBatteryBanner;
            modified = true;
        }
        else if (content.batteryBanner && typeof content.batteryBanner.bgType === 'undefined') {
            content.batteryBanner = {
                ...exports.defaultBatteryBanner,
                ...(content.batteryBanner.toObject ? content.batteryBanner.toObject() : content.batteryBanner),
            };
            modified = true;
        }
        if (modified) {
            await content.save();
        }
    }
    return content;
};
exports.getOrCreateDefaultContent = getOrCreateDefaultContent;
// GET /api/v1/content/public - Public endpoint
const getPublicContent = async (_req, res) => {
    try {
        const content = await (0, exports.getOrCreateDefaultContent)();
        const visibleCards = (content.serviceCards || [])
            .filter((card) => card.isVisible)
            .sort((a, b) => a.order - b.order);
        const visibleNav = (content.navigation || [])
            .filter((nav) => nav.isVisible !== false && (!nav.roleVisibility || nav.roleVisibility.includes('public')))
            .sort((a, b) => a.order - b.order);
        const referralSettings = (await ReferralSettings_1.ReferralSettings.findOne({ key: 'global_referral_settings' })) || {
            enabled: true,
            welcomeRewardCoins: 0,
            batteryCoins: 500,
            showroomCoins: 250,
            purchaseReward: 500,
            referrerReward: 500,
            newCustomerReward: 500,
            serviceReward: 250,
            serviceRedemptionValue: 200,
            coinConversionRate: 1,
        };
        res.status(200).json({
            success: true,
            data: {
                topBar: content.topBar || exports.defaultTopBarData,
                headerNav: content.headerNav || exports.defaultHeaderNavData,
                hero: content.hero,
                serviceCards: visibleCards,
                navigation: visibleNav,
                billingConfig: {
                    currencySymbol: content.billingConfig?.currencySymbol || '₹',
                    showroomLocations: content.billingConfig?.showroomLocations || exports.defaultBillingConfig.showroomLocations,
                },
                portalLinks: content.portalLinks || exports.defaultPortalLinks,
                customerLoginTimer: content.customerLoginTimer || exports.defaultCustomerLoginTimer,
                batteryBanner: content.batteryBanner
                    ? {
                        ...exports.defaultBatteryBanner,
                        ...(content.batteryBanner.toObject
                            ? content.batteryBanner.toObject()
                            : content.batteryBanner),
                    }
                    : exports.defaultBatteryBanner,
                quickActionsConfig: content.quickActionsConfig || exports.defaultQuickActionsConfig,
                quickActions: (content.quickActions || []).filter((q) => q.isVisible !== false),
                referralSettings,
                contactInfo: {
                    ...exports.defaultContactData,
                    ...(content.contactInfo?.toObject
                        ? content.contactInfo.toObject()
                        : content.contactInfo),
                    divisionContacts: content.contactInfo?.divisionContacts && content.contactInfo.divisionContacts.length > 0
                        ? content.contactInfo.divisionContacts
                        : exports.defaultDivisionContacts,
                },
                footer: content.footer,
                privacyPolicy: content.privacyPolicy,
                termsConditions: content.termsConditions,
                refundPolicy: content.refundPolicy,
                themeColors: content.themeColors || {},
                sectionLayouts: content.sectionLayouts || {},
                idCardConfig: content.idCardConfig || exports.defaultIdCardConfig,
            },
        });
    }
    catch (error) {
        console.error('Error fetching public content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch public content',
            data: {
                hero: exports.defaultHeroData,
                serviceCards: exports.defaultServiceCards,
                navigation: exports.defaultNavigation,
                billingConfig: exports.defaultBillingConfig,
                portalLinks: exports.defaultPortalLinks,
                customerLoginTimer: exports.defaultCustomerLoginTimer,
                contactInfo: exports.defaultContactData,
                footer: exports.defaultFooterData,
                privacyPolicy: exports.defaultPrivacyPolicyData,
                termsConditions: exports.defaultTermsConditionsData,
                refundPolicy: exports.defaultRefundPolicyData,
            },
        });
    }
};
exports.getPublicContent = getPublicContent;
// GET /api/v1/content/admin - Admin endpoint
const getAdminContent = async (_req, res) => {
    try {
        const content = await (0, exports.getOrCreateDefaultContent)();
        res.status(200).json({
            success: true,
            data: content,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin content',
            error: error.message,
        });
    }
};
exports.getAdminContent = getAdminContent;
// PUT /api/v1/content/admin - Admin update endpoint
const updateAdminContent = async (req, res) => {
    try {
        const { hero, serviceCards, navigation, idCardConfig, billingConfig, portalLinks, customerLoginTimer, batteryBanner, quickActionsConfig, quickActions, footer, privacyPolicy, termsConditions, refundPolicy, contactInfo, topBar, headerNav, themeColors, sectionLayouts, } = req.body;
        let content = await (0, exports.getOrCreateDefaultContent)();
        if (themeColors) {
            content.themeColors = { ...(content.themeColors || {}), ...themeColors };
            content.markModified('themeColors');
        }
        if (sectionLayouts) {
            content.sectionLayouts = { ...(content.sectionLayouts || {}), ...sectionLayouts };
            content.markModified('sectionLayouts');
        }
        if (topBar) {
            content.topBar = { ...(content.topBar || {}), ...topBar };
            content.markModified('topBar');
        }
        if (headerNav) {
            content.headerNav = { ...(content.headerNav || {}), ...headerNav };
            content.markModified('headerNav');
        }
        if (hero)
            content.hero = { ...content.hero, ...hero };
        if (serviceCards) {
            content.serviceCards = serviceCards;
            content.markModified('serviceCards');
        }
        if (navigation) {
            content.navigation = navigation;
            content.markModified('navigation');
        }
        if (idCardConfig) {
            content.idCardConfig = { ...(content.idCardConfig || {}), ...idCardConfig };
            content.markModified('idCardConfig');
        }
        if (billingConfig) {
            content.billingConfig = { ...(content.billingConfig || {}), ...billingConfig };
            content.markModified('billingConfig');
        }
        if (portalLinks) {
            content.portalLinks = { ...(content.portalLinks || {}), ...portalLinks };
            content.markModified('portalLinks');
        }
        if (customerLoginTimer) {
            content.customerLoginTimer = { ...(content.customerLoginTimer || {}), ...customerLoginTimer };
            content.markModified('customerLoginTimer');
        }
        if (batteryBanner) {
            content.batteryBanner = { ...(content.batteryBanner || {}), ...batteryBanner };
            content.markModified('batteryBanner');
        }
        if (quickActionsConfig) {
            content.quickActionsConfig = { ...(content.quickActionsConfig || {}), ...quickActionsConfig };
            content.markModified('quickActionsConfig');
        }
        if (quickActions) {
            content.quickActions = quickActions;
            content.markModified('quickActions');
        }
        if (contactInfo) {
            content.contactInfo = {
                ...(content.contactInfo ? (content.contactInfo.toObject ? content.contactInfo.toObject() : content.contactInfo) : {}),
                ...contactInfo,
            };
            content.markModified('contactInfo');
        }
        if (footer) {
            content.footer = { ...content.footer, ...footer };
            content.markModified('footer');
        }
        if (privacyPolicy) {
            content.privacyPolicy = { ...content.privacyPolicy, ...privacyPolicy };
            content.markModified('privacyPolicy');
        }
        if (termsConditions) {
            content.termsConditions = { ...content.termsConditions, ...termsConditions };
            content.markModified('termsConditions');
        }
        if (refundPolicy) {
            content.refundPolicy = { ...content.refundPolicy, ...refundPolicy };
            content.markModified('refundPolicy');
        }
        content.updatedAt = new Date();
        await content.save();
        res.status(200).json({
            success: true,
            message: 'Content updated successfully',
            data: content,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update content',
            error: error.message,
        });
    }
};
exports.updateAdminContent = updateAdminContent;
// POST /api/v1/content/reset-defaults - Reset to original default data (pre-update clean factory state)
const resetContentToDefaults = async (_req, res) => {
    try {
        let content = await Content_1.Content.findOne({ key: 'global_cms' });
        if (!content) {
            content = new Content_1.Content({ key: 'global_cms' });
        }
        content.topBar = exports.defaultTopBarData;
        content.headerNav = exports.defaultHeaderNavData;
        content.hero = exports.defaultHeroData;
        content.serviceCards = exports.defaultServiceCards;
        content.navigation = exports.defaultNavigation;
        content.idCardConfig = exports.defaultIdCardConfig;
        content.billingConfig = exports.defaultBillingConfig;
        content.portalLinks = exports.defaultPortalLinks;
        content.customerLoginTimer = exports.defaultCustomerLoginTimer;
        content.contactInfo = exports.defaultContactData;
        content.footer = exports.defaultFooterData;
        content.privacyPolicy = exports.defaultPrivacyPolicyData;
        content.termsConditions = exports.defaultTermsConditionsData;
        content.refundPolicy = exports.defaultRefundPolicyData;
        content.batteryBanner = exports.defaultBatteryBanner;
        content.quickActionsConfig = exports.defaultQuickActionsConfig;
        content.quickActions = exports.defaultQuickActions;
        content.markModified('topBar');
        content.markModified('headerNav');
        content.markModified('serviceCards');
        content.markModified('hero');
        content.markModified('batteryBanner');
        content.markModified('quickActionsConfig');
        content.markModified('quickActions');
        content.markModified('footer');
        content.markModified('contactInfo');
        content.markModified('privacyPolicy');
        content.markModified('termsConditions');
        content.markModified('refundPolicy');
        content.updatedAt = new Date();
        await content.save();
        res.status(200).json({
            success: true,
            message: 'Content successfully reset to previous default data',
            data: content,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to reset content',
            error: error.message,
        });
    }
};
exports.resetContentToDefaults = resetContentToDefaults;
