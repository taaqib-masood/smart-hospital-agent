"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountUp } from "@/lib/hooks";
import {
  TrendingDown,
  AlertTriangle,
  Phone,
  CheckCircle,
  Activity,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  AlertCircle
} from "lucide-react";

interface NoShowViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type RiskLevel = "Low" | "Medium" | "High" | "Critical";
type FactorKey =
  | "prev_noshow"
  | "last_minute"
  | "unconfirmed"
  | "monday_slot"
  | "rescheduled"
  | "first_visit"
  | "confirmed_wa"
  | "regular";

interface Appointment {
  id: number;
  name: string;
  time: string;
  type: string;
  risk: number;
  level: RiskLevel;
  factors: FactorKey[];
  history: boolean[];
  reasoning: string[];
  suggestion: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    name: "Priya Sharma",
    time: "10:30 AM",
    type: "General Checkup",
    risk: 22,
    level: "Low",
    factors: ["first_visit"],
    history: [true, true, true, true, true, false],
    reasoning: [
      "First-time visitor — no historical no-show data available",
      "Booked 3 days in advance, indicating planned intent",
      "No confirmation received yet, but lead time is healthy",
    ],
    suggestion: "Send a friendly welcome reminder 24h before. Include clinic directions.",
  },
  {
    id: 2,
    name: "Rahul Gupta",
    time: "11:00 AM",
    type: "Follow-up",
    risk: 71,
    level: "High",
    factors: ["prev_noshow", "last_minute", "monday_slot"],
    history: [false, true, false, false, true, false],
    reasoning: [
      "2 previous no-shows — strongest single predictor of repeat behaviour",
      "Last-minute booking (< 6 hrs) correlates with 3× higher risk",
      "Monday morning slots historically show 60% higher no-show rates",
    ],
    suggestion: "Call patient directly + send WhatsApp reminder 2h before. Offer easy reschedule link.",
  },
  {
    id: 3,
    name: "Ananya Nair",
    time: "11:30 AM",
    type: "Dental Cleaning",
    risk: 45,
    level: "Medium",
    factors: ["prev_noshow", "last_minute"],
    history: [true, true, false, true, true, true],
    reasoning: [
      "1 previous no-show on record — moderate historical risk",
      "Booked yesterday — slightly elevated lead-time risk",
      "Dental cleanings see higher skip rates than urgent consultations",
    ],
    suggestion: "Send a WhatsApp reminder with a 1-tap confirm/reschedule option 24h before.",
  },
  {
    id: 4,
    name: "Vikram Patel",
    time: "12:00 PM",
    type: "Consultation",
    risk: 18,
    level: "Low",
    factors: ["regular", "confirmed_wa"],
    history: [true, true, true, true, true, true],
    reasoning: [
      "Long-term regular patient — 4× more reliable than average",
      "WhatsApp confirmation received — removes unconfirmed risk factor",
      "Consistent attendance record across all 6 tracked visits",
    ],
    suggestion: "No action needed. Patient is reliable and confirmed. Send standard day-of reminder.",
  },
  {
    id: 5,
    name: "Sunita Rao",
    time: "2:30 PM",
    type: "BP Check",
    risk: 58,
    level: "High",
    factors: ["rescheduled", "unconfirmed"],
    history: [true, false, true, true, false, true],
    reasoning: [
      "Rescheduled twice — repeated reschedules signal weak intent",
      "No WhatsApp confirmation received despite reminder sent",
      "Long travel distance increases friction-based cancellations",
    ],
    suggestion: "Send WhatsApp reminder with a quick reschedule link. Follow up with call if unread after 1h.",
  },
  {
    id: 6,
    name: "Karan Mehta",
    time: "3:00 PM",
    type: "General Checkup",
    risk: 89,
    level: "Critical",
    factors: ["prev_noshow", "unconfirmed", "monday_slot"],
    history: [false, false, false, true, false, true],
    reasoning: [
      "3 previous no-shows — highest risk tier automatically triggered",
      "Completely unconfirmed — zero engagement with reminders sent",
      "Monday afternoon slot compounds risk with post-weekend inertia",
    ],
    suggestion: "Immediate phone call required. Offer deposit or easy reschedule. Consider overbooking slot.",
  },
  {
    id: 7,
    name: "Deepa Singh",
    time: "3:30 PM",
    type: "X-Ray Review",
    risk: 34,
    level: "Medium",
    factors: ["first_visit", "confirmed_wa"],
    history: [true, true, true, true, false, true],
    reasoning: [
      "New patient — no clinic-specific no-show history available",
      "WhatsApp confirmation received — positive engagement signal",
      "X-Ray reviews are result-driven, patients tend to show up",
    ],
    suggestion: "Send a standard reminder 2h before. Patient is confirmed and motivated by results.",
  },
];

const RISK_CONFIG: Record<
  RiskLevel,
  { color: string; text: string; bar: string; border: string; bg: string }
> = {
  Low: { color: "text-emerald-700", text: "Low", bar: "bg-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50" },
  Medium: { color: "text-amber-700", text: "Medium", bar: "bg-amber-500", border: "border-amber-200", bg: "bg-amber-50" },
  High: { color: "text-rose-700", text: "High", bar: "bg-rose-500", border: "border-rose-200", bg: "bg-rose-50" },
  Critical: { color: "text-red-700", text: "Critical", bar: "bg-red-600", border: "border-red-200", bg: "bg-red-50" },
};

const MODEL_FACTORS = [
  { name: "Previous No-Shows", weight: "+35 pts", desc: "Strongest predictor of future behaviour", color: "text-rose-700" },
  { name: "Booking Lead Time", weight: "+20 pts", desc: "< 6hrs bookings show 3× higher risk", color: "text-amber-700" },
  { name: "Day/Time Slot", weight: "+15 pts", desc: "Monday mornings historically high risk", color: "text-amber-600" },
  { name: "Confirmation Status", weight: "+15 pts", desc: "Unconfirmed adds significant risk", color: "text-slate-600" },
  { name: "Reschedule History", weight: "+10 pts", desc: "Multiple reschedules signal intent issues", color: "text-indigo-600" },
  { name: "Patient Tenure", weight: "-10 pts", desc: "Long-term patients are 4× more reliable", color: "text-emerald-700" },
];

function StatCard({ label, value, prefix = "", suffix = "", icon, trend, delay }: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  trend: string;
  delay: number;
}) {
  const count = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#CCD5DF] flex items-center justify-center text-[#00685f]">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-[#0F172A] mb-1">
        {prefix}{count.toLocaleString("en-AE")}{suffix}
      </div>
      <div className="flex items-center gap-1 text-[#00685f] text-xs font-semibold">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>{trend}</span>
      </div>
    </motion.div>
  );
}

const DONUT_SEGMENTS = [
  { label: "Low", count: 2, color: "#00685f", strokeColor: "#00685f" },
  { label: "Medium", count: 2, color: "#f59e0b", strokeColor: "#f59e0b" },
  { label: "High", count: 1, color: "#f43f5e", strokeColor: "#f43f5e" },
  { label: "Critical", count: 1, color: "#dc2626", strokeColor: "#dc2626" },
];

const DONUT_TOTAL = DONUT_SEGMENTS.reduce((s, d) => s + d.count, 0);

function DonutChart() {
  const r = 50;
  const cx = 65;
  const cy = 65;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width={130} height={130} viewBox="0 0 130 130">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={12} />
          {DONUT_SEGMENTS.map((seg, i) => {
            const segFrac = seg.count / DONUT_TOTAL;
            const segLen = segFrac * circumference;
            const offset = circumference - (cumulative * circumference) / DONUT_TOTAL;
            const gap = 3;
            cumulative += seg.count;
            return (
              <motion.circle
                key={seg.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.strokeColor}
                strokeWidth={12}
                strokeDasharray={`${Math.max(segLen - gap, 0)} ${circumference - Math.max(segLen - gap, 0)}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                style={{ transformOrigin: `${cx}px ${cy}px`, rotate: "-90deg" }}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${Math.max(segLen - gap, 0)} ${circumference - Math.max(segLen - gap, 0)}` }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: "easeOut" }}
              />
            );
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#0F172A" fontSize={20} fontWeight={700}>{DONUT_TOTAL}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={500}>Patients</text>
        </svg>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {DONUT_SEGMENTS.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.strokeColor }} />
              <span className="text-slate-600 font-medium">{seg.label}</span>
            </div>
            <span className="text-[#0F172A] font-bold">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskBar({ pct, level, delay }: { pct: number; level: RiskLevel; delay: number }) {
  const cfg = RISK_CONFIG[level];
  return (
    <div className="flex items-center gap-2.5 w-full">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <motion.div
          className={`h-full rounded-full ${cfg.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className={`text-xs font-bold w-9 text-right ${cfg.color}`}>{pct}%</span>
    </div>
  );
}

function ActionButtons({
  level,
  id,
  addToast,
  reminded,
  setReminded,
}: {
  level: RiskLevel;
  id: number;
  addToast: NoShowViewProps["addToast"];
  reminded: Set<number>;
  setReminded: React.Dispatch<React.SetStateAction<Set<number>>>;
}) {
  const isReminded = reminded.has(id);

  const handleRemind = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReminded((prev) => new Set(prev).add(id));
    addToast("WhatsApp reminder sent successfully", "success");
    setTimeout(() => {
      setReminded((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToast("Calling patient — initiating call log", "info");
  };

  if (level === "Low") return <span className="text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1"><CheckCircle size={12} /> Confirmed</span>;

  if (level === "Medium") {
    return (
      <button onClick={handleRemind} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${isReminded ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-[#00685f] text-white border-[#00685f]"}`}>
        {isReminded ? "Sent ✓" : "Send Reminder"}
      </button>
    );
  }

  if (level === "High") {
    return (
      <button onClick={handleCall} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 flex items-center gap-1.5">
        <Phone size={12} /> Call + Remind
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button onClick={handleCall} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 border border-red-300 text-red-700 hover:bg-red-100 transition-all flex items-center gap-1 shadow-xs">
        <Phone size={12} /> Call
      </button>
    </div>
  );
}

function AppointmentRow({
  appt,
  index,
  addToast,
  reminded,
  setReminded,
}: {
  appt: Appointment;
  index: number;
  addToast: NoShowViewProps["addToast"];
  reminded: Set<number>;
  setReminded: React.Dispatch<React.SetStateAction<Set<number>>>;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = RISK_CONFIG[appt.level];

  return (
    <div className="border-b border-[#CCD5DF] last:border-0">
      <div
        className={`grid grid-cols-[1.5fr_1fr_1fr_1.5fr_140px] gap-4 items-center px-6 py-4 transition-colors cursor-pointer ${
          expanded ? "bg-[#00685f]/[0.03]" : "hover:bg-slate-50"
        }`}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#00685f]/15 text-[#00685f] font-bold text-xs flex items-center justify-center flex-shrink-0">
            {appt.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="min-w-0">
            <p className="text-[#0F172A] text-sm font-bold truncate">{appt.name}</p>
            <p className="text-slate-500 text-xs">{appt.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{appt.time}</span>
        </div>

        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {appt.level}
          </span>
        </div>

        <div>
          <RiskBar pct={appt.risk} level={appt.level} delay={0.1 + index * 0.05} />
        </div>

        <div className="flex items-center justify-end gap-3">
          <ActionButtons
            level={appt.level}
            id={appt.id}
            addToast={addToast}
            reminded={reminded}
            setReminded={setReminded}
          />
          <div className="text-slate-400 hover:text-slate-600">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-[#F8FAFC] border-t border-[#CCD5DF] px-6 py-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  AI Risk Reasoning
                </h4>
                <ul className="space-y-1.5">
                  {appt.reasoning.map((r, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-[#00685f] mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Recommended Action
                </h4>
                <div className="bg-white border border-[#CCD5DF] rounded-lg p-3 text-xs text-slate-700 font-medium">
                  {appt.suggestion}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NoShowView({ addToast }: NoShowViewProps) {
  const [reminded, setReminded] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"All" | RiskLevel>("All");

  const filteredAppts =
    filter === "All"
      ? APPOINTMENTS
      : APPOINTMENTS.filter((a) => a.level === filter);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">No-Show Prediction Engine</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Real-time AI probability scoring and automated recovery workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Today's Risk Index"
          value={38}
          suffix="%"
          icon={<TrendingDown className="w-4 h-4" />}
          trend="-8% vs last month"
          delay={0.05}
        />
        <StatCard
          label="High Risk Patients"
          value={3}
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          trend="Action required"
          delay={0.1}
        />
        <StatCard
          label="Recovered Revenue"
          value={18500}
          prefix="AED "
          icon={<DollarSign className="w-4 h-4" />}
          trend="+AED 4,200 this week"
          delay={0.15}
        />
        <StatCard
          label="No-Shows Prevented"
          value={24}
          icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
          trend="91% show-up rate"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-[#CCD5DF] rounded-xl overflow-hidden shadow-xs flex flex-col">
          <div className="p-5 border-b border-[#CCD5DF] flex items-center justify-between bg-[#F8FAFC]">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Today's Risk Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">7 scheduled consultations</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-[#CCD5DF]">
              {(["All", "Low", "Medium", "High", "Critical"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilter(lvl)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    filter === lvl
                      ? "bg-white text-[#00685f] shadow-xs"
                      : "text-slate-600 hover:text-[#0F172A]"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_140px] gap-4 px-6 py-3 bg-[#F8FAFC] border-b border-[#CCD5DF] text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Patient</span>
            <span>Slot</span>
            <span>Risk Tier</span>
            <span>Probability</span>
            <span className="text-right pr-[28px]">Action</span>
          </div>

          <div className="divide-y divide-[#CCD5DF]">
            {filteredAppts.map((appt, i) => (
              <AppointmentRow
                key={appt.id}
                appt={appt}
                index={i}
                addToast={addToast}
                reminded={reminded}
                setReminded={setReminded}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#0F172A] mb-4">Risk Distribution</h3>
            <DonutChart />
          </div>

          <div className="bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#0F172A] mb-4">Predictive Weights</h3>
            <div className="space-y-3">
              {MODEL_FACTORS.map((f) => (
                <div key={f.name} className="flex items-center justify-between text-xs pb-2 border-b border-[#CCD5DF]/50 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-[#0F172A]">{f.name}</p>
                    <p className="text-[11px] text-slate-500">{f.desc}</p>
                  </div>
                  <span className={`font-mono font-bold ${f.color}`}>{f.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
