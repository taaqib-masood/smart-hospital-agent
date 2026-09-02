"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useCountUp } from "@/lib/hooks";
import { TrendingUp, Clock, ShieldCheck, Zap } from "lucide-react";

interface StatItem {
  value: string;
  numericValue: number | null;
  suffix: string;
  label: string;
  sub: string;
  icon: React.ElementType;
}

const stats: StatItem[] = [
  { value: "40%", numericValue: 40, suffix: "%", label: "No-Show Reduction", sub: "Via auto WhatsApp reminders", icon: TrendingUp },
  { value: "3.5 hrs", numericValue: 3, suffix: " hrs", label: "Saved Daily Per Clinic", sub: "Zero manual front desk calls", icon: Clock },
  { value: "24/7", numericValue: null, suffix: "", label: "Booking Uptime", sub: "Patients book late nights & weekends", icon: Zap },
  { value: "< 30s", numericValue: 30, suffix: "s", label: "Instant AI Response", sub: "100% missed calls recovered", icon: ShieldCheck },
];

function AnimatedStat({ stat, index, triggered }: { stat: StatItem; index: number; triggered: boolean }) {
  const count = useCountUp(triggered ? (stat.numericValue ?? 0) : 0, 1200);
  const Icon = stat.icon;

  return (
    <motion.div
      className="bg-white border border-[#CCD5DF] rounded-2xl p-6 shadow-xs flex flex-col justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={triggered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#00685f]/10 text-[#00685f] flex items-center justify-center">
          <Icon size={16} />
        </div>
      </div>
      <div>
        <span className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
          {stat.numericValue !== null ? `${count}${stat.suffix}` : stat.value}
        </span>
        <p className="text-xs text-slate-500 mt-1 font-medium">{stat.sub}</p>
      </div>
    </motion.div>
  );
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-12 bg-[#f7f9fb] border-y border-[#CCD5DF]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <AnimatedStat key={stat.label} stat={stat} index={i} triggered={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
