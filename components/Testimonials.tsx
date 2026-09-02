"use client";

import { motion } from "framer-motion";
import { Star, ShieldCheck } from "lucide-react";

const testimonials = [
  {
    quote: "We used to miss 8 to 10 calls every morning during peak OPD hours. Since introducing Reva, we recovered AED 22,000+ per month in consults that would have called other clinics. It paid for itself in 5 days.",
    name: "Dr. Priya Menon",
    role: "Senior Dermatologist",
    clinic: "Skin & Laser Center",
    city: "Downtown Dubai",
    initials: "PM",
    avatarColor: "bg-[#00685f]",
  },
  {
    quote: "My front desk spent 2 hours every day manually calling patients for 6-month dental follow-ups. Reva handles recalls automatically via WhatsApp — our return patient rate jumped from 32% to 74%.",
    name: "Dr. Arjun Shah",
    role: "Chief Dental Surgeon",
    clinic: "Shah Dental Oasis",
    city: "Dubai Healthcare City",
    initials: "AS",
    avatarColor: "bg-teal-700",
  },
  {
    quote: "Patients frequently message late at night when experiencing acute symptoms. Reva confirms appointments and provides pre-consultation instructions instantly. Outstanding patient experience.",
    name: "Dr. Ananya Krishnan",
    role: "Consultant Physician",
    clinic: "American Hospital Dubai Clinic Network",
    city: "Chennai",
    initials: "AK",
    avatarColor: "bg-emerald-700",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6 bg-[#f7f9fb] border-t border-[#CCD5DF]">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00685f] bg-[#00685f]/10 px-3 py-1 rounded-full border border-[#00685f]/20">
            Doctor Verified
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            Trusted by Doctors Across India
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Over 200+ clinics and medical practices rely on Reva AI every single day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-[#CCD5DF] rounded-2xl p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#CCD5DF]">
                <div className={`w-10 h-10 rounded-full ${t.avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                  {t.initials}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0F172A] leading-tight">{t.name}</h4>
                  <p className="text-[10px] text-slate-500">{t.role} • {t.clinic}, {t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
