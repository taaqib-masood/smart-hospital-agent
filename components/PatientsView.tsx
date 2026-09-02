"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Phone,
  Copy,
  MessageCircle,
  Calendar,
  Plus,
  Clock,
  Activity,
} from "lucide-react";

interface PatientsViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

interface Patient {
  id: number;
  name: string;
  initials: string;
  phone: string;
  age: number;
  gender: "M" | "F";
  lastVisit: string;
  nextAppt?: string;
  totalVisits: number;
  status: "Active" | "Inactive" | "New";
  conditions: string[];
  notes: string;
  history: { date: string; type: string; doctor: string; notes: string }[];
}

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 1,
    name: "Priya Sharma",
    initials: "PS",
    phone: "+971 50 123 4567",
    age: 34,
    gender: "F",
    lastVisit: "Dec 15, 2025",
    nextAppt: "Dec 31, 10:30 AM",
    totalVisits: 12,
    status: "Active",
    conditions: ["Hypertension", "Diabetes"],
    notes:
      "Patient is managing hypertension well with current medication. BP readings have been stable over the last three months. Monitor potassium levels at next visit due to diuretic use.",
    history: [
      { date: "Dec 15, 2025", type: "Follow-up", doctor: "Dr. Mehta", notes: "BP 128/82. Medication adjusted." },
    ],
  },
  {
    id: 2,
    name: "Rahul Gupta",
    initials: "RG",
    phone: "+971 55 234 5678",
    age: 28,
    gender: "M",
    lastVisit: "Dec 18, 2025",
    nextAppt: "Jan 2, 11:00 AM",
    totalVisits: 4,
    status: "Active",
    conditions: ["Asthma"],
    notes:
      "Patient experiences seasonal asthma flares, especially in winter months. Currently on Salbutamol inhaler as needed.",
    history: [
      { date: "Dec 18, 2025", type: "Follow-up", doctor: "Dr. Iyer", notes: "Lung function improved. Inhaler use reduced." },
    ],
  },
  {
    id: 3,
    name: "Ananya Nair",
    initials: "AN",
    phone: "+971 52 345 6789",
    age: 41,
    gender: "F",
    lastVisit: "Dec 10, 2025",
    nextAppt: "Dec 31, 11:30 AM",
    totalVisits: 7,
    status: "Active",
    conditions: [],
    notes:
      "No chronic conditions currently on record. Patient visits regularly for preventive health checkups.",
    history: [
      { date: "Dec 10, 2025", type: "General Checkup", doctor: "Dr. Mehta", notes: "Vitals normal. Thyroid normal." },
    ],
  },
  {
    id: 4,
    name: "Vikram Patel",
    initials: "VP",
    phone: "+971 58 456 7890",
    age: 55,
    gender: "M",
    lastVisit: "Dec 20, 2025",
    nextAppt: "Dec 31, 12:00 PM",
    totalVisits: 19,
    status: "Active",
    conditions: ["Diabetes", "Cholesterol"],
    notes:
      "Long-term diabetic patient with well-controlled LDL on statins. Recent HbA1c was 7.1. Advised to increase physical activity and reduce refined carbohydrates.",
    history: [
      { date: "Dec 20, 2025", type: "Blood Test Review", doctor: "Dr. Kapoor", notes: "LDL 98. HbA1c 7.1. Statin continued." },
    ],
  },
];

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-200",
  New: "bg-[#00685f]/10 text-[#00685f] border-[#00685f]/20",
};

export default function PatientsView({ addToast }: PatientsViewProps) {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Inactive" | "New">("All");
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "notes">("overview");
  const [noteContent, setNoteContent] = useState(INITIAL_PATIENTS[0]?.notes || "");
  const [noteDirty, setNoteDirty] = useState(false);

  const selectedPatient = patients.find((p) => p.id === selectedId);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search) ||
        p.conditions.some((c) => c.toLowerCase().includes(search.toLowerCase()));
      if (!matchSearch) return false;
      if (filter !== "All" && p.status !== filter) return false;
      return true;
    });
  }, [patients, search, filter]);

  const handleSelectPatient = (p: Patient) => {
    setSelectedId(p.id);
    setNoteContent(p.notes);
    setNoteDirty(false);
  };

  const handleCopyPhone = () => {
    if (!selectedPatient) return;
    navigator.clipboard.writeText(selectedPatient.phone);
    addToast("Phone number copied to clipboard", "success");
  };

  const handleSaveNote = () => {
    if (!selectedPatient) return;
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? { ...p, notes: noteContent } : p))
    );
    setNoteDirty(false);
    addToast("Clinical note saved ✓", "success");
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Patient Directory & CRM</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Unified medical history, appointment logs, and clinical communication dossiers.
          </p>
        </div>
        <button
          onClick={() => {
            const newP: Patient = {
              id: Date.now(),
              name: "New Patient",
              initials: "NP",
              phone: "+971 50 999 8888",
              age: 30,
              gender: "F",
              lastVisit: "Today",
              totalVisits: 1,
              status: "New",
              conditions: ["Routine Checkup"],
              notes: "Initial consultation intake.",
              history: [{ date: "Today", type: "New Registration", doctor: "Dr. Sharma", notes: "First visit dossier created." }],
            };
            setPatients((prev) => [newP, ...prev]);
            setSelectedId(newP.id);
            addToast("New patient dossier created ✓", "success");
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
        >
          <Plus size={14} /> Add Patient
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-5 bg-white border border-[#CCD5DF] rounded-xl overflow-hidden shadow-xs flex flex-col">
          <div className="p-4 border-b border-[#CCD5DF] space-y-3 bg-[#F8FAFC]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, phone or condition..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
              />
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-[#CCD5DF]">
              {(["All", "Active", "Inactive", "New"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${
                    filter === tab
                      ? "bg-white text-[#00685f] shadow-xs"
                      : "text-slate-600 hover:text-[#0F172A]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#CCD5DF] overflow-y-auto flex-1">
            {filtered.map((p) => {
              const isSelected = p.id === selectedId;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPatient(p)}
                  className={`p-4 cursor-pointer transition-colors flex items-center justify-between border-l-4 ${
                    isSelected
                      ? "bg-[#00685f]/[0.04] border-l-[#00685f]"
                      : "border-l-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#00685f]/15 text-[#00685f] font-bold text-xs flex items-center justify-center shrink-0">
                      {p.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0F172A] truncate">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.phone}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${STATUS_COLORS[p.status]}`}>
                      {p.status}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">{p.totalVisits} visits</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#CCD5DF] rounded-xl overflow-hidden shadow-xs flex flex-col">
          {selectedPatient ? (
            <>
              <div className="p-6 border-b border-[#CCD5DF] bg-[#F8FAFC]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#00685f] text-white font-bold text-base flex items-center justify-center shrink-0">
                      {selectedPatient.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[#0F172A]">{selectedPatient.name}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${STATUS_COLORS[selectedPatient.status]}`}>
                          {selectedPatient.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>{selectedPatient.gender === "M" ? "Male" : "Female"}, {selectedPatient.age} yrs</span>
                        <span>•</span>
                        <button onClick={handleCopyPhone} className="flex items-center gap-1 hover:text-[#00685f]">
                          <Phone size={12} /> {selectedPatient.phone} <Copy size={10} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addToast(`WhatsApp chat opened with ${selectedPatient.name}`, "success")}
                      className="px-3 py-1.5 bg-[#00685f] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 hover:bg-[#005049]"
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mt-6 border-b border-[#CCD5DF] -mb-6">
                  {(["overview", "history", "notes"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 text-xs font-bold capitalize border-b-2 transition-all ${
                        activeTab === tab
                          ? "border-[#00685f] text-[#00685f]"
                          : "border-transparent text-slate-500 hover:text-[#0F172A]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Chronic Conditions</h4>
                      <div className="flex gap-2 flex-wrap">
                        {selectedPatient.conditions.length > 0 ? (
                          selectedPatient.conditions.map((c) => (
                            <span key={c} className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-md">
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No chronic ailments recorded</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Upcoming Appointment</span>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A] mt-1">
                          <Calendar size={14} className="text-[#00685f]" />
                          <span>{selectedPatient.nextAppt || "None Scheduled"}</span>
                        </div>
                      </div>
                      <div className="bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Lifetime Visits</span>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A] mt-1">
                          <Activity size={14} className="text-[#00685f]" />
                          <span>{selectedPatient.totalVisits} Consultations</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Visit Timeline</h4>
                    <div className="space-y-3">
                      {selectedPatient.history.map((h, i) => (
                        <div key={i} className="p-3.5 bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl text-xs space-y-1">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-[#0F172A]">{h.type}</span>
                            <span className="text-slate-500 font-normal">{h.date}</span>
                          </div>
                          <p className="text-slate-600">{h.doctor} • {h.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "notes" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Doctor Clinical Notes</h4>
                      {noteDirty && (
                        <button
                          onClick={handleSaveNote}
                          className="px-3 py-1 bg-[#00685f] text-white text-xs font-bold rounded-md hover:bg-[#005049]"
                        >
                          Save Changes
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={6}
                      value={noteContent}
                      onChange={(e) => {
                        setNoteContent(e.target.value);
                        setNoteDirty(true);
                      }}
                      className="w-full p-4 bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f] leading-relaxed"
                      placeholder="Type clinical consultation notes here..."
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center flex-1">
              <Users size={32} className="mb-2 text-slate-300" />
              Select a patient from the left directory to view full profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
