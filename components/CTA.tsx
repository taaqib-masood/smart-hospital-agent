"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, MessageSquare } from "lucide-react";

const footerLinks = [
  {
    heading: "Product",
    links: ["WhatsApp Booking", "Missed Call Recovery", "Digital Rx", "Waiting Room Queue", "Pricing"],
  },
  {
    heading: "Solutions",
    links: ["Dental Clinics", "Dermatology", "General OPD", "Pediatrics", "Specialist Networks"],
  },
  {
    heading: "Compliance & Security",
    links: ["DPDP Act (India)", "HIPAA Compliance", "Data Encryption", "Privacy Policy", "Terms of Service"],
  },
  {
    heading: "Support",
    links: ["Doctor Onboarding", "WhatsApp API Integration", "API Documentation", "Clinic Helpdesk"],
  },
];

export default function CTA() {
  return (
    <section className="bg-white border-t border-[#CCD5DF] pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#00685f] to-[#004d46] rounded-3xl p-10 md:p-16 text-white text-center shadow-xl space-y-6 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-3.5 py-1 rounded-full border border-white/20">
              Ready to Upgrade Your Clinic?
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Stop Missing Patients Today.
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto">
              Join 200+ clinics using Reva AI to automate front-desk bookings, eliminate no-shows, and deliver 24/7 patient care.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="px-8 py-3.5 bg-white text-[#00685f] hover:bg-emerald-50 text-sm font-bold rounded-xl shadow-md transition-all"
              >
                Start Free 14-Day Trial
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-bold rounded-xl transition-all"
              >
                View Live Demo Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pt-8 border-t border-[#CCD5DF] text-xs">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00685f] text-white flex items-center justify-center font-bold text-sm">
                R
              </div>
              <span className="text-base font-bold text-[#0F172A]">Reva AI</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              The autonomous AI medical receptionist and patient management platform designed for modern clinics across India.
            </p>
            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} Reva AI Technologies Inc. All rights reserved.
            </p>
          </div>

          {footerLinks.map((col) => (
            <div key={col.heading} className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F172A]">{col.heading}</h4>
              <ul className="space-y-2 text-slate-500">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-[#00685f] transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
