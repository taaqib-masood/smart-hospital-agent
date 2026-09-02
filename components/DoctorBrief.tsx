"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Calendar, Pill, AlertTriangle, FileText, ExternalLink, Edit3, Brain } from "lucide-react";
import { useEffect, useState } from "react";

interface DoctorBriefProps {
  patient: {
    name: string;
    initials: string;
    avatarColor: string;
    appointmentType: string;
    time: string;
  };
  onClose: () => void;
}

interface BriefData {
  complaint: string;
  symptoms: string[];
  severity: number;
  severityLabel: string;
  duration: string;
  medications: string;
  allergies: string;
  notes: string;
  submittedAt: string;
  aiAssessment: { condition: string; probability: number; color: string }[];
  lastVisit: { date: string; diagnosis: string; notes: string };
}

function getBriefData(name: string): BriefData {
  if (name === "Priya Sharma") {
    return {
      complaint: "Recurring headache for 3 days, getting worse in the evening",
      symptoms: ["Headache", "Fatigue", "Dizziness", "Nausea"],
      severity: 6,
      severityLabel: "Moderate",
      duration: "2-3 days",
      medications: "Amlodipine 5mg (morning), Metformin 500mg (twice daily)",
      allergies: "Penicillin",
      notes: "Symptoms worsen when looking at screens. Had similar episode 2 months ago.",
      submittedAt: "9:45 AM today",
      aiAssessment: [
        { condition: "Tension Headache", probability: 78, color: "teal" },
        { condition: "Migraine", probability: 45, color: "cyan" },
        { condition: "Hypertension-related", probability: 31, color: "amber" },
      ],
      lastVisit: {
        date: "Nov 15, 2025",
        diagnosis: "Hypertension management",
        notes: "BP 138/88. Continued Amlodipine. Advised low sodium diet.",
      },
    };
  }
  return {
    complaint: "General health check and routine follow-up",
    symptoms: ["Fatigue", "Mild cough"],
    severity: 3,
    severityLabel: "Mild",
    duration: "About a week",
    medications: "None",
    allergies: "None reported",
    notes: "",
    submittedAt: "10:02 AM today",
    aiAssessment: [
      { condition: "Routine Check", probability: 92, color: "teal" },
      { condition: "Viral Infection", probability: 18, color: "amber" },
    ],
    lastVisit: {
      date: "Sep 3, 2025",
      diagnosis: "General checkup",
      notes: "All vitals normal.",
    },
  };
}

function SectionHeader({ label, pulse }: { label: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-2.5">
      <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase whitespace-nowrap">
        {label}
      </span>
      {pulse && (
        <span className="flex items-center gap-1 bg-[#00685f]/10 border border-[#00685f]/20 text-[#00685f] text-[10px] font-semibold px-2 py-0.5 rounded-full">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00685f] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00685f]" />
          </span>
          AI Analysis
        </span>
      )}
      <div className="flex-1 h-px bg-[#CCD5DF]" />
    </div>
  );
}

const severityEmoji = (s: number) => {
  if (s <= 3) return "😌";
  if (s <= 6) return "😟";
  return "😰";
};

export default function DoctorBrief({ patient, onClose }: DoctorBriefProps) {
  const brief = getBriefData(patient.name);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative w-full max-w-xl h-full bg-white border-l border-[#CCD5DF] shadow-2xl flex flex-col overflow-hidden text-[#0F172A]"
        >
          {/* Top Surgical Green Accent */}
          <div className="h-1 w-full bg-[#00685f] flex-shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#CCD5DF] bg-[#F8FAFC] flex-shrink-0">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-slate-500 hover:text-[#0F172A] transition-colors text-xs font-semibold uppercase tracking-wider"
            >
              <X className="w-4 h-4" />
              Close
            </button>
            <span className="text-[#0F172A] text-sm font-bold tracking-tight">Pre-Consultation Brief</span>
            <div className="flex items-center gap-1.5 bg-[#00685f]/10 border border-[#00685f]/20 rounded-md px-2 py-0.5">
              <Brain className="w-3.5 h-3.5 text-[#00685f]" />
              <span className="text-[#00685f] text-xs font-bold">Reva AI</span>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 surgical-scroll">

            {/* Patient identity */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05 }}
              className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#CCD5DF]"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0 shadow-xs"
                style={{ background: patient.avatarColor }}
              >
                {patient.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[#0F172A] text-base font-bold truncate">{patient.name}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-[#00685f]/10 text-[#00685f] rounded-full">
                    {patient.time}
                  </span>
                </div>
                <p className="text-slate-500 text-xs font-medium mt-0.5">
                  {patient.appointmentType}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[#00685f] text-xs font-medium">
                  <Zap className="w-3 h-3" />
                  <span>Submitted {brief.submittedAt}</span>
                </div>
              </div>
            </motion.div>

            {/* Chief Complaint */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
            >
              <SectionHeader label="Chief Complaint" />
              <div className="border-l-3 border-[#00685f] bg-[#F8FAFC] p-3.5 rounded-r-lg border-y border-r border-[#CCD5DF]">
                <p className="text-[#0F172A] text-sm font-semibold italic leading-relaxed">
                  &ldquo;{brief.complaint}&rdquo;
                </p>
              </div>
            </motion.div>

            {/* Symptoms */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 }}
            >
              <SectionHeader label={`Reported Symptoms (${brief.symptoms.length})`} />
              <div className="flex flex-wrap gap-2">
                {brief.symptoms.map((symptom, i) => (
                  <motion.span
                    key={symptom}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={mounted ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold border border-[#00685f]/25 bg-[#00685f]/5 text-[#00685f]"
                  >
                    • {symptom}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Severity */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="bg-white border border-[#CCD5DF] p-4 rounded-xl"
            >
              <SectionHeader label="Pain / Severity Level" />
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{severityEmoji(brief.severity)}</span>
                <span className="text-[#0F172A] text-2xl font-bold">{brief.severity}</span>
                <span className="text-slate-400 text-sm font-semibold">/10</span>
                <span className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {brief.severityLabel}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={mounted ? { width: `${brief.severity * 10}%` } : {}}
                  transition={{ delay: 0.25, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[#00685f] via-amber-500 to-rose-500"
                />
              </div>
            </motion.div>

            {/* Duration */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25 }}
            >
              <SectionHeader label="Symptom Duration" />
              <div className="flex items-center gap-2 text-slate-700 text-sm font-medium bg-[#F8FAFC] p-3 rounded-lg border border-[#CCD5DF]">
                <Calendar className="w-4 h-4 text-[#00685f]" />
                <span>{brief.duration}</span>
              </div>
            </motion.div>

            {/* Medications & Allergies */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <SectionHeader label="Medications & Alerts" />
              <div className="flex items-start gap-2 text-slate-700 text-sm font-medium bg-[#F8FAFC] p-3 rounded-lg border border-[#CCD5DF]">
                <Pill className="w-4 h-4 text-[#00685f] mt-0.5 flex-shrink-0" />
                <span>{brief.medications}</span>
              </div>
              {brief.allergies && brief.allergies !== "None" && brief.allergies !== "None reported" && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>KNOWN ALLERGY: {brief.allergies}</span>
                </div>
              )}
            </motion.div>

            {/* Patient Notes */}
            {brief.notes && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.35 }}
              >
                <SectionHeader label="Patient Notes" />
                <div className="bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl p-3.5">
                  <p className="text-slate-600 text-xs leading-relaxed italic">&ldquo;{brief.notes}&rdquo;</p>
                </div>
              </motion.div>
            )}

            {/* AI Assessment */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
            >
              <SectionHeader label="Differential AI Assessment" pulse />
              <div className="bg-white border border-[#CCD5DF] rounded-xl p-4 space-y-3">
                {brief.aiAssessment.map((item, i) => (
                  <div key={item.condition}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#0F172A] text-xs font-bold">{item.condition}</span>
                      <span className="text-[#00685f] text-xs font-mono font-bold">{item.probability}% match</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={mounted ? { width: `${item.probability}%` } : {}}
                        transition={{ delay: 0.45 + i * 0.12, duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-[#00685f]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Last Visit */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.45 }}
            >
              <SectionHeader label={`Past Record — ${brief.lastVisit.date}`} />
              <div className="bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl p-3.5 space-y-1">
                <p className="text-[#0F172A] text-xs font-bold">{brief.lastVisit.diagnosis}</p>
                <p className="text-slate-500 text-xs leading-relaxed">&ldquo;{brief.lastVisit.notes}&rdquo;</p>
              </div>
            </motion.div>

            <div className="h-2" />
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-[#CCD5DF] bg-[#F8FAFC] flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-[#CCD5DF] text-slate-700 text-xs font-bold rounded-lg py-2.5 transition-all shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Add Clinical Note
            </button>
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg py-2.5 transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Full Dossier
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
