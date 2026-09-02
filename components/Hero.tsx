"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Check, CheckCheck, ArrowRight, Shield, Star, Calendar, MessageSquare, PhoneCall, Sparkles, ChevronRight } from "lucide-react";

const MESSAGES = [
  {
    id: 1,
    side: "left",
    text: "Hi, I need to book a consultation with Dr. Sharma tomorrow morning",
    time: "10:02 AM",
  },
  {
    id: 2,
    side: "right",
    text: "Hi! 👋 Welcome to Dr. Sharma's Clinic. Dr. Sharma has these open slots for tomorrow:",
    time: "10:02 AM",
  },
  {
    id: 3,
    side: "right",
    isCard: true,
    time: "10:02 AM",
    card: {
      date: "Tomorrow, Morning OPD",
      slots: ["10:30 AM ✓", "11:15 AM ✓", "02:00 PM ✓"],
    },
  },
  {
    id: 4,
    side: "left",
    text: "10:30 AM works best for me!",
    time: "10:03 AM",
  },
  {
    id: 5,
    side: "right",
    text: "✅ Booked & Confirmed! Your appointment is scheduled for tomorrow at 10:30 AM. You will receive an automated reminder 1 hour prior. See you soon!",
    time: "10:03 AM",
  },
];

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-2">
      <div className="bg-white border border-[#CCD5DF] rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex items-center gap-1.5 shadow-2xs">
        <span className="text-[11px] font-bold text-[#00685f]">Reva AI is typing</span>
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#00685f]"
              animate={{ y: [0, -3, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;

    MESSAGES.forEach((msg, i) => {
      setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg.id]);
      }, 400 + i * 800);
    });

    setTimeout(() => {
      setShowTyping(true);
    }, 400 + MESSAGES.length * 800 + 200);

    setTimeout(() => {
      setShowTyping(false);
    }, 400 + MESSAGES.length * 800 + 1600);
  }, [inView]);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-[#eaf6f4]/60 via-[#f7f9fb] to-[#f7f9fb]">
      {/* Background Subtle Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "radial-gradient(#CCD5DF 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* LEFT COLUMN: Copy & CTAs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#CCD5DF] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[#00685f]">
              Autonomous 24/7 WhatsApp AI Receptionist for Indian Clinics
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F172A] leading-[1.12]">
            Your Clinic Deserves an AI Receptionist That{" "}
            <span className="text-[#00685f] underline decoration-[#00685f]/30 underline-offset-8">
              Never Misses a Patient.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            Reva AI answers patient inquiries instantly on WhatsApp, automatically schedules appointments in Dr. Sharma&apos;s calendar, recovers lost missed calls, and collects payments — 24 hours a day.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <Link
              href="/dashboard"
              className="px-7 py-3.5 bg-[#00685f] hover:bg-[#005049] text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all"
            >
              Explore Live Doctor Portal <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-[#CCD5DF] text-slate-800 text-sm font-bold rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-colors"
            >
              Start Free 14-Day Trial
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 border-t border-[#CCD5DF]">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Check className="w-4 h-4 text-emerald-600" /> DPDP & HIPAA Compliant
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Check className="w-4 h-4 text-emerald-600" /> Official WhatsApp Business API
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Check className="w-4 h-4 text-emerald-600" /> 10-Minute Instant Setup
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Realistic WhatsApp Phone Mockup (5 cols) */}
        <div ref={ref} className="lg:col-span-5 flex justify-center">
          <div className="w-[320px] sm:w-[350px] bg-[#0F172A] rounded-[44px] p-3.5 shadow-2xl border-4 border-slate-800 relative">
            {/* Dynamic Island Cutout */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-end px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1e293b]" />
            </div>

            {/* Inner Phone Screen */}
            <div className="bg-[#f0f2f5] rounded-[34px] overflow-hidden flex flex-col h-[560px] border border-slate-700/50">
              {/* WhatsApp Header */}
              <div className="bg-[#00685f] text-white pt-8 pb-3 px-4 flex items-center justify-between shrink-0 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 text-white font-bold text-xs flex items-center justify-center">
                    DS
                  </div>
                  <div>
                    <h3 className="font-bold text-xs leading-tight">Dr. Sharma&apos;s Clinic</h3>
                    <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Reva AI Active
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/80">
                  <PhoneCall size={14} />
                  <Calendar size={14} />
                </div>
              </div>

              {/* Chat Canvas with Doodle background */}
              <div
                className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs relative"
                style={{
                  backgroundImage: "radial-gradient(#00685f 0.4px, transparent 0.4px), radial-gradient(#CCD5DF 0.4px, #f7f9fb 0.4px)",
                  backgroundSize: "20px 20px",
                }}
              >
                {/* Date Chip */}
                <div className="flex justify-center my-1">
                  <span className="bg-white/90 border border-[#CCD5DF] text-slate-500 font-bold text-[9px] px-2.5 py-0.5 rounded-full shadow-2xs uppercase">
                    Today
                  </span>
                </div>

                {MESSAGES.map((msg) => {
                  const isVisible = visibleMessages.includes(msg.id);
                  if (!isVisible) return null;

                  const isReva = msg.side === "right";

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${isReva ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-2.5 text-[11px] shadow-xs relative ${
                          isReva
                            ? "bg-[#d9fdd3] text-[#111b21] rounded-tr-none border border-emerald-200/50"
                            : "bg-white text-[#111b21] rounded-tl-none border border-[#CCD5DF]"
                        }`}
                      >
                        {msg.text && <p className="leading-relaxed">{msg.text}</p>}

                        {msg.isCard && msg.card && (
                          <div className="mt-1.5 pt-1.5 border-t border-emerald-300/40 space-y-1.5">
                            <p className="font-bold text-[10px] text-[#00685f]">{msg.card.date}</p>
                            <div className="flex flex-wrap gap-1">
                              {msg.card.slots.map((s) => (
                                <span
                                  key={s}
                                  className="px-2 py-0.5 bg-white border border-emerald-300 text-emerald-800 font-bold text-[9px] rounded"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-slate-400">
                          <span>{msg.time}</span>
                          {isReva && <CheckCheck size={11} className="text-[#53bdeb]" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {showTyping && <TypingIndicator />}
              </div>

              {/* Chat Input Bar */}
              <div className="p-2.5 bg-[#F8FAFC] border-t border-[#CCD5DF] flex items-center gap-2">
                <div className="flex-1 bg-white border border-[#CCD5DF] rounded-full px-3 py-1.5 text-[10px] text-slate-400">
                  Type a message...
                </div>
                <div className="w-7 h-7 bg-[#00685f] rounded-full flex items-center justify-center text-white">
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
