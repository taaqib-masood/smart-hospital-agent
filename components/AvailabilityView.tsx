"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Plus,
  Calendar as CalendarIcon,
  Check,
  X,
  Coffee,
  Sun,
  AlertCircle
} from "lucide-react";
import { createAvailabilityException, createAvailabilityRule, deleteAvailabilityException, deleteAvailabilityRule, getAvailability, type AvailabilityWorkspace } from "@/lib/api";

interface AvailabilityViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

type SlotStatus = "available" | "blocked" | "booked" | "lunch";

interface TimeSlot {
  time: string;
  label: string;
  status: SlotStatus;
  patient?: string;
  exceptionId?: string;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const INITIAL_SLOTS: TimeSlot[] = [
  { time: "09:00", label: "09:00 AM", status: "booked", patient: "Priya Sharma" },
  { time: "09:30", label: "09:30 AM", status: "booked", patient: "Rahul Gupta" },
  { time: "10:00", label: "10:00 AM", status: "available" },
  { time: "10:30", label: "10:30 AM", status: "available" },
  { time: "11:00", label: "11:00 AM", status: "booked", patient: "Ananya Nair" },
  { time: "11:30", label: "11:30 AM", status: "available" },
  { time: "12:00", label: "12:00 PM", status: "available" },
  { time: "12:30", label: "12:30 PM", status: "available" },
  { time: "13:00", label: "01:00 PM", status: "lunch" },
  { time: "13:30", label: "01:30 PM", status: "lunch" },
  { time: "14:00", label: "02:00 PM", status: "blocked" },
  { time: "14:30", label: "02:30 PM", status: "available" },
  { time: "15:00", label: "03:00 PM", status: "available" },
  { time: "15:30", label: "03:30 PM", status: "booked", patient: "Sunita Rao" },
  { time: "16:00", label: "04:00 PM", status: "available" },
  { time: "16:30", label: "04:30 PM", status: "available" },
  { time: "17:00", label: "05:00 PM", status: "available" },
  { time: "17:30", label: "05:30 PM", status: "available" },
];

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function isoDate(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().split("T")[0];
}

function addMinutes(time: string, minutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export default function AvailabilityView({ addToast }: AvailabilityViewProps) {
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(isoDate(now));
  const [visibleMonth, setVisibleMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [slots, setSlots] = useState<TimeSlot[]>(isDemoMode ? INITIAL_SLOTS : []);
  const [workingDays, setWorkingDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  const [doctors, setDoctors] = useState<AvailabilityWorkspace["doctors"]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityWorkspace["rules"]>([]);

  const loadAvailability = async (date = selectedDate, doctorId = selectedDoctorId) => {
    if (isDemoMode) return;
    const workspace = await getAvailability(date, doctorId || undefined);
    setDoctors(workspace.doctors);
    setAvailabilityRules(workspace.rules);
    const nextDoctorId = doctorId || workspace.doctors[0]?.id || "";
    if (!doctorId && nextDoctorId) setSelectedDoctorId(nextDoctorId);
    setWorkingDays([...new Set(workspace.rules.filter(rule => !rule.doctor_id || rule.doctor_id === nextDoctorId).map(rule => DAYS_OF_WEEK[rule.weekday]))]);
    setSlots(workspace.slots.map(slot => ({
      time: slot.time,
      label: new Date(`2000-01-01T${slot.time}:00`).toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" }),
      status: slot.status,
      patient: slot.patient ?? undefined,
      exceptionId: slot.exception_id ?? undefined,
    })));
  };

  useEffect(() => {
    // Initial server synchronization for the availability workspace.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAvailability().catch(error => addToast(error instanceof Error ? error.message : "Could not load availability", "warn"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isDemoMode && selectedDoctorId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAvailability(selectedDate, selectedDoctorId).catch(error => addToast(error instanceof Error ? error.message : "Could not load availability", "warn"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedDoctorId]);

  const availableCount = slots.filter((s) => s.status === "available").length;
  const bookedCount = slots.filter((s) => s.status === "booked").length;
  const blockedCount = slots.filter((s) => s.status === "blocked").length;

  const toggleSlotStatus = async (time: string) => {
    if (!isDemoMode) {
      const slot = slots.find(item => item.time === time);
      if (!slot || !selectedDoctorId) return;
      try {
        if (slot.status === "blocked" && slot.exceptionId) {
          await deleteAvailabilityException(slot.exceptionId);
        } else if (slot.status === "available") {
          await createAvailabilityException({
            doctor_id: selectedDoctorId,
            exception_date: selectedDate,
            start_time: time,
            end_time: addMinutes(time, 30),
            reason: "Blocked by receptionist",
          });
        }
        await loadAvailability();
        addToast("Slot availability updated ✓", "info");
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Could not update slot", "warn");
      }
      return;
    }
    setSlots((prev) =>
      prev.map((s) => {
        if (s.time === time) {
          if (s.status === "available") return { ...s, status: "blocked" };
          if (s.status === "blocked") return { ...s, status: "available" };
        }
        return s;
      })
    );
    addToast("Slot availability updated ✓", "info");
  };

  const handleBlockAllAfternoon = async () => {
    if (!isDemoMode && selectedDoctorId) {
      try {
        await createAvailabilityException({ doctor_id: selectedDoctorId, exception_date: selectedDate, start_time: "14:00", end_time: "18:00", reason: "Afternoon blocked" });
        await loadAvailability();
        addToast("Afternoon slots blocked", "warn");
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Could not block afternoon", "warn");
      }
      return;
    }
    setSlots((prev) =>
      prev.map((s) => {
        const hour = parseInt(s.time.split(":")[0]);
        if (hour >= 14 && s.status === "available") {
          return { ...s, status: "blocked" };
        }
        return s;
      })
    );
    addToast("Afternoon slots blocked for emergency OT ✓", "warn");
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Doctor Schedule & Slot Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure consultation timings, 1-tap slot blocking, lunch hours, and sync with WhatsApp booking engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isDemoMode && doctors.length > 0 && (
            <select
              value={selectedDoctorId}
              onChange={event => setSelectedDoctorId(event.target.value)}
              className="px-3 py-2 bg-white border border-[#CCD5DF] text-slate-700 text-xs font-bold rounded-lg"
            >
              {doctors.map(doctor => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
            </select>
          )}
          <button
            onClick={handleBlockAllAfternoon}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#CCD5DF] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Lock size={13} /> Block Afternoon
          </button>
        </div>
      </div>

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Open Slots Today</span>
          <p className="text-2xl font-bold text-[#00685f]">{availableCount}</p>
          <span className="text-xs text-emerald-700 font-bold">Bookable via WhatsApp</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Booked Consultations</span>
          <p className="text-2xl font-bold text-[#0F172A]">{bookedCount}</p>
          <span className="text-xs text-slate-500">Scheduled patients</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Blocked / Leave</span>
          <p className="text-2xl font-bold text-amber-700">{blockedCount}</p>
          <span className="text-xs text-slate-500">Reserved / Surgery</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">OPD Schedule</span>
          <p className="text-2xl font-bold text-[#0F172A]">{isDemoMode ? "09:00 - 18:00" : "Configured"}</p>
          <span className="text-xs text-[#00685f] font-semibold">{workingDays.length} active day{workingDays.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Calendar Month & Days (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#CCD5DF] pb-3">
            <h3 className="font-bold text-base text-[#0F172A]">{visibleMonth.toLocaleDateString("en-AE", { month: "long", year: "numeric" })}</h3>
            <div className="flex gap-1">
                <button onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} className="p-1 rounded hover:bg-slate-100 text-slate-500"><ChevronLeft size={16} /></button>
                <button onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))} className="p-1 rounded hover:bg-slate-100 text-slate-500"><ChevronRight size={16} /></button>
              </div>
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {DAYS_OF_WEEK.map((d) => (
                <span key={d} className="text-[11px] font-bold uppercase tracking-wider text-slate-400 py-1">{d}</span>
              ))}

              {Array.from({ length: visibleMonth.getDay() }).map((_, index) => (
                <span key={`empty-${index}`} aria-hidden="true" />
              ))}

              {Array.from({ length: new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                const date = i + 1;
                const cellDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), date);
                const cellIso = isoDate(cellDate);
                const isSelected = selectedDate === cellIso;

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(cellIso)}
                    className={`py-2.5 rounded-lg font-bold text-xs transition-all ${
                      isSelected
                        ? "bg-[#00685f] text-white shadow-xs"
                        : "text-[#0F172A] hover:bg-slate-100"
                    }`}
                  >
                    {date}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Working Days Config */}
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0F172A]">Weekly Clinic Operational Days</h3>
            <div className="flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                const active = workingDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (isDemoMode) {
                        setWorkingDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
                        addToast(`${day} schedule updated`, "info");
                        return;
                      }
                      const weekday = DAYS_OF_WEEK.indexOf(day);
                      const existing = availabilityRules.filter(rule => rule.weekday === weekday && rule.doctor_id === selectedDoctorId);
                      const operation = existing.length
                        ? Promise.all(existing.map(rule => deleteAvailabilityRule(rule.id)))
                        : createAvailabilityRule({ doctor_id: selectedDoctorId, weekday, start_time: "09:00", end_time: "18:00", slot_minutes: 30 });
                      operation.then(() => loadAvailability()).then(() => addToast(`${day} schedule updated`, "info")).catch(error => addToast(error instanceof Error ? error.message : "Could not update schedule", "warn"));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                        : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Slot Grid for Selected Date (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#CCD5DF] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">
                  Schedule for {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-AE", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </h3>
                <p className="text-xs text-slate-500">Tap any available slot to block / unblock instantly.</p>
              </div>

              <span className="text-xs font-bold text-[#00685f] bg-[#00685f]/10 border border-[#00685f]/20 px-2.5 py-1 rounded-full">
                {availableCount} Slots Open
              </span>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {slots.map((slot) => {
                const isBooked = slot.status === "booked";
                const isLunch = slot.status === "lunch";
                const isBlocked = slot.status === "blocked";
                const isAvailable = slot.status === "available";

                return (
                  <button
                    key={slot.time}
                    disabled={isBooked || isLunch}
                    onClick={() => toggleSlotStatus(slot.time)}
                    className={`p-3 rounded-xl border text-left transition-all text-xs ${
                      isBooked
                        ? "bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed"
                        : isLunch
                        ? "bg-amber-50/50 border-amber-200 text-amber-800 cursor-not-allowed"
                        : isBlocked
                        ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                        : "bg-white border-[#CCD5DF] hover:border-[#00685f] hover:bg-teal-50/30 text-[#0F172A]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{slot.label}</span>
                      {isBooked && <Check size={12} className="text-emerald-600" />}
                      {isLunch && <Coffee size={12} className="text-amber-600" />}
                      {isBlocked && <Lock size={12} className="text-rose-600" />}
                    </div>
                    <span className="text-[11px] block truncate">
                      {isBooked ? slot.patient : isLunch ? "Lunch Break" : isBlocked ? "Blocked" : "Available"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
