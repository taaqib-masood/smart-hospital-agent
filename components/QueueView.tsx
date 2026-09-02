"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Users,
  Clock,
  Send,
  ChevronUp,
  X,
  Check,
  Pause,
  Play,
  AlertTriangle,
  TrendingDown,
  BarChart2,
  Copy,
  Printer,
  MessageCircle,
  Plus
} from "lucide-react";

interface QueueViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

interface Patient {
  id: string;
  name: string;
  initials: string;
  waitMins: number;
  type: string;
}

const INITIAL_QUEUE: Patient[] = [
  { id: "1", name: "Priya Sharma", initials: "PS", waitMins: 12, type: "General" },
  { id: "2", name: "Rahul Gupta", initials: "RG", waitMins: 20, type: "Follow-up" },
  { id: "3", name: "Ananya Nair", initials: "AN", waitMins: 28, type: "Consultation" },
  { id: "4", name: "Vikram Mehta", initials: "VM", waitMins: 35, type: "General" },
  { id: "5", name: "Sneha Patel", initials: "SP", waitMins: 42, type: "Follow-up" },
];

const NO_SHOW_RISKS = [
  {
    name: "Arun Krishnan",
    risk: 78,
    reasons: ["Booked 3 weeks ago", "Cancelled before", "Monday 9AM slot"],
  },
  {
    name: "Meera Joshi",
    risk: 63,
    reasons: ["No-show history", "Long gap since last visit"],
  },
];

export default function QueueView({ addToast }: QueueViewProps) {
  const [queue, setQueue] = useState<Patient[]>(INITIAL_QUEUE);
  const [paused, setPaused] = useState(false);
  const [callingId, setCallingId] = useState<string | null>(null);
  const [notifyAhead, setNotifyAhead] = useState(true);
  const [notifyLate, setNotifyLate] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [addName, setAddName] = useState("");
  const [addType, setAddType] = useState("General");
  const [showAddForm, setShowAddForm] = useState(false);

  const callNext = () => {
    if (!queue.length) return;
    const next = queue[0];
    setCallingId(next.id);
    addToast(`Calling ${next.name}… WhatsApp notification sent ✓`, "success");
    setTimeout(() => {
      setQueue((prev) => prev.slice(1));
      setCallingId(null);
    }, 1500);
  };

  const removePatient = (id: string) => {
    setQueue((prev) => prev.filter((p) => p.id !== id));
    addToast("Patient removed from queue", "warn");
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setQueue((prev) => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  };

  const addPatient = () => {
    if (!addName.trim()) return;
    const initials = addName
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
    const newPat: Patient = {
      id: Date.now().toString(),
      name: addName.trim(),
      initials,
      waitMins: (queue.length + 1) * 7 + 5,
      type: addType,
    };
    setQueue((prev) => [...prev, newPat]);
    setAddName("");
    setShowAddForm(false);
    addToast(`${addName.trim()} added to queue`, "success");
  };

  const copyLink = () => {
    navigator.clipboard?.writeText("https://reva.ae/queue/dr-sharma").catch(() => {});
    addToast("Public live queue link copied!", "info");
  };

  const sendBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    addToast("Broadcast update sent to all waiting patients ✓", "success");
    setBroadcastMsg("");
  };

  function Toggle({ val, onToggle, label }: { val: boolean; onToggle: () => void; label: string }) {
    return (
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-bold text-slate-700">{label}</span>
        <button
          onClick={onToggle}
          className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 flex items-center ${
            val ? "bg-[#00685f]" : "bg-slate-200"
          }`}
          style={{ height: "22px", width: "40px" }}
        >
          <motion.div
            animate={{ x: val ? 20 : 2 }}
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
            className="w-4 h-4 rounded-full bg-white shadow-xs"
          />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Live Waiting Room & Queue</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Real-time patient flow management, SMS/WhatsApp broadcast, and no-show prediction.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00685f] animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Current Waiting Queue</h3>
                <p className="text-xs text-slate-500">{queue.length} Patients • Avg 18m wait</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={callNext}
                disabled={!queue.length || !!callingId}
                className="px-4 py-2 bg-[#00685f] hover:bg-[#005049] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check size={14} /> {callingId ? "Calling..." : "Call Next"}
              </button>
              <button
                onClick={() => {
                  setPaused((v) => !v);
                  addToast(paused ? "Queue resumed" : "Queue paused", paused ? "success" : "warn");
                }}
                className={`px-3 py-2 border rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  paused ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-white border-[#CCD5DF] text-slate-700 hover:bg-slate-50"
                }`}
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
                {paused ? "Resume" : "Pause"}
              </button>
            </div>
          </div>

          {/* Queue List Container */}
          <div className="bg-white border border-[#CCD5DF] rounded-xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-[auto_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-[#F8FAFC] border-b border-[#CCD5DF] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>#</span>
              <span>Patient</span>
              <span>Type</span>
              <span>Est. Wait</span>
              <span className="text-right">Action</span>
            </div>

            <div className="divide-y divide-[#CCD5DF]">
              <AnimatePresence initial={false}>
                {queue.map((patient, idx) => {
                  const isNext = idx === 0;
                  return (
                    <motion.div
                      key={patient.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className={`grid grid-cols-[auto_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3.5 items-center text-xs transition-colors ${
                        isNext ? "bg-[#00685f]/[0.03]" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-slate-400 font-bold">#{idx + 1}</span>
                        {isNext && (
                          <span className="text-[9px] font-bold text-[#00685f] bg-[#00685f]/10 border border-[#00685f]/20 px-1 rounded ml-1">
                            NEXT
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[#00685f]/15 text-[#00685f] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {patient.initials}
                        </div>
                        <span className="font-bold text-[#0F172A] truncate">{patient.name}</span>
                      </div>

                      <span className="text-slate-600 font-medium">{patient.type}</span>

                      <div className="flex items-center gap-1 text-slate-500 font-medium">
                        <Clock size={12} className="text-slate-400" /> {patient.waitMins}m
                      </div>

                      <div className="flex items-center gap-1.5 justify-end">
                        {isNext ? (
                          <button
                            onClick={callNext}
                            className="p-1.5 rounded-md bg-[#00685f] text-white hover:bg-[#005049] shadow-xs"
                            title="Call Patient Now"
                          >
                            <Check size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => moveUp(idx)}
                            className="p-1.5 rounded-md border border-[#CCD5DF] text-slate-500 hover:text-[#00685f] hover:border-[#00685f] bg-white"
                            title="Move Up"
                          >
                            <ChevronUp size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => removePatient(patient.id)}
                          className="p-1.5 rounded-md border border-[#CCD5DF] text-slate-400 hover:text-rose-600 hover:border-rose-300 bg-white"
                          title="Remove"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {queue.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  The waiting room queue is currently empty.
                </div>
              )}
            </div>
          </div>

          {/* Add to Queue Widget */}
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-4 shadow-xs">
            {showAddForm ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Patient full name..."
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                  />
                  <select
                    value={addType}
                    onChange={(e) => setAddType(e.target.value)}
                    className="px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                  >
                    <option value="General">General</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 border border-[#CCD5DF] text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addPatient}
                    className="px-3.5 py-1.5 bg-[#00685f] text-white text-xs font-bold rounded-lg hover:bg-[#005049] shadow-xs"
                  >
                    Add Patient
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2 border border-dashed border-[#CCD5DF] rounded-lg text-xs font-bold text-slate-600 hover:border-[#00685f] hover:text-[#00685f] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> Walk-in Quick Intake
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Intelligence, QR & WhatsApp Broadcast (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* WhatsApp Broadcast */}
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-[#00685f]" /> WhatsApp Notifications & Broadcast
            </h3>
            <div className="space-y-3">
              <Toggle
                val={notifyAhead}
                onToggle={() => setNotifyAhead((v) => !v)}
                label="Alert patients when 2 ahead in line"
              />
              <Toggle
                val={notifyLate}
                onToggle={() => setNotifyLate((v) => !v)}
                label="Auto 'Delay Alert' if doctor > 20m late"
              />
            </div>

            <div className="pt-3 border-t border-[#CCD5DF] space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Broadcast to Waiting Room
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Doctor is in an emergency surgery..."
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                />
                <button
                  onClick={sendBroadcast}
                  className="px-3 py-1.5 bg-[#00685f] text-white text-xs font-bold rounded-lg hover:bg-[#005049] shadow-xs"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* QR Code TV View Card */}
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-[#00685f]" /> Reception QR & TV Display Link
            </h3>
            <div className="flex items-center gap-4 bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl p-3.5">
              <div className="w-16 h-16 bg-white border border-[#CCD5DF] rounded-lg flex items-center justify-center shrink-0">
                <QrCode className="w-10 h-10 text-[#00685f]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Patient Self-Checkin</p>
                <p className="text-xs font-mono text-slate-700 truncate mt-0.5">reva.ae/queue/dr-sharma</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={copyLink} className="text-xs font-bold text-[#00685f] hover:underline flex items-center gap-1">
                    <Copy size={11} /> Copy URL
                  </button>
                  <button onClick={() => addToast("Poster print preview opened", "info")} className="text-xs font-bold text-slate-600 hover:underline flex items-center gap-1">
                    <Printer size={11} /> Print Poster
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
