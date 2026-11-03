"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContactTemplate = exports.getAboutTemplate = exports.getServicesTemplate = exports.getHomepageTemplate = void 0;
const getHomepageTemplate = () => [
    {
        id: 'sec-hero',
        name: 'Hero Banner Section',
        type: 'hero',
        layout: { width: 'boxed', maxWidth: '1280px', columns: 1, gap: '2rem', alignItems: 'center' },
        styling: {
            bgColor: '#064e3b',
            bgGradient: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
            paddingY: '4.5rem',
            paddingX: '1.5rem',
            borderRadius: '1.25rem',
            marginY: '1rem',
            shadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        },
        responsive: { hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false },
        isVisible: true,
        order: 1,
        components: [
            {
                id: 'comp-hero-1',
                type: 'hero_banner',
                name: 'Main Hero Banner',
                props: {
                    badge: '⚡ Official EV Battery Diagnostic & Repair Hub',
                    title: 'Advanced Lithium-Ion & LFP Battery Solutions',
                    subtitle: 'Authorized multi-brand EV battery service, computerized cell balancing, BMS firmware configuration, and instant warranty claim management.',
                    primaryButtonText: 'Book Service / Complaint',
                    primaryButtonLink: '/complaint/register',
                    secondaryButtonText: 'Track Service Status',
                    secondaryButtonLink: '/complaint/track',
                    warrantyButtonText: 'Check Warranty',
                    warrantyButtonLink: '/warranty/check',
                    showMetricsPill: true,
                    metricsText: 'Over 10,000+ Battery Packs Diagnostics Completed Across Rajasthan',
                },
                styling: { textAlign: 'center', color: '#ffffff' },
            },
        ],
    },
    {
        id: 'sec-stats',
        name: 'Key Metrics & KPI Bar',
        type: 'grid',
        layout: { width: 'boxed', maxWidth: '1280px', columns: 4, gap: '1.25rem', alignItems: 'stretch' },
        styling: {
            bgColor: '#ffffff',
            paddingY: '2rem',
            paddingX: '1.5rem',
            borderRadius: '1rem',
            marginY: '1.5rem',
            shadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
        },
        responsive: { columnsTablet: 2, columnsMobile: 1 },
        isVisible: true,
        order: 2,
        components: [
            {
                id: 'comp-stat-1',
                type: 'stats_counter',
                name: 'Stat 1',
                props: { value: '12,500+', label: 'Battery Packs Tested', icon: 'BatteryCharging', trend: '+24% YoY' },
                styling: { color: '#059669' },
            },
            {
                id: 'comp-stat-2',
                type: 'stats_counter',
                name: 'Stat 2',
                props: { value: '99.4%', label: 'Cell Balancing Accuracy', icon: 'CheckCircle2', trend: 'Grade A Quality' },
                styling: { color: '#0284c7' },
            },
            {
                id: 'comp-stat-3',
                type: 'stats_counter',
                name: 'Stat 3',
                props: { value: '24-48 Hrs', label: 'Avg. Diagnostic TAT', icon: 'Clock', trend: 'Fast-Track SLA' },
                styling: { color: '#f59e0b' },
            },
            {
                id: 'comp-stat-4',
                type: 'stats_counter',
                name: 'Stat 4',
                props: { value: '100% Genuine', label: 'OEM Parts & Cells', icon: 'ShieldCheck', trend: 'AIS-156 Certified' },
                styling: { color: '#10b981' },
            },
        ],
    },
    {
        id: 'sec-services',
        name: 'Dynamic Service Offerings Grid',
        type: 'standard',
        layout: { width: 'boxed', maxWidth: '1280px', columns: 1, gap: '1.5rem' },
        styling: {
            bgColor: 'transparent',
            paddingY: '2.5rem',
            paddingX: '1.5rem',
        },
        responsive: { hideOnDesktop: false },
        isVisible: true,
        order: 3,
        components: [
            {
                id: 'comp-sec-head-1',
                type: 'text_heading',
                name: 'Services Heading',
                props: {
                    badge: 'Our Specialized Divisions',
                    title: 'Comprehensive EV Power & Mobility Services',
                    subtitle: 'Select a specialized operational division below to book assistance or submit technical claims.',
                    align: 'center',
                },
            },
            {
                id: 'comp-services-grid',
                type: 'service_cards_grid',
                name: 'Live Service Cards',
                props: {
                    showDynamicDbCards: true,
                    columns: 3,
                },
            },
        ],
    },
    {
        id: 'sec-interactive',
        name: 'Live Tracking & Warranty Widgets',
        type: 'grid',
        layout: { width: 'boxed', maxWidth: '1280px', columns: 2, gap: '2rem', alignItems: 'start' },
        styling: {
            bgColor: '#f1f5f9',
            paddingY: '3rem',
            paddingX: '1.5rem',
            borderRadius: '1.25rem',
            marginY: '2rem',
        },
        responsive: { columnsTablet: 1, columnsMobile: 1 },
        isVisible: true,
        order: 4,
        components: [
            {
                id: 'comp-tracker-widget',
                type: 'ticket_tracker',
                name: 'Live Ticket Tracker Widget',
                props: {
                    title: 'Track Service Ticket',
                    subtitle: 'Enter your Ticket ID (EBS-YYMM-XXXX) or registered 10-digit mobile number for real-time status.',
                    buttonText: 'Check Ticket Status',
                },
            },
            {
                id: 'comp-warranty-widget',
                type: 'warranty_checker',
                name: 'Live Warranty Checker Widget',
                props: {
                    title: 'Verify Warranty Coverage',
                    subtitle: 'Enter your battery pack laser-engraved serial number or invoice ID to inspect active warranty.',
                    buttonText: 'Verify Warranty',
                },
            },
        ],
    },
    {
        id: 'sec-faq',
        name: 'Frequently Asked Questions (FAQ)',
        type: 'standard',
        layout: { width: 'narrow', maxWidth: '840px', columns: 1, gap: '1rem' },
        styling: {
            bgColor: '#ffffff',
            paddingY: '3rem',
            paddingX: '2rem',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            shadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        },
        responsive: {},
        isVisible: true,
        order: 5,
        components: [
            {
                id: 'comp-faq-heading',
                type: 'text_heading',
                name: 'FAQ Heading',
                props: {
                    badge: 'Got Questions?',
                    title: 'Frequently Asked Questions',
                    subtitle: 'Everything you need to know about EV battery diagnostics, warranty claims, and repairs.',
                    align: 'center',
                },
            },
            {
                id: 'comp-faq-list',
                type: 'accordion_faq',
                name: 'FAQ Accordion',
                props: {
                    items: [
                        {
                            question: 'How do I submit an EV battery for health check and diagnostics?',
                            answer: 'You can click "Book Service / Complaint" on our portal, select the "Battery" division, enter your pack serial number, and submit. You will receive an official EBS ticket reference for real-time tracking.',
                        },
                        {
                            question: 'How long does a full battery cell balancing diagnostic cycle take?',
                            answer: 'Standard computerized load testing and impedance analysis take 24 to 48 working hours depending on pack capacity (48V / 60V / 72V) and cell chemistry.',
                        },
                        {
                            question: 'Can I claim free warranty repairs online?',
                            answer: 'Yes. Use the Warranty Check tool to verify your active duration. If within warranty, free diagnostics and manufacturer parts replacements are covered per standard terms.',
                        },
                        {
                            question: 'What types of EV batteries does Ekosmart support?',
                            answer: 'We support all 48V, 60V, and 72V Lithium Iron Phosphate (LFP) and Nickel Manganese Cobalt (NMC) battery packs across all leading 2-wheeler and 3-wheeler EV models.',
                        },
                    ],
                },
            },
        ],
    },
];
exports.getHomepageTemplate = getHomepageTemplate;
const getServicesTemplate = () => [
    {
        id: 'sec-serv-hero',
        name: 'Services Hero',
        type: 'hero',
        layout: { width: 'boxed', maxWidth: '1280px', columns: 1 },
        styling: {
            bgColor: '#064e3b',
            bgGradient: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
            paddingY: '3.5rem',
            paddingX: '1.5rem',
            borderRadius: '1rem',
            marginY: '1rem',
        },
        responsive: {},
        isVisible: true,
        order: 1,
        components: [
            {
                id: 'comp-serv-title',
                type: 'text_heading',
                name: 'Services Title',
                props: {
                    badge: 'Official Engineering Division',
                    title: 'Advanced EV Battery & Component Services',
                    subtitle: 'Full spectrum testing, reconditioning, smart BMS tuning, and certified parts replacement.',
                    align: 'center',
                },
                styling: { color: '#ffffff' },
            },
        ],
    },
    {
        id: 'sec-serv-grid',
        name: 'Detailed Services Grid',
        type: 'standard',
        layout: { width: 'boxed', maxWidth: '1280px', columns: 1 },
        styling: { paddingY: '2.5rem', paddingX: '1.5rem' },
        responsive: {},
        isVisible: true,
        order: 2,
        components: [
            {
                id: 'comp-serv-cards',
                type: 'service_cards_grid',
                name: 'Service Division Cards',
                props: { showDynamicDbCards: true, columns: 3 },
            },
        ],
    },
];
exports.getServicesTemplate = getServicesTemplate;
const getAboutTemplate = () => [
    {
        id: 'sec-about-hero',
        name: 'About Hero',
        type: 'hero',
        layout: { width: 'boxed', maxWidth: '1280px', columns: 1 },
        styling: {
            bgColor: '#0f172a',
            bgGradient: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)',
            paddingY: '3.5rem',
            paddingX: '1.5rem',
            borderRadius: '1rem',
            marginY: '1rem',
        },
        responsive: {},
        isVisible: true,
        order: 1,
        components: [
            {
                id: 'comp-about-head',
                type: 'text_heading',
                name: 'About Title',
                props: {
                    badge: 'About Ekosmart',
                    title: 'Powering India’s Clean Mobility Revolution',
                    subtitle: 'Ekosmart EV Battery Solution is an ISO 9001:2015 certified manufacturer, diagnostic lab, and fleet management provider headquartered in Kota, Rajasthan.',
                    align: 'center',
                },
                styling: { color: '#ffffff' },
            },
        ],
    },
    {
        id: 'sec-about-content',
        name: 'Company Dossier',
        type: 'grid',
        layout: { width: 'boxed', maxWidth: '1280px', columns: 2, gap: '2rem', alignItems: 'center' },
        styling: { paddingY: '3rem', paddingX: '1.5rem' },
        responsive: { columnsTablet: 1, columnsMobile: 1 },
        isVisible: true,
        order: 2,
        components: [
            {
                id: 'comp-about-text',
                type: 'rich_text',
                name: 'About Narrative',
                props: {
                    content: `### Engineered for Reliability & High Energy Density
Ekosmart operates a state-of-the-art testing and manufacturing facility at Electronic Complex, IPIA Kota. 
Equipped with multi-channel battery cyclers, thermal chambers, and automated spot-welding jigs, our technical team delivers highest quality EV battery packs with robust AIS-156 compliant BMS protections.

- **Certified Precision:** Grade-A prismatic & cylindrical cells with automated impedance matching.
- **Dedicated Service Fleet:** Rapid response breakdown assistance for commercial and rental two-wheelers.
- **End-to-End Digital Portal:** Transparent ticket tracking, serialized warranty validation, and instant POS billing.`,
                },
            },
            {
                id: 'comp-about-stats',
                type: 'card_grid',
                name: 'Accreditations',
                props: {
                    cards: [
                        { title: 'ISO 9001:2015', description: 'Certified Quality Management System', icon: 'Award' },
                        { title: 'AIS-156 Phase 2', description: 'Certified Battery Thermal & Electrical Safety', icon: 'ShieldCheck' },
                        { title: 'Over 25+ Techs', description: 'Skilled Battery Engineers & Technicians', icon: 'Users' },
                        { title: 'Central Kota Lab', description: 'Road No. 1, IPIA Kota, Rajasthan', icon: 'MapPin' },
                    ],
                },
            },
        ],
    },
];
exports.getAboutTemplate = getAboutTemplate;
const getContactTemplate = () => [
    {
        id: 'sec-contact-hero',
        name: 'Contact Hero',
        type: 'hero',
        layout: { width: 'boxed', maxWidth: '1280px', columns: 1 },
        styling: {
            bgColor: '#064e3b',
            paddingY: '3rem',
            paddingX: '1.5rem',
            borderRadius: '1rem',
            marginY: '1rem',
        },
        responsive: {},
        isVisible: true,
        order: 1,
        components: [
            {
                id: 'comp-contact-head',
                type: 'text_heading',
                name: 'Contact Header',
                props: {
                    badge: 'Get in Touch',
                    title: 'Ekosmart Central Plant & Service Centers',
                    subtitle: 'Have a query about your battery or wish to partner with us? Our engineering team is ready to assist.',
                    align: 'center',
                },
                styling: { color: '#ffffff' },
            },
        ],
    },
    {
        id: 'sec-contact-details',
        name: 'Contact Coordinates',
        type: 'grid',
        layout: { width: 'boxed', maxWidth: '1280px', columns: 2, gap: '2rem', alignItems: 'start' },
        styling: { paddingY: '2.5rem', paddingX: '1.5rem' },
        responsive: { columnsTablet: 1, columnsMobile: 1 },
        isVisible: true,
        order: 2,
        components: [
            {
                id: 'comp-contact-box',
                type: 'contact_info_box',
                name: 'Plant Coordinates',
                props: {
                    companyName: 'EKOSMART EV BATTERY SOLUTION',
                    address: 'Plot No. 12, Electronic Complex, Road No. 1, IPIA, Kota, Rajasthan - 324005',
                    phones: ['+91 8949049003', '+91 9549730483'],
                    emails: ['Smartdrive5640@gmail.com', 'hr@ekosmartdrive.in'],
                    workingHours: 'Monday – Saturday: 09:00 AM – 07:00 PM (Closed on Sunday)',
                },
            },
            {
                id: 'comp-ticket-helper',
                type: 'card',
                name: 'Help Desk Card',
                props: {
                    title: 'Need Immediate Support?',
                    description: 'For active complaints or warranty verification, access our online self-service portals.',
                    buttonText: 'Submit Service Ticket',
                    buttonLink: '/complaint/register',
                    secondaryButtonText: 'Check Warranty Status',
                    secondaryButtonLink: '/warranty/check',
                },
            },
        ],
    },
];
exports.getContactTemplate = getContactTemplate;
