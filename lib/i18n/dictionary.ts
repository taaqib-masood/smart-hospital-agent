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
    pricing: "Pricing",
    login: "Log in",
    trial: "Start Free Trial",
    trialMobile: "Start 14-Day Free Trial",
    navAria: "Main navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    langAria: "Language",
    tryAgent: "Try the AI Agent",
  },

  hero: {
    eyebrow: "AI Patient Operations Layer for UAE Clinics",
    h1a: "Never Miss a Patient.",
    h1b: "Automate Your Clinic\u2019s Front Desk.",
    p: [
      { t: "Reva AI integrates with WhatsApp to recover missed calls, reduce no-shows, and manage patient journeys for procedures like " },
      { t: "Cataract", b: true },
      { t: ", " },
      { t: "LASIK", b: true },
      { t: ", and " },
      { t: "Dry Eye", b: true },
      { t: " care." },
    ] as Seg[],
    ctaPrimary: "Start 14-Day Free Trial",
    ctaSecondary: "Explore Live Portal",
    trust1: "DHA & HIPAA Compliant",
    trust2: "WhatsApp Business API",
    statsAria: "Reva AI quick metrics",
    stats: [
      { value: 28, prefix: "<", suffix: "s", label: "Avg. response time" },
      { value: 98, prefix: "", suffix: "%", label: "Missed-call recovery" },
      { value: 24, prefix: "", suffix: "/7", label: "Patient coverage" },
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
      "Hello! Welcome to Aloka Eye Clinic. I have an opening this Thursday at 4:00 PM with Dr. Sharma. Shall I confirm?",
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
    sub: "Stop losing revenue to missed calls and no-shows. Reva handles the busywork so your team can focus on patient care.",
    items: [
      {
        title: "Missed-Call Recovery",
        text: "When staff can\u2019t answer, Reva instantly texts the patient on WhatsApp, recovers the intent, and books the appointment automatically.",
      },
      {
        title: "Smart No-Show Prevention",
        text: "Automated 24-hour and 1-hour reminders. Patients confirm, reschedule, or cancel with one tap.",
      },
      {
        title: "AI Patient Briefs",
        text: "Before the doctor walks in, Reva summarizes patient history, symptoms, and eligibility (e.g., LASIK consultation notes) right on the dashboard.",
      },
    ],
    stats: [
      { value: 40, suffix: "%", label: "Reduction in No-Shows" },
      { value: 3, suffix: "+", label: "Hours Saved Daily Per Clinic" },
      { value: 98, suffix: "%", label: "Missed-Call Recovery Rate" },
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
    h2: "Operational in 48 Hours. No IT Headaches.",
    sub: "We handle the setup. Your clinic handles the patients.",
    stepLabel: (n: number) => `STEP ${n}`,
    steps: [
      {
        title: "Connect WhatsApp Business",
        text: "We provision your official API access.",
      },
      {
        title: "Map Your Workflows",
        text: "We configure your doctors, procedures, and automation rules.",
      },
      {
        title: "Recover Lost Revenue",
        text: "Go live and start capturing missed patient opportunities.",
      },
    ],
    ctaH: "Do the Math on Your Clinic",
    ctaP: "Find out how much revenue you are losing to missed calls and no-shows.",
    ctaBtn: "Calculate Your ROI",
    ctaNote: "Interactive \u00b7 Takes 30 seconds \u00b7 No sign-up required",
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
    clinicName: "Aloka Eye Clinic",
    clinicSub: "Jumeirah \u00b7 Dubai",
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
    eyebrow: "Security & Compliance",
    h2: "Patient Data, Protected by Design",
    sub: "Built for UAE healthcare regulation from day one \u2014 so your team can automate with total confidence.",
    items: [
      {
        title: "DHA-Ready Compliance",
        text: "Aligned with Dubai Health Authority requirements for digital health records.",
      },
      {
        title: "HIPAA-Aligned Safeguards",
        text: "Administrative, physical, and technical safeguards modelled on HIPAA.",
      },
      {
        title: "UAE Data Residency",
        text: "Patient data stored in-region, never leaving the UAE.",
      },
      {
        title: "End-to-End Encryption",
        text: "Every WhatsApp message encrypted in transit and at rest.",
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
      "All plans include WhatsApp Business API provisioning, guided onboarding, and DHA & HIPAA compliant data handling.",
    guaranteeBold: "30-Day Results Guarantee.",
    guaranteeRest:
      " If Reva hasn’t recovered at least its subscription in recovered revenue during your first 30 days, your next month is on us.",
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
          { label: "WhatsApp Business API (verified, green-badge)", pro: "yes", hospital: "yes" },
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
          { label: "DHA & HIPAA compliance", pro: "yes", hospital: "yes" },
          { label: "UAE data residency + audit trails", pro: "yes", hospital: "yes" },
          { label: "48-hour guided onboarding", pro: "yes", hospital: "yes" },
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
    eyebrow: "Launch Partner & Clinical Pilot",
    h2: "Inaugural Launch Partner · Aloka Eye Clinic, Dubai",
    sub: "Reva AI is currently integrating its clinical patient operations layer with Aloka Eye Clinic & Day Surgery Center, purpose-built for UAE healthcare workflows.",
    verified: "Clinical Pilot Integration Partner",
    badgeLabel: "Integration in Progress · Dubai Healthcare City (DHCC)",
    partnerTitle: "Aloka Eye Clinic & Day Surgery Center",
    partnerLocation: "Dubai Healthcare City (DHCC), Dubai, UAE",
    partnerQuote:
      "We are partnering with Reva AI to automate our WhatsApp reception, eliminate lost inquiries from peak surgical hours, and deliver instant 24/7 bilingual booking for our ophthalmology and LASIK patients. Pre-consultation AI briefs allow our doctors to enter the room fully prepared.",
    partnerLeadName: "Dr. Priya Sharma",
    partnerLeadRole: "Medical Director & Lead Refractive Surgeon · Aloka Eye Clinic, Dubai",
    partnerLeadInitials: "PS",
    pilotCohortTitle: "UAE Healthcare Early Access Program",
    pilotCohortBody:
      "We are onboarding a limited cohort of 5 specialist clinics in Dubai and Abu Dhabi for our launch phase. Early pilot partners receive dedicated workflow engineering and white-glove DHA compliance setup.",
    pilotCta: "Book a 20-Minute Walkthrough",
    metricsTitle: "Target Operational Impact · Pilot Projections",
    metrics: [
      { value: 98, suffix: "%", label: "Projected missed-call recovery rate" },
      { value: 40, suffix: "%", label: "Projected no-show reduction" },
      { value: 30, prefix: "< ", suffix: "s", label: "Projected WhatsApp response time" },
      { value: 100, suffix: "%", label: "DHA & UAE data residency compliant" },
    ] as Array<{
      value: number;
      prefix?: string;
      suffix?: string;
      decimals?: number;
      label: string;
    }>,
    metricsNote:
      "Engineered in collaboration with Aloka Eye Clinic · Clinical deployment phase 2026.",
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
        a: "Yes. Reva is built to be DHA & HIPAA compliant end to end \u2014 patient data is encrypted in transit and at rest, hosted with UAE data residency, and access is role-based with full audit trails. We sign a clinic-specific data processing agreement before go-live.",
        cat: "compliance",
      },
      {
        q: "How does Reva connect to our clinic's WhatsApp?",
        a: "We provision an official WhatsApp Business API number for Aloka (or migrate your existing one). This is the verified, green-badge channel \u2014 not an unofficial automation tool. Your clinic keeps full ownership of the number and its conversation history.",
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
        a: "48 hours. Day one: we provision your WhatsApp Business API access and verify your number. Day two: we map your doctors, procedures, and automation rules with a one-hour call \u2014 then you're live. No IT team required from your side; we handle everything.",
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
    badge1: "DHA & HIPAA Compliant",
    badge2: "Built on WhatsApp Business API",
    product: "Product",
    company: "Company",
    productLinks: [
      "Features",
      "How it Works",
      "Live Portal",
      "Try the AI Agent",
      "Before & After",
      "A Day with Reva",
      "Pricing",
      "FAQ",
    ],
    companyLinks: [
      "Security & Compliance",
      "Privacy Policy",
      "DHA Compliance",
      "Talk to Our Team",
    ],
    ctaH: "Ready to calm your front desk?",
    ctaP:
      "See how much revenue Reva AI can recover for your clinic \u2014 in under two minutes.",
    ctaBtn: "Start 14-Day Free Trial",
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
    s3Hint: "Reva recovers up to 98% of missed calls \u2014 we default to a conservative 40%.",
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
    clinicPh: "Aloka Eye Clinic",
    fPhone: "Phone",
    optional: "(optional)",
    phonePh: "+971 50 000 0000",
    submitting: "Submitting\u2026",
    reassurance: "DHA & HIPAA compliant \u00b7 Your data never leaves the UAE",
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
    successBadge: "DHA & HIPAA compliant onboarding",
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
    clinic: "Aloka Eye Clinic",
    cta: "Start Free Trial",
  },

  chat: {
    eyebrow: "Try It Yourself",
    h2: "Chat with Reva AI, Right Now",
    sub: "This is a live simulation of the exact conversations Reva handles for Aloka every day — bookings, pricing questions, reschedules, and after-hours enquiries. No staff required.",
    liveChip: "Live demo",
    repliesIn: "AI Agent \u00b7 typically replies in seconds",
    resetAria: "Reset conversation",
    demoNote: "Demo \u2014 the real Reva is connected to your clinic\u2019s calendar",
    inputPh: "Type a message\u2026",
    sendAria: "Send message",
    typingAria: "Reva AI is typing",
    greeting:
      "Hello! This is Reva, Aloka Eye Clinic\u2019s AI assistant. I can book consultations, share pricing, or answer questions about our doctors. How can I help you today?",
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
        "Happy to share: a comprehensive eye exam is AED 350, a LASIK consultation is AED 500, and a cataract evaluation is AED 600. If you\u2019re insured, we handle the pre-approval for you. Would you like to book?",
      reschedule:
        "No problem at all. I can move your appointment to Thursday at 4:00 PM or Saturday at 11:00 AM \u2014 just tap the slot that works, and I\u2019ll update your booking instantly.",
      insurance:
        "Yes \u2014 we work with all major DHA-approved insurers, including Daman, AXA, Cigna, and MetLife. Share your card photo here and I\u2019ll verify your coverage and start the pre-approval before your visit.",
      hours:
        "We\u2019re open Saturday to Thursday, 9:00 AM \u2013 8:00 PM, and closed on Fridays. I\u2019m here on WhatsApp around the clock though \u2014 leave a message any time and I\u2019ll arrange everything.",
      doctor:
        "Dr. Meera Sharma is our lead refractive surgeon \u2014 12 years of experience in cornea, cataract, and LASIK, with over 9,000 procedures performed. She consults at our Jumeirah clinic. Shall I book you with her?",
      location:
        "We\u2019re on Jumeirah Beach Road, Dubai \u2014 free valet parking at the main entrance. I\u2019ll send a pin and directions to your WhatsApp once your appointment is confirmed.",
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
      { stat: "98% ", text: "of missed calls recovered — most within 5 minutes" },
      { stat: "24/7 ", text: "WhatsApp coverage — every message answered in seconds" },
      { stat: "40% ", text: "fewer no-shows with smart reminders & easy rescheduling" },
      { stat: "", text: "AI briefs hand doctors patient context before the knock" },
      { stat: "", text: "Weekends covered — Monday starts calm, booked, and briefed" },
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
        text: "The clinic is closed until Saturday morning — the WhatsApp channel never is. Every Friday message gets an instant, DHA-conscious reply.",
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
    pricing: "الأسعار",
    login: "تسجيل الدخول",
    trial: "ابدأ التجربة المجانية",
    trialMobile: "ابدأ تجربة 14 يومًا مجانًا",
    navAria: "التنقل الرئيسي",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    langAria: "اختيار اللغة",
    tryAgent: "جرّب وكيل الذكاء الاصطناعي",
  },

  hero: {
    eyebrow: "طبقة عمليات الذكاء الاصطناعي لعيادات الإمارات",
    h1a: "لن يفوتك مريض بعد اليوم.",
    h1b: "أتمِتة كاملة لمكتب استقبال عيادتك.",
    p: [
      { t: "تتكامل Reva AI مع WhatsApp لاستعادة المكالمات الفائتة، وتقليل حالات عدم الحضور، وإدارة رحلات المرضى لإجراءات مثل " },
      { t: "الساد", b: true },
      { t: "، و" },
      { t: "LASIK", b: true },
      { t: "، ورعاية " },
      { t: "جفاف العين", b: true },
      { t: "." },
    ],
    ctaPrimary: "ابدأ تجربة 14 يومًا مجانًا",
    ctaSecondary: "استكشف البوابة الحيّة",
    trust1: "متوافق مع معايير DHA و HIPAA",
    trust2: "WhatsApp Business API",
    statsAria: "مقاييس سريعة لـ Reva AI",
    stats: [
      { value: 28, prefix: "<", suffix: "ث", label: "متوسط زمن الاستجابة" },
      { value: 98, prefix: "", suffix: "%", label: "استعادة المكالمات الفائتة" },
      { value: 24, prefix: "", suffix: "/7", label: "تغطية المرضى" },
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
      "أهلًا بك في Aloka Eye Clinic! لديّ موعد متاح يوم الخميس الساعة 4:00 م مع د. شارما. هل أؤكّده لك؟",
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
    sub: "توقّف عن خسارة الإيرادات بسبب المكالمات الفائتة وحالات عدم الحضور. يتولّى Reva الأعمال الروتينية ليتفرّغ فريقك لرعاية المرضى.",
    items: [
      {
        title: "استعادة المكالمات الفائتة",
        text: "عندما يتعذّر على موظفيك الرد، يراسل Reva المريض فورًا عبر WhatsApp، ويفهم احتياجه، ويحجز الموعد تلقائيًا.",
      },
      {
        title: "منع ذكي لحالات عدم الحضور",
        text: "تذكيرات تلقائية قبل 24 ساعة وقبل ساعة واحدة. يؤكّد المرضى موعدهم أو يعيدون جدولته أو يلغونه بلمسة واحدة.",
      },
      {
        title: "ملخّصات مرضى بالذكاء الاصطناعي",
        text: "قبل دخول الطبيب، يلخّص Reva تاريخ المريض وأعراضه وأهليته (مثل ملاحظات استشارة LASIK) مباشرةً على لوحة التحكم.",
      },
    ],
    stats: [
      { value: 40, suffix: "%", label: "انخفاض في حالات عدم الحضور" },
      { value: 3, suffix: "+", label: "ساعات موفّرة يوميًا لكل عيادة" },
      { value: 98, suffix: "%", label: "نسبة استعادة المكالمات الفائتة" },
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
    h2: "جاهز للتشغيل خلال 48 ساعة. دون أي صداع تقني.",
    sub: "نتولّى نحن الإعداد، وتتولّى عيادتك المرضى.",
    stepLabel: (n: number) => `الخطوة ${n}`,
    steps: [
      {
        title: "اربط WhatsApp Business",
        text: "نوفّر لك وصول API الرسمي.",
      },
      {
        title: "ارسم مسارات عملك",
        text: "نضبط أطباءك وإجراءاتك وقواعد الأتمتة لديك.",
      },
      {
        title: "استعد الإيرادات المفقودة",
        text: "ابدأ التشغيل والتقط فرص المرضى الفائتة.",
      },
    ],
    ctaH: "احسبها لعيادتك",
    ctaP: "اكتشف حجم الإيرادات التي تخسرها بسبب المكالمات الفائتة وحالات عدم الحضور.",
    ctaBtn: "احسب العائد على الاستثمار",
    ctaNote: "تفاعلي · يستغرق 30 ثانية · لا يتطلب تسجيلًا",
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
    clinicName: "Aloka Eye Clinic",
    clinicSub: "جميرا · دبي",
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
        title: "امتثال جاهز لمعايير DHA",
        text: "متوافق مع متطلبات هيئة الصحة بدبي للسجلات الصحية الرقمية.",
      },
      {
        title: "ضمانات على غرار HIPAA",
        text: "ضمانات إدارية ومادية وتقنية مصمّمة على غرار HIPAA.",
      },
      {
        title: "إقامة البيانات داخل الإمارات",
        text: "تُخزَّن بيانات المرضى داخل الدولة ولا تغادر الإمارات أبدًا.",
      },
      {
        title: "تشفير من الطرف إلى الطرف",
        text: "كل رسالة WhatsApp مشفّرة أثناء النقل وفي حالة السكون.",
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
      "تشمل جميع الباقات تفعيل WhatsApp Business API، وتهيئة موجّهة، ومعالجة بيانات متوافقة مع معايير DHA و HIPAA.",
    guaranteeBold: "ضمان النتائج لـ 30 يومًا.",
    guaranteeRest:
      " إذا لم يستعد Reva قيمة اشتراكه على الأقل من الإيرادات المستردة خلال أول 30 يومًا، فالشهر التالي على حسابنا.",
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
          { label: "امتثال DHA و HIPAA", pro: "yes", hospital: "yes" },
          { label: "إقامة بيانات داخل الإمارات + مسارات تدقيق", pro: "yes", hospital: "yes" },
          { label: "تهيئة موجّهة خلال 48 ساعة", pro: "yes", hospital: "yes" },
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
    eyebrow: "الشريك الطبي للإطلاق والبرنامج التجريبي",
    h2: "الشريك الطبي للإطلاق · عيادة ألوكا للعيون، دبي",
    sub: "تعمل ريفا للذكاء الاصطناعي حالياً على تنفيذ التكامل السريري الأول بالتعاون مع عيادة ألوكا للعيون ومركز جراحة اليوم الواحد في دبي.",
    verified: "شريك الإطلاق والبرنامج التجريبي الأول",
    badgeLabel: "قيد التكامل السريري · مدينة دبي للرعاية الصحية (DHCC)",
    partnerTitle: "عيادة ألوكا للعيون ومركز جراحة اليوم الواحد",
    partnerLocation: "مدينة دبي للرعاية الصحية (DHCC)، دبي، الإمارات",
    partnerQuote:
      "نتعاون مع ريفا للذكاء الاصطناعي لأتمتة مكتب الاستقبال عبر واتساب، واستعادة المكالمات الفائتة أثناء ساعات العمليات، وتوفير حجز فوري وثنائي اللغة لمرضى العيون والليزك على مدار 24/7. الملخصات الذكية المسبقة تتيح لأطبائنا التفرغ التام للرعاية السريرية.",
    partnerLeadName: "د. بريا شارما",
    partnerLeadRole: "المديرة الطبية واستشارية جراحة القرنية والليزك · عيادة ألوكا للعيون، دبي",
    partnerLeadInitials: "PS",
    pilotCohortTitle: "برنامج الوصول المبكر لعيادات ومراكز الإمارات",
    pilotCohortBody:
      "نستقبل حالياً دفعة تجريبية محدودة تضم 5 مراكز طبية تخصصية مختارة في دبي وأبوظبي. يحصل شركاء الإطلاق المبكر على تخصيص كامل لمسارات العمل وإعداد مباشر للتوافق مع معايير هيئة الصحة بدبي.",
    pilotCta: "احجز جولة تعريفية مدتها 20 دقيقة",
    metricsTitle: "الأثر التشغيلي المستهدف · تقديرات مرحلة الإطلاق",
    metrics: [
      { value: 98, suffix: "%", label: "نسبة استعادة المكالمات الفائتة المتوقعة" },
      { value: 40, suffix: "%", label: "انخفاض حالات عدم الحضور المتوقع" },
      { value: 30, prefix: "< ", suffix: "ثانية", label: "زمن الاستجابة التلقائي عبر واتساب" },
      { value: 100, suffix: "%", label: "توافق تام مع هيئة الصحة بدبي DHA واستضافة البيانات بالدولة" },
    ],
    metricsNote:
      "تم التطوير بالتعاون مع عيادة ألوكا للعيون · مرحلة الإطلاق والتشغيل التجريبي 2026.",
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
        a: "نعم. صُمِّم Reva ليكون متوافقًا مع معايير DHA و HIPAA من البداية إلى النهاية — بيانات المرضى مشفّرة أثناء النقل وفي حالة السكون، ومستضافة داخل الإمارات، والوصول قائم على الأدوار مع مسارات تدقيق كاملة. نوقّع اتفاقية معالجة بيانات خاصة بعيادتك قبل التشغيل.",
        cat: "compliance",
      },
      {
        q: "كيف يتصل Reva بـ WhatsApp الخاص بعيادتنا؟",
        a: "نوفّر رقم WhatsApp Business API رسميًا لـ Aloka (أو ننقل رقمك الحالي). هذه القناة الموثّقة ذات الشارة الخضراء — وليست أداة أتمتة غير رسمية. تحتفظ عيادتك بالملكية الكاملة للرقم وسجل محادثاته.",
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
        a: "48 ساعة. اليوم الأول: نوفّر وصول WhatsApp Business API ونتحقق من رقمك. اليوم الثاني: نرسم أطباءك وإجراءاتك وقواعد الأتمتة في مكالمة مدتها ساعة — ثم تبدأ التشغيل. لا حاجة لفريق تقنية من جانبك؛ نتولّى كل شيء.",
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
    badge1: "متوافق مع معايير DHA و HIPAA",
    badge2: "مبنيّ على WhatsApp Business API",
    product: "المنتج",
    company: "الشركة",
    productLinks: [
      "المزايا",
      "كيف يعمل",
      "البوابة الحيّة",
      "جرّب وكيل الذكاء الاصطناعي",
      "قبل وبعد",
      "يوم مع Reva",
      "الأسعار",
      "الأسئلة الشائعة",
    ],
    companyLinks: [
      "الأمن والامتثال",
      "سياسة الخصوصية",
      "امتثال DHA",
      "تحدّث إلى فريقنا",
    ],
    ctaH: "هل أنت مستعد لمكتب استقبال أهدأ؟",
    ctaP: "اكتشف حجم الإيرادات التي يمكن لـ Reva AI استعادتها لعيادتك — في أقل من دقيقتين.",
    ctaBtn: "ابدأ تجربة 14 يومًا مجانًا",
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
    s3Hint: "يستعيد Reva ما يصل إلى 98% من المكالمات الفائتة — نعتمد افتراضيًا نسبة متحفّظة قدرها 40%.",
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
    clinicPh: "Aloka Eye Clinic",
    fPhone: "الهاتف",
    optional: "(اختياري)",
    phonePh: "+971 50 000 0000",
    submitting: "جارٍ الإرسال…",
    reassurance: "متوافق مع معايير DHA و HIPAA · بياناتك لا تغادر الإمارات أبدًا",
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
    successBadge: "تهيئة متوافقة مع معايير DHA و HIPAA",
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
    clinic: "Aloka Eye Clinic",
    cta: "ابدأ التجربة المجانية",
  },

  chat: {
    eyebrow: "جرّبه بنفسك",
    h2: "تحدّث مع Reva AI الآن",
    sub: "هذه محاكاة حيّة للمحادثات التي يتولّاها Reva يوميًا لصالح Aloka — الحجوزات، وأسئلة الأسعار، وإعادة الجدولة، واستفسارات ما بعد الدوام. دون أي تدخّل من الموظفين.",
    liveChip: "عرض حيّ",
    repliesIn: "وكيل ذكاء اصطناعي · يردّ عادة خلال ثوانٍ",
    resetAria: "إعادة المحادثة",
    demoNote: "عرض تجريبي — ربطنا Reva الحقيقي بتقويم عيادتك",
    inputPh: "اكتب رسالة…",
    sendAria: "إرسال الرسالة",
    typingAria: "Reva AI يكتب الآن",
    greeting:
      "مرحبًا! أنا Reva، مساعد Aloka Eye Clinic الذكي. أستطيع حجز الاستشارات، ومشاركة الأسعار، أو الإجابة عن أسئلتك عن أطبائنا. كيف أستطيع مساعدتك اليوم؟",
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
        "يسعدني الإفادة: فحص العين الشامل بـ 350 AED، واستشارة LASIK بـ 500 AED، وتقييم الساد (الكتاركت) بـ 600 AED. وإذا كان لديك تأمين، نتولّى الموافقة المسبقة نيابةً عنك. هل ترغب في الحجز؟",
      reschedule:
        "لا مشكلة على الإطلاق. أستطيع نقل موعدك إلى الخميس الساعة 4:00 مساءً أو السبت الساعة 11:00 صباحًا — اختر الموعد المناسب وسأحدّث حجزك فورًا.",
      insurance:
        "نعم — نتعامل مع كبرى شركات التأمين المعتمدة من DHA، بما فيها Daman و AXA و Cigna و MetLife. أرسل صورة بطاقتك هنا وسأتحقق من تغطيتك وأبدأ الموافقة المسبقة قبل زيارتك.",
      hours:
        "نعمل من السبت إلى الخميس، من 9:00 صباحًا حتى 8:00 مساءً، ونغلق أيام الجمعة. أما أنا فموجود على WhatsApp على مدار الساعة — اترك رسالتك في أي وقت وسأتولّى كل الترتيبات.",
      doctor:
        "الدكتورة ميرا شارما هي جرّاحةنا الرئيسية لجراحات تصحيح الإبصار — خبرة 12 عامًا في القرنية والساد و LASIK، وأكثر من 9,000 عملية. تستقبل مرضاها في عيادتنا بجميرا. هل أحجز لك معها؟",
      location:
        "نحن على شارع جميرا بيتش، دبي — خدمة صفّ سيارات مجانية عند المدخل الرئيسي. سأرسل لك الموقع والاتجاهات عبر WhatsApp فور تأكيد موعدك.",
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
        text: "العيادة مغلقة حتى صباح السبت — لكن قناة WhatsApp لا تُغلق أبدًا. كل رسالة جمعة يقابلها ردّ فوري يراعي معايير DHA.",
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
