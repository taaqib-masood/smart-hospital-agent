"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Clock,
  Users,
  Building2,
  Zap,
  Sparkles,
} from "lucide-react";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const STEPS = 7;

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

const transition = { duration: 0.28, ease: "easeInOut" as const };

// ─── Types ───────────────────────────────────────────────────────────────────

interface DayConfig {
  day: string;
  enabled: boolean;
  open: string;
  close: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const defaultDays: DayConfig[] = [
  { day: "Monday", enabled: true, open: "09:00", close: "18:00" },
  { day: "Tuesday", enabled: true, open: "09:00", close: "18:00" },
  { day: "Wednesday", enabled: true, open: "09:00", close: "18:00" },
  { day: "Thursday", enabled: true, open: "09:00", close: "18:00" },
  { day: "Friday", enabled: true, open: "09:00", close: "18:00" },
  { day: "Saturday", enabled: true, open: "09:00", close: "18:00" },
  { day: "Sunday", enabled: false, open: "09:00", close: "18:00" },
];

const defaultGreeting =
  "Hi [Name]! 👋 Welcome to [Clinic Name]. I'm Reva, your AI assistant. I can help you book an appointment, check timings, or answer your questions. How can I help you today?";

const avatarColors = [
  "bg-cyan-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        enabled ? "bg-cyan-500" : "bg-white/10"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 35 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
        style={{ left: enabled ? "calc(100% - 20px)" : "4px" }}
      />
    </button>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
}: {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs text-slate-400 font-medium">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all ${
            icon ? "pl-10" : ""
          }`}
        />
      </div>
    </div>
  );
}

// ─── Steps ───────────────────────────────────────────────────────────────────

function Step1({
  clinicType,
  setClinicType,
}: {
  clinicType: string;
  setClinicType: (v: string) => void;
}) {
  const types = [
    { id: "GP", icon: "🏥", label: "General Practice / GP" },
    { id: "Dental", icon: "🦷", label: "Dental Clinic" },
    { id: "Specialist", icon: "👁️", label: "Specialist Clinic" },
    { id: "Multi", icon: "🏨", label: "Multi-specialty" },
  ];
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-6xl">👋</div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome to Reva AI
        </h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Let's set up your AI receptionist in under 10 minutes. Your clinic
          will never miss a patient again.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => setClinicType(t.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 text-center ${
              clinicType === t.id
                ? "border-cyan-500/60 bg-cyan-500/10"
                : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
            }`}
          >
            <span className="text-2xl">{t.icon}</span>
            <span className="text-xs text-white font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2({
  clinicInfo,
  setClinicInfo,
}: {
  clinicInfo: { name: string; city: string; phone: string; doctorCount: string };
  setClinicInfo: (v: typeof clinicInfo) => void;
}) {
  const doctorOptions = ["1", "2-5", "6-10", "10+"];
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Tell us about your clinic
        </h2>
        <p className="text-slate-400 text-sm">
          This helps Reva personalise responses for your patients.
        </p>
      </div>
      <InputField
        label="Clinic Name"
        placeholder="Dr. Sharma's Clinic"
        value={clinicInfo.name}
        onChange={(v) => setClinicInfo({ ...clinicInfo, name: v })}
      />
      <InputField
        label="City"
        placeholder="Dubai"
        value={clinicInfo.city}
        onChange={(v) => setClinicInfo({ ...clinicInfo, city: v })}
      />
      <InputField
        label="Phone Number"
        placeholder="+971 50 123 4567"
        value={clinicInfo.phone}
        onChange={(v) => setClinicInfo({ ...clinicInfo, phone: v })}
        type="tel"
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-medium">
          Number of Doctors
        </label>
        <div className="flex gap-2">
          {doctorOptions.map((opt) => (
            <button
              key={opt}
              onClick={() =>
                setClinicInfo({ ...clinicInfo, doctorCount: opt })
              }
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                clinicInfo.doctorCount === opt
                  ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-400"
                  : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3({
  whatsappNum,
  setWhatsappNum,
  verified,
  setVerified,
}: {
  whatsappNum: string;
  setWhatsappNum: (v: string) => void;
  verified: boolean;
  setVerified: (v: boolean) => void;
}) {
  const [verifying, setVerifying] = useState(false);

  const handleVerify = () => {
    if (verifying || verified) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Connect your WhatsApp
        </h2>
        <p className="text-slate-400 text-sm">
          Reva will reply to patients from your clinic's WhatsApp number.
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#25D366]">
          <MessageSquare size={18} />
        </div>
        <input
          type="tel"
          placeholder="+971 50 123 4567"
          value={whatsappNum}
          onChange={(e) => setWhatsappNum(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-4 text-white placeholder:text-slate-500 text-base focus:outline-none focus:border-cyan-500/50 transition-all"
        />
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={handleVerify}
          disabled={verifying || verified}
          className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
            verified
              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
              : "bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:opacity-90"
          }`}
        >
          {verifying ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
            />
          ) : verified ? (
            <>
              <Check size={16} /> Number Verified!
            </>
          ) : (
            <>
              Send Verification Code <ChevronRight size={16} />
            </>
          )}
        </button>
        <p className="text-xs text-slate-500 text-center">
          We'll send a one-time code to this number
        </p>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex gap-3 items-start">
        <span className="text-base">🔒</span>
        <p className="text-xs text-slate-400">
          Your WhatsApp data is encrypted and only used to send/receive booking
          messages.
        </p>
      </div>
    </div>
  );
}

function Step4({
  workingHours,
  setWorkingHours,
}: {
  workingHours: DayConfig[];
  setWorkingHours: (v: DayConfig[]) => void;
}) {
  const update = (i: number, patch: Partial<DayConfig>) => {
    const next = workingHours.map((d, idx) =>
      idx === i ? { ...d, ...patch } : d
    );
    setWorkingHours(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          When is your clinic open?
        </h2>
        <p className="text-slate-400 text-sm">
          Reva will only accept bookings within these hours.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {workingHours.map((d, i) => (
          <div
            key={d.day}
            className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5"
          >
            <span className="text-xs text-slate-400 w-20 font-medium">
              {d.day.slice(0, 3)}
            </span>
            <ToggleSwitch
              enabled={d.enabled}
              onToggle={() => update(i, { enabled: !d.enabled })}
            />
            <div className="flex items-center gap-2 flex-1">
              <input
                type="time"
                value={d.open}
                disabled={!d.enabled}
                onChange={(e) => update(i, { open: e.target.value })}
                className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500/50 disabled:opacity-30 transition-all"
              />
              <span className="text-slate-600 text-xs">–</span>
              <input
                type="time"
                value={d.close}
                disabled={!d.enabled}
                onChange={(e) => update(i, { close: e.target.value })}
                className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500/50 disabled:opacity-30 transition-all"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step5({
  doctors,
  setDoctors,
}: {
  doctors: Doctor[];
  setDoctors: (v: Doctor[]) => void;
}) {
  const addDoctor = () => {
    if (doctors.length >= 5) return;
    setDoctors([
      ...doctors,
      { id: crypto.randomUUID(), name: "", specialty: "" },
    ]);
  };

  const removeDoctor = (id: string) => {
    setDoctors(doctors.filter((d) => d.id !== id));
  };

  const updateDoctor = (id: string, patch: Partial<Doctor>) => {
    setDoctors(doctors.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Add your doctors
        </h2>
        <p className="text-slate-400 text-sm">
          Reva will book appointments for each doctor separately.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {doctors.map((doc, i) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3"
          >
            <div
              className={`w-8 h-8 rounded-full ${
                avatarColors[i % avatarColors.length]
              } flex-shrink-0 flex items-center justify-center text-white text-xs font-bold`}
            >
              {doc.name ? doc.name[0].toUpperCase() : (i + 1).toString()}
            </div>
            <input
              placeholder="Doctor Name"
              value={doc.name}
              onChange={(e) => updateDoctor(doc.id, { name: e.target.value })}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-600 focus:outline-none"
            />
            <input
              placeholder="General Physician"
              value={doc.specialty}
              onChange={(e) =>
                updateDoctor(doc.id, { specialty: e.target.value })
              }
              className="flex-1 bg-transparent text-slate-400 text-sm placeholder:text-slate-600 focus:outline-none"
            />
            {doctors.length > 1 && (
              <button
                onClick={() => removeDoctor(doc.id)}
                className="text-slate-600 hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      {doctors.length < 5 ? (
        <button
          onClick={addDoctor}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/[0.12] text-slate-500 text-sm hover:text-slate-300 hover:border-white/20 transition-all"
        >
          <Plus size={15} /> Add Another Doctor
        </button>
      ) : (
        <p className="text-xs text-slate-500 text-center">
          Maximum 5 doctors can be added during setup. You can add more from
          your dashboard.
        </p>
      )}
    </div>
  );
}

function Step6({
  greeting,
  setGreeting,
  clinicName,
}: {
  greeting: string;
  setGreeting: (v: string) => void;
  clinicName: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertChip = (chip: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = greeting.slice(0, start) + chip + greeting.slice(end);
    setGreeting(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + chip.length, start + chip.length);
    }, 0);
  };

  const preview = greeting
    .replace(/\[Name\]/g, "Priya")
    .replace(/\[Clinic Name\]/g, clinicName || "Our Clinic")
    .replace(/\[Phone\]/g, "+971 50 123 4567");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Customize Reva's greeting
        </h2>
        <p className="text-slate-400 text-sm">
          This is what patients see when they first message your clinic.
        </p>
      </div>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          rows={5}
          maxLength={500}
          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
        />
        <span className="absolute bottom-3 right-3 text-xs text-slate-600">
          {greeting.length}/500
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["[Name]", "[Clinic Name]", "[Phone]"].map((chip) => (
          <button
            key={chip}
            onClick={() => insertChip(chip)}
            className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs hover:bg-cyan-500/20 transition-all"
          >
            {chip}
          </button>
        ))}
      </div>
      <div className="bg-[#0a1a0a] border border-white/[0.06] rounded-2xl p-4">
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
          <MessageSquare size={12} className="text-[#25D366]" /> WhatsApp
          Preview
        </p>
        <div className="flex">
          <div className="bg-[#25D366]/20 border border-[#25D366]/20 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
            <p className="text-white text-sm whitespace-pre-wrap">{preview}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimatedCheck() {
  return (
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/30" />
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full -rotate-90"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="url(#grad)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
      >
        <motion.path
          d="M30 52 L44 66 L70 38"
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

function Step7({
  clinicInfo,
  workingHours,
  doctors,
  greeting,
  whatsappNum,
  onComplete,
}: {
  clinicInfo: { name: string; city: string; phone: string; doctorCount: string };
  workingHours: DayConfig[];
  doctors: Doctor[];
  greeting: string;
  whatsappNum: string;
  onComplete: () => void;
}) {
  const enabledDays = workingHours.filter((d) => d.enabled);
  const hoursLabel =
    enabledDays.length === 0
      ? "No days configured"
      : `${enabledDays.length} days/week`;

  const handleGo = async () => {
    localStorage.setItem("reva_onboarded", "true");

    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      onComplete();
      return;
    }

    // Persist to Supabase
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Build working_hours JSON keyed by 3-letter day
        const dayKeys: Record<string, string> = {
          Monday: "mon", Tuesday: "tue", Wednesday: "wed", Thursday: "thu",
          Friday: "fri", Saturday: "sat", Sunday: "sun",
        };
        const working_hours: Record<string, { open: string; close: string } | null> = {};
        workingHours.forEach(d => {
          working_hours[dayKeys[d.day]] = d.enabled ? { open: d.open, close: d.close } : null;
        });

        // Upsert clinic
        const { data: clinic } = await supabase
          .from("reva_clinics")
          .upsert({
            owner_id: user.id,
            name: clinicInfo.name || "My Clinic",
            phone: clinicInfo.phone,
            whatsapp_number: whatsappNum,
            address: clinicInfo.city,
            greeting_message: greeting,
            working_hours,
            updated_at: new Date().toISOString(),
          }, { onConflict: "owner_id" })
          .select("id")
          .single();

        // Insert doctors
        if (clinic?.id) {
          const validDoctors = doctors.filter(d => d.name.trim());
          if (validDoctors.length > 0) {
            await supabase.from("reva_doctors").upsert(
              validDoctors.map(d => ({
                clinic_id: clinic.id,
                name: d.name.trim(),
                specialization: d.specialty.trim() || null,
              }))
            );
          }
        }
      }
    } catch (e) {
      console.error("Onboarding save error:", e);
    }

    onComplete();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-cyan-500/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-violet-500/20 blur-3xl"
        />
      </div>

      <AnimatedCheck />

      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Reva is live! 🚀
        </h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Your AI receptionist is ready. Share your WhatsApp number with
          patients and Reva handles the rest.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 flex flex-col gap-1 items-center text-center">
          <Building2 size={18} className="text-cyan-400" />
          <p className="text-xs text-slate-400 mt-1">Clinic</p>
          <p className="text-sm text-white font-medium truncate w-full text-center">
            {clinicInfo.name || "Your Clinic"}
          </p>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 flex flex-col gap-1 items-center text-center">
          <Clock size={18} className="text-violet-400" />
          <p className="text-xs text-slate-400 mt-1">Hours</p>
          <p className="text-sm text-white font-medium">{hoursLabel}</p>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 flex flex-col gap-1 items-center text-center">
          <Users size={18} className="text-emerald-400" />
          <p className="text-xs text-slate-400 mt-1">Doctors</p>
          <p className="text-sm text-white font-medium">
            {doctors.filter((d) => d.name).length || 1} added
          </p>
        </div>
      </div>

      <button
        onClick={handleGo}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        Go to Dashboard <ChevronRight size={18} />
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // State
  const [clinicType, setClinicType] = useState("GP");
  const [clinicInfo, setClinicInfo] = useState({
    name: "",
    city: "",
    phone: "",
    doctorCount: "1",
  });
  const [whatsappNum, setWhatsappNum] = useState("");
  const [verified, setVerified] = useState(false);
  const [workingHours, setWorkingHours] = useState<DayConfig[]>(defaultDays);
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: crypto.randomUUID(), name: "", specialty: "" },
  ]);
  const [greeting, setGreeting] = useState(defaultGreeting);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && localStorage.getItem("reva_onboarded")) {
      onComplete();
    }
  }, [onComplete]);

  if (!mounted) return null;

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS));
  };
  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSkip = async () => {
    localStorage.setItem("reva_onboarded", "true");
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      onComplete();
      return;
    }
    // Save whatever partial data we have so far
    if (clinicInfo.name) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("reva_clinics").upsert({
            owner_id: user.id,
            name: clinicInfo.name || "My Clinic",
            phone: clinicInfo.phone,
            whatsapp_number: whatsappNum,
            updated_at: new Date().toISOString(),
          }, { onConflict: "owner_id" });
        }
      } catch (e) {
        console.error("Skip save error:", e);
      }
    }
    onComplete();
  };

  const canProceed = () => {
    if (step === 5) return doctors.some((d) => d.name.trim().length > 0);
    return true;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1 clinicType={clinicType} setClinicType={setClinicType} />
        );
      case 2:
        return (
          <Step2 clinicInfo={clinicInfo} setClinicInfo={setClinicInfo} />
        );
      case 3:
        return (
          <Step3
            whatsappNum={whatsappNum}
            setWhatsappNum={setWhatsappNum}
            verified={verified}
            setVerified={setVerified}
          />
        );
      case 4:
        return (
          <Step4
            workingHours={workingHours}
            setWorkingHours={setWorkingHours}
          />
        );
      case 5:
        return <Step5 doctors={doctors} setDoctors={setDoctors} />;
      case 6:
        return (
          <Step6
            greeting={greeting}
            setGreeting={setGreeting}
            clinicName={clinicInfo.name}
          />
        );
      case 7:
        return (
          <Step7
            clinicInfo={clinicInfo}
            workingHours={workingHours}
            doctors={doctors}
            greeting={greeting}
            whatsappNum={whatsappNum}
            onComplete={onComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-[#080d1f] border border-white/[0.1] rounded-3xl max-w-2xl w-full shadow-2xl shadow-black/60 overflow-hidden"
      >
        {/* Progress bar */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: STEPS }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i + 1 === step ? 24 : 10,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className={`h-2.5 rounded-full ${
                  i + 1 <= step
                    ? "bg-gradient-to-r from-cyan-500 to-violet-600"
                    : "bg-white/10"
                }`}
              />
            ))}
            <span className="ml-auto text-xs text-slate-500">
              {step}/{STEPS}
            </span>
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 py-5 min-h-[420px] flex flex-col relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="flex-1 flex flex-col"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation */}
        {step < 7 && (
          <div className="px-6 pb-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              {step > 1 ? (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-slate-400 text-sm hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/[0.05]"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={goNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
            <button
              onClick={handleSkip}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors text-center"
            >
              Skip setup
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
