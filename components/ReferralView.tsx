"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  X,
  Search,
  Users,
  Smartphone,
  Hospital
} from "lucide-react";

interface ReferralViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

type ReferralStatus = "Pending" | "Appointment Set" | "Seen" | "Overdue";
type TabId = "sent" | "received" | "network";

interface SentReferral {
  id: string;
  patient: string;
  age: number;
  specialist: string;
  specialty: string;
  date: string;
  status: ReferralStatus;
  outcome: string | null;
  reason: string;
  specialistPhone: string;
}

interface ReceivedReferral {
  id: string;
  patient: string;
  fromDoctor: string;
  reason: string;
  date: string;
  status: "New" | "Booked" | "Seen";
}

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  referrals: number;
  rating: number;
  hospital: string;
  phone: string;
}

const INITIAL_SENT: SentReferral[] = [
  { id: "r1", patient: "Priya Sharma", age: 42, specialist: "Dr. Arjun Mehta", specialty: "Cardiologist", date: "Apr 22", status: "Appointment Set", outcome: null, reason: "Chest pain and palpitations for 2 weeks", specialistPhone: "+971 4 377 5500" },
  { id: "r2", patient: "Rahul Gupta", age: 35, specialist: "Dr. Sneha Patel", specialty: "Endocrinologist", date: "Apr 21", status: "Seen", outcome: "Diabetes management plan given", reason: "Uncontrolled blood sugar levels", specialistPhone: "+971 4 435 9999" },
  { id: "r3", patient: "Ananya Nair", age: 28, specialist: "Dr. Ravi Kumar", specialty: "Orthopedic Surgeon", date: "Apr 20", status: "Pending", outcome: null, reason: "Knee pain post-injury", specialistPhone: "+971 4 519 9999" },
  { id: "r4", patient: "Vikram Patel", age: 55, specialist: "Dr. Priya Nair", specialty: "Neurologist", date: "Apr 19", status: "Seen", outcome: "MRI recommended, follow-up in 4 wks", reason: "Recurrent headaches and dizziness", specialistPhone: "+971 4 414 4444" },
  { id: "r5", patient: "Sunita Rao", age: 61, specialist: "Dr. Arjun Mehta", specialty: "Cardiologist", date: "Apr 18", status: "Seen", outcome: "Echo normal, continue meds", reason: "Routine cardiac evaluation", specialistPhone: "+971 4 377 5500" },
];

const RECEIVED_REFERRALS: ReceivedReferral[] = [
  { id: "rec1", patient: "Raj Verma", fromDoctor: "Dr. Amit Shah", reason: "Post-pulmonology follow-up", date: "Apr 23", status: "New" },
  { id: "rec2", patient: "Kavya Reddy", fromDoctor: "Dr. Ravi Kumar", reason: "Post-ortho rehab check", date: "Apr 22", status: "Booked" },
  { id: "rec3", patient: "Mohan Das", fromDoctor: "Dr. Sneha Patel", reason: "Diabetes complication", date: "Apr 21", status: "Seen" },
];

const SPECIALISTS: Specialist[] = [
  { id: "sp1", name: "Dr. Arjun Mehta", specialty: "Cardiologist", referrals: 14, rating: 4.9, hospital: "American Hospital Dubai, Oud Metha", phone: "+971 4 377 5500" },
  { id: "sp2", name: "Dr. Sneha Patel", specialty: "Endocrinologist", referrals: 11, rating: 4.8, hospital: "Mediclinic City Hospital, DHCC", phone: "+971 4 435 9999" },
  { id: "sp3", name: "Dr. Ravi Kumar", specialty: "Orthopedic Surgeon", referrals: 9, rating: 4.7, hospital: "King's College Hospital, Dubai Hills", phone: "+971 4 519 9999" },
  { id: "sp4", name: "Dr. Priya Nair", specialty: "Neurologist", referrals: 8, rating: 4.9, hospital: "Fakeeh University Hospital, Silicon Oasis", phone: "+971 4 414 4444" },
];

export default function ReferralView({ addToast }: ReferralViewProps) {
  const [sentList, setSentList] = useState<SentReferral[]>(INITIAL_SENT);
  const [receivedList, setReceivedList] = useState<ReceivedReferral[]>(RECEIVED_REFERRALS);
  const [activeTab, setActiveTab] = useState<TabId>("sent");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [patientName, setPatientName] = useState("");
  const [specialistName, setSpecialistName] = useState(SPECIALISTS[0].name);
  const [reason, setReason] = useState("");

  const seenCount = sentList.filter((r) => r.status === "Seen").length;
  const loopRate = Math.round((seenCount / (sentList.length || 1)) * 100);

  const handleCreateReferral = () => {
    if (!patientName.trim()) return;
    const sp = SPECIALISTS.find(s => s.name === specialistName) || SPECIALISTS[0];
    const newRef: SentReferral = {
      id: "ref-" + Date.now(),
      patient: patientName.trim(),
      age: 38,
      specialist: sp.name,
      specialty: sp.specialty,
      date: "Today",
      status: "Pending",
      outcome: null,
      reason: reason.trim() || "Specialist evaluation requested",
      specialistPhone: sp.phone,
    };
    setSentList(prev => [newRef, ...prev]);
    setShowCreateModal(false);
    setPatientName("");
    setReason("");
    addToast(`Referral for ${newRef.patient} dispatched to ${newRef.specialist} via WhatsApp ✓`, "success");
  };

  const handleResend = (ref: SentReferral) => {
    addToast(`Clinical referral note resent to ${ref.specialist} via WhatsApp ✓`, "info");
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Referrals & Specialist Network</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Doctor-to-doctor WhatsApp referrals, bi-directional loop tracking, and clinical consult summaries.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
        >
          <Plus size={14} /> Refer Patient
        </button>
      </div>

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Outbound Referrals</span>
          <p className="text-2xl font-bold text-[#00685f]">{sentList.length}</p>
          <span className="text-xs text-slate-500">Active consult tracks</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Loop Closed Rate</span>
          <p className="text-2xl font-bold text-emerald-700">{loopRate}%</p>
          <span className="text-xs text-emerald-700 font-bold">Consult notes received</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Inbound Referrals</span>
          <p className="text-2xl font-bold text-[#0F172A]">{receivedList.length}</p>
          <span className="text-xs text-slate-500">From peer doctors</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Network Specialists</span>
          <p className="text-2xl font-bold text-[#0F172A]">{SPECIALISTS.length}</p>
          <span className="text-xs text-[#00685f] font-semibold">Verified directory</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#CCD5DF] pb-2">
        <button
          onClick={() => setActiveTab("sent")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "sent" ? "bg-[#00685f] text-white" : "text-slate-600 hover:text-[#0F172A]"
          }`}
        >
          Outbound Referrals ({sentList.length})
        </button>
        <button
          onClick={() => setActiveTab("received")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "received" ? "bg-[#00685f] text-white" : "text-slate-600 hover:text-[#0F172A]"
          }`}
        >
          Inbound Patients ({receivedList.length})
        </button>
        <button
          onClick={() => setActiveTab("network")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "network" ? "bg-[#00685f] text-white" : "text-slate-600 hover:text-[#0F172A]"
          }`}
        >
          Specialist Directory ({SPECIALISTS.length})
        </button>
      </div>

      {activeTab === "sent" && (
        <div className="bg-white border border-[#CCD5DF] rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#CCD5DF] bg-[#F8FAFC]">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, doctor, or condition..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1.5fr_1.5fr_1.5fr_1fr_auto] gap-4 px-6 py-3 bg-[#F8FAFC] border-b border-[#CCD5DF] text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Patient</span>
            <span>Referred To</span>
            <span>Reason</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-[#CCD5DF]">
            {sentList.map((ref) => (
              <div key={ref.id} className="hover:bg-slate-50 transition-colors">
                <div
                  onClick={() => setExpandedId(expandedId === ref.id ? null : ref.id)}
                  className="grid grid-cols-[1.5fr_1.5fr_1.5fr_1fr_auto] gap-4 px-6 py-3.5 items-center cursor-pointer text-xs"
                >
                  <div>
                    <p className="font-bold text-[#0F172A]">{ref.patient}</p>
                    <p className="text-[11px] text-slate-400">{ref.age} yrs • {ref.date}</p>
                  </div>

                  <div>
                    <p className="font-bold text-[#00685f]">{ref.specialist}</p>
                    <p className="text-[11px] text-slate-500">{ref.specialty}</p>
                  </div>

                  <span className="text-slate-600 truncate font-medium">{ref.reason}</span>

                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        ref.status === "Seen"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : ref.status === "Appointment Set"
                          ? "bg-teal-50 text-[#00685f] border-teal-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {ref.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleResend(ref); }}
                      className="px-2.5 py-1 bg-white border border-[#CCD5DF] hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded shadow-xs"
                    >
                      WhatsApp Note
                    </button>
                    {expandedId === ref.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === ref.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-[#F8FAFC] border-t border-[#CCD5DF] px-6 py-3.5 text-xs space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Notes & Outcome</span>
                          <p className="font-medium text-[#0F172A] mt-0.5">{ref.outcome || "Pending specialist consult note"}</p>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">{ref.specialistPhone}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "received" && (
        <div className="bg-white border border-[#CCD5DF] rounded-xl overflow-hidden shadow-xs divide-y divide-[#CCD5DF]">
          {receivedList.map((r) => (
            <div key={r.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
              <div>
                <p className="font-bold text-sm text-[#0F172A]">{r.patient}</p>
                <p className="text-slate-500 mt-0.5">Referred by <span className="font-bold text-[#00685f]">{r.fromDoctor}</span> • {r.date}</p>
                <p className="text-slate-600 mt-1">{r.reason}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {r.status}
                </span>
                <button
                  onClick={() => addToast(`Booking appointment for ${r.patient}`, "success")}
                  className="px-3 py-1.5 bg-[#00685f] hover:bg-[#005049] text-white font-bold rounded-lg shadow-xs"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "network" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SPECIALISTS.map((sp) => (
            <div key={sp.id} className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">{sp.name}</h3>
                  <p className="text-xs font-bold text-[#00685f]">{sp.specialty}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Hospital size={12} /> {sp.hospital}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {sp.rating}
                </div>
              </div>

              <div className="pt-3 border-t border-[#CCD5DF] flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{sp.referrals} referrals shared</span>
                <button
                  onClick={() => {
                    setSpecialistName(sp.name);
                    setShowCreateModal(true);
                  }}
                  className="px-3 py-1.5 bg-[#00685f] hover:bg-[#005049] text-white font-bold rounded-lg shadow-xs flex items-center gap-1"
                >
                  <Send size={12} /> Refer Patient
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#CCD5DF] rounded-xl p-6 w-full max-w-md shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#CCD5DF] pb-3">
                <h3 className="text-base font-bold text-[#0F172A]">Send Specialist Referral</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Referred Specialist
                  </label>
                  <select
                    value={specialistName}
                    onChange={(e) => setSpecialistName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                  >
                    {SPECIALISTS.map((s) => (
                      <option key={s.id} value={s.name}>{s.name} ({s.specialty})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Clinical Reason / Symptoms
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Uncontrolled hypertension with persistent headaches..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#CCD5DF]">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-[#CCD5DF] text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReferral}
                  className="flex-1 py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Dispatch via WhatsApp
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
