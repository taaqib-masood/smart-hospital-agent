"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountUp } from "@/lib/hooks";
import {
  TrendingUp,
  AlertCircle,
  Activity,
  Search,
  Send,
  Plus,
  X,
  CreditCard,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

type PaymentMethod = "Cash" | "Apple Pay" | "Card" | "Tabby" | null;
type InvoiceStatus = "Paid" | "Pending" | "Waived";

interface Invoice {
  id: number;
  patientName: string;
  initials: string;
  service: string;
  date: string;
  time: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  daysOverdue: number;
}

interface BillingViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

const INVOICES_DATA: Invoice[] = [
  { id: 1,  patientName: "Priya Sharma",   initials: "PS", service: "General Checkup",        date: "Today",     time: "10:30 AM", amount: 400,  paymentMethod: "Apple Pay",  status: "Paid",    daysOverdue: 0 },
  { id: 2,  patientName: "Rahul Gupta",    initials: "RG", service: "Follow-up",              date: "Today",     time: "11:00 AM", amount: 250,  paymentMethod: null,   status: "Pending", daysOverdue: 0 },
  { id: 3,  patientName: "Ananya Nair",    initials: "AN", service: "Dental Cleaning",        date: "Today",     time: "11:30 AM", amount: 1500, paymentMethod: "Cash", status: "Paid",    daysOverdue: 0 },
  { id: 4,  patientName: "Vikram Patel",   initials: "VP", service: "Consultation",           date: "Today",     time: "12:00 PM", amount: 500,  paymentMethod: "Card", status: "Paid",    daysOverdue: 0 },
  { id: 5,  patientName: "Sunita Rao",     initials: "SR", service: "Blood Pressure Check",   date: "Today",     time: "2:30 PM",  amount: 200,  paymentMethod: "Apple Pay",  status: "Paid",    daysOverdue: 0 },
  { id: 6,  patientName: "Karan Mehta",    initials: "KM", service: "General Checkup",        date: "Today",     time: "3:00 PM",  amount: 400,  paymentMethod: null,   status: "Pending", daysOverdue: 0 },
  { id: 7,  patientName: "Deepa Singh",    initials: "DS", service: "X-Ray Review",           date: "Today",     time: "3:30 PM",  amount: 800,  paymentMethod: null,   status: "Pending", daysOverdue: 0 },
  { id: 8,  patientName: "Arjun Kumar",    initials: "AK", service: "Root Canal (Part 1)",    date: "Yesterday", time: "10:00 AM", amount: 4000, paymentMethod: "Card", status: "Paid",    daysOverdue: 0 },
  { id: 9,  patientName: "Meera Joshi",    initials: "MJ", service: "Consultation",           date: "Yesterday", time: "11:30 AM", amount: 500,  paymentMethod: "Cash", status: "Paid",    daysOverdue: 0 },
  { id: 10, patientName: "Ravi Sharma",    initials: "RS", service: "General Checkup",        date: "Yesterday", time: "2:00 PM",  amount: 400,  paymentMethod: null,   status: "Pending", daysOverdue: 1 },
];

const SERVICE_OPTIONS = [
  "General Checkup", "Follow-up", "Consultation", "Dental Cleaning",
  "X-Ray Review", "Blood Pressure Check", "Blood Test Review",
  "Root Canal", "Dental Implant Consult",
];

function StatCard({ label, value, prefix = "", suffix = "", sub, icon, trend }: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  sub: string;
  icon: React.ReactNode;
  trend?: string;
}) {
  const displayed = useCountUp(value);
  const formatted = prefix.includes("AED")
    ? "AED " + displayed.toLocaleString("en-AE") + suffix
    : prefix + displayed + suffix;

  return (
    <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#00685f]/10 text-[#00685f] flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-[#0F172A] tracking-tight">{formatted}</div>
        <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[#00685f] text-xs font-semibold pt-1 border-t border-[#CCD5DF]">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

export default function BillingView({ addToast }: BillingViewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES_DATA);
  const [filter, setFilter] = useState<"All" | InvoiceStatus>("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newName, setNewName] = useState("");
  const [newService, setNewService] = useState(SERVICE_OPTIONS[0]);
  const [newAmount, setNewAmount] = useState(500);

  const todayRevenue = invoices
    .filter(i => i.status === "Paid" && i.date === "Today")
    .reduce((s, i) => s + i.amount, 0);

  const pendingInvoices = invoices.filter(i => i.status === "Pending");
  const pendingAmount = pendingInvoices.reduce((s, i) => s + i.amount, 0);
  const paidCount = invoices.filter(i => i.status === "Paid").length;
  const pendingCount = invoices.filter(i => i.status === "Pending").length;
  const collectionRate = Math.round((paidCount / (paidCount + pendingCount || 1)) * 100);

  const filtered = invoices.filter(inv => {
    const matchStatus = filter === "All" || inv.status === filter;
    const matchSearch = !search ||
      inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.service.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const markPaid = (id: number, method: PaymentMethod) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: "Paid", paymentMethod: method } : inv));
    addToast(`Invoice marked as paid via ${method} ✓`, "success");
  };

  const waiveInvoice = (id: number) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: "Waived" } : inv));
    addToast("Invoice waived", "warn");
  };

  const sendAllReminders = () => {
    addToast(`WhatsApp payment reminders dispatched to ${pendingInvoices.length} patients ✓`, "success");
  };

  const handleCreateInvoice = () => {
    if (!newName.trim()) return;
    const newInv: Invoice = {
      id: Date.now(),
      patientName: newName.trim(),
      initials: newName.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      service: newService,
      date: "Today",
      time: "Just now",
      amount: newAmount,
      paymentMethod: null,
      status: "Pending",
      daysOverdue: 0,
    };
    setInvoices(prev => [newInv, ...prev]);
    setShowAddModal(false);
    setNewName("");
    addToast("New invoice generated & dispatched via WhatsApp ✓", "success");
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Billing & Invoicing</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Instant invoice generation, settlement tracking, and automated WhatsApp payment links.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
        >
          <Plus size={14} /> Create Invoice
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Today's Revenue"
          value={todayRevenue}
          prefix="AED "
          sub="collected today"
          icon={<TrendingUp size={16} />}
          trend="+14% vs yesterday"
        />
        <StatCard
          label="Pending Amount"
          value={pendingAmount}
          prefix="AED "
          sub={`from ${pendingCount} patients`}
          icon={<AlertCircle size={16} />}
        />
        <StatCard
          label="Collection Rate"
          value={collectionRate}
          suffix="%"
          sub="this week"
          icon={<Activity size={16} />}
          trend="94.2% on-time settlement"
        />
        <StatCard
          label="Monthly Revenue"
          value={234800}
          prefix="AED "
          sub="April 2026 total"
          icon={<CreditCard size={16} />}
        />
      </div>

      {/* Invoices Ledger */}
      <div className="bg-white border border-[#CCD5DF] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#CCD5DF] bg-[#F8FAFC] flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex gap-1 bg-white p-1 rounded-lg border border-[#CCD5DF]">
              {(["All", "Paid", "Pending", "Waived"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    filter === s ? "bg-[#00685f] text-white shadow-xs" : "text-slate-500 hover:text-[#0F172A]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {pendingInvoices.length > 0 && (
              <button
                onClick={sendAllReminders}
                className="px-3 py-1 bg-white border border-[#CCD5DF] hover:bg-slate-50 text-[#00685f] text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
              >
                <Send size={12} /> Send Reminders ({pendingInvoices.length})
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-[1.8fr_1.6fr_1fr_1.3fr_180px] gap-4 px-6 py-3 bg-[#F8FAFC] border-b border-[#CCD5DF] text-[11px] font-bold uppercase tracking-wider text-slate-500 items-center">
          <span>Patient</span>
          <span>Service</span>
          <span>Amount</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        <div className="divide-y divide-[#CCD5DF]">
          {filtered.map((inv) => (
            <div key={inv.id} className="hover:bg-slate-50 transition-colors">
              <div
                onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                className="grid grid-cols-[1.8fr_1.6fr_1fr_1.3fr_180px] gap-4 px-6 py-3.5 items-center cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#00685f]/15 text-[#00685f] font-bold text-[10px] flex items-center justify-center shrink-0">
                    {inv.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#0F172A] truncate">{inv.patientName}</p>
                    <p className="text-[10px] text-slate-400">{inv.time}</p>
                  </div>
                </div>

                <span className="text-slate-600 font-medium truncate">{inv.service}</span>
                <span className="font-mono font-bold text-[#0F172A]">AED {inv.amount}</span>

                <div>
                  <span
                    className={`inline-flex items-center justify-center min-w-[90px] px-2.5 py-0.5 rounded-full text-[11px] font-bold border text-center ${
                      inv.status === "Paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : inv.status === "Pending"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {inv.status} {inv.paymentMethod ? `(${inv.paymentMethod})` : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2 justify-end w-full">
                  {inv.status === "Pending" && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); markPaid(inv.id, "Apple Pay"); }}
                        className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded hover:bg-emerald-100 shadow-2xs whitespace-nowrap"
                      >
                        Paid (Apple Pay)
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); markPaid(inv.id, "Cash"); }}
                        className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded hover:bg-slate-100 shadow-2xs whitespace-nowrap"
                      >
                        Cash
                      </button>
                    </div>
                  )}
                  <div className="text-slate-400 hover:text-slate-600 shrink-0">
                    {expandedId === inv.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === inv.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-[#F8FAFC] border-t border-[#CCD5DF] px-6 py-3 text-xs flex justify-between items-center text-slate-500"
                  >
                    <div className="flex items-center gap-4">
                      <span>Invoice ID: #INV-2026-{inv.id}</span>
                      <span>Date: {inv.date}</span>
                    </div>
                    {inv.status === "Pending" && (
                      <button
                        onClick={() => waiveInvoice(inv.id)}
                        className="text-xs text-rose-600 font-bold hover:underline"
                      >
                        Waive Fee
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#CCD5DF] rounded-xl p-6 w-full max-w-md shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#CCD5DF] pb-3">
                <h3 className="text-base font-bold text-[#0F172A]">Create & Dispatch Invoice</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
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
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Procedure / Service
                  </label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                  >
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Amount (AED)
                  </label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#CCD5DF]">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-[#CCD5DF] text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateInvoice}
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
