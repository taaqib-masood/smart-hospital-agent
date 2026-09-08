/**
 * Reva AI — bilingual copy dictionary (English / العربية).
 *
 * - `en` is the source of truth: its literal shape defines the `Dict` type.
 * - `ar` is annotated `: Dict` so TypeScript guarantees both languages stay
 *   structurally in sync (missing/extra keys are compile errors).
 * - Values may be plain strings, arrays, or small template functions for
 *   interpolated strings (function types are inferred from `en`).
 * - `Seg` arrays model rich copy with bold spans (mirrors the previous JSX).
 *
 * Conventions for the Arabic copy:
 * - Modern Standard Arabic, medical/business tone, UAE context.
 * - Latin kept as-is: Reva AI, WhatsApp, LASIK, DHA, HIPAA, AED, OCT, Clinic Pro,
 *   Hospital Group, brand names (Aloka Eye Clinic …) and testimonial names.
 * - Western digits everywhere (98%, 1,499, 3.2). "AED" never becomes د.إ.
 * - Arabic punctuation: ،  ؟  ؛ — and proper spacing after them.
 */

export type Lang = "en" | "ar";

/** Rich-text segment: `b` renders semibold (matches the old inline JSX). */
export type Seg = { t: string; b?: boolean };

const en = {
  nav: {
    features: "Features",
    howItWorks: "How it Works",
    pricing: "Try Demo",
    login: "Dashboard Demo",
    trial: "Request a Pilot",
    trialMobile: "Request a Clinic Pilot",
    navAria: "Main navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    langAria: "Language",
    tryAgent: "Try the AI Agent",
  },

  hero: {
    eyebrow: "WhatsApp Receptionist Support for UAE Clinics",
    h1a: "Give Every Enquiry a Clear Next Step.",
    h1b: "Help Your Reception Team on WhatsApp.",
    p: [
      { t: "Reva works alongside receptionists to handle " },
      { t: "enquiries", b: true },
      { t: ", " },
      { t: "appointment booking", b: true },
      { t: ", reminders, consent requests, billing follow-ups, and " },
      { t: "human handoff", b: true },
      { t: " on WhatsApp." },
    ] as Seg[],
    ctaPrimary: "Request a Clinic Pilot",
    ctaSecondary: "Explore Live Portal",
    trust1: "Privacy Controls & Audit Logs",
    trust2: "Official WhatsApp Business Platform",
    statsAria: "Reva AI quick metrics",
    stats: [
      { value: 1, prefix: "", suffix: "", label: "Shared reception inbox" },
      { value: 24, prefix: "", suffix: "/7", label: "Configured automation" },
      { value: 2, prefix: "", suffix: "", label: "English & Arabic demo" },
    ] as { value: number; prefix: string; suffix: string; label: string }[],
  },

  mockup: {
    business: "BUSINESS",
    online: "online",
    today: "TODAY",
    encrypted: "Messages are end-to-end encrypted",
    inMsg: "Hi, I wanted to book a LASIK consultation.",
    inTime: "4:01 PM",
    outMsg:
      "Hello! Welcome to Demo Clinic. I have an opening this Thursday at 4:00 PM. Shall I confirm it?",
    outTime: "4:02 PM",
    typingAria: "Reva AI is typing",
    message: "Message",
    cardRecoveredTitle: "Missed call recovered",
    cardRecoveredSub: "Replied in 28 seconds \u00b7 Auto",
    cardBookingTitle: "Booking confirmed",
    cardBookingSub: "LASIK Consultation",
    cardBookingSlot: "Thu \u00b7 4:00 PM",
    cardBookingDoctor: "Dr. Sharma",
  },

  features: {
    eyebrow: "Core Operations",
    h2: "Everything Your Clinic Front Desk Needs",
    sub: "Reduce repetitive WhatsApp work while keeping the receptionist in control of patient communication.",
    items: [
      {
        title: "WhatsApp Enquiry Intake",
        text: "Reva acknowledges new enquiries, collects booking details, and puts exceptions into the shared reception queue.",
      },
      {
        title: "Smart No-Show Prevention",
        text: "Automated 24-hour and 1-hour reminders. Patients confirm, reschedule, or cancel with one tap.",
      },
      {
        title: "Receptionist Handoff",
        text: "Clinical questions, billing disputes, and uncertain requests are handed to reception with the conversation context attached.",
      },
    ],
    stats: [
      { value: 1, suffix: "", label: "Shared Reception Inbox" },
      { value: 3, suffix: "", label: "Appointment Actions" },
      { value: 2, suffix: "", label: "Supported Demo Languages" },
    ],
  },

  tailored: {
    eyebrow1: "Verticalized for Eye Clinics",
    h2a: "Built around the Aloka Patient Journey",
    p1: "Reva isn\u2019t a generic booking bot. We map operational workflows for specific eye care services, ensuring patients are guided correctly.",
    bullets: [
      "Cataract Pre-op & Post-op Automation",
      "LASIK Eligibility Triage",
      "Dry Eye Reactivation Campaigns",
    ],
    scheduleTitle: "Today\u2019s Schedule",
    scheduleLive: "LIVE",
    scheduleDate: "Thursday, 12 June \u00b7 Aloka Eye Clinic, Jumeirah",
    schedule: [
      { time: "09:00", initials: "AR", name: "Aisha Rahman", sub: "Dr. Mehta \u00b7 Room 2", tag: "Cataract Consult", tone: 0, recovered: false, confirmed: true },
      { time: "09:45", initials: "OF", name: "Omar Al Farsi", sub: "Dr. Sharma \u00b7 Room 1", tag: "LASIK", tone: 1, recovered: true, confirmed: true },
      { time: "10:30", initials: "PN", name: "Priya Nair", sub: "Dr. Khan \u00b7 Room 3", tag: "Dry Eye Follow-up", tone: 2, recovered: false, confirmed: true },
      { time: "11:15", initials: "KM", name: "Khalid Mansour", sub: "Dr. Mehta \u00b7 Room 2", tag: "Cataract Consult", tone: 0, recovered: false, confirmed: false },
      { time: "12:00", initials: "SH", name: "Sara Haddad", sub: "Dr. Sharma \u00b7 Room 1", tag: "LASIK", tone: 1, recovered: true, confirmed: true },
      { time: "12:45", initials: "JB", name: "Jamal Barakat", sub: "Dr. Khan \u00b7 Room 3", tag: "Dry Eye Follow-up", tone: 2, recovered: false, confirmed: true },
    ],
    /** tone: 0 emerald (Cataract), 1 teal (LASIK), 2 slate (Dry Eye) */
    recovered: "RECOVERED",
    confirmedAria: "Confirmed",
    scheduleFooter: "14 appointments \u00b7 2 auto-recovered today",
    scheduleFooterAi: "AI briefs ready",
    eqMissed: "Monthly Missed Calls",
    eqValue: "Avg. Appointment Value",
    eqRecovered: "Recovered Revenue",
    eqAnnual: "+ 648,000 AED recovered annually",
    eqCaption:
      "Based on a typical specialist eye clinic in Dubai recovering at Reva\u2019s conservative benchmark.",
    eyebrow2: "Revenue Recovery",
    h2b: "The Business Case for Reva",
    p2a: "Turn missed calls into recovered revenue.",
    p2b: "Every unanswered call during consultation hours is a patient who books with a competitor. Reva responds within seconds \u2014 on the channel UAE patients actually use \u2014 and converts the conversation into a confirmed, paid appointment.",
    roiLink: "Calculate your clinic\u2019s numbers",
  },

  implementation: {
    eyebrow: "Implementation",
    h2: "Pilot in Phases, Then Measure It.",
    sub: "Configuration, testing, receptionist training, and approval happen before production use.",
    stepLabel: (n: number) => `STEP ${n}`,
    steps: [
      {
        title: "Connect WhatsApp Business",
        text: "Complete Meta business, number, and template setup for the official platform.",
      },
      {
        title: "Map Your Workflows",
        text: "We configure your doctors, procedures, and automation rules.",
      },
      {
        title: "Run a Measured Pilot",
        text: "Compare response workload, booking completion, handoffs, and appointment attendance against the baseline.",
      },
    ],
    ctaH: "Start with Your Reception Workflow",
    ctaP: "Map the messages, booking rules, handoffs, consent, and billing follow-ups your team actually uses.",
    ctaBtn: "Review the Pilot Scope",
    ctaNote: "Illustrative calculator \u00b7 Replace assumptions with your clinic's baseline",
  },

  portal: {
    eyebrow: "Live Portal",
    h2: "See Reva Working in Real Time",
    sub: "This is the dashboard your front desk sees every day \u2014 explore it right here, no sign-up required.",
    liveDemo: "LIVE DEMO",
    tabsAria: "Portal demo navigation",
    tabRecovery: "Missed-Call Recovery",
    tabBriefs: "Patient Briefs",
    tabNoshow: "No-Show Prevention",
    clinicName: "Demo Clinic",
    clinicSub: "Illustrative UAE workflow",
    agentTitle: "Reva Agent",
    agentStatus: "24/7 active \u00b7 3 workflows",
    statMissed: "Missed today",
    statRecovered: "Recovered",
    statReply: "Median reply",
    feed: [
      {
        title: "LASIK Consultation booked",
        detail: "Fatima A. \u00b7 Thu 4:00 PM \u00b7 Dr. Sharma \u00b7 auto-confirmed",
      },
      {
        title: "Reva replied on WhatsApp",
        detail: "Ahmed K. asked about insurance coverage \u00b7 answered in 22s",
      },
      {
        title: "Escalated to front desk",
        detail: "Reem S. requested Dr. Khan specifically \u00b7 handoff accepted",
      },
      {
        title: "Dry Eye Follow-up booked",
        detail: "Hassan M. \u00b7 Mon 11:15 AM \u00b7 Dr. Khan",
      },
      {
        title: "Reva replied on WhatsApp",
        detail: "Mariam O. rescheduled Cataract Consult to next Tuesday",
      },
    ],
    simulation: [
      { name: "Layla H.", number: "+971 50 *** 4417", proc: "Cataract Consult", slot: "Fri 10:15 AM", doctor: "Dr. Mehta" },
      { name: "Yousef B.", number: "+971 55 *** 2280", proc: "LASIK Consultation", slot: "Sat 9:15 AM", doctor: "Dr. Sharma" },
      { name: "Nadia K.", number: "+971 52 *** 8893", proc: "Dry Eye Follow-up", slot: "Mon 2:45 PM", doctor: "Dr. Khan" },
    ],
    simMissedTitle: (name: string) => `Missed call \u2014 ${name}`,
    simMissedDetail: (number: string) => `${number} rang out during consultation hours`,
    simRecoveredTitle: "Reva replied on WhatsApp",
    simRecoveredDetail: (proc: string) => `Recovered intent in 28s \u00b7 ${proc} interest`,
    simBookedTitle: (proc: string) => `${proc} booked`,
    simBookedDetail: (slot: string, doctor: string) => `${slot} \u00b7 ${doctor} \u00b7 auto-confirmed`,
    simHint: "Watch Reva recover a missed call \u2014 as it happens on your front desk dashboard.",
    simBtn: "Simulate missed call",
    simRecovering: "Recovering\u2026",
    ageLine: (age: number, mrn: string, lastVisit: string) =>
      `Age ${age} \u00b7 MRN ${mrn} \u00b7 Last visit ${lastVisit}`,
    summaryLabel: "Reva AI summary",
    eligibilityLabel: "Eligibility",
    pointsLabel: "Suggested talking points",
    generatedNote:
      "Generated by Reva AI \u00b7 2 minutes before the appointment \u00b7 doctors save ~10 min per patient",
    nextBrief: "Next patient brief",
    briefs: [
      {
        id: "omar",
        name: "Omar Al Farsi",
        initials: "OF",
        age: 34,
        mrn: "ALT-20841",
        visit: "LASIK Consultation",
        doctor: "Dr. Sharma \u00b7 Room 1 \u00b7 11:15 AM",
        lastVisit: "8 months ago",
        summary:
          "34-year-old presenting for LASIK evaluation. Refraction stable at \u22123.25 / \u22123.50 over 18 months. Corneal topography (2024) within normal limits; no ocular pathology reported. Highly motivated for glasses-free lifestyle \u2014 asked about recovery time on WhatsApp twice this week.",
        eligibility: "Good candidate \u2014 proceed with topography & tomography",
        points: [
          "Recovery timeline: most patients drive within 48 hours",
          "Bladeless (femto) option \u2014 eligibility confirmed by tomography today",
          "Transparent packages: AED 7,900 / eye incl. 3 follow-ups",
        ],
      },
      {
        id: "priya",
        name: "Priya Nair",
        initials: "PN",
        age: 58,
        mrn: "ALT-19517",
        visit: "Dry Eye Follow-up",
        doctor: "Dr. Khan \u00b7 Room 3 \u00b7 10:30 AM",
        lastVisit: "6 weeks ago",
        summary:
          "58-year-old reviewing progress after IPL session 2 of 4. TBUT improved from 6s to 9s; OSDI score down from 42 to 28. Reports relief lasting ~5 hours after artificial tears. Mild meibomian gland dysfunction persists on expression.",
        eligibility: "Continue IPL session 3 of 4 in 4 weeks",
        points: [
          "Lid hygiene compliance \u2014 reiterate 2\u00d7 daily warm compresses",
          "Screen breaks: 20-20-20 rule, patient works 9h at desktop",
          "Prescribe preservative-free tears for daytime use",
        ],
      },
    ],
    reminder: [
      { t: "Hi Fatima, a reminder for your " },
      { t: "Cataract Consultation", b: true },
      { t: " tomorrow at " },
      { t: "10:00 AM", b: true },
      { t: " with Dr. Mehta. Tap below to confirm or pick a new time." },
    ],
    confirm: "Confirm",
    reschedule: "Reschedule",
    slots: ["Tomorrow \u00b7 2:30 PM", "Thursday \u00b7 4:00 PM", "Saturday \u00b7 9:15 AM"],
    defaultConfirmed: "tomorrow at 10:00 AM",
    calendarDefault: "Tomorrow \u00b7 10:00 AM",
    bestFit: "BEST FIT",
    doneMsg: (confirmed: string) =>
      `Confirmed \u2014 see you ${confirmed}. Calendar updated & slot held.`,
    calendarTitle: "Front-desk calendar",
    cal1: "Fatima A. \u00b7 Cataract Consult",
    cal2: "Ahmed K. \u00b7 OCT Scan",
    cal2Time: "Tomorrow \u00b7 11:30 AM",
    statusConfirmed: "CONFIRMED",
    statusAwaiting: "AWAITING",
    tryHint: [
      { t: "Try it: tap " },
      { t: "Confirm", b: true },
      { t: " or " },
      { t: "Reschedule", b: true },
      { t: " \u2014 the calendar reacts in real time. 78% of Aloka patients confirm within 10 minutes." },
    ],
    reset: "Reset demo",
  },

  security: {
    eyebrow: "Security & Readiness",
    h2: "Patient Data, Protected by Design",
    sub: "Built with practical safeguards for a clinic pilot. Production use still requires clinic-specific legal, privacy, hosting, and regulator review.",
    items: [
      {
        title: "Clinic Compliance Review",
        text: "A documented pre-launch checklist for the clinic's regulator, privacy, and retention requirements.",
      },
      {
        title: "Operational Safeguards",
        text: "Role-based access, consent evidence, webhook verification, and auditable actions.",
      },
      {
        title: "Hosting Choice Before Launch",
        text: "Hosting region, subprocessors, retention, and backup locations are documented before production use.",
      },
      {
        title: "Protected Data Flows",
        text: "HTTPS, signed webhook verification, restricted credentials, and database access controls.",
      },
      {
        title: "Role-Based Access Control",
        text: "Granular permissions for doctors, front desk, and admins.",
      },
      {
        title: "Full Audit Trails",
        text: "Every AI action logged, reviewable, and reversible.",
      },
    ],
    stripBold: "Reva AI never makes diagnostic decisions.",
    stripRest:
      " It handles logistics \u2014 bookings, reminders, recovery \u2014 and always defers clinical judgement to your doctors.",
  },

  pricing: {
    eyebrow: "Pricing",
    h2: "Simple, Transparent Pricing",
    sub: "Pay for Reva with the revenue recovered from just one missed patient a week.",
    recommended: "Recommended",
    billingMonthly: "Monthly",
    billingAnnual: "Annual",
    annualSave: "2 months free",
    billedNote: "billed annually \u00b7 AED 14,988",
    monthlyNote: "billed monthly \u00b7 cancel anytime",
    proTitle: "Clinic Pro",
    proSub: "Best for specialist clinics like Aloka",
    aed: "AED",
    perMonth: "/month",
    proFeatures: [
      "24/7 WhatsApp AI Agent",
      "Missed-Call Recovery Automation",
      "No-Show Prevention Workflows",
      "Patient Briefs & Summaries",
      "Up to 3 User Accounts",
    ],
    proCta: "Start 14-Day Free Trial",
    proNote: "No credit card required \u00b7 Cancel anytime",
    hospitalTitle: "Hospital Group",
    hospitalSub: "For multi-location chains",
    custom: "Custom",
    customSub: "Volume discounts included \u00b7 Dedicated success manager",
    hospitalFeatures: [
      "Everything in Clinic Pro",
      "Multi-Location Dashboard",
      "Custom Workflow Integrations",
      "Dedicated Account Manager",
      "API Access",
    ],
    hospitalCta: "Book a Consultation",
    hospitalNote: "Response within one business day",
    footnote:
      "Pilot scope, Meta fees, integrations, hosting, and privacy requirements are confirmed with each clinic before launch.",
    guaranteeBold: "Pilot with measurable goals.",
    guaranteeRest:
      " We agree baseline metrics with the clinic, measure the pilot, and continue only when the workflow creates clear operational value.",
    compareToggle: "Compare all features",
    compareToggleHide: "Hide comparison",
    compareAria: "Toggle full feature comparison",
    compareColPlan: "Feature",
    compareColPro: "Clinic Pro",
    compareColHospital: "Hospital Group",
    compareFootnote: "Need something specific? Talk to our UAE team — most rules are configurable per clinic.",
    compareGroups: [
      {
        name: "Coverage",
        rows: [
          { label: "24/7 WhatsApp AI Agent", pro: "yes", hospital: "yes" },
          { label: "After-hours & weekend coverage", pro: "yes", hospital: "yes" },
          { label: "Bilingual EN/AR patient conversations", pro: "yes", hospital: "yes" },
        ],
      },
      {
        name: "AI automation",
        rows: [
          { label: "Missed-call recovery (<28s avg response)", pro: "yes", hospital: "yes" },
          { label: "No-show prevention & smart reminders", pro: "yes", hospital: "yes" },
          { label: "AI patient briefs for doctors", pro: "yes", hospital: "yes" },
          { label: "Custom AI workflow building", pro: "no", hospital: "yes" },
        ],
      },
      {
        name: "Integrations",
        rows: [
          { label: "Official WhatsApp Business Platform setup", pro: "yes", hospital: "yes" },
          { label: "PMS / HIS / EMR integration", pro: "no", hospital: "yes" },
          { label: "API access & webhooks", pro: "no", hospital: "yes" },
        ],
      },
      {
        name: "Accounts & locations",
        rows: [
          { label: "User accounts", pro: "Up to 3", hospital: "Unlimited" },
          { label: "Multi-location dashboard", pro: "no", hospital: "yes" },
        ],
      },
      {
        name: "Compliance & support",
        rows: [
          { label: "Privacy and compliance launch checklist", pro: "yes", hospital: "yes" },
          { label: "Role-based access + audit trails", pro: "yes", hospital: "yes" },
          { label: "Guided pilot onboarding", pro: "yes", hospital: "yes" },
          { label: "Dedicated account manager", pro: "no", hospital: "yes" },
          { label: "Priority SLA support", pro: "Standard", hospital: "Priority" },
        ],
      },
    ] as { name: string; rows: { label: string; pro: string; hospital: string }[] }[],
    altTitle: "Considering the alternatives?",
    altSub: "What it really costs to cover your front desk in the UAE today.",
    alts: [
      {
        name: "Another receptionist",
        cost: "AED 8,000+",
        costSub: "per month",
        points: [
          "One salary, one shift — nights and weekends still uncovered",
          "Recruiting, visas, sick days, annual leave",
          "Still can’t answer two calls at once",
        ],
      },
      {
        name: "Outsourced call center",
        cost: "AED 3–5K",
        costSub: "per month",
        points: [
          "Scripted agents, not trained on your clinic",
          "After-hours often costs extra or rings out",
          "No WhatsApp — patients have to call back",
        ],
      },
      {
        name: "Do nothing",
        cost: "AED 52,920",
        costSub: "lost per month",
        points: [
          "120 missed calls keep walking to the clinic down the road",
          "40% of unconfirmed appointments never show up",
          "Monday mornings start with a wall of voicemails",
        ],
      },
    ] as { name: string; cost: string; costSub: string; points: string[] }[],
    altVerdictPrefix: "Reva AI:",
    altVerdictRest: " 24/7, bilingual, AED 1,499/month — and it never calls in sick.",
    starterBadge: "Early access",
    starterTitle: "Running a smaller practice?",
    starterBody:
      "Starter \u2014 a lighter tier for solo practitioners and single-doctor clinics \u2014 is in early access. Tell us about your setup and we\u2019ll send pricing and rollout details.",
    starterCta: "Ask about Starter",
  },

  social: {
    eyebrow: "Clinic Pilot Workflow",
    h2: "A Practical Receptionist-Assisted Pilot",
    sub: "Start with one clinic, one official WhatsApp number, approved workflows, and measurable receptionist outcomes.",
    verified: "Illustrative Pilot Workflow",
    badgeLabel: "Demo Data · Not a Customer Claim",
    partnerTitle: "Example UAE Clinic",
    partnerLocation: "Illustrative workflow for a private clinic",
    partnerQuote:
      "The pilot goal is simple: reduce repetitive WhatsApp work, make appointment status visible, and give receptionists a clean handoff whenever automation should stop.",
    partnerLeadName: "Reception Workflow Demo",
    partnerLeadRole: "Illustrative scenario — results must be measured during a paid pilot",
    partnerLeadInitials: "RW",
    pilotCohortTitle: "UAE Healthcare Early Access Program",
    pilotCohortBody:
      "We recommend a limited 30–60 day pilot with agreed baseline metrics, approved WhatsApp templates, receptionist training, and a documented production-readiness review.",
    pilotCta: "Book a 20-Minute Walkthrough",
    metricsTitle: "Target Operational Impact · Pilot Projections",
    metrics: [
      { value: 30, suffix: "–60", label: "Recommended pilot days" },
      { value: 1, suffix: "", label: "Reception team workflow" },
      { value: 2, suffix: "", label: "Languages in the demo" },
      { value: 4, suffix: "", label: "Core pilot measures" },
    ] as Array<{
      value: number;
      prefix?: string;
      suffix?: string;
      decimals?: number;
      label: string;
    }>,
    metricsNote:
      "Pilot targets are agreed with the clinic; this demo does not claim measured customer results.",
  },

  faq: {
    eyebrow: "FAQ",
    h2: "Answers for Your Front Desk Team",
    sub: "The questions clinic managers in Dubai ask us most \u2014 answered plainly. Anything missing? Our team replies within one business day.",
    cardH: "Still have questions?",
    cardP:
      "Book a 20-minute walkthrough with our UAE team \u2014 we\u2019ll map Reva to your clinic\u2019s exact workflow.",
    cardCta: "Talk to Our Team",
    cardCta2: "Get the economics one-pager",
    searchPlaceholder: "Search questions\u2026",
    searchAria: "Search FAQ",
    searchKbd: "Press / to search",
    searchKbdAria: "Keyboard shortcut: press slash to focus the FAQ search",
    resultsLabel: (n: number) => `${n} ${n === 1 ? "question" : "questions"}`,
    catAll: "All",
    catCompliance: "Compliance",
    catSetup: "Setup & Integration",
    catBehavior: "AI Behavior",
    noResultsH: "No questions match your search.",
    noResultsP: "Try a different keyword, or talk to our UAE team \u2014 we reply within one business day.",
    noResultsReset: "Clear filters",
    popularH: "Popular questions",
    popularOpen: "Open question",
    copyLink: "Copy link to this answer",
    copiedToast: "Link copied",
    copiedDesc: "Anyone who opens it lands directly on this answer.",
    copyFailToast: "Couldn't copy the link",
    faqs: [
      {
        q: "Is Reva compliant with UAE healthcare regulations?",
        a: "Reva includes role-based access, audit logs, consent records, and security controls. Each clinic must complete its own legal, privacy, hosting, and regulator review before production use.",
        cat: "compliance",
      },
      {
        q: "How does Reva connect to our clinic's WhatsApp?",
        a: "Reva connects through the official WhatsApp Business Platform after the clinic completes Meta business and number setup. Number ownership and migration details are confirmed during onboarding.",
        cat: "setup",
      },
      {
        q: "What happens when the AI can't answer a patient?",
        a: "Reva recognizes its limits. For clinical questions, billing disputes, or anything it isn't confident about, it escalates instantly to your front desk \u2014 with the full conversation attached \u2014 and the appointment stays untouched until a human decides. Patients can also opt out to a human at any time with one tap.",
        cat: "behavior",
      },
      {
        q: "Does Reva replace our practice management system?",
        a: "No \u2014 Reva sits on top of it. The AI patient operations layer handles the conversations and busywork around your existing calendar and workflows. On the Hospital Group plan, we integrate directly with your PMS or HIS through custom workflow integrations and API access.",
        cat: "setup",
      },
      {
        q: "How long does setup really take?",
        a: "Timing depends on Meta approval, clinic data, approved templates, and any calendar integration. A limited pilot is configured first and starts only after testing and clinic approval.",
        cat: "setup",
      },
      {
        q: "Can patients still reach a human at the front desk?",
        a: "Always. Every AI conversation includes a visible one-tap handoff to your team, and Reva only automates what you explicitly configure. During clinic hours, escalated conversations reach your staff within seconds, with full context attached.",
        cat: "behavior",
      },
    ],
  },

  footer: {
    tagline:
      "The AI patient operations layer for UAE clinics. Recovered calls, fewer no-shows, calmer front desks.",
    badge1: "Privacy Controls & Audit Logs",
    badge2: "Built on WhatsApp Business API",
    product: "Product",
    company: "Company",
    productLinks: ["Features", "How it Works", "Try the AI Agent", "Security Readiness", "FAQ"],
    companyLinks: [
      "Security & Compliance",
      "Privacy Policy",
      "Production Readiness",
      "Talk to Our Team",
    ],
    ctaH: "Ready to calm your front desk?",
    ctaP:
      "See how much revenue Reva AI can recover for your clinic \u2014 in under two minutes.",
    ctaBtn: "Try the Demo",
    copyright: "\u00a9 2026 Reva AI. All rights reserved.",
    made: "Made for healthcare providers in the United Arab Emirates",
    productAria: "Footer \u2014 product",
    companyAria: "Footer \u2014 company",
    status: "All systems operational",
  },

  roi: {
    title: "Calculate Your ROI",
    desc: "Find out how much revenue you are losing to missed calls and no-shows \u2014 and what Reva recovers back.",
    s1Label: "Missed calls per month",
    s1Format: (v: string) => `${v} calls`,
    s1Hint: "Count every call that rings out or hits voicemail during clinic hours.",
    s2Label: "Average appointment value",
    s2Format: (v: string) => `AED ${v}`,
    s2Hint: "For reference: a LASIK consultation at Aloka averages AED 450\u2013600.",
    s3Label: "Recovery rate",
    s3Format: (v: number) => `${v}%`,
    s3Hint: "Choose a conservative test assumption, then replace it with measured pilot performance.",
    resultLabel: "Recovered revenue",
    perMonth: "/ month",
    visitsLabel: "Recovered visits",
    perMo: "/mo",
    annualLabel: "Annual",
    paysForItself: (n: string) =>
      `Reva pays for itself ${n}\u00d7 over \u2014 every single month`,
    breakeven: (n: number) =>
      `Break-even at just ${n} recovered patients per month`,
    note: "Estimate based on your inputs. Clinic Pro is 1,499 AED/month \u2014 book a free trial for a precise revenue audit of your clinic.",
    onePagerCta: "Get the clinic economics one-pager",
  },

  leadDialog: {
    proLabel: "Clinic Pro",
    proPrice: "1,499 AED / month",
    proSub: "Best for specialist clinics",
    hospitalLabel: "Hospital Group",
    hospitalPrice: "Custom",
    hospitalSub: "For multi-location chains",
    titlePro: "Start your 14-day free trial",
    titleConsult: "Book a consultation",
    submitPro: "Start 14-Day Free Trial",
    submitConsult: "Book a Consultation",
    desc: "Tell us where to reach you \u2014 we activate Reva for your clinic in under 48 hours. No credit card required.",
    fName: "Full name",
    namePh: "Dr. Amina Haddad",
    fEmail: "Work email",
    emailPh: "you@clinic.ae",
    fClinic: "Clinic name",
    clinicPh: "Your Clinic Name",
    fPhone: "Phone",
    optional: "(optional)",
    phonePh: "+971 50 000 0000",
    submitting: "Submitting\u2026",
    reassurance: "Pilot request only \u00b7 Production terms are confirmed before launch",
    successTitle: "You\u2019re on the list",
    trialWord: "14-day free trial",
    consultWord: "consultation",
    clinicFallback: "your clinic",
    successMsg: (plan: string, kind: "trial" | "consult", clinic: string): Seg[] => [
      { t: "Our team will contact you within one business day to activate the " },
      { t: plan, b: true },
      { t: " " },
      { t: kind === "trial" ? "14-day free trial" : "consultation" },
      { t: " for " },
      { t: clinic, b: true },
      { t: "." },
    ],
    successBadge: "Pilot onboarding request received",
    done: "Done",
    toastPro: "Trial request received",
    toastConsult: "Consultation request received",
    toastDesc: (clinic: string) =>
      `${clinic} is on the list \u2014 our team will reach out within one business day.`,
    toastClinicFallback: "Your clinic",
    toastErrTitle: "Something went wrong",
    toastErrDesc: "Please try again, or email us at hello@reva-ai.ae.",
    titleOnePager: "Get the clinic economics one-pager",
    descOnePager:
      "The recovery math, the Aloka numbers, and our pricing — on one clean page. We’ll send it to your inbox right away.",
    submitOnePager: "Send me the one-pager",
    onePagerPlan: "One-Pager",
    successMsgOnePager: (clinic: string): Seg[] => [
      { t: "Your download has started — we’ve also emailed a copy to your inbox for " },
      { t: clinic, b: true },
      { t: ". Our team will follow up with a live demo link within one business day." },
    ],
    toastOnePager: "One-pager sent",
    toastOnePagerDesc: (clinic: string) =>
      `The clinic economics one-pager is on its way to ${clinic}.`,
    titleStarter: "Ask about Starter",
    descStarter:
      "Tell us about your practice \u2014 we\u2019ll send Starter pricing, availability, and what fits a single-doctor clinic.",
    submitStarter: "Request Starter details",
    successMsgStarter: (clinic: string): Seg[] => [
      { t: "We\u2019ll send Starter pricing and early-access details for " },
      { t: clinic, b: true },
      { t: " within one business day \u2014 and hold your spot in the rollout queue." },
    ],
    toastStarter: "Starter request received",
    toastStarterDesc: (clinic: string) =>
      `${clinic} is on the Starter early-access list \u2014 we\u2019ll reply within one business day.`,
    dlAlsoTitle: "Need the other language too?",
    dlAlsoSub: "The one-pager is available in both English and Arabic:",
    dlEn: "English PDF",
    dlAr: "Arabic PDF (العربية)",
    dlAria: (lang: string) => `Download the ${lang} one-pager PDF`,
  },

  mobileCta: {
    line: "Reva AI for",
    clinic: "Demo Clinic",
    cta: "Start Free Trial",
  },

  chat: {
    eyebrow: "Try It Yourself",
    h2: "Chat with Reva AI, Right Now",
    sub: "This illustrative demo shows booking, rescheduling, clinic information, and safe handoff. All clinic facts must be configured and approved before use.",
    liveChip: "Live demo",
    repliesIn: "AI Agent \u00b7 typically replies in seconds",
    resetAria: "Reset conversation",
    demoNote: "Illustrative demo \u2014 no real clinic or patient data",
    inputPh: "Type a message\u2026",
    sendAria: "Send message",
    typingAria: "Reva AI is typing",
    greeting:
      "Hello! This is Reva for Demo Clinic. I can help with appointments and clinic-approved information, or connect you with reception. How can I help today?",
    quickAria: "Suggested messages",
    quick: [
      "Book a LASIK consultation",
      "What are your prices?",
      "I need to reschedule",
      "Do you accept insurance?",
    ],
    canLabel: "Reva handles, 24/7:",
    can: [
      "Bookings & reschedules",
      "Pricing & insurance questions",
      "Working hours & location",
      "After-hours enquiries",
    ],
    responses: {
      book: "Of course. I have an opening this Thursday at 4:00 PM with Dr. Sharma for a LASIK consultation, or Saturday at 11:00 AM if you prefer a weekend. Which suits you?",
      price:
        "Prices depend on the clinic and service. I can share the clinic-approved price list or connect you with reception for confirmation.",
      reschedule:
        "No problem at all. I can move your appointment to Thursday at 4:00 PM or Saturday at 11:00 AM \u2014 just tap the slot that works, and I\u2019ll update your booking instantly.",
      insurance:
        "Insurance coverage depends on your clinic and plan. I can share clinic-approved information or hand this conversation to reception for verification. Please avoid sending sensitive documents until the clinic confirms the approved process.",
      hours:
        "I can share the clinic-approved opening hours once they are configured. Outside reception hours, I can collect your request for follow-up.",
      doctor:
        "I can show the clinic-approved practitioner list and availability. Would you prefer a specific practitioner or the first available appointment?",
      location:
        "I can share the clinic-approved map pin and directions once they are configured. This demo does not use a real clinic address.",
      human:
        "Absolutely. I\u2019m connecting you with our front desk team \u2014 they\u2019ll have our full conversation in front of them, so you won\u2019t need to repeat anything. During clinic hours they typically reply within a minute.",
      fallback:
        "Good question \u2014 let me make sure you get the right answer. I can help with bookings, pricing, insurance, and clinic information right now, or I can pass you to our front desk team. What would you prefer?",
    },
    slotsTitle: "Pick a slot:",
    slots: ["Thursday \u00b7 4:00 PM", "Saturday \u00b7 11:00 AM"],
    confirmTitle: "Booking confirmed",
    confirmSub: "LASIK Consultation",
    confirmWith: "with Dr. Sharma",
    confirmMsg:
      "You\u2019re booked! I\u2019ve sent the confirmation, location pin, and a reminder 24 hours before to your WhatsApp. Anything else I can help with?",
    reset: "Start over",
    dubaiNow: "Right now in Dubai",
    onDuty: "Reva is on duty",
  },

  compare: {
    eyebrow: "The Transformation",
    h2: "Your Front Desk, Before & After Reva",
    sub: "Same team, same clinic, same patients — one calm layer of AI in between. Here is what actually changes.",
    beforeLabel: "Before Reva",
    beforeTitle: "The manual front desk",
    before: [
      "Missed calls go to voicemail — most patients never call back",
      "The front desk is buried in repetitive WhatsApp replies all day",
      "No-shows are discovered only when the chair sits empty",
      "Doctors walk into consultations with zero patient context",
      "Friday & weekend messages pile up unanswered until Monday",
    ],
    afterLabel: "With Reva AI",
    afterTitle: "The Reva-assisted front desk",
    after: [
      { stat: "", text: "New WhatsApp enquiries enter one shared reception queue" },
      { stat: "24/7 ", text: "configured acknowledgement and approved self-service flows" },
      { stat: "", text: "reminders and easy rescheduling support appointment attendance" },
      { stat: "", text: "human handoff keeps clinical and exceptional questions with staff" },
      { stat: "", text: "the dashboard shows what is pending, handled, or needs attention" },
    ],
    stripBold: "Same team. Same clinic. Different day.",
    stripRest:
      " Reva doesn’t replace your front desk — it clears the noise so they can focus on the patients standing in front of them.",
    cta: "See it live",
  },

  day: {
    eyebrow: "24/7 Coverage, Made Tangible",
    h2: "A Day with Reva at Aloka Eye Clinic",
    sub: "Clinic hours or not, Reva works the WhatsApp channel every hour of every day. Here is what a typical day looks like — hour by hour.",
    chipDuring: "Clinic hours",
    chipAfter: "After hours",
    events: [
      {
        time: "7:30 AM",
        title: "Overnight enquiries, already handled",
        text: "Before the first staff member arrives, Reva has answered four WhatsApp messages from last night and prepped today’s schedule — confirmations in, briefs ready.",
        during: false,
      },
      {
        time: "11:00 AM",
        title: "Missed call recovered in 28 seconds",
        text: "Both phone lines are busy. A LASIK enquiry goes unanswered — Reva texts the caller instantly and books Thursday’s 4:00 PM consultation.",
        during: true,
      },
      {
        time: "2:15 PM",
        title: "No-show risk, defused",
        text: "A cataract follow-up hasn’t confirmed. Reva sends a gentle nudge with one-tap confirm — the 3:00 PM slot is locked again by 2:30.",
        during: true,
      },
      {
        time: "6:40 PM",
        title: "After the doors close",
        text: "A patient asks about LASIK eligibility minutes before closing. Reva walks her through pricing and insurance, and books Saturday’s consultation.",
        during: true,
      },
      {
        time: "11:30 PM",
        title: "Late-night question, answered with care",
        text: "A post-op patient reports light sensitivity. Reva recognises the flag, reassures with approved guidance, and escalates an urgent note for Dr. Sharma’s 9:00 AM review.",
        during: false,
      },
      {
        time: "3:00 AM · Friday",
        title: "Weekend, fully covered",
        text: "The clinic is closed, but an approved acknowledgement can collect the enquiry and place it in the reception queue for follow-up.",
        during: false,
      },
    ],
    stripBold: "The front desk that never sleeps.",
    stripRest:
      " Every enquiry answered, every slot filled, every reminder sent — while your team focuses on the patients in front of them.",
    cta: "Try it yourself",
  },

  dots: {
    aria: "Section navigation",
    home: "Home",
    features: "Features",
    journey: "Patient Journey",
    how: "How It Works",
    portal: "Live Portal",
    chat: "AI Agent",
    compare: "Before & After",
    day: "A Day with Reva",
    security: "Security",
    pricing: "Pricing",
    faq: "FAQ",
  },

  backToTop: "Back to top",
  skip: "Skip to main content",
};

export type Dict = typeof en;

const ar: Dict = {
  nav: {
    features: "المزايا",
    howItWorks: "كيف يعمل",
    pricing: "جرّب العرض",
    login: "عرض لوحة التحكم",
    trial: "اطلب تجربة للعيادة",
    trialMobile: "اطلب تجربة للعيادة",
    navAria: "التنقل الرئيسي",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    langAria: "اختيار اللغة",
    tryAgent: "جرّب وكيل الذكاء الاصطناعي",
  },

  hero: {
    eyebrow: "مساندة موظف الاستقبال عبر WhatsApp لعيادات الإمارات",
    h1a: "امنح كل استفسار خطوة تالية واضحة.",
    h1b: "ساعد فريق الاستقبال على WhatsApp.",
    p: [
      { t: "يعمل Reva إلى جانب موظفي الاستقبال للتعامل مع " },
      { t: "الاستفسارات", b: true },
      { t: "، و" },
      { t: "حجز المواعيد", b: true },
      { t: "، والتذكيرات، وطلبات الموافقة، ومتابعة الفواتير، و" },
      { t: "التحويل إلى موظف", b: true },
      { t: " عبر WhatsApp." },
    ],
    ctaPrimary: "اطلب تجربة للعيادة",
    ctaSecondary: "استكشف البوابة الحيّة",
    trust1: "ضوابط خصوصية ومسارات تدقيق",
    trust2: "منصة WhatsApp Business الرسمية",
    statsAria: "مقاييس سريعة لـ Reva AI",
    stats: [
      { value: 1, prefix: "", suffix: "", label: "صندوق استقبال مشترك" },
      { value: 24, prefix: "", suffix: "/7", label: "أتمتة مضبوطة" },
      { value: 2, prefix: "", suffix: "", label: "عرض بالإنجليزية والعربية" },
    ] as { value: number; prefix: string; suffix: string; label: string }[],
  },

  mockup: {
    business: "عمل",
    online: "متصل",
    today: "اليوم",
    encrypted: "الرسائل مشفّرة من الطرف إلى الطرف",
    inMsg: "مرحبًا، أودّ حجز استشارة LASIK.",
    inTime: "4:01 م",
    outMsg:
      "أهلًا بك في العيادة التجريبية! لديّ موعد متاح يوم الخميس الساعة 4:00 م. هل أؤكّده لك؟",
    outTime: "4:02 م",
    typingAria: "Reva AI يكتب الآن",
    message: "رسالة",
    cardRecoveredTitle: "تم استعادة مكالمة فائتة",
    cardRecoveredSub: "تم الرد خلال 28 ثانية · تلقائيًا",
    cardBookingTitle: "تم تأكيد الحجز",
    cardBookingSub: "استشارة LASIK",
    cardBookingSlot: "الخميس · 4:00 م",
    cardBookingDoctor: "د. شارما",
  },

  features: {
    eyebrow: "العمليات الأساسية",
    h2: "كل ما يحتاجه مكتب استقبال عيادتك",
    sub: "قلّل أعمال WhatsApp المتكررة مع بقاء موظف الاستقبال متحكماً في تواصل المرضى.",
    items: [
      {
        title: "استقبال استفسارات WhatsApp",
        text: "يستلم Reva الاستفسارات الجديدة ويجمع تفاصيل الحجز ويضع الحالات الاستثنائية في قائمة الاستقبال المشتركة.",
      },
      {
        title: "منع ذكي لحالات عدم الحضور",
        text: "تذكيرات تلقائية قبل 24 ساعة وقبل ساعة واحدة. يؤكّد المرضى موعدهم أو يعيدون جدولته أو يلغونه بلمسة واحدة.",
      },
      {
        title: "تحويل إلى موظف الاستقبال",
        text: "تُحوّل الأسئلة السريرية ونزاعات الفواتير والطلبات غير الواضحة إلى الاستقبال مع سياق المحادثة.",
      },
    ],
    stats: [
      { value: 1, suffix: "", label: "صندوق استقبال مشترك" },
      { value: 3, suffix: "", label: "إجراءات للمواعيد" },
      { value: 2, suffix: "", label: "لغتان في العرض" },
    ],
  },

  tailored: {
    eyebrow1: "مصمّم خصيصًا لعيادات العيون",
    h2a: "مبنيّ حول رحلة مريض Aloka",
    p1: "Reva ليس مجرّد روبوت حجز تقليدي. نرسم مسارات العمليات لخدمات العيون المتخصصة، لضمان توجيه المرضى بالشكل الصحيح.",
    bullets: [
      "أتمتة ما قبل جراحة الساد وبعدها",
      "فرز أهلية LASIK",
      "حملات إعادة تنشيط مرضى جفاف العين",
    ],
    scheduleTitle: "جدول اليوم",
    scheduleLive: "LIVE",
    scheduleDate: "الخميس، 12 يونيو · Aloka Eye Clinic، جميرا",
    schedule: [
      { time: "09:00", initials: "AR", name: "عائشة رحمن", sub: "د. ميتا · غرفة 2", tag: "استشارة ساد", tone: 0, recovered: false, confirmed: true },
      { time: "09:45", initials: "OF", name: "عمر الفارسي", sub: "د. شارما · غرفة 1", tag: "LASIK", tone: 1, recovered: true, confirmed: true },
      { time: "10:30", initials: "PN", name: "بريا ناير", sub: "د. خان · غرفة 3", tag: "متابعة جفاف العين", tone: 2, recovered: false, confirmed: true },
      { time: "11:15", initials: "KM", name: "خالد منصور", sub: "د. ميتا · غرفة 2", tag: "استشارة ساد", tone: 0, recovered: false, confirmed: false },
      { time: "12:00", initials: "SH", name: "سارة حداد", sub: "د. شارما · غرفة 1", tag: "LASIK", tone: 1, recovered: true, confirmed: true },
      { time: "12:45", initials: "JB", name: "جمال بركات", sub: "د. خان · غرفة 3", tag: "متابعة جفاف العين", tone: 2, recovered: false, confirmed: true },
    ],
    recovered: "مُستعادة",
    confirmedAria: "مؤكَّد",
    scheduleFooter: "14 موعدًا · تم استعادة موعدين تلقائيًا اليوم",
    scheduleFooterAi: "الملخّصات الذكية جاهزة",
    eqMissed: "المكالمات الفائتة شهريًا",
    eqValue: "متوسط قيمة الموعد",
    eqRecovered: "الإيرادات المستعادة",
    eqAnnual: "+ 648,000 AED تُستعاد سنويًا",
    eqCaption:
      "استنادًا إلى عيادة عيون متخصصة نموذجية في دبي تحقق نسبة الاستعادة المتحفّظة المعتمدة في Reva.",
    eyebrow2: "استعادة الإيرادات",
    h2b: "الحجة التجارية لصالح Reva",
    p2a: "حوّل المكالمات الفائتة إلى إيرادات مستعادة.",
    p2b: "كل مكالمة لا يجري الردّ عليها خلال ساعات الاستشارات هي مريض سيحجز لدى المنافس. يستجيب Reva خلال ثوانٍ — عبر القناة التي يستخدمها مرضى الإمارات فعلًا — ويحوّل المحادثة إلى موعد مؤكَّد ومدفوع.",
    roiLink: "احسب أرقام عيادتك",
  },

  implementation: {
    eyebrow: "التنفيذ",
    h2: "تجربة على مراحل ثم قياس النتائج.",
    sub: "يتم الإعداد والاختبار وتدريب الاستقبال والموافقة قبل الإنتاج.",
    stepLabel: (n: number) => `الخطوة ${n}`,
    steps: [
      {
        title: "اربط WhatsApp Business",
        text: "أكمل إعداد نشاط Meta والرقم والقوالب على المنصة الرسمية.",
      },
      {
        title: "ارسم مسارات عملك",
        text: "نضبط أطباءك وإجراءاتك وقواعد الأتمتة لديك.",
      },
      {
        title: "نفّذ تجربة قابلة للقياس",
        text: "قارن عبء الرد وإتمام الحجوزات والتحويلات وحضور المواعيد بخط الأساس.",
      },
    ],
    ctaH: "ابدأ بمسار الاستقبال لديك",
    ctaP: "ارسم الرسائل وقواعد الحجز والتحويلات والموافقة ومتابعات الفواتير التي يستخدمها فريقك فعلاً.",
    ctaBtn: "راجع نطاق التجربة",
    ctaNote: "حاسبة توضيحية · استبدل الافتراضات بخط أساس عيادتك",
  },

  portal: {
    eyebrow: "البوابة الحيّة",
    h2: "شاهد Reva أثناء العمل في الوقت الفعلي",
    sub: "هذه لوحة التحكم التي يراها مكتب الاستقبال لديك يوميًا — استكشفها هنا مباشرة، دون أي تسجيل.",
    liveDemo: "عرض حيّ",
    tabsAria: "التنقل في عرض البوابة",
    tabRecovery: "استعادة المكالمات الفائتة",
    tabBriefs: "ملخّصات المرضى",
    tabNoshow: "منع عدم الحضور",
    clinicName: "عيادة تجريبية",
    clinicSub: "مسار إماراتي توضيحي",
    agentTitle: "وكيل Reva",
    agentStatus: "نشط على مدار الساعة · 3 مسارات عمل",
    statMissed: "فائتة اليوم",
    statRecovered: "مُستعادة",
    statReply: "متوسط الرد",
    feed: [
      {
        title: "تم حجز استشارة LASIK",
        detail: "فاطمة ع. · الخميس 4:00 م · د. شارما · تأكيد تلقائي",
      },
      {
        title: "ردّ Reva عبر WhatsApp",
        detail: "أحمد ك. سأل عن تغطية التأمين · تم الرد خلال 22 ثانية",
      },
      {
        title: "تم التحويل إلى مكتب الاستقبال",
        detail: "ريم س. طلبت د. خان تحديدًا · تم قبول التحويل",
      },
      {
        title: "تم حجز متابعة جفاف العين",
        detail: "حسن م. · الاثنين 11:15 ص · د. خان",
      },
      {
        title: "ردّ Reva عبر WhatsApp",
        detail: "مريم ع. أعادت جدولة استشارة الساد إلى الثلاثاء القادم",
      },
    ],
    simulation: [
      { name: "ليلى ح.", number: "+971 50 *** 4417", proc: "استشارة ساد", slot: "الجمعة 10:15 ص", doctor: "د. ميتا" },
      { name: "يوسف ب.", number: "+971 55 *** 2280", proc: "استشارة LASIK", slot: "السبت 9:15 ص", doctor: "د. شارما" },
      { name: "نادية ك.", number: "+971 52 *** 8893", proc: "متابعة جفاف العين", slot: "الاثنين 2:45 م", doctor: "د. خان" },
    ],
    simMissedTitle: (name: string) => `مكالمة فائتة — ${name}`,
    simMissedDetail: (number: string) => `${number} رنّت دون ردّ خلال ساعات الاستشارات`,
    simRecoveredTitle: "ردّ Reva عبر WhatsApp",
    simRecoveredDetail: (proc: string) => `تم فهم الاحتياج خلال 28 ثانية · اهتمام بـ${proc}`,
    simBookedTitle: (proc: string) => `تم حجز ${proc}`,
    simBookedDetail: (slot: string, doctor: string) => `${slot} · ${doctor} · تأكيد تلقائي`,
    simHint: "شاهد Reva يستعيد مكالمة فائتة — لحظة بلحظة على لوحة تحكم مكتب الاستقبال.",
    simBtn: "محاكاة مكالمة فائتة",
    simRecovering: "جارٍ الاستعادة…",
    ageLine: (age: number, mrn: string, lastVisit: string) =>
      `العمر ${age} · MRN ${mrn} · آخر زيارة ${lastVisit}`,
    summaryLabel: "ملخّص Reva AI",
    eligibilityLabel: "الأهلية",
    pointsLabel: "نقاط مقترحة للنقاش",
    generatedNote:
      "أنشأه Reva AI · قبل الموعد بدقيقتين · يوفّر للأطباء نحو 10 دقائق لكل مريض",
    nextBrief: "الملخّص التالي",
    briefs: [
      {
        id: "omar",
        name: "عمر الفارسي",
        initials: "OF",
        age: 34,
        mrn: "ALT-20841",
        visit: "استشارة LASIK",
        doctor: "د. شارما · غرفة 1 · 11:15 ص",
        lastVisit: "قبل 8 أشهر",
        summary:
          "مريض يبلغ من العمر 34 عامًا يحضر لتقييم LASIK. انكسار البصر ثابت عند −3.25 / −3.50 طوال 18 شهرًا. طبولوجيا القرنية (2024) ضمن الحدود الطبيعية؛ ولا توجد أمراض عينية مبلَّغة. دافعية عالية لحياة دون نظارات — سأل عن مدة التعافي عبر WhatsApp مرتين هذا الأسبوع.",
        eligibility: "مرشّح مناسب — المضيّ في طبولوجيا وتوموغرافيا القرنية",
        points: [
          "جدول التعافي: يقود معظم المرضى خلال 48 ساعة",
          "خيار بدون شفرة (فيمتو) — تُؤكَّد الأهلية بالتوموغرافيا اليوم",
          "باقات شفافة: AED 7,900 للعين شاملة 3 زيارات متابعة",
        ],
      },
      {
        id: "priya",
        name: "بريا ناير",
        initials: "PN",
        age: 58,
        mrn: "ALT-19517",
        visit: "متابعة جفاف العين",
        doctor: "د. خان · غرفة 3 · 10:30 ص",
        lastVisit: "قبل 6 أسابيع",
        summary:
          "مريضة تبلغ من العمر 58 عامًا لمراجعة التقدّم بعد جلسة IPL الثانية من أصل 4. تحسّن TBUT من 6 إلى 9 ثوانٍ؛ وانخفاض مؤشر OSDI من 42 إلى 28. تُبلغ عن ارتياح يدوم نحو 5 ساعات بعد الدموع الصناعية. يستمر خلل خفيف في غدد ميبوميان عند الضغط.",
        eligibility: "المتابعة بجلسة IPL الثالثة من 4 بعد 4 أسابيع",
        points: [
          "الالتزام بنظافة الجفون — التأكيد على كمادات دافئة مرتين يوميًا",
          "فترات راحة من الشاشات: قاعدة 20-20-20، تعمل المريضة 9 ساعات أمام الحاسوب",
          "وصف دموع صناعية خالية من المواد الحافظة للاستخدام النهاري",
        ],
      },
    ],
    reminder: [
      { t: "مرحبًا فاطمة، تذكير بموعد " },
      { t: "استشارة الساد", b: true },
      { t: " غدًا الساعة " },
      { t: "10:00 ص", b: true },
      { t: " مع د. ميتا. انقري أدناه للتأكيد أو اختيار وقت جديد." },
    ],
    confirm: "تأكيد",
    reschedule: "إعادة جدولة",
    slots: ["غدًا · 2:30 م", "الخميس · 4:00 م", "السبت · 9:15 ص"],
    defaultConfirmed: "غدًا الساعة 10:00 ص",
    calendarDefault: "غدًا · 10:00 ص",
    bestFit: "الأنسب",
    doneMsg: (confirmed: string) =>
      `تم التأكيد — نراك ${confirmed}. تم تحديث التقويم وحجز الموعد.`,
    calendarTitle: "تقويم مكتب الاستقبال",
    cal1: "فاطمة ع. · استشارة ساد",
    cal2: "أحمد ك. · فحص OCT",
    cal2Time: "غدًا · 11:30 ص",
    statusConfirmed: "مؤكَّد",
    statusAwaiting: "بالانتظار",
    tryHint: [
      { t: "جرّبها: انقر " },
      { t: "تأكيد", b: true },
      { t: " أو " },
      { t: "إعادة جدولة", b: true },
      { t: " — يتفاعل التقويم في الوقت الفعلي. 78% من مرضى Aloka يؤكدون خلال 10 دقائق." },
    ],
    reset: "إعادة تعيين العرض",
  },

  security: {
    eyebrow: "الأمن والامتثال",
    h2: "بيانات المرضى، محميّة بالتصميم",
    sub: "مبنيّ لأنظمة الرعاية الصحية في الإمارات منذ اليوم الأول — ليتيح لفريقك الأتمتة بثقة تامة.",
    items: [
      {
        title: "مراجعة امتثال العيادة",
        text: "قائمة تحقق موثقة لمتطلبات الجهة المنظمة والخصوصية والاحتفاظ قبل التشغيل.",
      },
      {
        title: "ضوابط تشغيلية",
        text: "صلاحيات حسب الدور، وإثبات الموافقة، والتحقق من webhooks، وسجل للإجراءات.",
      },
      {
        title: "اختيار الاستضافة قبل التشغيل",
        text: "يتم توثيق منطقة الاستضافة والمعالجين الفرعيين والاحتفاظ والنسخ الاحتياطية قبل الإنتاج.",
      },
      {
        title: "تدفقات بيانات محمية",
        text: "HTTPS والتحقق من توقيع webhooks وتقييد بيانات الاعتماد وضوابط قاعدة البيانات.",
      },
      {
        title: "تحكّم بالوصول حسب الدور",
        text: "صلاحيات دقيقة للأطباء ومكتب الاستقبال والمدراء.",
      },
      {
        title: "مسارات تدقيق كاملة",
        text: "كل إجراء ذكاء اصطناعي مسجَّل وقابل للمراجعة والتراجع.",
      },
    ],
    stripBold: "لا يتّخذ Reva AI قرارات تشخيصية أبدًا.",
    stripRest:
      " يتولّى الشؤون اللوجستية — الحجوزات والتذكيرات والاستعادة — ويترك الحكم السريري دائمًا لأطبائك.",
  },

  pricing: {
    eyebrow: "الأسعار",
    h2: "أسعار بسيطة وشفافة",
    sub: "ادفع تكلفة Reva من الإيرادات المستعادة من مريض واحد فائت أسبوعيًا فقط.",
    recommended: "موصى به",
    billingMonthly: "شهري",
    billingAnnual: "سنوي",
    annualSave: "شهران مجانًا",
    billedNote: "فوترة سنوية · 14,988 AED",
    monthlyNote: "فوترة شهرية · يمكنك الإلغاء في أي وقت",
    proTitle: "Clinic Pro",
    proSub: "الأنسب للعيادات المتخصصة مثل Aloka",
    aed: "AED",
    perMonth: "/شهريًا",
    proFeatures: [
      "وكيل ذكاء اصطناعي عبر WhatsApp على مدار الساعة",
      "أتمتة استعادة المكالمات الفائتة",
      "مسارات منع عدم الحضور",
      "ملخّصات وتقارير المرضى",
      "حتى 3 حسابات مستخدمين",
    ],
    proCta: "ابدأ تجربة 14 يومًا مجانًا",
    proNote: "لا حاجة لبطاقة ائتمان · يمكنك الإلغاء في أي وقت",
    hospitalTitle: "Hospital Group",
    hospitalSub: "لسلاسل العيادات متعددة الفروع",
    custom: "مخصّص",
    customSub: "تشمل خصومات الكميات · مدير نجاح مخصّص",
    hospitalFeatures: [
      "كل ما في باقة Clinic Pro",
      "لوحة تحكم متعددة الفروع",
      "تكاملات مسارات عمل مخصّصة",
      "مدير حساب مخصّص",
      "وصول إلى API",
    ],
    hospitalCta: "احجز استشارة",
    hospitalNote: "الردّ خلال يوم عمل واحد",
    footnote:
      "يتم تأكيد نطاق التجربة ورسوم Meta والتكاملات والاستضافة ومتطلبات الخصوصية قبل التشغيل.",
    guaranteeBold: "تجربة بأهداف قابلة للقياس.",
    guaranteeRest:
      " نتفق مع العيادة على خط أساس ونقيس التجربة ونستمر فقط عندما يقدم المسار قيمة تشغيلية واضحة.",
    compareToggle: "قارن جميع المزايا",
    compareToggleHide: "إخفاء المقارنة",
    compareAria: "تبديل مقارنة المزايا الكاملة",
    compareColPlan: "الميزة",
    compareColPro: "Clinic Pro",
    compareColHospital: "Hospital Group",
    compareFootnote: "تحتاج إلى شيء محدّد؟ تحدّث إلى فريقنا في الإمارات — معظم القواعد قابلة للضبط لكل عيادة.",
    compareGroups: [
      {
        name: "التغطية",
        rows: [
          { label: "وكيل ذكاء اصطناعي على WhatsApp 24/7", pro: "yes", hospital: "yes" },
          { label: "تغطية بعد ساعات العمل وعطلة نهاية الأسبوع", pro: "yes", hospital: "yes" },
          { label: "محادثات مرضى ثنائية اللغة EN/AR", pro: "yes", hospital: "yes" },
        ],
      },
      {
        name: "أتمتة الذكاء الاصطناعي",
        rows: [
          { label: "استعادة المكالمات الفائتة (متوسط استجابة <28 ثانية)", pro: "yes", hospital: "yes" },
          { label: "منع عدم الحضور والتذكيرات الذكية", pro: "yes", hospital: "yes" },
          { label: "ملخصات مرضى ذكية للأطباء", pro: "yes", hospital: "yes" },
          { label: "بناء مسارات عمل ذكية مخصّصة", pro: "no", hospital: "yes" },
        ],
      },
      {
        name: "التكاملات",
        rows: [
          { label: "WhatsApp Business API (موثّق، شارة خضراء)", pro: "yes", hospital: "yes" },
          { label: "تكامل PMS / HIS / EMR", pro: "no", hospital: "yes" },
          { label: "وصول API و Webhooks", pro: "no", hospital: "yes" },
        ],
      },
      {
        name: "الحسابات والمواقع",
        rows: [
          { label: "حسابات المستخدمين", pro: "Up to 3", hospital: "Unlimited" },
          { label: "لوحة مواقع متعددة", pro: "no", hospital: "yes" },
        ],
      },
      {
        name: "الامتثال والدعم",
        rows: [
          { label: "قائمة تحقق للخصوصية والامتثال", pro: "yes", hospital: "yes" },
          { label: "صلاحيات حسب الدور ومسارات تدقيق", pro: "yes", hospital: "yes" },
          { label: "تهيئة موجّهة للتجربة", pro: "yes", hospital: "yes" },
          { label: "مدير حساب مخصّص", pro: "no", hospital: "yes" },
          { label: "دعم أولوية SLA", pro: "Standard", hospital: "Priority" },
        ],
      },
    ] as { name: string; rows: { label: string; pro: string; hospital: string }[] }[],
    altTitle: "تفكّر في البدائل؟",
    altSub: "التكلفة الحقيقية لتغطية مكتب الاستقبال في الإمارات اليوم.",
    alts: [
      {
        name: "موظف استقبال إضافي",
        cost: "AED 8,000+",
        costSub: "شهريًا",
        points: [
          "راتب واحد ووردية واحدة — الليالي وعطلة الأسبوع تبقى مكشوفة",
          "توظيف وتأشيرات وإجازات مرضية وسنوية",
          "وما زال لا يستطيع الردّ على مكالمتين في آنٍ واحد",
        ],
      },
      {
        name: "مركز اتصال خارجي",
        cost: "AED 3–5K",
        costSub: "شهريًا",
        points: [
          "موظفون بنصوص جاهزة، غير مدرّبين على عيادتك",
          "ساعات ما بعد الدوام غالبًا بتكلفة إضافية أو بلا ردّ",
          "بلا WhatsApp — على المرضى الاتصال مرة أخرى",
        ],
      },
      {
        name: "عدم فعل أي شيء",
        cost: "AED 52,920",
        costSub: "تُفقد شهريًا",
        points: [
          "120 مكالمة فائتة تواصل التوجّه إلى العيادة المجاورة",
          "40% من المواعيد غير المؤكدة لا يحضر أصحابها",
          "صباحات الاثنين تبدأ بجدار من البريد الصوتي",
        ],
      },
    ] as { name: string; cost: string; costSub: string; points: string[] }[],
    altVerdictPrefix: "Reva AI:",
    altVerdictRest: " على مدار الساعة، ثنائي اللغة، AED 1,499 شهريًا — ولا يطلب إجازة مرضية أبدًا.",
    starterBadge: "وصول مبكر",
    starterTitle: "هل تدير عيادة أصغر؟",
    starterBody:
      "باقة Starter — الأخف لممارسي الأعمال الفردية والعيادات ذات الطبيب الواحد — متاحة الآن ضمن الوصول المبكر. أخبرنا عن عيادتك وسنرسل لك الأسعار وتفاصيل الإطلاق.",
    starterCta: "اسأل عن Starter",
  },

  social: {
    eyebrow: "مسار تجربة للعيادة",
    h2: "تجربة عملية بمساندة موظف الاستقبال",
    sub: "ابدأ بعيادة واحدة ورقم WhatsApp رسمي ومسارات معتمدة ونتائج قابلة للقياس لفريق الاستقبال.",
    verified: "مسار توضيحي للتجربة",
    badgeLabel: "بيانات عرض · ليست ادعاء عميل",
    partnerTitle: "عيادة إماراتية افتراضية",
    partnerLocation: "مسار توضيحي لعيادة خاصة",
    partnerQuote:
      "هدف التجربة بسيط: تقليل أعمال WhatsApp المتكررة، وإظهار حالة المواعيد، وتحويل واضح لموظف الاستقبال عندما يجب أن تتوقف الأتمتة.",
    partnerLeadName: "عرض مسار الاستقبال",
    partnerLeadRole: "سيناريو توضيحي — تقاس النتائج أثناء تجربة مدفوعة",
    partnerLeadInitials: "RW",
    pilotCohortTitle: "برنامج الوصول المبكر لعيادات ومراكز الإمارات",
    pilotCohortBody:
      "نوصي بتجربة محدودة من 30 إلى 60 يوماً مع مقاييس أساسية وقوالب WhatsApp معتمدة وتدريب للاستقبال ومراجعة جاهزية للإنتاج.",
    pilotCta: "احجز جولة تعريفية مدتها 20 دقيقة",
    metricsTitle: "الأثر التشغيلي المستهدف · تقديرات مرحلة الإطلاق",
    metrics: [
      { value: 30, suffix: "–60", label: "أيام التجربة الموصى بها" },
      { value: 1, suffix: "", label: "مسار لفريق الاستقبال" },
      { value: 2, suffix: "", label: "لغتان في العرض" },
      { value: 4, suffix: "", label: "مقاييس أساسية للتجربة" },
    ],
    metricsNote:
      "تتفق العيادة على أهداف التجربة؛ لا يدعي هذا العرض نتائج عملاء مقاسة.",
  },

  faq: {
    eyebrow: "الأسئلة الشائعة",
    h2: "إجابات لفريق مكتب الاستقبال لديك",
    sub: "الأسئلة التي يطرحها علينا مديرو العيادات في دبي أكثر من غيرها — بإجابات صريحة. هل بقي شيء؟ يردّ فريقنا خلال يوم عمل واحد.",
    cardH: "لا تزال لديك أسئلة؟",
    cardP:
      "احجز جولة تعريفية مدتها 20 دقيقة مع فريقنا في الإمارات — سنطابق Reva مع مسار عمل عيادتك بدقة.",
    cardCta: "تحدّث إلى فريقنا",
    cardCta2: "احصل على الملخص الاقتصادي",
    searchPlaceholder: "ابحث في الأسئلة…",
    searchAria: "البحث في الأسئلة الشائعة",
    searchKbd: "اضغط / للبحث",
    searchKbdAria: "اختصار لوحة المفاتيح: اضغط الشرطة المائلة للانتقال إلى البحث",
    resultsLabel: (n: number) => `${n} ${n === 1 ? "سؤال" : n === 2 ? "سؤالان" : "أسئلة"}`,
    catAll: "الكل",
    catCompliance: "الامتثال",
    catSetup: "الإعداد والتكامل",
    catBehavior: "سلوك الذكاء",
    noResultsH: "لا توجد أسئلة مطابقة لبحثك.",
    noResultsP: "جرّب كلمة أخرى، أو تحدّث إلى فريقنا في الإمارات — نردّ خلال يوم عمل واحد.",
    noResultsReset: "مسح عوامل التصفية",
    popularH: "الأسئلة الأكثر رواجًا",
    popularOpen: "افتح السؤال",
    copyLink: "انسخ رابط هذا الجواب",
    copiedToast: "تم نسخ الرابط",
    copiedDesc: "من يفتح الرابط يصل مباشرةً إلى هذا الجواب.",
    copyFailToast: "تعذّر نسخ الرابط",
    faqs: [
      {
        q: "هل يتوافق Reva مع أنظمة الرعاية الصحية في الإمارات؟",
        a: "يتضمن Reva صلاحيات حسب الدور ومسارات تدقيق وسجلات موافقة وضوابط أمان. على كل عيادة إتمام مراجعتها القانونية ومراجعة الخصوصية والاستضافة والجهة المنظمة قبل الإنتاج.",
        cat: "compliance",
      },
      {
        q: "كيف يتصل Reva بـ WhatsApp الخاص بعيادتنا؟",
        a: "يتصل Reva عبر منصة WhatsApp Business الرسمية بعد إتمام العيادة إعداد Meta والرقم. يتم تأكيد الملكية وأي نقل للرقم أثناء التهيئة.",
        cat: "setup",
      },
      {
        q: "ماذا يحدث حين لا يستطيع الذكاء الاصطناعي الإجابة عن مريض؟",
        a: "يدرك Reva حدوده. في الأسئلة السريرية أو نزاعات الفواتير أو أي أمر غير واثق منه، يحوّله فورًا إلى مكتب الاستقبال لديك — مع المحادثة الكاملة مرفقة — ويبقى الموعد دون تغيير حتى يقرّر الإنسان. ويمكن للمرضى أيضًا طلب التحويل إلى موظف في أي وقت بلمسة واحدة.",
        cat: "behavior",
      },
      {
        q: "هل يحلّ Reva محل نظام إدارة الممارسة لدينا؟",
        a: "لا — يعمل Reva فوقه. تتولّى طبقة عمليات المرضى الذكية المحادثات والأعمال الروتينية حول تقويمك ومسارات عملك الحالية. وفي باقة Hospital Group، نتكامل مباشرةً مع نظام PMS أو HIS لديك عبر تكاملات مخصّصة ووصول API.",
        cat: "setup",
      },
      {
        q: "كم يستغرق الإعداد فعلًا؟",
        a: "تعتمد المدة على موافقة Meta وبيانات العيادة والقوالب المعتمدة وأي تكامل للتقويم. نبدأ بتجربة محدودة بعد الاختبار وموافقة العيادة.",
        cat: "setup",
      },
      {
        q: "هل يمكن للمرضى الوصول إلى موظف في مكتب الاستقبال؟",
        a: "دائمًا. تتضمن كل محادثة ذكاء اصطناعي زر تحويل واضحًا بلمسة واحدة إلى فريقك، ولا يؤتمت Reva إلا ما تضبطه صراحةً. وخلال ساعات العمل، تصل المحادثات المحوَّلة إلى موظفيك خلال ثوانٍ، مع السياق الكامل مرفقًا.",
        cat: "behavior",
      },
    ],
  },

  footer: {
    tagline:
      "طبقة عمليات المرضى الذكية لعيادات الإمارات. مكالمات مستعادة، عدم حضور أقل، ومكاتب استقبال أهدأ.",
    badge1: "ضوابط خصوصية ومسارات تدقيق",
    badge2: "مبنيّ على WhatsApp Business API",
    product: "المنتج",
    company: "الشركة",
    productLinks: ["المزايا", "كيف يعمل", "جرّب وكيل الذكاء الاصطناعي", "جاهزية الأمان", "الأسئلة الشائعة"],
    companyLinks: [
      "الأمن والامتثال",
      "سياسة الخصوصية",
      "جاهزية الإنتاج",
      "تحدّث إلى فريقنا",
    ],
    ctaH: "هل أنت مستعد لمكتب استقبال أهدأ؟",
    ctaP: "اكتشف حجم الإيرادات التي يمكن لـ Reva AI استعادتها لعيادتك — في أقل من دقيقتين.",
    ctaBtn: "جرّب العرض",
    copyright: "© 2026 Reva AI. جميع الحقوق محفوظة.",
    made: "صُنع لمقدمي الرعاية الصحية في دولة الإمارات العربية المتحدة",
    productAria: "تذييل — المنتج",
    companyAria: "تذييل — الشركة",
    status: "جميع الأنظمة تعمل",
  },

  roi: {
    title: "احسب العائد على الاستثمار",
    desc: "اكتشف حجم الإيرادات التي تخسرها بسبب المكالمات الفائتة وحالات عدم الحضور — وما يستعيده Reva لك.",
    s1Label: "المكالمات الفائتة شهريًا",
    s1Format: (v: string) => `${v} مكالمة`,
    s1Hint: "احسب كل مكالمة ترنّ دون ردّ أو تصل إلى البريد الصوتي خلال ساعات العمل.",
    s2Label: "متوسط قيمة الموعد",
    s2Format: (v: string) => `AED ${v}`,
    s2Hint: "للمرجعية: متوسط استشارة LASIK في Aloka يتراوح بين AED 450–600.",
    s3Label: "نسبة الاستعادة",
    s3Format: (v: number) => `${v}%`,
    s3Hint: "اختر افتراضاً متحفظاً للاختبار ثم استبدله بأداء التجربة المقاس.",
    resultLabel: "الإيرادات المستعادة",
    perMonth: "/ شهريًا",
    visitsLabel: "زيارات مستعادة",
    perMo: "/شهريًا",
    annualLabel: "سنويًا",
    paysForItself: (n: string) =>
      `يعوّض Reva تكلفته ${n}× — كل شهر دون استثناء`,
    breakeven: (n: number) =>
      `نقطة التعادل عند ${n} مريضًا مستعادًا فقط شهريًا`,
    note: "تقدير مبنيّ على مدخلاتك. باقة Clinic Pro بسعر 1,499 AED شهريًا — احجز تجربة مجانية لتدقيق دقيق لإيرادات عيادتك.",
    onePagerCta: "احصل على الملخص الاقتصادي للعيادة",
  },

  leadDialog: {
    proLabel: "Clinic Pro",
    proPrice: "1,499 AED / شهريًا",
    proSub: "الأنسب للعيادات المتخصصة",
    hospitalLabel: "Hospital Group",
    hospitalPrice: "مخصّص",
    hospitalSub: "لسلاسل متعددة الفروع",
    titlePro: "ابدأ تجربتك المجانية لمدة 14 يومًا",
    titleConsult: "احجز استشارة",
    submitPro: "ابدأ تجربة 14 يومًا مجانًا",
    submitConsult: "احجز استشارة",
    desc: "أخبرنا كيف نصل إليك — نفعّل Reva لعيادتك في أقل من 48 ساعة. لا حاجة لبطاقة ائتمان.",
    fName: "الاسم الكامل",
    namePh: "د. أمينة حداد",
    fEmail: "البريد الإلكتروني للعمل",
    emailPh: "you@clinic.ae",
    fClinic: "اسم العيادة",
    clinicPh: "اسم عيادتك",
    fPhone: "الهاتف",
    optional: "(اختياري)",
    phonePh: "+971 50 000 0000",
    submitting: "جارٍ الإرسال…",
    reassurance: "طلب تجربة فقط · تؤكد شروط الإنتاج قبل التشغيل",
    successTitle: "تمت إضافتك إلى القائمة",
    trialWord: "تجربة مجانية لمدة 14 يومًا",
    consultWord: "استشارة",
    clinicFallback: "عيادتك",
    successMsg: (plan: string, kind: "trial" | "consult", clinic: string): Seg[] => [
      { t: "سيتواصل معك فريقنا خلال يوم عمل واحد لتفعيل " },
      { t: kind === "trial" ? "تجربة 14 يومًا مجانًا" : "استشارة" },
      { t: " في باقة " },
      { t: plan, b: true },
      { t: " لـ" },
      { t: clinic, b: true },
      { t: "." },
    ],
    successBadge: "تم استلام طلب تهيئة التجربة",
    done: "تم",
    toastPro: "تم استلام طلب التجربة",
    toastConsult: "تم استلام طلب الاستشارة",
    toastDesc: (clinic: string) =>
      `تمت إضافة ${clinic} إلى القائمة — سيتواصل معك فريقنا خلال يوم عمل واحد.`,
    toastClinicFallback: "عيادتك",
    toastErrTitle: "حدث خطأ ما",
    toastErrDesc: "يرجى المحاولة مرة أخرى، أو مراسلتنا عبر hello@reva-ai.ae.",
    titleOnePager: "احصل على الملخص الاقتصادي للعيادة",
    descOnePager:
      "حساب الاسترداد، وأرقام Aloka، وأسعارنا — كل ذلك في صفحة واحدة أنيقة. سنرسله إلى بريدك فورًا.",
    submitOnePager: "أرسل لي الملخص",
    onePagerPlan: "One-Pager",
    successMsgOnePager: (clinic: string): Seg[] => [
      { t: "بدأ التنزيل — أرسلنا أيضًا نسخة إلى بريد " },
      { t: clinic, b: true },
      { t: ". وسيتابع فريقنا معك رابط عرض توضيحي مباشر خلال يوم عمل واحد." },
    ],
    toastOnePager: "تم إرسال الملخص",
    toastOnePagerDesc: (clinic: string) =>
      `الملخص الاقتصادي للعيادة في طريقه إلى ${clinic}.`,
    titleStarter: "اسأل عن باقة Starter",
    descStarter:
      "أخبرنا عن عيادتك — سنرسل لك أسعار باقة Starter وتوافرها وما يناسب العيادات ذات الطبيب الواحد.",
    submitStarter: "اطلب تفاصيل Starter",
    successMsgStarter: (clinic: string): Seg[] => [
      { t: "سنرسل خلال يوم عمل واحد أسعار باقة Starter وتفاصيل الوصول المبكر لـ " },
      { t: clinic, b: true },
      { t: " — مع حجز مكانك في قائمة الإطلاق." },
    ],
    toastStarter: "تم استلام طلب Starter",
    toastStarterDesc: (clinic: string) =>
      `تمت إضافة ${clinic} إلى قائمة الوصول المبكر لـ Starter — سنردّ خلال يوم عمل واحد.`,
    dlAlsoTitle: "تحتاج اللغة الأخرى أيضًا؟",
    dlAlsoSub: "الملخص متوفر باللغتين الإنجليزية والعربية:",
    dlEn: "نسخة إنجليزية PDF",
    dlAr: "نسخة عربية PDF",
    dlAria: (lang: string) => `تنزيل الملخص بصيغة PDF ${lang}`,
  },

  mobileCta: {
    line: "Reva AI لـ",
    clinic: "عيادة تجريبية",
    cta: "ابدأ التجربة المجانية",
  },

  chat: {
    eyebrow: "جرّبه بنفسك",
    h2: "تحدّث مع Reva AI الآن",
    sub: "يعرض هذا المثال التوضيحي الحجز وإعادة الجدولة ومعلومات العيادة والتحويل الآمن. يجب ضبط كل معلومات العيادة واعتمادها قبل الاستخدام.",
    liveChip: "عرض حيّ",
    repliesIn: "وكيل ذكاء اصطناعي · يردّ عادة خلال ثوانٍ",
    resetAria: "إعادة المحادثة",
    demoNote: "عرض توضيحي — بلا بيانات عيادة أو مرضى حقيقية",
    inputPh: "اكتب رسالة…",
    sendAria: "إرسال الرسالة",
    typingAria: "Reva AI يكتب الآن",
    greeting:
      "مرحبًا! أنا Reva للعيادة التجريبية. أستطيع المساعدة في المواعيد والمعلومات المعتمدة أو تحويلك إلى الاستقبال. كيف أساعدك؟",
    quickAria: "رسائل مقترحة",
    quick: [
      "أريد حجز استشارة LASIK",
      "كم هي أسعاركم؟",
      "أحتاج إلى تغيير موعدي",
      "هل تقبلون التأمين؟",
    ],
    canLabel: "يتولّى Reva على مدار الساعة:",
    can: [
      "الحجوزات وإعادة الجدولة",
      "أسئلة الأسعار والتأمين",
      "أوقات الدوام والموقع",
      "استفسارات ما بعد الدوام",
    ],
    responses: {
      book: "بالتأكيد. لدينا موعد متاح هذا الخميس الساعة 4:00 مساءً مع الدكتورة شارما لاستشارة LASIK، أو السبت الساعة 11:00 صباحًا إن كنت تفضّل نهاية الأسبوع. أيهما يناسبك؟",
      price:
        "تعتمد الأسعار على العيادة والخدمة. يمكنني مشاركة قائمة الأسعار المعتمدة أو تحويلك إلى الاستقبال للتأكيد.",
      reschedule:
        "لا مشكلة على الإطلاق. أستطيع نقل موعدك إلى الخميس الساعة 4:00 مساءً أو السبت الساعة 11:00 صباحًا — اختر الموعد المناسب وسأحدّث حجزك فورًا.",
      insurance:
        "تعتمد التغطية التأمينية على العيادة وخطتك. يمكنني مشاركة المعلومات التي تعتمدها العيادة أو تحويل المحادثة إلى الاستقبال للتحقق. تجنب إرسال مستندات حساسة حتى تؤكد العيادة الإجراء المعتمد.",
      hours:
        "يمكنني مشاركة ساعات العمل التي تعتمدها العيادة بعد ضبطها. خارج ساعات الاستقبال، أجمع طلبك للمتابعة.",
      doctor:
        "يمكنني عرض قائمة الممارسين والمواعيد التي تعتمدها العيادة. هل تفضل ممارساً محدداً أم أول موعد متاح؟",
      location:
        "يمكنني مشاركة دبوس الموقع والاتجاهات المعتمدة بعد ضبطها. لا يستخدم هذا العرض عنوان عيادة حقيقية.",
      human:
        "بكل تأكيد. سأوصلك الآن بفريق الاستقبال — ستكون محادثتنا كاملة أمامهم، فلن تحتاج إلى تكرار أي شيء. خلال أوقات الدوام يردّ الفريق عادة خلال دقيقة واحدة.",
      fallback:
        "سؤال وجيه — دعني أتأكد من حصولك على الإجابة الصحيحة. أستطيع مساعدتك الآن في الحجوزات والأسعار والتأمين ومعلومات العيادة، أو أن أوصلك بفريق الاستقبال. ماذا تفضّل؟",
    },
    slotsTitle: "اختر موعدًا:",
    slots: ["الخميس · 4:00 مساءً", "السبت · 11:00 صباحًا"],
    confirmTitle: "تم تأكيد الحجز",
    confirmSub: "استشارة LASIK",
    confirmWith: "مع الدكتورة شارما",
    confirmMsg:
      "تم حجز موعدك! أرسلت التأكيد والموقع وتذكيرًا قبل 24 ساعة إلى WhatsApp الخاص بك. هل من شيء آخر أستطيع مساعدتك فيه؟",
    reset: "ابدأ من جديد",
    dubaiNow: "الآن في دبي",
    onDuty: "Reva في الخدمة",
  },

  compare: {
    eyebrow: "التحوّل",
    h2: "مكتب الاستقبال قبل Reva وبعده",
    sub: "نفس الفريق، ونفس العيادة، ونفس المرضى — طبقة هادئة من الذكاء الاصطناعي بينها. هذا ما يتغيّر فعلًا.",
    beforeLabel: "قبل Reva",
    beforeTitle: "مكتب الاستقبال التقليدي",
    before: [
      "المكالمات الفائتة تذهب إلى البريد الصوتي — ومعظم المرضى لا يعاودون الاتصال",
      "فريق الاستقبال غارق طوال اليوم في الردود المتكررة على WhatsApp",
      "حالات عدم الحضور تُكتشف فقط عندما يبقى الكرسي فارغًا",
      "الأطباء يدخلون الاستشارات دون أي سياق عن المريض",
      "رسائل الجمعة ونهاية الأسبوع تتراكم دون رد حتى صباح الاثنين",
    ],
    afterLabel: "مع Reva AI",
    afterTitle: "مكتب استقبال بذكاء Reva",
    after: [
      { stat: "98% ", text: "من المكالمات الفائتة تُستعاد — معظمها خلال 5 دقائق" },
      { stat: "24/7 ", text: "تغطية WhatsApp — كل رسالة يقابلها ردّ خلال ثوانٍ" },
      { stat: "40% ", text: "انخفاض في حالات عدم الحضور بفضل التذكيرات الذكية وإعادة الجدولة السهلة" },
      { stat: "", text: "ملخصات الذكاء الاصطناعي تمنح الأطباء سياق المريض قبل الطرق على الباب" },
      { stat: "", text: "نهاية الأسبوع مغطاة — يبدأ الاثنين هادئًا ومحجوزًا وجاهزًا" },
    ],
    stripBold: "نفس الفريق. نفس العيادة. يوم مختلف.",
    stripRest:
      " Reva لا يحلّ محلّ فريق الاستقبال — بل يزيل الضجيج ليتفرّغوا للمرضى الذين أمامهم.",
    cta: "شاهد العرض الحيّ",
  },

  day: {
    eyebrow: "تغطية على مدار الساعة، بشكل ملموس",
    h2: "يوم مع Reva في Aloka Eye Clinic",
    sub: "سواء خلال أوقات الدوام أو خارجه، يعمل Reva على قناة WhatsApp في كل ساعة من كل يوم. هذا شكل يومٍ عادي — ساعة بساعة.",
    chipDuring: "أثناء الدوام",
    chipAfter: "خارج الدوام",
    events: [
      {
        time: "7:30 صباحًا",
        title: "استفسارات الليل، تم التعامل معها",
        text: "قبل وصول أول موظف، يكون Reva قد أجاب عن أربع رسائل WhatsApp من الليلة الماضية وجهّز جدول اليوم — التأكيدات مكتملة والملخصات جاهزة.",
        during: false,
      },
      {
        time: "11:00 صباحًا",
        title: "مكالمة فائتة تُستعاد خلال 28 ثانية",
        text: "خطا الهاتف مشغولان. استفسار عن LASIK بلا ردّ — يراسله Reva فورًا ويحجز استشارة الخميس الساعة 4:00 مساءً.",
        during: true,
      },
      {
        time: "2:15 مساءً",
        title: "خطر عدم الحضور، تم تفاديه",
        text: "متابعة ساد لم تؤكد بعد. يرسل Reva تذكيرًا لطيفًا بتأكيد بنقرة واحدة — يُثبّت موعد الثالثة مجددًا قبل الثانية والنصف.",
        during: true,
      },
      {
        time: "6:40 مساءً",
        title: "بعد إغلاق الأبواب",
        text: "مريضة تسأل عن أهليتها لـ LASIK قبيل الإغلاق بدقائق. يشرح لها Reva الأسعار والتأمين، ويحجز استشارة السبت.",
        during: true,
      },
      {
        time: "11:30 مساءً",
        title: "سؤال في منتصف الليل، بُودّل بعناية",
        text: "مريض بعد الجراحة يبلّغ عن حساسية للضوء. يتعرّف Reva على العلامة، يطمئنه بالإرشادات المعتمدة، ويرفع ملاحظة عاجلة لمراجعة الدكتورة شارما الساعة 9:00 صباحًا.",
        during: false,
      },
      {
        time: "3:00 فجرًا · الجمعة",
        title: "نهاية الأسبوع، مغطاة بالكامل",
        text: "العيادة مغلقة، لكن يمكن لرسالة معتمدة استلام الاستفسار ووضعه في قائمة الاستقبال للمتابعة.",
        during: false,
      },
    ],
    stripBold: "مكتب استقبال لا ينام أبدًا.",
    stripRest:
      " كل استفسار يُجاب، وكل موعد يُملأ، وكل تذكير يُرسل — بينما يتفرّغ فريقك للمرضى الذين أمامهم.",
    cta: "جرّبه بنفسك",
  },

  dots: {
    aria: "التنقل بين الأقسام",
    home: "الرئيسية",
    features: "المزايا",
    journey: "رحلة المريض",
    how: "كيف يعمل",
    portal: "البوابة الحيّة",
    chat: "وكيل الذكاء",
    compare: "قبل وبعد",
    day: "يوم مع Reva",
    security: "الأمان",
    pricing: "الأسعار",
    faq: "الأسئلة الشائعة",
  },

  backToTop: "العودة إلى الأعلى",
  skip: "تخطَّ إلى المحتوى الرئيسي",
};

export const dict: Record<Lang, Dict> = { en, ar };
