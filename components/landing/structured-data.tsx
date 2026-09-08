const FAQ_JSONLD = [
  {
    q: "Is Reva compliant with UAE healthcare regulations?",
    a: "Reva includes role-based access, audit logging, consent records, and security controls. Each clinic must complete its own legal, privacy, hosting, and regulator review before production use.",
  },
  {
    q: "How does Reva connect to our clinic's WhatsApp?",
    a: "Reva connects through the official WhatsApp Business Platform after the clinic completes Meta business and number setup. Number ownership and migration details are confirmed during onboarding.",
  },
  {
    q: "What happens when the AI can't answer a patient?",
    a: "Reva recognizes its limits. For clinical questions, billing disputes, or anything it isn't confident about, it escalates instantly to your front desk — with the full conversation attached — and the appointment stays untouched until a human decides. Patients can also opt out to a human at any time with one tap.",
  },
  {
    q: "Does Reva replace our practice management system?",
    a: "No — Reva sits on top of it. The AI patient operations layer handles the conversations and busywork around your existing calendar and workflows. On the Hospital Group plan, we integrate directly with your PMS or HIS through custom workflow integrations and API access.",
  },
  {
    q: "How long does setup really take?",
    a: "The timeline depends on Meta approval, number setup, clinic data, templates, and any calendar integration. A limited pilot is configured first and production starts only after testing and clinic approval.",
  },
  {
    q: "Can patients still reach a human at the front desk?",
    a: "Always. Every AI conversation includes a visible one-tap handoff to your team, and Reva only automates what you explicitly configure. During clinic hours, escalated conversations reach your staff within seconds, with full context attached.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://reva-ai.ae/#org",
      name: "Reva AI",
      description:
        "WhatsApp receptionist automation for UAE clinics, with appointment workflows and human handoff.",
      logo: "https://reva-ai.ae/reva-icon.svg",
      areaServed: "AE",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://reva-ai.ae/#app",
      name: "Reva AI",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Healthcare Practice Automation",
      operatingSystem: "Web, WhatsApp",
      description:
        "Reva AI helps clinic reception teams manage WhatsApp enquiries, appointments, reminders, consent requests, billing follow-ups, and human handoff.",
      featureList: [
        "WhatsApp receptionist inbox",
        "Appointment booking and reminders",
        "Human handoff",
        "Consent request tracking",
        "Billing follow-up",
        "Opt-in and opt-out records",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://reva-ai.ae/#faq",
      mainEntity: FAQ_JSONLD.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
