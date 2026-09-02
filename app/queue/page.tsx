"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import { QrCode, Clock, Bell, Check, Star, MessageCircle, Phone, ArrowRight } from "lucide-react";

type Phase = "lookup" | "waiting" | "ready" | "done";

function AnimatedNumber({ value }: { value: number }) {
  const motionVal = useMotionValue(value);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 18 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return <>{display}</>;
}

const statusUpdates = [
  { icon: Check, text: "You are checked in and verified", color: "text-[#00685f]", border: "border-emerald-200", bg: "bg-emerald-50" },
  { icon: Bell, text: "We will WhatsApp you automatically when you are 2 ahead", color: "text-amber-800", border: "border-amber-200", bg: "bg-amber-50" },
  { icon: MessageCircle, text: "Feel free to wait in the cafeteria or outside", color: "text-slate-600", border: "border-[#CCD5DF]", bg: "bg-[#F8FAFC]" },
];

export default function QueuePage() {
  const [phase, setPhase] = useState<Phase>("lookup");
  const [patientName, setPatientName] = useState("");
  const [inputName, setInputName] = useState("");
  const [position, setPosition] = useState(3);
  const [totalAhead, setTotalAhead] = useState(3);
  const [estimatedWait, setEstimatedWait] = useState(22);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [rating, setRating] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const readyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate queue moving
  useEffect(() => {
    if (phase !== "waiting") return;

    intervalRef.current = setInterval(() => {
      setPosition((prev) => {
        const next = prev - 1;
        setEstimatedWait((w) => Math.max(0, w - 7));
        if (next <= 0) {
          setPhase("ready");
          clearInterval(intervalRef.current!);
          return 0;
        }
        return next;
      });
    }, 8000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  // Auto-transition ready → done
  useEffect(() => {
    if (phase !== "ready") return;
    readyTimerRef.current = setTimeout(() => setPhase("done"), 30000);
    return () => {
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    };
  }, [phase]);

  const handleLookup = () => {
    if (!inputName.trim()) return;
    setPatientName(inputName.trim());
    setPhase("waiting");
  };

  const handleRating = (val: number) => {
    setRating(val);
    if (val >= 4) setShowReview(true);
  };

  const progressPercent = Math.max(0, Math.min(100, ((22 - estimatedWait) / 22) * 100));

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#0F172A] relative overflow-hidden flex flex-col font-sans">
      <div className="relative z-10 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* ─── PHASE: LOOKUP ─── */}
          {phase === "lookup" && (
            <motion.div
              key="lookup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12"
            >
              <div className="w-full max-w-md bg-white border border-[#CCD5DF] rounded-2xl p-8 shadow-xs text-center space-y-6">
                <div>
                  <span className="text-xs font-bold text-[#00685f] uppercase tracking-widest block mb-1">
                    Dr. Sharma&apos;s Clinic • Live OPD
                  </span>
                  <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                    Check Your Queue Position
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the patient name you used during booking
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl text-center text-lg font-bold text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#00685f]"
                  />

                  <button
                    onClick={handleLookup}
                    className="w-full py-3 bg-[#00685f] hover:bg-[#005049] text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    Track Live Position <ArrowRight size={16} />
                  </button>
                </div>

                <div className="pt-4 border-t border-[#CCD5DF] flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-[#00685f]" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Or scan the physical QR code displayed at reception
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── PHASE: WAITING ─── */}
          {phase === "waiting" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-[#CCD5DF]">
                <div>
                  <span className="text-xs font-bold text-slate-500">Dr. Sharma&apos;s Clinic</span>
                  <h2 className="text-base font-bold text-[#0F172A]">{patientName}</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-emerald-700 text-xs font-bold">Live Synced</span>
                </div>
              </div>

              {/* Big position number */}
              <div className="bg-white border border-[#CCD5DF] rounded-2xl p-8 my-6 text-center shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Patients Ahead of You
                </span>
                <div className="text-8xl font-black text-[#00685f] leading-none my-2">
                  <AnimatedNumber value={position} />
                </div>
                <p className="text-xs font-bold text-slate-600 mt-2">
                  {position === 0 ? "You are next! Please proceed." : `Estimated wait time: ~${estimatedWait} mins`}
                </p>
              </div>

              {/* Visual queue circles */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {Array.from({ length: Math.min(totalAhead, 4) }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold ${
                        i === 0
                          ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                          : "bg-slate-100 border-slate-300 text-slate-500"
                      }`}
                    >
                      {i === 0 ? "1" : i + 1}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">{i === 0 ? "Next" : ""}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-[#00685f] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    You
                  </div>
                  <span className="text-[10px] text-[#00685f] font-bold">Current</span>
                </div>
              </div>

              {/* Status updates */}
              <div className="space-y-2.5 mb-6">
                {statusUpdates.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-medium ${item.border} ${item.bg}`}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                    <span className={item.color}>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Notify toggle button */}
              <button
                onClick={() => setNotifyEnabled((v) => !v)}
                className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  notifyEnabled
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-white border-[#CCD5DF] text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Bell size={14} className={notifyEnabled ? "text-emerald-600" : "text-slate-400"} />
                {notifyEnabled ? "WhatsApp alerts active ✓" : "Enable 2-ahead WhatsApp push alert"}
              </button>
            </motion.div>
          )}

          {/* ─── PHASE: READY ─── */}
          {phase === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center mb-6 shadow-md">
                <Check className="w-12 h-12 text-emerald-700" strokeWidth={3} />
              </div>
              <h1 className="text-3xl font-black text-[#0F172A] mb-2">It&apos;s Your Turn!</h1>
              <p className="text-slate-600 text-base mb-1">Please head to Consultation Room #2</p>
              <p className="text-xs text-slate-400">Dr. Sharma is ready to see you now.</p>
            </motion.div>
          )}

          {/* ─── PHASE: DONE ─── */}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto"
            >
              <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Consultation Completed</h1>
              <p className="text-slate-500 text-xs mb-6">Dr. Sharma&apos;s Clinic • OPD</p>

              <div className="bg-white border border-[#CCD5DF] rounded-2xl p-6 shadow-xs w-full mb-6">
                <p className="text-xs font-bold text-slate-700 mb-3">How was your visit today?</p>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button key={val} onClick={() => handleRating(val)}>
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          val <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {showReview && (
                  <button className="w-full py-2.5 bg-[#00685f] text-white font-bold text-xs rounded-xl shadow-xs">
                    Leave a Google Review
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MessageCircle size={14} className="text-emerald-600" />
                <span>Your digital prescription has been dispatched via WhatsApp</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase !== "done" && (
        <div className="relative z-20 border-t border-[#CCD5DF] bg-white px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Dr. Sharma&apos;s Clinic • Jumeirah Medical District, Dubai</span>
          <span className="flex items-center gap-1">
            <Phone size={12} /> +971 4 345 6789
          </span>
        </div>
      )}
    </div>
  );
}
