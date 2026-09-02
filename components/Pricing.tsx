"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "For individual doctors testing AI automation",
    features: [
      "Up to 50 conversations / month",
      "Official WhatsApp Booking",
      "Appointment reminders (24h prior)",
      "1 Doctor profile",
      "Standard email support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Clinic Pro",
    monthlyPrice: 2499,
    yearlyPrice: 1999,
    description: "For growing outpatient clinics & dental centers",
    features: [
      "Unlimited WhatsApp conversations",
      "Missed call recovery automation",
      "Smart 1-tap reminders & no-show prediction",
      "Up to 5 Doctors & multi-slot management",
      "Digital Rx & Lab Report dispatch",
      "Digital Invoicing & Deposit Collection (Apple Pay / Card)",
      "Priority WhatsApp doctor support",
    ],
    cta: "Start 14-Day Free Trial",
    popular: true,
  },
  {
    name: "Hospital Chain",
    monthlyPrice: 6999,
    yearlyPrice: 5599,
    description: "For multi-specialty hospitals & clinic chains",
    features: [
      "Everything in Clinic Pro",
      "Unlimited Doctors & Multi-branch locations",
      "Full API & EMR / EHR integrations",
      "Dedicated account manager",
      "Custom WhatsApp templates & voice bot",
      "Custom SLA & 99.9% uptime guarantee",
    ],
    cta: "Contact Enterprise Sales",
    popular: false,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="py-24 px-6 bg-white border-t border-[#CCD5DF]">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00685f] bg-[#00685f]/10 px-3 py-1 rounded-full border border-[#00685f]/20">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            Simple Pricing. Serious Clinic ROI.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Start for free. Recover lost appointments from day one. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3 text-xs font-bold">
            <span className={!yearly ? "text-[#0F172A]" : "text-slate-400"}>Monthly Billing</span>
            <button
              onClick={() => setYearly(!yearly)}
              className="relative w-12 h-6 bg-[#00685f] rounded-full p-0.5 transition-colors focus:outline-none"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  yearly ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={yearly ? "text-[#00685f]" : "text-slate-400"}>
              Annual Billing <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((p) => {
            const price = yearly ? p.yearlyPrice : p.monthlyPrice;

            return (
              <div
                key={p.name}
                className={`rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 ${
                  p.popular
                    ? "bg-[#F8FAFC] border-2 border-[#00685f] shadow-lg scale-100 lg:-translate-y-2"
                    : "bg-white border border-[#CCD5DF] shadow-xs hover:shadow-md"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00685f] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs uppercase tracking-wider">
                    Most Popular Choice
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-xl text-[#0F172A]">{p.name}</h3>
                    <p className="text-slate-500 text-xs mt-1">{p.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#0F172A]">
                      {price === 0 ? "AED 0" : `AED ${price.toLocaleString("en-AE")}`}
                    </span>
                    {price > 0 && <span className="text-xs text-slate-500 font-medium">/ month</span>}
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-[#CCD5DF] text-xs">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-slate-700">
                        <Check size={15} className="text-[#00685f] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    href={p.name === "Hospital Chain" ? "#" : "/login"}
                    className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                      p.popular
                        ? "bg-[#00685f] hover:bg-[#005049] text-white shadow-sm"
                        : "bg-white hover:bg-slate-50 border border-[#CCD5DF] text-[#0F172A]"
                    }`}
                  >
                    {p.cta} <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
