"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, MessageSquare, BarChart3,
  Settings, Bell, AlertCircle,
  Send, Check, X, ChevronLeft, ChevronRight, Search,
  Plus, Users,
  CreditCard, Shield,
  Clock, LogOut, Zap, Menu
} from "lucide-react";
import PatientsView from "@/components/PatientsView";
import BillingView from "@/components/BillingView";
import FollowUpView from "@/components/FollowUpView";
import ConsentView from "@/components/ConsentView";
import AvailabilityView from "@/components/AvailabilityView";
import MessagesView from "@/components/MessagesView";
import { DashboardProvider, useDashboard } from "@/lib/dashboard-context";
import { createAppointment, getAnalytics, getAppointments, getAvailability, getClinic, queueAppointmentReminder, updateAppointment, updateClinic, type RevaAnalytics } from "@/lib/api";
import type { RevaAppointment } from "@/lib/supabase/types";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { LanguageProvider } from "@/components/landing/language-provider";
import { usePortalLanguage } from "@/lib/i18n/portal";

/* ─── Types ─── */
type View = "Dashboard" | "Calendar" | "Messages" | "Analytics" | "Settings" | "Notifications" | "Patients" | "Billing" | "Follow-Up" | "Consent" | "Availability";
type AppointmentStatus = "Confirmed" | "Pending" | "Cancelled" | "Completed" | "No-Show";

interface Appointment {
  time: string; name: string; initials: string;
  avatarColor: string; type: string; status: AppointmentStatus;
}
interface Conversation {
  id: string | number; name: string; initials: string; avatarColor: string;
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

const NAV_ITEMS: { icon: React.ElementType; label: View; title?: string; badge?: number }[] = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: MessageSquare,   label: "Messages", title: "WhatsApp Inbox", badge: 3 },
  { icon: Calendar,        label: "Calendar", title: "Appointments" },
  { icon: Users,           label: "Patients", title: "Contacts" },
  { icon: CreditCard,      label: "Billing" },
  { icon: Send,            label: "Follow-Up", title: "Automations" },
  { icon: Shield,          label: "Consent" },
  { icon: Clock,           label: "Availability" },
  { icon: BarChart3,       label: "Analytics" },
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
  const { t } = usePortalLanguage();
  const map: Record<AppointmentStatus, string> = {
    Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending:   "bg-amber-50 text-amber-700 border-amber-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    Completed: "bg-blue-50 text-blue-700 border-blue-200",
    "No-Show": "bg-slate-100 text-slate-700 border-slate-300",
  };
  return (
    <span className={`inline-flex items-center justify-center w-[88px] h-[26px] text-xs rounded-full border font-bold text-center tracking-wide shrink-0 ${map[status]}`}>
      {t(status)}
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
  const { locale, t } = usePortalLanguage();
  const { appointments: realAppts, conversations: realConversations, loading, refresh } = useDashboard();
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const [appts, setAppts] = useState<(Appointment & { _id?: string })[]>(demoMode ? APPOINTMENTS_INIT : []);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [filter, setFilter] = useState<"All" | AppointmentStatus>("All");

  useEffect(() => {
    if (!demoMode && !loading) {
      // Merge remotely loaded appointments into the interactive dashboard list.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAppts(realAppts.map(mapRealAppointment));
    }
  }, [demoMode, loading, realAppts]);

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

  const sendReminder = async (appointment: Appointment & { _id?: string }) => {
    setExpandedIdx(null);
    if (!appointment._id) {
      addToast(`Demo WhatsApp reminder sent to ${appointment.name} ✓`, "info");
      return;
    }
    try {
      const result = await queueAppointmentReminder(appointment._id);
      addToast(
        result.notification === "queued"
          ? `WhatsApp reminder queued for ${appointment.name} ✓`
          : "Approved appointment reminder template is not configured",
        result.notification === "queued" ? "info" : "warn",
      );
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Could not queue reminder", "warn");
    }
  };

  const filtered = appts.filter(a => filter === "All" || a.status === filter);
  const conversations: Conversation[] = demoMode ? CONVERSATIONS_PREVIEW : realConversations.slice(0, 3).map(conversation => {
    const name = conversation.contact_name ?? conversation.contact_phone;
    return {
      id: conversation.id,
      name,
      initials: name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase(),
      avatarColor: "bg-[#00685f]",
      preview: conversation.last_message ?? "No message preview",
      time: new Date(conversation.last_message_at).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" }),
      unread: conversation.unread_count,
    };
  });
  const enquiryCount = demoMode ? 28 : realConversations.length;
  const confirmedCount = demoMode ? 18 : realAppts.filter(item => item.status === "Confirmed").length;
  const pendingCount = demoMode ? 4 : realAppts.filter(item => item.status === "Pending").length;
  const handoffCount = demoMode ? 3 : realConversations.filter(item => !item.is_bot_active).length;
  const unreadCount = demoMode ? 3 : realConversations.reduce((sum, item) => sum + item.unread_count, 0);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">{t("Dashboard Overview")}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{t("Real-time clinic metrics, today's schedule, and AI agent operations.")}</p>
      </div>

      {/* Bento KPI Cards — Daily Operations Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("New Enquiries")}</span>
            <MessageSquare className="w-4 h-4 text-[#00685f]" />
          </div>
          <p className="text-3xl font-bold text-[#0F172A] mb-1">{enquiryCount}</p>
          <span className="text-xs text-slate-500">{t("WhatsApp conversations")}</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("Booked Consultations")}</span>
            <Calendar className="w-4 h-4 text-[#00685f]" />
          </div>
          <p className="text-3xl font-bold text-[#00685f] mb-1">{confirmedCount}</p>
          <span className="text-xs text-slate-500">{t("Confirmed today")}</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("Pending Confirmations")}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-amber-700 mb-1">{pendingCount}</p>
          <span className="text-xs text-slate-500">{t("Awaiting patient slot selection")}</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("Staff Follow-ups Required")}</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-bold text-rose-600 mb-1">{handoffCount}</p>
          <div className="flex items-center gap-1 text-xs text-rose-700 font-semibold">
            <span>{t("Receptionist takeovers")}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Schedule & Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Today's Appointments (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#CCD5DF] rounded-xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#CCD5DF] flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between bg-[#F8FAFC]">
            <h3 className="font-bold text-base text-[#0F172A]">{t("Today's Appointments")}</h3>
            <div className="flex max-w-full items-center gap-1 overflow-x-auto bg-white p-1 rounded-lg border border-[#CCD5DF]">
              {(["All", "Confirmed", "Pending", "Completed", "Cancelled"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    filter === f ? "bg-[#00685f] text-white shadow-xs" : "text-slate-500 hover:text-[#0F172A]"
                  }`}
                >
                  {t(f)}
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
                          <Check size={12} /> {t("Confirm")}
                        </button>
                        <button
                          onClick={() => updateStatus(realIdx, "Cancelled")}
                          className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-lg hover:bg-rose-100 flex items-center gap-1"
                        >
                          <X size={12} /> {t("Cancel")}
                        </button>
                        <button
                          onClick={() => sendReminder(appt)}
                          className="px-3 py-1.5 bg-white border border-[#CCD5DF] text-[#00685f] text-xs font-bold rounded-lg hover:bg-slate-50 flex items-center gap-1"
                        >
                          <Send size={12} /> {t("Send WhatsApp Reminder")}
                        </button>
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
            <h3 className="font-bold text-base text-[#0F172A]">{t("Recent WhatsApp Chats")}</h3>
            <span className="text-[11px] font-bold text-[#00685f] bg-[#00685f]/10 px-2 py-0.5 rounded-full">
              {unreadCount} {t("unread")}
            </span>
          </div>

          <div className="space-y-2.5">
            {conversations.map((c) => (
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

          {/* Automation shortcut */}
          <div className="pt-4 border-t border-[#CCD5DF] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-bold text-[#0F172A]">{t("WhatsApp Automations")}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t("Manage approved follow-up and no-show sequences from one place.")}
            </p>
            <button
              onClick={() => setActiveView("Follow-Up")}
              className="w-full py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              {t("Open Automations")}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ─── Calendar View ─── */
function CalendarView({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const { locale, t } = usePortalLanguage();
  const now = new Date();
  const { patients } = useDashboard();
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const [visibleMonth, setVisibleMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(now.toISOString().split("T")[0]);
  const [appointments, setAppointments] = useState<RevaAppointment[]>([]);
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string }>>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [walkIn, setWalkIn] = useState(false);
  const [draft, setDraft] = useState({ patient_id: "", doctor_id: "", time: "09:00", type: "Consultation" });

  useEffect(() => {
    if (demoMode) return;
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const last = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
    const localDate = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    getAppointments({ from: localDate(first), to: localDate(last) }).then(setAppointments).catch(() => setAppointments([]));
  }, [demoMode, visibleMonth]);

  useEffect(() => {
    if (!demoMode) getAvailability().then(workspace => {
      setDoctors(workspace.doctors);
      setDraft(current => ({ ...current, patient_id: current.patient_id || patients[0]?.id || "", doctor_id: current.doctor_id || workspace.doctors[0]?.id || "" }));
    }).catch(() => setDoctors([]));
  }, [demoMode, patients]);

  const openAppointmentForm = (isWalkIn = false) => {
    setWalkIn(isWalkIn);
    setDraft(current => ({ ...current, type: isWalkIn ? "Walk-in" : "Consultation", time: isWalkIn ? new Date().toTimeString().slice(0, 5) : current.time }));
    setShowAdd(true);
  };

  const addAppointment = async () => {
    if (demoMode) {
      setShowAdd(false);
      addToast(walkIn ? "Demo walk-in registered ✓" : "Demo appointment added ✓", "success");
      return;
    }
    if ((!walkIn && !draft.patient_id) || !draft.doctor_id) {
      addToast(walkIn ? "Select a practitioner for this walk-in" : "Configure a patient contact and practitioner first", "warn");
      return;
    }
    try {
      await createAppointment({ patient_id: draft.patient_id || undefined, doctor_id: draft.doctor_id, appointment_date: selected, appointment_time: draft.time, type: draft.type });
      const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
      const last = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
      const localDate = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0];
      setAppointments(await getAppointments({ from: localDate(first), to: localDate(last) }));
      setShowAdd(false);
      addToast(walkIn ? "Walk-in registered ✓" : "Appointment created ✓", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Could not create appointment", "warn");
    }
  };

  const monthName = visibleMonth.toLocaleDateString(locale, { month: "long", year: "numeric" });
  const dayCount = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const firstWeekday = visibleMonth.getDay();
  const isoForDay = (day: number) => {
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0];
  };
  const selectedAppointments = demoMode
    ? APPOINTMENTS_INIT.slice(0, 4)
    : appointments.filter(appointment => appointment.appointment_date === selected);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">{t("Appointment Calendar")}</h2><p className="text-sm text-slate-500 mt-0.5">{t("Reception scheduling and daily appointment status.")}</p></div>
        <div className="flex gap-2">
          <button onClick={() => openAppointmentForm(true)} className="flex items-center gap-1.5 px-4 py-2 border border-[#00685f] text-[#00685f] text-xs font-bold rounded-lg"><Plus size={14} /> {t("Walk-in")}</button>
          <button onClick={() => openAppointmentForm()} className="flex items-center gap-1.5 px-4 py-2 bg-[#00685f] text-white text-xs font-bold rounded-lg"><Plus size={14} /> {t("Add Appointment")}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#CCD5DF] pb-3">
            <h3 className="font-bold text-base text-[#0F172A]">{monthName}</h3>
            <div className="flex gap-1">
              <button onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} className="p-1 rounded hover:bg-slate-100 text-slate-500"><ChevronLeft size={16} /></button>
              <button onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))} className="p-1 rounded hover:bg-slate-100 text-slate-500"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <span key={d} className="text-[11px] font-bold uppercase tracking-wider text-slate-400 py-1">{new Date(`2026-01-${String(4 + ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(d)).padStart(2, "0")}T12:00:00`).toLocaleDateString(locale, { weekday: "short" })}</span>
            ))}

            {Array.from({ length: firstWeekday }).map((_, index) => <span key={`blank-${index}`} />)}
            {Array.from({ length: dayCount }).map((_, i) => {
              const day = i + 1;
              const dayIso = isoForDay(day);
              const isSel = dayIso === selected;
              const count = demoMode ? (day % 5 === 0 ? 2 : 0) : appointments.filter(item => item.appointment_date === dayIso).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelected(dayIso)}
                  className={`py-3 rounded-lg font-bold text-xs transition-all ${
                    isSel
                      ? "bg-[#00685f] text-white shadow-xs"
                      : "text-[#0F172A] hover:bg-slate-100"
                  }`}
                >
                  <span>{day}</span>{count > 0 && <span className={`block text-[9px] ${isSel ? "text-white/80" : "text-[#00685f]"}`}>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-base text-[#0F172A]">{t("Appointments on")} {new Date(`${selected}T12:00:00`).toLocaleDateString(locale, { month: "long", day: "numeric" })}</h3>
          <p className="text-xs text-slate-500">{selectedAppointments.length} {t("scheduled")}</p>
          <div className="space-y-2 pt-2">
            {selectedAppointments.map((a) => {
              const isReal = "appointment_date" in a;
              const name = isReal ? a.patient?.name ?? "Patient" : a.name;
              const time = isReal ? String(a.appointment_time).slice(0, 5) : a.time;
              const type = isReal ? a.type : a.type;
              const status = a.status;
              return <div key={`${name}-${time}`} className="p-2.5 bg-[#F8FAFC] border border-[#CCD5DF] rounded-lg text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#0F172A]">{name}</p>
                  <p className="text-[11px] text-slate-500">{time} • {type}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-600">{t(status)}</span>
              </div>;
            })}
            {selectedAppointments.length === 0 && <p className="text-xs text-slate-400 py-6 text-center">{t("No appointments recorded for this day.")}</p>}
          </div>
        </div>
      </div>

      {showAdd && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><div className="bg-white border border-[#CCD5DF] rounded-xl p-6 w-full max-w-md space-y-4"><div className="flex justify-between"><h3 className="font-bold">{walkIn ? t("Register Walk-in") : t("Add Appointment")}</h3><button onClick={() => setShowAdd(false)}><X size={16} /></button></div><p className="text-xs text-slate-500">{new Date(`${selected}T12:00:00`).toLocaleDateString(locale, { dateStyle: "full" })}</p>{!demoMode && <><select value={draft.patient_id} onChange={event => setDraft({ ...draft, patient_id: event.target.value })} className="w-full px-3 py-2 border border-[#CCD5DF] rounded-lg text-xs"><option value="">{walkIn ? t("Existing patient (optional)") : t("Select patient")}</option>{patients.map(patient => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select><select value={draft.doctor_id} onChange={event => setDraft({ ...draft, doctor_id: event.target.value })} className="w-full px-3 py-2 border border-[#CCD5DF] rounded-lg text-xs"><option value="">{t("Select practitioner")}</option>{doctors.map(doctor => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}</select></>}<input type="time" value={draft.time} onChange={event => setDraft({ ...draft, time: event.target.value })} className="w-full px-3 py-2 border border-[#CCD5DF] rounded-lg text-xs" /><input value={draft.type} onChange={event => setDraft({ ...draft, type: event.target.value })} placeholder={t("Appointment type")} className="w-full px-3 py-2 border border-[#CCD5DF] rounded-lg text-xs" /><div className="flex gap-2"><button onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-[#CCD5DF] rounded-lg text-xs font-bold">{t("Cancel")}</button><button onClick={addAppointment} className="flex-1 py-2 bg-[#00685f] text-white rounded-lg text-xs font-bold">{walkIn ? t("Register Walk-in") : t("Create")}</button></div></div></div>}
    </div>
  );
}

/* ─── Analytics View ─── */
function AnalyticsView() {
  const { locale, t } = usePortalLanguage();
  const [analytics, setAnalytics] = useState<RevaAnalytics | null>(null);
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    if (!demoMode) {
      getAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
    }
  }, [demoMode]);

  const metrics = analytics?.metrics;
  const chart = analytics
    ? analytics.daily.slice(-7).map(item => ({
        day: new Date(`${item.date}T12:00:00`).toLocaleDateString(locale, { weekday: "short" }),
        value: item.bookings,
      }))
    : demoMode ? WEEKLY_CHART : [];
  const services = analytics?.services ?? (demoMode ? TOP_SERVICES.map(item => ({ name: item.name, count: item.count })) : []);
  const maxBookings = Math.max(1, ...chart.map(item => item.value));
  const noShowRate = metrics?.bookings ? Math.round((metrics.no_shows / metrics.bookings) * 100) : 0;

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">{t("Clinic Analytics & Performance")}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{t("Recorded bookings, paid invoices, attendance, and channel breakdowns.")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">{t("Recorded Revenue")}</span>
          <p className="text-2xl font-bold text-emerald-700">AED {(metrics?.recorded_revenue ?? (demoMode ? 21500 : 0)).toLocaleString("en-AE")}</p>
          <span className="text-xs text-slate-500">{t("Paid invoices in selected period")}</span>
        </div>
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">{t("Total Bookings")}</span>
          <p className="text-2xl font-bold text-[#00685f]">{metrics?.bookings ?? (demoMode ? 312 : 0)}</p>
          <span className="text-xs text-slate-500">{t("Last 30 days")}</span>
        </div>
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">{t("WhatsApp Bookings")}</span>
          <p className="text-2xl font-bold text-[#0F172A]">{metrics?.whatsapp_bookings ?? (demoMode ? 48 : 0)}</p>
          <span className="text-xs text-[#00685f] font-semibold">{t("Confirmed through automation")}</span>
        </div>
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">{t("No-Show Rate")}</span>
          <p className="text-2xl font-bold text-[#0F172A]">{metrics ? noShowRate : demoMode ? 7 : 0}%</p>
          <span className="text-xs text-slate-500">{t("Based on recorded appointments")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#0F172A]">{t("Weekly Bookings Breakdown")}</h3>
          <div className="flex items-end gap-4 h-44 pt-4">
            {chart.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-400">{d.value}</span>
                <div
                  className="w-full rounded-t-md bg-[#00685f] transition-all"
                  style={{ height: `${(d.value / maxBookings) * 100}%` }}
                />
                <span className="text-[11px] font-bold text-slate-600">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#0F172A]">{t("Top Procedures & OPD")}</h3>
          <div className="space-y-3">
            {services.map((s) => (
              <div key={s.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-[#0F172A]">
                  <span>{s.name}</span>
                  <span>{s.count}</span>
                </div>
                <div className="h-2 bg-[#F8FAFC] border border-[#CCD5DF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00685f] rounded-full" style={{ width: `${services[0]?.count ? (s.count / services[0].count) * 100 : 0}%` }} />
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
  const { t } = usePortalLanguage();
  const [notifs, setNotifs] = useState(NOTIFICATIONS_INIT);
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">{t("Notifications")}</h2>
          <p className="text-sm text-slate-500">{t("Live operational alerts and patient triggers.")}</p>
        </div>
        <button
          onClick={() => { setNotifs(n => n.map(x => ({ ...x, read: true }))); addToast("All marked as read", "info"); }}
          className="text-xs font-bold text-[#00685f] hover:underline"
        >
          {t("Mark all as read")}
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
  const { t } = usePortalLanguage();
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const [form, setForm] = useState({
    clinicName: "Dr. Sharma's Clinic",
    phone: "+971 50 123 4567",
    whatsapp: "+971 50 123 4567",
    address: "Dubai",
  });

  useEffect(() => {
    if (!demoMode) {
      getClinic().then(clinic => setForm({
        clinicName: clinic.name,
        phone: clinic.phone ?? "",
        whatsapp: clinic.whatsapp_number ?? "",
        address: clinic.address ?? "",
      })).catch(error => addToast(error instanceof Error ? error.message : "Could not load settings", "warn"));
    }
  }, [addToast, demoMode]);

  const saveSettings = async () => {
    if (demoMode) {
      addToast("Settings saved successfully ✓", "success");
      return;
    }
    try {
      await updateClinic({ name: form.clinicName, phone: form.phone, whatsapp_number: form.whatsapp, address: form.address });
      addToast("Settings saved successfully ✓", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Could not save settings", "warn");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">{t("Clinic Settings")}</h2>
        <p className="text-sm text-slate-500">{t("Manage clinic profile, WhatsApp routing, and doctor schedules.")}</p>
      </div>

      <div className="bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-sm text-[#0F172A]">{t("Clinic Details")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-500 mb-1">{t("Clinic Name")}</label>
            <input
              value={form.clinicName}
              onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-500 mb-1">{t("Clinic Address")}</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-500 mb-1">{t("Official WhatsApp")}</label>
            <input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-500 mb-1">{t("Clinic Phone")}</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
            />
          </div>
        </div>

        <button
          onClick={saveSettings}
          className="mt-4 px-5 py-2.5 bg-[#00685f] hover:bg-[#005049] text-white font-bold rounded-lg shadow-xs"
        >
          {t("Save Changes")}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Shell Component ─── */
function DashboardPageInner() {
  const { lang, isAr, setLang, t } = usePortalLanguage();
  const { clinic, conversations, loading, error, refresh } = useDashboard();
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const [activeView, setActiveView] = useState<View>("Dashboard");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastId, setToastId] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const addToast = (message: string, type: Toast["type"]) => {
    const id = toastId + 1;
    setToastId(id);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const logout = async () => {
    if (demoMode) {
      window.location.href = "/";
      return;
    }
    await createBrowserClient().auth.signOut();
    window.location.href = "/login";
  };

  const unreadMessages = demoMode ? 3 : conversations.reduce((sum, conversation) => sum + conversation.unread_count, 0);
  const whatsappConfigured = Boolean(clinic?.whatsapp_phone_id);

  return (
    <div className="relative flex h-screen bg-[#f7f9fb] text-[#0F172A] antialiased overflow-hidden font-sans" dir={isAr ? "rtl" : "ltr"}>
      {mobileNavOpen && (
        <button
          type="button"
          aria-label={t("Close navigation")}
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/35 md:hidden"
        />
      )}
      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 z-40 w-64 shrink-0 flex flex-col border-[#CCD5DF] bg-white transition-transform md:relative md:inset-auto md:z-20 md:translate-x-0 ${isAr ? "right-0 border-l" : "left-0 border-r"} ${mobileNavOpen ? "translate-x-0" : isAr ? "translate-x-full" : "-translate-x-full"}`}>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#CCD5DF] flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <img src="/reva-icon.png" alt="Reva AI" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-base text-[#0F172A] leading-tight">Reva AI</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{clinic?.name ?? (demoMode ? "Demo Clinic" : "Clinic Portal")}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map(({ icon: Icon, label, title, badge }) => {
            const active = activeView === label;
            return (
              <button
                key={label}
                onClick={() => { setActiveView(label); setMobileNavOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? "bg-[#00685f]/10 text-[#00685f] font-bold"
                    : "text-slate-600 hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
              >
                <Icon size={16} className={active ? "text-[#00685f]" : "text-slate-400"} />
                <span className="truncate">{t(title ?? label)}</span>
                {(label === "Messages" ? unreadMessages : (badge ?? 0)) > 0 && !active && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00685f]/10 text-[#00685f]">
                    {label === "Messages" ? unreadMessages : badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Status Card */}
        <div className="p-4 border-t border-[#CCD5DF] bg-[#F8FAFC]">
          <div className="flex items-center justify-between text-xs">
            <span className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${demoMode ? "text-slate-700 bg-slate-100 border border-slate-200" : whatsappConfigured ? "text-emerald-800 bg-emerald-50 border border-emerald-200" : "text-amber-800 bg-amber-50 border border-amber-200"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${demoMode ? "bg-slate-400" : whatsappConfigured ? "bg-emerald-600 animate-pulse" : "bg-amber-500"}`} /> {t(demoMode ? "Demo Workspace" : whatsappConfigured ? "WhatsApp Ready" : "Setup Required")}
            </span>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-slate-600 p-1"
              title={t("Logout")}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <main className="min-w-0 flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-[#CCD5DF] px-3 sm:px-4 md:px-8 flex items-center justify-between gap-3 shrink-0 z-10">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label={t("Open navigation")}
            className="md:hidden w-9 h-9 shrink-0 rounded-lg bg-white border border-[#CCD5DF] flex items-center justify-center text-slate-600"
          >
            <Menu size={17} />
          </button>
          <div className="relative max-w-md w-full hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t("Search contacts, appointments, messages...")}
              className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-lg border border-[#CCD5DF] bg-white text-[11px] font-bold" aria-label="Language">
              <button onClick={() => setLang("en")} aria-pressed={lang === "en"} className={`px-2.5 py-2 ${lang === "en" ? "bg-[#00685f] text-white" : "text-slate-500"}`}>EN</button>
              <button onClick={() => setLang("ar")} aria-pressed={lang === "ar"} className={`px-2.5 py-2 ${lang === "ar" ? "bg-[#00685f] text-white" : "text-slate-500"}`}>ع</button>
            </div>
            <button
              onClick={() => setActiveView("Notifications")}
              aria-label={t("Open notifications")}
              className="w-9 h-9 rounded-lg bg-white border border-[#CCD5DF] flex items-center justify-center text-slate-500 hover:text-[#00685f] hover:border-[#00685f] transition-colors"
            >
              <Bell size={15} />
            </button>
            <button
              onClick={() => { setActiveView("Calendar"); addToast("Select a date to manage appointments", "info"); }}
              aria-label={t("Add appointment")}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Plus size={14} /> <span className="hidden sm:inline">{t("Add Appointment")}</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-8 surgical-scroll bg-[#f7f9fb]">
          {!demoMode && loading && (
            <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
              <span className="h-2 w-2 animate-pulse rounded-full bg-teal-600" /> {t("Refreshing clinic workspace…")}
            </div>
          )}
          {!demoMode && error && (
            <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <span>{t("Could not refresh live data. Existing information may be out of date.")}</span>
              <button onClick={refresh} className="font-bold underline underline-offset-2">{t("Retry")}</button>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === "Dashboard"     && <DashboardView addToast={addToast} setActiveView={setActiveView} />}
              {activeView === "Calendar"      && <CalendarView addToast={addToast} />}
              {activeView === "Messages"      && <MessagesView addToast={addToast} />}
              {activeView === "Patients"      && <PatientsView addToast={addToast} />}
              {activeView === "Billing"       && <BillingView addToast={addToast} />}
              {activeView === "Follow-Up"     && <FollowUpView addToast={addToast} />}
              {activeView === "Consent"      && <ConsentView addToast={addToast} />}
              {activeView === "Availability" && <AvailabilityView addToast={addToast} />}
              {activeView === "Analytics"     && <AnalyticsView />}
              {activeView === "Notifications" && <NotificationsView addToast={addToast} />}
              {activeView === "Settings"      && <SettingsView addToast={addToast} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <ToastStack toasts={toasts} remove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

    </div>
  );
}

export default function DashboardPage() {
  return (
    <LanguageProvider>
      <DashboardProvider>
        <DashboardPageInner />
      </DashboardProvider>
    </LanguageProvider>
  );
}
