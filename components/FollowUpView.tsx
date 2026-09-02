"use client";

import { useState } from "react";
import {
  Clock,
  AlertCircle,
  Star,
  Calendar,
  Users,
  Send,
  CheckCircle2
} from "lucide-react";

interface FollowUpViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

interface Rule {
  id: string;
  name: string;
  description: string;
  delay: string;
  enabled: boolean;
  icon: React.ReactNode;
}

interface Template {
  ruleId: string;
  body: string;
}

interface QueueItem {
  id: string;
  patient: string;
  rule: string;
  dueTime: string;
  status: "Confirmed" | "Pending";
}

const DEFAULT_RULES: Rule[] = [
  {
    id: "r1",
    name: "Post-Visit Thank You",
    description: "Sends a warm thank-you + clinic rating link",
    delay: "2 hrs",
    enabled: true,
    icon: <Clock size={16} />,
  },
  {
    id: "r2",
    name: "Prescription Reminder",
    description: "Reminds patient to take medication on time",
    delay: "12 hrs",
    enabled: true,
    icon: <AlertCircle size={16} />,
  },
  {
    id: "r3",
    name: "Review Request",
    description: "Asks for Google review after positive rating",
    delay: "3 days",
    enabled: true,
    icon: <Star size={16} />,
  },
  {
    id: "r4",
    name: "Follow-up Booking Nudge",
    description: "Suggests scheduling next appointment",
    delay: "7 days",
    enabled: false,
    icon: <Calendar size={16} />,
  },
  {
    id: "r5",
    name: "No-Show Re-engagement",
    description: "Reaches out to missed patients to rebook",
    delay: "1 day",
    enabled: true,
    icon: <Users size={16} />,
  },
];

const DEFAULT_TEMPLATES: Template[] = [
  {
    ruleId: "r1",
    body: "Hi {name}! 👋 Thank you for visiting Dr. Sharma's Clinic today. We hope you're feeling much better. We'd love your 30-second feedback: {rating_link}",
  },
  {
    ruleId: "r2",
    body: "Hello {name}, this is a gentle reminder from Dr. Sharma's Clinic to take your prescribed doses today. View your digital Rx here: {rx_link}",
  },
  {
    ruleId: "r3",
    body: "Hi {name}! Thank you for your rating ⭐ Could you take 10 seconds to share your experience on Google Reviews? It helps other patients find us: {rating_link}",
  },
  {
    ruleId: "r4",
    body: "Hi {name}, Dr. Sharma recommended a follow-up review around now. Tap here to book your preferred slot: {booking_link}",
  },
  {
    ruleId: "r5",
    body: "Hi {name}, we noticed you missed your consultation today. Would you like to reschedule with Dr. Sharma for tomorrow? {booking_link}",
  },
];

const INITIAL_QUEUE: QueueItem[] = [
  { id: "q1", patient: "Priya Sharma", rule: "Post-Visit Thank You", dueTime: "12:30 PM", status: "Pending" },
  { id: "q2", patient: "Rahul Gupta", rule: "Prescription Reminder", dueTime: "2:00 PM", status: "Pending" },
  { id: "q3", patient: "Ananya Nair", rule: "Review Request", dueTime: "3:15 PM", status: "Pending" },
  { id: "q4", patient: "Vikram Patel", rule: "No-Show Re-engagement", dueTime: "4:00 PM", status: "Pending" },
  { id: "q5", patient: "Sunita Rao", rule: "Post-Visit Thank You", dueTime: "4:45 PM", status: "Confirmed" },
];

const VARIABLES = ["{name}", "{doctor}", "{date}", "{rating_link}", "{rx_link}", "{booking_link}"];

export default function FollowUpView({ addToast }: FollowUpViewProps) {
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [activeTab, setActiveTab] = useState<string>("r1");
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);

  const activeRule = rules.find((r) => r.id === activeTab) || rules[0];
  const activeTemplate = templates.find((t) => t.ruleId === activeTab) || templates[0];

  const updateTemplateBody = (body: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.ruleId === activeTab ? { ...t, body } : t))
    );
  };

  const toggleRuleEnabled = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    addToast("Rule status updated ✓", "info");
  };

  const insertVariable = (v: string) => {
    updateTemplateBody(activeTemplate.body + " " + v);
  };

  const handleSave = () => {
    addToast("WhatsApp follow-up template saved ✓", "success");
  };

  const triggerManualDispatch = (item: QueueItem) => {
    setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "Confirmed" } : q)));
    addToast(`Automated WhatsApp dispatched to ${item.patient} ✓`, "success");
  };

  const previewText = activeTemplate.body
    .replace("{name}", "Priya")
    .replace("{doctor}", "Sharma")
    .replace("{date}", "Today")
    .replace("{rating_link}", "https://reva.ae/r/827")
    .replace("{rx_link}", "https://reva.ae/rx/912")
    .replace("{booking_link}", "https://reva.ae/book");

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Automated Follow-ups & Retention</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Event-driven WhatsApp sequences for post-consultation care, digital Rx reminders, and Google reviews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Automation Engine Active
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Automation Rule Tabs & Template Editor */}
        <div className="lg:col-span-8 space-y-6">
          {/* Rules Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {rules.map((rule) => {
              const isActive = activeTab === rule.id;
              return (
                <button
                  key={rule.id}
                  onClick={() => setActiveTab(rule.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isActive
                      ? "bg-white border-[#00685f] shadow-xs ring-1 ring-[#00685f]"
                      : "bg-[#F8FAFC] border-[#CCD5DF] hover:bg-white text-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`p-1.5 rounded-lg ${isActive ? "bg-[#00685f]/10 text-[#00685f]" : "bg-slate-200 text-slate-600"}`}>
                      {rule.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{rule.delay}</span>
                  </div>
                  <p className="text-xs font-bold text-[#0F172A] truncate">{rule.name}</p>
                  <span className={`text-[10px] font-bold ${rule.enabled ? "text-emerald-700" : "text-slate-400"}`}>
                    {rule.enabled ? "Active" : "Paused"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Template Editor Card */}
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#CCD5DF] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">{activeRule.name}</h3>
                <p className="text-xs text-slate-500">{activeRule.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">
                  {activeRule.enabled ? "Rule Enabled" : "Rule Paused"}
                </span>
                <button
                  onClick={() => toggleRuleEnabled(activeRule.id)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    activeRule.enabled ? "bg-[#00685f]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      activeRule.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                WhatsApp Message Template
              </label>
              <textarea
                value={activeTemplate.body}
                onChange={(e) => updateTemplateBody(e.target.value)}
                rows={4}
                className="w-full p-3.5 bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f] leading-relaxed"
              />
            </div>

            {/* Variable Tokens */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Insert Dynamic Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLES.map((v) => (
                  <button
                    key={v}
                    onClick={() => insertVariable(v)}
                    className="px-2 py-1 bg-white border border-[#CCD5DF] rounded-md text-[11px] font-mono text-slate-700 hover:border-[#00685f] hover:text-[#00685f] transition-colors"
                  >
                    + {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#CCD5DF]">
              <span className="text-xs text-slate-400">
                Character count: {activeTemplate.body.length} / 1024
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => updateTemplateBody(DEFAULT_TEMPLATES.find((t) => t.ruleId === activeTab)?.body || "")}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Reset Default
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send size={12} /> Save Template
                </button>
              </div>
            </div>
          </div>

          {/* Performance KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-[#CCD5DF] rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">Messages Sent</span>
              <p className="text-xl font-bold text-[#0F172A]">1,420</p>
              <span className="text-[11px] font-semibold text-emerald-700">+12% this month</span>
            </div>
            <div className="bg-white border border-[#CCD5DF] rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">Read Rate</span>
              <p className="text-xl font-bold text-[#0F172A]">94.8%</p>
              <span className="text-[11px] font-semibold text-[#00685f]">Industry lead</span>
            </div>
            <div className="bg-white border border-[#CCD5DF] rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">Retention Bookings</span>
              <p className="text-xl font-bold text-[#0F172A]">38.2%</p>
              <span className="text-[11px] font-semibold text-emerald-700">542 rebookings</span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Phone Preview & Live Dispatch Queue */}
        <div className="lg:col-span-4 space-y-6">
          {/* WhatsApp Preview Card */}
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live WhatsApp Preview</h3>
            
            <div className="rounded-2xl border border-[#CCD5DF] overflow-hidden bg-[#e5ddd5]/30">
              <div className="bg-[#00685f] px-3.5 py-2.5 flex items-center gap-2 text-white">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                  DS
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Dr. Sharma's Clinic</p>
                  <p className="text-[10px] text-emerald-100">Official WhatsApp Business</p>
                </div>
              </div>

              <div className="p-4 min-h-[160px] flex flex-col justify-end">
                <div className="bg-white border border-slate-200 rounded-xl rounded-tl-xs p-3 shadow-xs max-w-[90%]">
                  <p className="text-xs text-[#0F172A] leading-relaxed whitespace-pre-wrap">{previewText}</p>
                  <span className="text-[9px] text-slate-400 block text-right mt-1.5">12:30 PM ✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Follow-up Queue */}
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#CCD5DF] pb-3">
              <h3 className="text-sm font-bold text-[#0F172A]">Scheduled Today ({queue.length})</h3>
              <span className="text-xs font-bold text-[#00685f]">Auto-Trigger</span>
            </div>

            <div className="space-y-2.5">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#F8FAFC] border border-[#CCD5DF] rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-[#0F172A]">{item.patient}</p>
                    <p className="text-[11px] text-slate-500">{item.rule} • {item.dueTime}</p>
                  </div>

                  {item.status === "Confirmed" ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 size={12} /> Dispatched
                    </span>
                  ) : (
                    <button
                      onClick={() => triggerManualDispatch(item)}
                      className="px-2.5 py-1 bg-[#00685f] hover:bg-[#005049] text-white text-[11px] font-bold rounded shadow-xs"
                    >
                      Send Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
