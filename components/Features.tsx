"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageSquare, PhoneCall, BellRing, RefreshCcw, FileText, CreditCard, Shield, Activity, Users } from "lucide-react";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  badge: string;
}

const features: Feature[] = [
  {
    icon: MessageSquare,
    title: "WhatsApp Booking & Triage",
    description: "Patients book appointments 24/7 via natural language WhatsApp chats. Reva checks doctor calendars and confirms slots automatically.",
    badge: "24/7 Automated",
  },
  {
    icon: PhoneCall,
    title: "Missed Call Recovery",
    description: "Never lose a patient when front-desk phone lines are busy. Reva detects missed calls and triggers an instant WhatsApp booking link.",
    badge: "Revenue Saver",
  },
  {
    icon: BellRing,
    title: "Smart No-Show Prevention",
    description: "Automated WhatsApp reminders sent 24 hours and 1 hour before visits with 1-tap confirmation pills, reducing no-shows by 40%.",
    badge: "AI Risk Scoring",
  },
  {
    icon: FileText,
    title: "Digital Rx & Lab Reports",
    description: "Create official doctor prescriptions in 30 seconds and dispatch signed PDFs with dosage instructions straight to the patient's phone.",
    badge: "Paperless",
  },
  {
    icon: CreditCard,
    title: "Digital Deposits & Invoicing",
    description: "Collect consultation pre-payments and procedure advance deposits directly through auto-generated secure Apple Pay & card payment links in AED.",
    badge: "Instant Settlement",
  },
  {
    icon: RefreshCcw,
    title: "Automated Patient Recall",
    description: "Re-engage patients due for dental cleaning, chronic BP reviews, or post-surgery checkups with scheduled WhatsApp recall campaigns.",
    badge: "Retention Booster",
  },
];

export default function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00685f] bg-[#00685f]/10 px-3 py-1 rounded-full border border-[#00685f]/20">
            Autonomous Front-Desk Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            Everything Your Clinic Front Desk Needs
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Engineered specifically for outpatient clinics, dental centers, and specialist practices across India.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#F8FAFC] border border-[#CCD5DF] hover:border-[#00685f]/50 hover:bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-[#00685f] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#0F172A] mb-2">{f.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
