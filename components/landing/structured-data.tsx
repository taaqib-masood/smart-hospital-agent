const FAQ_JSONLD = [
  {
    q: "Is Reva compliant with UAE healthcare regulations?",
    a: "Yes. Reva is built to be DHA & HIPAA compliant end to end — patient data is encrypted in transit and at rest, hosted with UAE data residency, and access is role-based with full audit trails. We sign a clinic-specific data processing agreement before go-live.",
  },
  {
    q: "How does Reva connect to our clinic's WhatsApp?",
    a: "We provision an official WhatsApp Business API number for Aloka (or migrate your existing one). This is the verified, green-badge channel — not an unofficial automation tool. Your clinic keeps full ownership of the number and its conversation history.",
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
    a: "48 hours. Day one: we provision your WhatsApp Business API access and verify your number. Day two: we map your doctors, procedures, and automation rules with a one-hour call — then you're live. No IT team required from your side; we handle everything.",
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
        "AI Patient Operations Layer for UAE clinics — missed-call recovery, no-show prevention, and AI patient briefs native on WhatsApp.",
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
        "Reva AI integrates with WhatsApp to recover missed calls, reduce no-shows, and manage patient journeys for procedures like Cataract, LASIK, and Dry Eye care. DHA & HIPAA Compliant. Built for UAE clinics.",
      offers: {
        "@type": "Offer",
        name: "Clinic Pro",
        price: "1499",
        priceCurrency: "AED",
        description: "Per clinic, per month — 14-day free trial included.",
      },
      featureList: [
        "Missed-call recovery on WhatsApp",
        "Smart no-show prevention",
        "AI patient briefs",
        "Cataract pre-op & post-op automation",
        "LASIK eligibility triage",
        "Dry eye reactivation campaigns",
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
