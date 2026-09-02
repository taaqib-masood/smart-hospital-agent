"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountUp } from "@/lib/hooks";
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Check,
  ChevronDown,
  ChevronUp,
  Send,
  Copy,
  ExternalLink,
  Search,
  IndianRupee,
  Smartphone,
  ShieldCheck,
  Clock
} from "lucide-react";

interface DepositsViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

type TxStatus = "Paid" | "Pending" | "Refunded" | "Waived";
interface Transaction {
  id: number;
  patient: string;
  initials: string;
  appointment: string;
  deposit: number;
  status: TxStatus;
  paid_at: string;
  method: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: 1, patient: "Priya Sharma", initials: "PS", appointment: "Apr 24 10:30 AM", deposit: 200, status: "Paid", paid_at: "9:14 AM", method: "Apple Pay" },
  { id: 2, patient: "Rahul Gupta", initials: "RG", appointment: "Apr 24 11:00 AM", deposit: 200, status: "Pending", paid_at: "—", method: "—" },
  { id: 3, patient: "Ananya Nair", initials: "AN", appointment: "Apr 24 11:30 AM", deposit: 150, status: "Paid", paid_at: "8:52 AM", method: "Card" },
  { id: 4, patient: "Vikram Patel", initials: "VP", appointment: "Apr 24 12:00 PM", deposit: 300, status: "Paid", paid_at: "Yesterday", method: "Apple Pay" },
  { id: 5, patient: "Sunita Rao", initials: "SR", appointment: "Apr 24 2:30 PM", deposit: 200, status: "Pending", paid_at: "—", method: "—" },
  { id: 6, patient: "Karan Mehta", initials: "KM", appointment: "Apr 24 3:00 PM", deposit: 200, status: "Waived", paid_at: "—", method: "—" },
  { id: 7, patient: "Deepa Singh", initials: "DS", appointment: "Apr 24 3:30 PM", deposit: 150, status: "Paid", paid_at: "10:05 AM", method: "Net Banking" },
  { id: 8, patient: "Meera Joshi", initials: "MJ", appointment: "Apr 23 9:00 AM", deposit: 250, status: "Paid", paid_at: "Apr 23 8:30AM", method: "Card" },
  { id: 9, patient: "Arjun Kumar", initials: "AK", appointment: "Apr 23 11:00 AM", deposit: 200, status: "Refunded", paid_at: "Apr 23 12:00", method: "Apple Pay" },
  { id: 10, patient: "Raj Verma", initials: "RV", appointment: "Apr 23 2:00 PM", deposit: 300, status: "Paid", paid_at: "Apr 23 1:45PM", method: "Apple Pay" },
  { id: 11, patient: "Kavya Reddy", initials: "KR", appointment: "Apr 22 10:00 AM", deposit: 200, status: "Paid", paid_at: "Apr 22 9:22AM", method: "Card" },
  { id: 12, patient: "Mohan Das", initials: "MD", appointment: "Apr 22 11:30 AM", deposit: 150, status: "Pending", paid_at: "—", method: "—" },
  { id: 13, patient: "Nalini Menon", initials: "NM", appointment: "Apr 22 3:00 PM", deposit: 200, status: "Paid", paid_at: "Apr 22 2:44PM", method: "Apple Pay" },
  { id: 14, patient: "Arun Joshi", initials: "AJ", appointment: "Apr 21 9:30 AM", deposit: 300, status: "Paid", paid_at: "Apr 21 9:00AM", method: "Card" },
  { id: 15, patient: "Rekha Singh", initials: "RS", appointment: "Apr 21 11:00 AM", deposit: 200, status: "Paid", paid_at: "Apr 21 10:30", method: "Apple Pay" },
  { id: 16, patient: "Suresh Babu", initials: "SB", appointment: "Apr 20 10:00 AM", deposit: 150, status: "Refunded", paid_at: "Apr 20 11:00", method: "Card" },
  { id: 17, patient: "Divya Nair", initials: "DN", appointment: "Apr 20 2:00 PM", deposit: 200, status: "Paid", paid_at: "Apr 20 1:30PM", method: "Apple Pay" },
  { id: 18, patient: "Priya Sharma", initials: "PS", appointment: "Apr 19 10:30 AM", deposit: 200, status: "Paid", paid_at: "Apr 19 9:50AM", method: "Apple Pay" },
  { id: 19, patient: "Rahul Gupta", initials: "RG", appointment: "Apr 18 11:00 AM", deposit: 300, status: "Paid", paid_at: "Apr 18 10:30", method: "Card" },
  { id: 20, patient: "Ananya Nair", initials: "AN", appointment: "Apr 17 3:00 PM", deposit: 150, status: "Waived", paid_at: "—", method: "—" },
];

const STATUS_CONFIG: Record<TxStatus, { color: string; bg: string; border: string }> = {
  Paid: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  Pending: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  Refunded: { color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
  Waived: { color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
};

const AMOUNT_OPTIONS = [100, 150, 200, 250, 300];

export default function DepositsView({ addToast }: DepositsViewProps) {
  const [txns, setTxns] = useState(TRANSACTIONS);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [depositsActive, setDepositsActive] = useState(true);

  const [formPatient, setFormPatient] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formAmount, setFormAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const [requireAll, setRequireAll] = useState(true);
  const [waiveReturning, setWaiveReturning] = useState(true);
  const [autoRefund, setAutoRefund] = useState(true);
  const [expiry, setExpiry] = useState("2hr");

  const totalCollected = txns.filter((t) => t.status === "Paid").reduce((s, t) => s + t.deposit, 0);
  const totalRefunded = txns.filter((t) => t.status === "Refunded").reduce((s, t) => s + t.deposit, 0);
  const collected = useCountUp(totalCollected);
  const netVal = useCountUp(totalCollected - totalRefunded);

  const filtered = txns.filter((t) => {
    const matchSearch = t.patient.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function sendLink() {
    if (!formPatient) {
      addToast("Enter a patient name", "warn");
      return;
    }
    const amt = useCustom ? parseInt(customAmount) || 200 : formAmount;
    const newTx: Transaction = {
      id: Date.now(),
      patient: formPatient,
      initials: formPatient.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      appointment: formDate && formTime ? `${formDate} ${formTime}` : "Upcoming",
      deposit: amt,
      status: "Pending",
      paid_at: "—",
      method: "—",
    };
    setTxns((prev) => [newTx, ...prev]);
    addToast(`Deposit link sent to ${formPatient} via WhatsApp 💸`, "success");
    setFormPatient("");
    setFormDate("");
    setFormTime("");
  }

  function Toggle({ val, onToggle }: { val: boolean; onToggle: () => void }) {
    return (
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
    );
  }

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Deposits & Pre-Payments</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Automated booking advance collections via Apple Pay, Card & WhatsApp payment links (AED).
        </p>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Deposits Collected (Apr 2026)
          </span>
          <div className="text-3xl font-bold text-[#0F172A] mt-1">
            AED {collected.toLocaleString("en-AE")}
          </div>
          <div className="flex items-center gap-1 text-[#00685f] text-xs font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18% vs last month • 94% collection rate</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 flex-1 max-w-xl">
          <div className="bg-[#F8FAFC] border border-[#CCD5DF] rounded-lg p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">No-Shows Prevented</span>
            <span className="text-lg font-bold text-emerald-700 mt-0.5 block">23</span>
          </div>
          <div className="bg-[#F8FAFC] border border-[#CCD5DF] rounded-lg p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avg Deposit</span>
            <span className="text-lg font-bold text-[#0F172A] mt-0.5 block">AED 218</span>
          </div>
          <div className="bg-[#F8FAFC] border border-[#CCD5DF] rounded-lg p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Net Protected</span>
            <span className="text-lg font-bold text-[#00685f] mt-0.5 block">AED {netVal.toLocaleString("en-AE")}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600">Deposits Active</span>
          <Toggle
            val={depositsActive}
            onToggle={() => {
              setDepositsActive((p) => !p);
              addToast(depositsActive ? "Deposits paused" : "Deposits active", depositsActive ? "warn" : "success");
            }}
          />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Transactions Ledger (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#CCD5DF] rounded-xl overflow-hidden shadow-xs">
            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-[#CCD5DF] flex items-center justify-between gap-4 flex-wrap bg-[#F8FAFC]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient or transaction..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                />
              </div>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-[#CCD5DF]">
                {["All", "Paid", "Pending", "Refunded", "Waived"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                      statusFilter === tab
                        ? "bg-white text-[#00685f] shadow-xs"
                        : "text-slate-600 hover:text-[#0F172A]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-[#F8FAFC] border-b border-[#CCD5DF] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>Patient</span>
              <span>Slot</span>
              <span>Amount</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            {/* Transaction Rows */}
            <div className="divide-y divide-[#CCD5DF]">
              {filtered.map((tx) => {
                const sc = STATUS_CONFIG[tx.status];
                const isOpen = expandedId === tx.id;
                return (
                  <div key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <div
                      onClick={() => setExpandedId(isOpen ? null : tx.id)}
                      className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3.5 items-center cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[#00685f]/15 text-[#00685f] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {tx.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] truncate">{tx.patient}</p>
                          <p className="text-slate-400 text-[11px]">{tx.method !== "—" ? tx.method : "Awaiting"}</p>
                        </div>
                      </div>

                      <span className="text-slate-600 font-medium">{tx.appointment}</span>
                      <span className="font-bold text-[#0F172A]">AED {tx.deposit}</span>

                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${sc.bg} ${sc.color} ${sc.border}`}>
                          {tx.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 justify-end">
                        {tx.status === "Pending" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToast(`Reminder sent to ${tx.patient}`, "info");
                            }}
                            className="px-2.5 py-1 bg-[#00685f] text-white text-[11px] font-bold rounded-md hover:bg-[#005049] shadow-xs"
                          >
                            Resend
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">{tx.paid_at}</span>
                        )}
                        <div className="text-slate-400 hover:text-slate-600">
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible details */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-[#F8FAFC] border-t border-[#CCD5DF] px-6 py-3 text-xs flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2 font-mono text-slate-600">
                            <span>https://pay.reva.ae/l/reva-{tx.id}abc</span>
                            <button onClick={() => addToast("Payment link copied", "success")} className="text-[#00685f] hover:underline flex items-center gap-1 font-sans text-xs">
                              <Copy size={12} /> Copy
                            </button>
                          </div>
                          <span className="text-slate-400">Payment Gateway Ref: #PAY-AE-99{tx.id}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Send Link Form & Deposit Settings */}
        <div className="space-y-6">
          {/* Send Deposit Link Card */}
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#00685f]" /> Create & Send Deposit Link
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Patient name..."
                value={formPatient}
                onChange={(e) => setFormPatient(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                />
                <input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Deposit Amount
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {AMOUNT_OPTIONS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => {
                        setFormAmount(amt);
                        setUseCustom(false);
                      }}
                      className={`px-3 py-1 text-xs font-bold rounded-md border transition-all ${
                        !useCustom && formAmount === amt
                          ? "bg-[#00685f] text-white border-[#00685f]"
                          : "bg-white border-[#CCD5DF] text-slate-600 hover:border-[#00685f]"
                      }`}
                    >
                      AED {amt}
                    </button>
                  ))}
                  <button
                    onClick={() => setUseCustom(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-md border transition-all ${
                      useCustom
                        ? "bg-[#00685f] text-white border-[#00685f]"
                        : "bg-white border-[#CCD5DF] text-slate-600 hover:border-[#00685f]"
                    }`}
                  >
                    Custom
                  </button>
                </div>
                {useCustom && (
                  <input
                    type="number"
                    placeholder="Enter amount (AED)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full mt-2 px-3 py-1.5 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                  />
                )}
              </div>

              <button
                onClick={sendLink}
                className="w-full py-2.5 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Send via WhatsApp
              </button>
            </div>
          </div>

          {/* Deposit Settings Card */}
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Policy Rules</h3>
            <div className="space-y-3">
              {[
                { label: "Require for all bookings", val: requireAll, set: setRequireAll },
                { label: "Waive for returning regulars", val: waiveReturning, set: setWaiveReturning },
                { label: "Auto-refund on clinic cancellation", val: autoRefund, set: setAutoRefund },
              ].map((rule) => (
                <div key={rule.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">{rule.label}</span>
                  <Toggle val={rule.val} onToggle={() => rule.set((p) => !p)} />
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#CCD5DF]">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Link Expiry
              </span>
              <div className="flex gap-1.5">
                {["1hr", "2hr", "6hr", "24hr"].map((e) => (
                  <button
                    key={e}
                    onClick={() => setExpiry(e)}
                    className={`flex-1 py-1 text-xs font-bold rounded-md border transition-all ${
                      expiry === e
                        ? "bg-[#00685f] text-white border-[#00685f]"
                        : "bg-white border-[#CCD5DF] text-slate-600 hover:border-[#00685f]"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
