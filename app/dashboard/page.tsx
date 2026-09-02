"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, MessageSquare, BarChart3,
  Settings, Bell, TrendingUp, AlertCircle,
  Send, Check, X, ChevronLeft, ChevronRight, Search,
  Plus, Users, Activity,
  CreditCard, ListOrdered, FileText, GitMerge, Shield,
  Clock, Star, LogOut, Zap
} from "lucide-react";
import PatientsView from "@/components/PatientsView";
import BillingView from "@/components/BillingView";
import QueueView from "@/components/QueueView";
import FollowUpView from "@/components/FollowUpView";
import NoShowView from "@/components/NoShowView";
import PrescriptionView from "@/components/PrescriptionView";
import LabReportsView from "@/components/LabReportsView";
import ReferralView from "@/components/ReferralView";
import ConsentView from "@/components/ConsentView";
import AvailabilityView from "@/components/AvailabilityView";
import DepositsView from "@/components/DepositsView";
import ReviewsView from "@/components/ReviewsView";
import MessagesView from "@/components/MessagesView";
import { DashboardProvider, useDashboard } from "@/lib/dashboard-context";
import { updateAppointment } from "@/lib/api";
import type { RevaAppointment } from "@/lib/supabase/types";
import OnboardingWizard from "@/components/OnboardingWizard";
import DoctorBrief from "@/components/DoctorBrief";
import BriefButton from "@/components/BriefButton";

/* ─── Types ─── */
type View = "Dashboard" | "Calendar" | "Messages" | "Analytics" | "Settings" | "Notifications" | "Patients" | "Billing" | "Queue" | "Follow-Up" | "No-Show" | "Prescriptions" | "Lab Reports" | "Referrals" | "Consent" | "Availability" | "Deposits" | "Reviews";
type AppointmentStatus = "Confirmed" | "Pending" | "Cancelled";

interface Appointment {
  time: string; name: string; initials: string;
  avatarColor: string; type: string; status: AppointmentStatus;
}
interface Conversation {
  id: number; name: string; initials: string; avatarColor: string;
  preview: string; time: string; unread?: number;
}
interface Toast { id: number; message: string; type: "success" | "info" | "warn"; }
interface Notification { id: number; text: string; sub: string; time: string; read: boolean; icon: string; }

/* ─── Data ─── */
const APPOINTMENTS_INIT: Appointment[] = [
  { time: "10:30 AM", name: "Priya Sharma",  initials: "PS", avatarColor: "bg-teal-700", type: "General Checkup",       status: "Confirmed" },
  { time: "11:00 AM", name: "Rahul Gupta",   initials: "RG", avatarColor: "bg-[#00685f]", type: "Follow-up",             status: "Confirmed" },
  { time: "11:30 AM", name: "Ananya Nair",   initials: "AN", avatarColor: "bg-emerald-700", type: "Dental Cleaning",       status: "Pending"   },
  { time: "12:00 PM", name: "Vikram Patel",  initials: "VP", avatarColor: "bg-[#005049]", type: "Consultation",          status: "Confirmed" },
  { time: "2:30 PM",  name: "Sunita Rao",    initials: "SR", avatarColor: "bg-slate-700", type: "Blood Pressure Check",  status: "Confirmed" },
  { time: "3:00 PM",  name: "Karan Mehta",   initials: "KM", avatarColor: "bg-rose-700", type: "General Checkup",       status: "Cancelled" },
  { time: "3:30 PM",  name: "Deepa Singh",   initials: "DS", avatarColor: "bg-teal-800", type: "X-Ray Review",          status: "Pending"   },
];

const CONVERSATIONS_PREVIEW: Conversation[] = [
  { id: 1, name: "Priya Sharma", initials: "PS", avatarColor: "bg-[#00685f]", preview: "Thanks! See you at 10:30", time: "9:42 AM" },
  { id: 2, name: "Rahul Gupta", initials: "RG", avatarColor: "bg-teal-700", preview: "Can I reschedule to...", time: "9:15 AM", unread: 1 },
  { id: 3, name: "Meera Joshi", initials: "MJ", avatarColor: "bg-emerald-700", preview: "What are your timings on...", time: "Yesterday", unread: 2 },
];

const NOTIFICATIONS_INIT: Notification[] = [
  { id: 1, text: "New booking from Priya Sharma", sub: "Checkup — Tomorrow 10:30 AM", time: "2 min ago", read: false, icon: "📅" },
  { id: 2, text: "Missed call recovered", sub: "Meera Joshi was auto-replied via WhatsApp", time: "18 min ago", read: false, icon: "📞" },
  { id: 3, text: "No-show alert", sub: "Karan Mehta didn't confirm — slot marked available", time: "1 hr ago", read: false, icon: "⚠️" },
  { id: 4, text: "Recall campaign ready", sub: "87 patients due for 6-month dental recall", time: "3 hrs ago", read: true, icon: "📢" },
  { id: 5, text: "Rahul Gupta wants to reschedule", sub: "Reply needed — tap to open chat", time: "Today 9:15 AM", read: true, icon: "💬" },
];

const WEEKLY_CHART = [
  { day: "Mon", value: 22 }, { day: "Tue", value: 28 }, { day: "Wed", value: 31 },
  { day: "Thu", value: 25 }, { day: "Fri", value: 35 }, { day: "Sat", value: 18 }, { day: "Sun", value: 8 },
];
const TOP_SERVICES = [
  { name: "General Checkup", count: 142, pct: 88 },
  { name: "Dental Cleaning", count: 98,  pct: 61 },
  { name: "Blood Pressure",  count: 76,  pct: 47 },
  { name: "Consultation",    count: 61,  pct: 38 },
  { name: "X-Ray Review",    count: 34,  pct: 21 },
];

const NAV_ITEMS: { icon: React.ElementType; label: View; badge?: number }[] = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Calendar,        label: "Calendar" },
  { icon: MessageSquare,   label: "Messages",       badge: 3 },
  { icon: Users,           label: "Patients" },
  { icon: ListOrdered,     label: "Queue" },
  { icon: CreditCard,      label: "Billing" },
  { icon: Send,            label: "Follow-Up" },
  { icon: AlertCircle,     label: "No-Show" },
  { icon: Activity,        label: "Prescriptions" },
  { icon: FileText,        label: "Lab Reports" },
  { icon: GitMerge,        label: "Referrals" },
  { icon: Shield,          label: "Consent" },
  { icon: Clock,           label: "Availability" },
  { icon: CreditCard,      label: "Deposits" },
  { icon: Star,            label: "Reviews" },
  { icon: BarChart3,       label: "Analytics" },
  { icon: Bell,            label: "Notifications",  badge: 3 },
  { icon: Settings,        label: "Settings" },
];

/* ─── Helpers ─── */
function Avatar({ initials, color, size = "sm" }: { initials: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-10 h-10 text-sm" : size === "md" ? "w-8 h-8 text-xs" : "w-7 h-7 text-[10px]";
  return (
    <div className={`${sz} rounded-full ${color} flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, string> = {
    Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending:   "bg-amber-50 text-amber-700 border-amber-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center justify-center w-[88px] h-[26px] text-xs rounded-full border font-bold text-center tracking-wide shrink-0 ${map[status]}`}>
      {status}
    </span>
  );
}

function ToastStack({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold bg-white ${
              t.type === "success" ? "border-emerald-300 text-emerald-800"
              : t.type === "warn" ? "border-amber-300 text-amber-800"
              : "border-[#00685f]/30 text-[#00685f]"}`}
          >
            {t.type === "success" ? <Check className="w-4 h-4 text-emerald-600" />
              : t.type === "warn" ? <AlertCircle className="w-4 h-4 text-amber-600" />
              : <Zap className="w-4 h-4 text-[#00685f]" />}
            {t.message}
            <button onClick={() => remove(t.id)} className="ml-1 opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Views ─── */
const BRIEF_SUBMITTED = ["Priya Sharma", "Ananya Nair", "Deepa Singh"];

function mapRealAppointment(a: RevaAppointment): Appointment {
  const name = (a.patient as { name: string } | null)?.name ?? "Patient";
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  return {
    time: a.appointment_time.slice(0, 5),
    name,
    initials,
    avatarColor: "bg-[#00685f]",
    type: a.type,
    status: a.status as AppointmentStatus,
    _id: a.id,
  } as Appointment & { _id: string };
}

function DashboardView({ addToast, setActiveView }: { addToast: (msg: string, type: Toast["type"]) => void; setActiveView: (v: View) => void }) {
  const { appointments: realAppts, refresh } = useDashboard();
  const [appts, setAppts] = useState<(Appointment & { _id?: string })[]>(APPOINTMENTS_INIT);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [recallSent, setRecallSent] = useState(false);
  const [filter, setFilter] = useState<"All" | AppointmentStatus>("All");
  const [briefPatient, setBriefPatient] = useState<Appointment | null>(null);

  useEffect(() => {
    if (realAppts.length > 0) {
      setAppts(realAppts.map(mapRealAppointment));
    }
  }, [realAppts]);

  const updateStatus = (idx: number, status: AppointmentStatus) => {
    const appt = appts[idx] as Appointment & { _id?: string };
    setAppts(prev => prev.map((a, i) => i === idx ? { ...a, status } : a));
    setExpandedIdx(null);
    addToast(
      status === "Confirmed" ? "Appointment confirmed ✓" :
      status === "Cancelled" ? "Appointment cancelled" : "Status updated",
      status === "Confirmed" ? "success" : status === "Cancelled" ? "warn" : "info"
    );
    if (appt._id) {
      updateAppointment(appt._id, { status }).then(() => refresh()).catch(() => {});
    }
  };

  const sendReminder = (name: string) => {
    addToast(`WhatsApp reminder sent to ${name} ✓`, "info");
    setExpandedIdx(null);
  };

  const filtered = appts.filter(a => filter === "All" || a.status === filter);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Dashboard Overview</h2>
        <p className="text-sm text-slate-500 mt-0.5">Real-time clinic metrics, today&apos;s schedule, and AI agent operations.</p>
      </div>

      {/* Bento KPI Cards — Daily Operations Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">New Enquiries</span>
            <MessageSquare className="w-4 h-4 text-[#00685f]" />
          </div>
          <p className="text-3xl font-bold text-[#0F172A] mb-1">28</p>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14% today via WhatsApp</span>
          </div>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Booked Consultations</span>
            <Calendar className="w-4 h-4 text-[#00685f]" />
          </div>
          <p className="text-3xl font-bold text-[#00685f] mb-1">18</p>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% automated by AI</span>
          </div>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Confirmations</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-amber-700 mb-1">4</p>
          <span className="text-xs text-slate-500">Awaiting patient slot selection</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Staff Follow-ups Required</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-bold text-rose-600 mb-1">3</p>
          <div className="flex items-center gap-1 text-xs text-rose-700 font-semibold">
            <span>Escalations for Coordinator</span>
          </div>
        </div>
      </div>

      {/* 2-Column Schedule & Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Today's Appointments (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#CCD5DF] rounded-xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#CCD5DF] flex items-center justify-between bg-[#F8FAFC]">
            <h3 className="font-bold text-base text-[#0F172A]">Today&apos;s Appointments</h3>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#CCD5DF]">
              {(["All", "Confirmed", "Pending", "Cancelled"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    filter === f ? "bg-[#00685f] text-white shadow-xs" : "text-slate-500 hover:text-[#0F172A]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#CCD5DF]">
            {filtered.map((appt) => {
              const realIdx = appts.indexOf(appt);
              const isOpen = expandedIdx === realIdx;
              return (
                <div key={appt.name + appt.time} className="hover:bg-slate-50 transition-colors">
                  <div
                    onClick={() => setExpandedIdx(isOpen ? null : realIdx)}
                    className="p-4 flex items-center justify-between cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="tabular-nums font-mono text-slate-500 font-bold w-18 shrink-0">{appt.time}</span>
                      <Avatar initials={appt.initials} color={appt.avatarColor} />
                      <div className="min-w-0">
                        <p className="font-bold text-[#0F172A] truncate">{appt.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{appt.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <StatusBadge status={appt.status} />
                      <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#F8FAFC] border-t border-[#CCD5DF] p-3 flex flex-wrap items-center gap-2"
                      >
                        <button
                          onClick={() => updateStatus(realIdx, "Confirmed")}
                          className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                        >
                          <Check size={12} /> Confirm
                        </button>
                        <button
                          onClick={() => updateStatus(realIdx, "Cancelled")}
                          className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-lg hover:bg-rose-100 flex items-center gap-1"
                        >
                          <X size={12} /> Cancel
                        </button>
                        <button
                          onClick={() => sendReminder(appt.name)}
                          className="px-3 py-1.5 bg-white border border-[#CCD5DF] text-[#00685f] text-xs font-bold rounded-lg hover:bg-slate-50 flex items-center gap-1"
                        >
                          <Send size={12} /> Send WhatsApp Reminder
                        </button>
                        <BriefButton
                          patientName={appt.name}
                          submitted={BRIEF_SUBMITTED.includes(appt.name)}
                          onViewBrief={() => setBriefPatient(appt)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: WhatsApp Recent Chats (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#CCD5DF] rounded-xl shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#CCD5DF] pb-3">
            <h3 className="font-bold text-base text-[#0F172A]">Recent WhatsApp Chats</h3>
            <span className="text-[11px] font-bold text-[#00685f] bg-[#00685f]/10 px-2 py-0.5 rounded-full">
              3 unread
            </span>
          </div>

          <div className="space-y-2.5">
            {CONVERSATIONS_PREVIEW.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveView("Messages")}
                className="p-3 bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar initials={c.initials} color={c.avatarColor} />
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-[#0F172A] truncate">{c.name}</p>
                      <span className="text-[10px] text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.preview}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recall Campaign Card */}
          <div className="pt-4 border-t border-[#CCD5DF] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-bold text-[#0F172A]">Dental Recall Automation</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              87 patients due for 6-month checkups ready for automated WhatsApp dispatch.
            </p>
            <button
              onClick={() => {
                setRecallSent(true);
                addToast("Recall campaign sent to 87 patients ✓", "success");
              }}
              disabled={recallSent}
              className="w-full py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {recallSent ? "Campaign Dispatched ✓" : "Launch Recall Campaign"}
            </button>
          </div>
        </div>
      </div>

      {/* Brief Drawer */}
      <AnimatePresence>
        {briefPatient && (
          <DoctorBrief
            patient={{
              name: briefPatient.name,
              initials: briefPatient.initials,
              avatarColor: briefPatient.avatarColor,
              appointmentType: briefPatient.type,
              time: briefPatient.time,
            }}
            onClose={() => setBriefPatient(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Calendar View ─── */
function CalendarView() {
  const today = new Date();
  const [selected, setSelected] = useState(today.getDate());
  const monthName = "April 2026";

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Appointment Calendar</h2>
        <p className="text-sm text-slate-500 mt-0.5">Full clinic scheduling ledger and daily consultation breakdown.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#CCD5DF] pb-3">
            <h3 className="font-bold text-base text-[#0F172A]">{monthName}</h3>
            <div className="flex gap-1">
              <button className="p-1 rounded hover:bg-slate-100 text-slate-500"><ChevronLeft size={16} /></button>
              <button className="p-1 rounded hover:bg-slate-100 text-slate-500"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <span key={d} className="text-[11px] font-bold uppercase tracking-wider text-slate-400 py-1">{d}</span>
            ))}

            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const isSel = day === selected;
              return (
                <button
                  key={day}
                  onClick={() => setSelected(day)}
                  className={`py-3 rounded-lg font-bold text-xs transition-all ${
                    isSel
                      ? "bg-[#00685f] text-white shadow-xs"
                      : "text-[#0F172A] hover:bg-slate-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-base text-[#0F172A]">Appointments on April {selected}</h3>
          <p className="text-xs text-slate-500">6 patients scheduled</p>
          <div className="space-y-2 pt-2">
            {APPOINTMENTS_INIT.slice(0, 4).map((a) => (
              <div key={a.name} className="p-2.5 bg-[#F8FAFC] border border-[#CCD5DF] rounded-lg text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#0F172A]">{a.name}</p>
                  <p className="text-[11px] text-slate-500">{a.time} • {a.type}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Analytics View ─── */
function AnalyticsView() {
  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Clinic Analytics & Performance</h2>
        <p className="text-sm text-slate-500 mt-0.5">Automated patient conversion, revenue recovered, and channel breakdowns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Recovered Revenue</span>
          <p className="text-2xl font-bold text-emerald-700">AED 21,500</p>
          <span className="text-xs text-slate-500">From missed calls this month</span>
        </div>
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Total Bookings</span>
          <p className="text-2xl font-bold text-[#00685f]">312</p>
          <span className="text-xs text-emerald-700 font-bold">↑ 18% this month</span>
        </div>
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Avg AI Response</span>
          <p className="text-2xl font-bold text-[#0F172A]">48 sec</p>
          <span className="text-xs text-[#00685f] font-semibold">24/7 instant response</span>
        </div>
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Patient Retention</span>
          <p className="text-2xl font-bold text-[#0F172A]">87%</p>
          <span className="text-xs text-emerald-700 font-bold">Returned in 3 months</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#0F172A]">Weekly Bookings Breakdown</h3>
          <div className="flex items-end gap-4 h-44 pt-4">
            {WEEKLY_CHART.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-400">{d.value}</span>
                <div
                  className="w-full rounded-t-md bg-[#00685f] transition-all"
                  style={{ height: `${(d.value / 35) * 100}%` }}
                />
                <span className="text-[11px] font-bold text-slate-600">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#0F172A]">Top Procedures & OPD</h3>
          <div className="space-y-3">
            {TOP_SERVICES.map((s) => (
              <div key={s.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-[#0F172A]">
                  <span>{s.name}</span>
                  <span>{s.count}</span>
                </div>
                <div className="h-2 bg-[#F8FAFC] border border-[#CCD5DF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00685f] rounded-full" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Notifications View ─── */
function NotificationsView({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const [notifs, setNotifs] = useState(NOTIFICATIONS_INIT);
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Notifications</h2>
          <p className="text-sm text-slate-500">Live operational alerts and patient triggers.</p>
        </div>
        <button
          onClick={() => { setNotifs(n => n.map(x => ({ ...x, read: true }))); addToast("All marked as read", "info"); }}
          className="text-xs font-bold text-[#00685f] hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-white border border-[#CCD5DF] rounded-xl divide-y divide-[#CCD5DF] shadow-xs">
        {notifs.map((n) => (
          <div key={n.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="text-lg">{n.icon}</span>
              <div>
                <p className="font-bold text-[#0F172A]">{n.text}</p>
                <p className="text-[11px] text-slate-500">{n.sub}</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-400">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Settings View ─── */
function SettingsView({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const [form, setForm] = useState({
    clinicName: "Dr. Sharma's Clinic",
    phone: "+971 50 123 4567",
    whatsapp: "+971 50 123 4567",
    email: "dr.sharma@revaclinic.ae",
    city: "Dubai",
    openTime: "09:00",
    closeTime: "18:00",
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Clinic Settings</h2>
        <p className="text-sm text-slate-500">Manage clinic profile, WhatsApp routing, and doctor schedules.</p>
      </div>

      <div className="bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-sm text-[#0F172A]">Clinic Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-500 mb-1">Clinic Name</label>
            <input
              value={form.clinicName}
              onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-500 mb-1">City</label>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-500 mb-1">Official WhatsApp</label>
            <input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-500 mb-1">Clinic Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
            />
          </div>
        </div>

        <button
          onClick={() => addToast("Settings saved successfully ✓", "success")}
          className="mt-4 px-5 py-2.5 bg-[#00685f] hover:bg-[#005049] text-white font-bold rounded-lg shadow-xs"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ─── Main Shell Component ─── */
function DashboardPageInner() {
  const [activeView, setActiveView] = useState<View>("Dashboard");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastId, setToastId] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { clinic } = useDashboard();

  const addToast = (message: string, type: Toast["type"]) => {
    const id = toastId + 1;
    setToastId(id);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  return (
    <div className="flex h-screen bg-[#f7f9fb] text-[#0F172A] antialiased overflow-hidden font-sans">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-[#CCD5DF] bg-white z-20">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#CCD5DF] flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <img src="/reva-icon.png" alt="Reva AI" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-base text-[#0F172A] leading-tight">Reva AI</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dr. Sharma&apos;s Clinic</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map(({ icon: Icon, label, badge }) => {
            const active = activeView === label;
            return (
              <button
                key={label}
                onClick={() => setActiveView(label)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? "bg-[#00685f]/10 text-[#00685f] font-bold"
                    : "text-slate-600 hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
              >
                <Icon size={16} className={active ? "text-[#00685f]" : "text-slate-400"} />
                <span className="truncate">{label}</span>
                {badge && !active && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00685f]/10 text-[#00685f]">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Status Card */}
        <div className="p-4 border-t border-[#CCD5DF] bg-[#F8FAFC]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> AI Agent Live
            </span>
            <button
              onClick={() => addToast("Logged out", "info")}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-[#CCD5DF] px-8 flex items-center justify-between shrink-0 z-10">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients, prescriptions, reports..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView("Notifications")}
              className="w-9 h-9 rounded-lg bg-white border border-[#CCD5DF] flex items-center justify-center text-slate-500 hover:text-[#00685f] hover:border-[#00685f] transition-colors"
            >
              <Bell size={15} />
            </button>
            <button
              onClick={() => addToast("New appointment added", "success")}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Plus size={14} /> Add Appointment
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 surgical-scroll bg-[#f7f9fb]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === "Dashboard"     && <DashboardView addToast={addToast} setActiveView={setActiveView} />}
              {activeView === "Calendar"      && <CalendarView />}
              {activeView === "Messages"      && <MessagesView addToast={addToast} />}
              {activeView === "Patients"      && <PatientsView addToast={addToast} />}
              {activeView === "Queue"         && <QueueView addToast={addToast} />}
              {activeView === "Billing"       && <BillingView addToast={addToast} />}
              {activeView === "Follow-Up"     && <FollowUpView addToast={addToast} />}
              {activeView === "No-Show"       && <NoShowView addToast={addToast} />}
              {activeView === "Prescriptions" && <PrescriptionView addToast={addToast} />}
              {activeView === "Lab Reports"  && <LabReportsView addToast={addToast} />}
              {activeView === "Referrals"    && <ReferralView addToast={addToast} />}
              {activeView === "Consent"      && <ConsentView addToast={addToast} />}
              {activeView === "Availability" && <AvailabilityView addToast={addToast} />}
              {activeView === "Deposits"     && <DepositsView addToast={addToast} />}
              {activeView === "Reviews"      && <ReviewsView clinicId={clinic?.id ?? ""} />}
              {activeView === "Analytics"     && <AnalyticsView />}
              {activeView === "Notifications" && <NotificationsView addToast={addToast} />}
              {activeView === "Settings"      && <SettingsView addToast={addToast} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <ToastStack toasts={toasts} remove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard onComplete={() => { setShowOnboarding(false); addToast("Reva is live! 🚀", "success"); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardPageInner />
    </DashboardProvider>
  );
}
