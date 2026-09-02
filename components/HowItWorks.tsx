"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link2, Calendar, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Connect WhatsApp Business",
    description: "Link your official clinic phone number to Reva in under 3 minutes with our step-by-step setup wizard.",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Configure Doctor Timings",
    description: "Define consultation slots, OPD working days, doctor specialties, and pricing rules.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Patients Book Automatically",
    description: "Patients message on WhatsApp, receive instant slot options, and confirm appointments 24/7.",
  },
];

const BEFORE_AFTER = [
  {
    before: "Front desk overwhelmed with phone calls during peak clinic hours",
    after: "100% of patient chats & bookings handled in parallel by Reva AI",
  },
  {
    before: "Missed calls go to competitor clinics nearby",
    after: "Instant WhatsApp callback recovers 75% of missed callers",
  },
  {
    before: "Manual reminder calls take 2 hours of staff time daily",
    after: "Automated WhatsApp reminders slash no-show rates by 40%",
  },
  {
    before: "Paper prescriptions get misplaced by patients",
    after: "Instant verified PDF prescriptions dispatched directly to WhatsApp",
  },
];

export default function HowItWorks() {
  const stepsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stepsRef, { once: true, margin: "-60px" });

  return (
    <section id="how-it-works" className="py-24 px-6 bg-[#f7f9fb] border-t border-[#CCD5DF]">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00685f] bg-[#00685f]/10 px-3 py-1 rounded-full border border-[#00685f]/20">
            Effortless Setup
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            Up & Running in 10 Minutes
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            No complicated IT hardware or training required. If your staff can use WhatsApp, they can use Reva.
          </p>
        </div>

        {/* 3 Steps */}
        <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-white border border-[#CCD5DF] rounded-2xl p-7 shadow-xs relative overflow-hidden"
              >
                <span className="absolute top-4 right-4 text-5xl font-black text-slate-100 select-none">
                  {step.number}
                </span>

                <div className="w-12 h-12 rounded-xl bg-[#00685f] text-white flex items-center justify-center mb-5 shadow-xs">
                  <Icon size={22} />
                </div>

                <h3 className="font-bold text-base text-[#0F172A] mb-2">{step.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Before vs After Comparison */}
        <div className="bg-white border border-[#CCD5DF] rounded-3xl p-8 lg:p-12 shadow-xs space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-[#0F172A]">The Reva AI Advantage</h3>
            <p className="text-slate-500 text-xs">How clinics transform their daily operations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Clinic */}
            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-sm text-rose-800 flex items-center gap-2">
                <XCircle size={16} /> Traditional Clinic Front Desk
              </h4>
              <ul className="space-y-3 text-xs text-rose-950/80">
                {BEFORE_AFTER.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{item.before}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* With Reva AI */}
            <div className="bg-teal-50/50 border border-teal-200 rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-sm text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} /> With Reva AI Autonomous Agent
              </h4>
              <ul className="space-y-3 text-xs text-emerald-950/80">
                {BEFORE_AFTER.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span className="font-medium">{item.after}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
