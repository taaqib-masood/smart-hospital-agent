"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Zap,
  Plus,
  X,
  Smartphone,
  Printer,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Send,
  Pill,
  Stethoscope
} from "lucide-react";

interface PrescriptionViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

type DosageOption = "Once daily" | "Twice daily" | "Thrice daily" | "SOS" | "At bedtime";
type TimingOption = "Before meals" | "After meals" | "With meals" | "Empty stomach";
type DurationUnit = "days" | "weeks" | "months";

interface Medicine {
  id: string;
  name: string;
  dosage: DosageOption;
  timing: TimingOption;
  duration: string;
  durationUnit: DurationUnit;
  instructions: string;
}

interface PatientInfo {
  name: string;
  age: number;
  lastVisit: string;
  bloodGroup: string;
  allergies: string[];
}

interface RecentRx {
  id: string;
  patient: string;
  date: string;
  diagnosis: string;
  medicineCount: number;
}

const MEDICINE_LIST = [
  "Paracetamol 500mg",
  "Amoxicillin 500mg",
  "Metformin 500mg",
  "Amlodipine 5mg",
  "Atorvastatin 10mg",
  "Omeprazole 20mg",
  "Cetirizine 10mg",
  "Azithromycin 500mg",
  "Ibuprofen 400mg",
  "Pantoprazole 40mg",
  "Montelukast 10mg",
  "Dolo 650",
];

const TEST_SUGGESTIONS = [
  "CBC",
  "LFT",
  "RFT",
  "HbA1c",
  "Lipid Profile",
  "TSH",
  "Blood Sugar Fasting",
  "Urine Routine",
  "Chest X-Ray",
  "ECG",
];

const DIAGNOSIS_SUGGESTIONS = [
  "Viral Fever with Upper Respiratory Symptoms",
  "Hypertension Follow-up / Routine Review",
  "Type 2 Diabetes Mellitus - Glycemic Control",
  "Acute Bronchitis & Allergic Rhinitis",
];

const FOLLOWUP_OPTIONS = [
  "3 days",
  "1 week",
  "2 weeks",
  "1 month",
  "3 months",
  "As needed",
];

const DOSAGE_OPTIONS: DosageOption[] = [
  "Once daily",
  "Twice daily",
  "Thrice daily",
  "SOS",
  "At bedtime",
];

const TIMING_OPTIONS: TimingOption[] = [
  "Before meals",
  "After meals",
  "With meals",
  "Empty stomach",
];

const PATIENTS: PatientInfo[] = [
  { name: "Priya Sharma", age: 34, lastVisit: "12 Apr", bloodGroup: "B+", allergies: ["Sulfa Drugs"] },
  { name: "Rahul Gupta", age: 45, lastVisit: "28 Mar", bloodGroup: "O+", allergies: [] },
  { name: "Ananya Nair", age: 29, lastVisit: "05 Apr", bloodGroup: "A+", allergies: ["Penicillin"] },
  { name: "Vikram Patel", age: 52, lastVisit: "18 Apr", bloodGroup: "AB+", allergies: ["Aspirin"] },
  { name: "Sunita Rao", age: 61, lastVisit: "02 Apr", bloodGroup: "O-", allergies: [] },
];

const RECENT_RX: RecentRx[] = [
  { id: "rx-1", patient: "Priya Sharma", date: "Today", diagnosis: "Viral Upper Resp Infection", medicineCount: 3 },
  { id: "rx-2", patient: "Rahul Gupta", date: "Yesterday", diagnosis: "Hypertension Stage 1", medicineCount: 2 },
  { id: "rx-3", patient: "Vikram Patel", date: "22 Apr", diagnosis: "Post-op Dental Extraction", medicineCount: 4 },
];

function genId() {
  return "med-" + Math.random().toString(36).substring(2, 9);
}

export default function PrescriptionView({ addToast }: PrescriptionViewProps) {
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(PATIENTS[0]);
  const [patientSearch, setPatientSearch] = useState("");
  const [diagnosis, setDiagnosis] = useState("Viral Fever with mild congestion");
  const [showDiagChips, setShowDiagChips] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: genId(),
      name: "Paracetamol 500mg",
      dosage: "Thrice daily",
      timing: "After meals",
      duration: "5",
      durationUnit: "days",
      instructions: "Take with warm water",
    },
    {
      id: genId(),
      name: "Cetirizine 10mg",
      dosage: "At bedtime",
      timing: "After meals",
      duration: "3",
      durationUnit: "days",
      instructions: "Causes mild drowsiness",
    },
  ]);

  const [tests, setTests] = useState<string[]>(["CBC"]);
  const [testInput, setTestInput] = useState("");
  const [advice, setAdvice] = useState("Adequate hydration, warm saline gargles 3x daily, and light diet.");
  const [followUp, setFollowUp] = useState("5 days");

  const addMedicine = useCallback(() => {
    setMedicines((prev) => [
      ...prev,
      {
        id: genId(),
        name: "",
        dosage: "Once daily",
        timing: "After meals",
        duration: "5",
        durationUnit: "days",
        instructions: "",
      },
    ]);
  }, []);

  const updateMedicine = useCallback((id: string, updated: Partial<Medicine>) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
  }, []);

  const removeMedicine = useCallback((id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addTest = (t: string) => {
    if (t && !tests.includes(t)) {
      setTests((prev) => [...prev, t]);
    }
    setTestInput("");
  };

  const removeTest = (t: string) => {
    setTests((prev) => prev.filter((x) => x !== t));
  };

  const handleSendWhatsApp = () => {
    if (!selectedPatient) {
      addToast("Please select a patient first", "warn");
      return;
    }
    addToast(`Digital Prescription (PDF) dispatched to ${selectedPatient.name} via WhatsApp ✓`, "success");
  };

  const handlePrint = () => {
    addToast("Generating print preview...", "info");
    window.print();
  };

  const filteredPatients = PATIENTS.filter((p) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Digital Rx & E-Prescriptions</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Rapid drug search, smart dosage schedules, instant drug-interaction guard, and WhatsApp PDF dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#CCD5DF] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Printer size={14} /> Print Rx
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Smartphone size={14} /> Dispatch via WhatsApp
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Rx Builder (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Patient Selector */}
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Select Patient
            </label>
            <div className="flex flex-wrap gap-2">
              {filteredPatients.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedPatient(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedPatient?.name === p.name
                      ? "bg-[#00685f] text-white border-[#00685f] shadow-xs"
                      : "bg-[#F8FAFC] border-[#CCD5DF] text-slate-700 hover:bg-white"
                  }`}
                >
                  {p.name} ({p.age}y)
                </button>
              ))}
            </div>

            {selectedPatient && (
              <div className="flex items-center gap-3 pt-3 border-t border-[#CCD5DF] text-xs">
                <span className="font-bold text-[#0F172A]">{selectedPatient.name}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Blood Group: {selectedPatient.bloodGroup}</span>
                <span className="text-slate-400">•</span>
                {selectedPatient.allergies.length > 0 ? (
                  <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                    Allergy Alert: {selectedPatient.allergies.join(", ")}
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium">No Known Drug Allergies (NKDA)</span>
                )}
              </div>
            )}
          </div>

          {/* Clinical Diagnosis Card */}
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Diagnosis / Clinical Findings
              </label>
              <button
                onClick={() => setShowDiagChips(!showDiagChips)}
                className="text-xs font-bold text-[#00685f] flex items-center gap-1 hover:underline"
              >
                <Zap size={12} /> AI Suggest
              </button>
            </div>

            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Upper Respiratory Infection"
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
            />

            {showDiagChips && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {DIAGNOSIS_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setDiagnosis(s); setShowDiagChips(false); }}
                    className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold rounded-md hover:bg-emerald-100"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Medicines Builder */}
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#CCD5DF] pb-3">
              <h3 className="text-sm font-bold text-[#0F172A]">Prescribed Medications ({medicines.length})</h3>
              <button
                onClick={addMedicine}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs"
              >
                <Plus size={12} /> Add Drug
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, index) => (
                <div
                  key={med.id}
                  className="p-3.5 bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl space-y-2.5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#00685f]/15 text-[#00685f] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      list="meds-list"
                      value={med.name}
                      onChange={(e) => updateMedicine(med.id, { name: e.target.value })}
                      placeholder="Search or enter medicine name..."
                      className="flex-1 px-3 py-1.5 bg-white border border-[#CCD5DF] rounded-lg font-bold text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                    />
                    <button
                      onClick={() => removeMedicine(med.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Dosage</span>
                      <select
                        value={med.dosage}
                        onChange={(e) => updateMedicine(med.id, { dosage: e.target.value as DosageOption })}
                        className="w-full px-2 py-1.5 bg-white border border-[#CCD5DF] rounded-md font-medium text-slate-700 text-xs focus:outline-none focus:border-[#00685f]"
                      >
                        {DOSAGE_OPTIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Timing</span>
                      <select
                        value={med.timing}
                        onChange={(e) => updateMedicine(med.id, { timing: e.target.value as TimingOption })}
                        className="w-full px-2 py-1.5 bg-white border border-[#CCD5DF] rounded-md font-medium text-slate-700 text-xs focus:outline-none focus:border-[#00685f]"
                      >
                        {TIMING_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Duration</span>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={med.duration}
                          onChange={(e) => updateMedicine(med.id, { duration: e.target.value })}
                          className="w-14 px-2 py-1.5 bg-white border border-[#CCD5DF] rounded-md text-xs font-bold text-center text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                        />
                        <select
                          value={med.durationUnit}
                          onChange={(e) => updateMedicine(med.id, { durationUnit: e.target.value as DurationUnit })}
                          className="flex-1 px-2 py-1.5 bg-white border border-[#CCD5DF] rounded-md font-medium text-slate-700 text-xs focus:outline-none focus:border-[#00685f]"
                        >
                          <option value="days">days</option>
                          <option value="weeks">weeks</option>
                          <option value="months">months</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <datalist id="meds-list">
              {MEDICINE_LIST.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>

          {/* Investigations & Follow-Up Advice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Recommended Lab Tests
              </label>
              <div className="flex flex-wrap gap-1.5">
                {tests.map((t) => (
                  <span key={t} className="px-2.5 py-1 bg-[#00685f]/10 border border-[#00685f]/20 text-[#00685f] text-xs font-bold rounded-md flex items-center gap-1">
                    {t}
                    <button onClick={() => removeTest(t)} className="text-slate-400 hover:text-slate-700"><X size={12} /></button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {TEST_SUGGESTIONS.filter((s) => !tests.includes(s)).slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => addTest(s)}
                    className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Follow-Up Scheduling
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {FOLLOWUP_OPTIONS.slice(0, 6).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setFollowUp(opt)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      followUp === opt
                        ? "bg-[#00685f] text-white border-[#00685f] shadow-xs"
                        : "bg-[#F8FAFC] border-[#CCD5DF] text-slate-600 hover:bg-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Digital Rx Sheet Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs space-y-4 font-sans text-xs">
            {/* Header */}
            <div className="border-b border-[#CCD5DF] pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00685f] uppercase tracking-wider">Reva Medical Clinic • Dubai</span>
                <span className="text-[10px] font-bold text-slate-400">Rx-2026-0092</span>
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mt-0.5">Dr. Priya Sharma</h3>
              <p className="text-[11px] text-slate-500">MBBS, MD (Internal Medicine) • DHA License: DHA-DR-2024-88412</p>
            </div>

            {/* Patient Bar */}
            <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#CCD5DF]">
              <div className="flex justify-between font-bold text-[#0F172A]">
                <span>{selectedPatient?.name || "Patient Name"}</span>
                <span>{selectedPatient?.age || 34} Y / {selectedPatient?.bloodGroup}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Date: {new Date().toLocaleDateString("en-AE")}</p>
            </div>

            {/* Diagnosis */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Diagnosis</span>
              <p className="font-bold text-[#0F172A]">{diagnosis || "Clinical Diagnosis"}</p>
            </div>

            {/* Rx Drugs */}
            <div className="space-y-2 border-t border-[#CCD5DF] pt-3">
              <span className="text-[10px] font-bold text-[#00685f] uppercase tracking-wider block mb-1">℞ Prescribed Medicines</span>
              {medicines.map((med, i) => (
                <div key={med.id} className="pb-1.5">
                  <p className="font-bold text-[#0F172A]">{i + 1}. {med.name || "Medicine Name"}</p>
                  <p className="text-[11px] text-slate-500">{med.dosage} • {med.timing} • {med.duration} {med.durationUnit}</p>
                </div>
              ))}
            </div>

            {/* Tests & Advice */}
            {tests.length > 0 && (
              <div className="border-t border-[#CCD5DF] pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Investigations</span>
                <p className="text-[#0F172A] font-medium">{tests.join(", ")}</p>
              </div>
            )}

            <div className="border-t border-[#CCD5DF] pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">General Advice</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">{advice}</p>
            </div>

            {/* Signature Area */}
            <div className="pt-6 border-t border-[#CCD5DF] flex justify-between items-end text-[11px]">
              <div>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                  <CheckCircle size={10} /> Digitally Signed
                </span>
              </div>
              <div className="text-right">
                <div className="h-6 flex items-end justify-end text-[#00685f] font-serif italic text-sm">
                  Dr. P. Sharma
                </div>
                <p className="text-[10px] text-slate-400">Dr. Priya Sharma</p>
              </div>
            </div>
          </div>

          {/* Quick Dispatches */}
          <button
            onClick={handleSendWhatsApp}
            className="w-full py-3 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Smartphone size={14} /> Send WhatsApp PDF to {selectedPatient?.name}
          </button>
        </div>
      </div>
    </div>
  );
}
