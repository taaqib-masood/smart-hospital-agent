"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountUp } from "@/lib/hooks";
import {
  UploadCloud,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileText,
  CheckCircle,
  CheckCircle2,
  X
} from "lucide-react";

interface LabReportsViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

interface Report {
  id: number;
  patient: string;
  age: number;
  test: string;
  date: string;
  status: "Delivered" | "Pending";
  flagged: boolean;
  notes: string;
  phone: string;
}

const INITIAL_REPORTS: Report[] = [
  { id: 1, patient: "Priya Sharma", age: 34, test: "CBC", date: "Apr 24", status: "Delivered", flagged: false, notes: "WBC slightly elevated", phone: "+971 50 123 4567" },
  { id: 2, patient: "Rahul Gupta", age: 45, test: "Lipid Profile", date: "Apr 24", status: "Pending", flagged: false, notes: "", phone: "+971 55 234 5678" },
  { id: 3, patient: "Ananya Nair", age: 29, test: "HbA1c", date: "Apr 23", status: "Delivered", flagged: true, notes: "HbA1c 8.2 — above normal", phone: "+971 52 345 6789" },
  { id: 4, patient: "Vikram Patel", age: 52, test: "LFT", date: "Apr 23", status: "Delivered", flagged: false, notes: "", phone: "+971 58 456 7890" },
  { id: 5, patient: "Sunita Rao", age: 41, test: "Blood Sugar Fast", date: "Apr 23", status: "Pending", flagged: false, notes: "", phone: "+971 50 987 6543" },
  { id: 6, patient: "Karan Mehta", age: 38, test: "TSH", date: "Apr 22", status: "Delivered", flagged: true, notes: "TSH 6.8 — subclinical hypothyroid", phone: "+971 55 876 5432" },
  { id: 7, patient: "Deepa Singh", age: 26, test: "Urine Routine", date: "Apr 22", status: "Delivered", flagged: false, notes: "", phone: "+971 52 765 4321" },
  { id: 8, patient: "Meera Joshi", age: 60, test: "Chest X-Ray", date: "Apr 21", status: "Delivered", flagged: false, notes: "Mild cardiomegaly noted", phone: "+971 58 654 3210" },
  { id: 9, patient: "Arjun Kumar", age: 47, test: "ECG", date: "Apr 21", status: "Delivered", flagged: false, notes: "", phone: "+971 50 543 2109" },
  { id: 10, patient: "Priya Sharma", age: 34, test: "Lipid Profile", date: "Apr 20", status: "Delivered", flagged: false, notes: "", phone: "+971 50 123 4567" },
  { id: 11, patient: "Rahul Gupta", age: 45, test: "RFT", date: "Apr 20", status: "Delivered", flagged: false, notes: "", phone: "+971 55 234 5678" },
  { id: 12, patient: "Ananya Nair", age: 29, test: "CBC", date: "Apr 19", status: "Delivered", flagged: false, notes: "", phone: "+971 52 345 6789" },
  { id: 13, patient: "Vikram Patel", age: 52, test: "HbA1c", date: "Apr 19", status: "Delivered", flagged: true, notes: "HbA1c 7.9 — borderline", phone: "+971 58 456 7890" },
  { id: 14, patient: "Sunita Rao", age: 41, test: "Lipid Profile", date: "Apr 18", status: "Delivered", flagged: false, notes: "", phone: "+971 50 987 6543" },
  { id: 15, patient: "Karan Mehta", age: 38, test: "Blood Sugar PP", date: "Apr 18", status: "Delivered", flagged: false, notes: "", phone: "+971 55 876 5432" },
];

const PENDING_REPORTS = [
  { id: 2, patient: "Rahul Gupta", test: "Lipid Profile", uploadedAt: "Apr 24 · 2:30 PM", timeAgo: "3 hrs ago" },
  { id: 5, patient: "Sunita Rao", test: "Blood Sugar Fast", uploadedAt: "Apr 23 · 11:15 AM", timeAgo: "1 day ago" },
  { id: 16, patient: "Neha Verma", test: "Thyroid Panel", uploadedAt: "Apr 24 · 9:00 AM", timeAgo: "6 hrs ago" },
  { id: 17, patient: "Amit Desai", test: "Kidney Function", uploadedAt: "Apr 24 · 10:45 AM", timeAgo: "4 hrs ago" },
  { id: 18, patient: "Pooja Iyer", test: "Iron Studies", uploadedAt: "Apr 23 · 3:00 PM", timeAgo: "23 hrs ago" },
];

const FLAGGED_REPORTS = [
  { id: 3, patient: "Ananya Nair", test: "HbA1c", note: "HbA1c 8.2 — above normal" },
  { id: 6, patient: "Karan Mehta", test: "TSH", note: "TSH 6.8 — subclinical hypothyroid" },
  { id: 13, patient: "Vikram Patel", test: "HbA1c", note: "HbA1c 7.9 — borderline" },
];

function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
  delay,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
  trend?: string;
  delay: number;
}) {
  const count = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#CCD5DF] flex items-center justify-center text-[#00685f]">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-[#0F172A] mb-1">
        {count.toLocaleString("en-AE")}
      </div>
      {sub && <p className="text-xs text-slate-500 font-medium">{sub}</p>}
      {trend && (
        <div className="flex items-center gap-1 text-[#00685f] text-xs font-semibold mt-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend}</span>
        </div>
      )}
    </motion.div>
  );
}

export default function LabReportsView({ addToast }: LabReportsViewProps) {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Delivered" | "Pending" | "Flagged">("All");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [pendingList, setPendingList] = useState(PENDING_REPORTS);
  const [flaggedList, setFlaggedList] = useState(FLAGGED_REPORTS);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = reports.filter((r) => {
    const matchSearch =
      r.patient.toLowerCase().includes(search.toLowerCase()) ||
      r.test.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "Delivered") return r.status === "Delivered";
    if (filter === "Pending") return r.status === "Pending";
    if (filter === "Flagged") return r.flagged;
    return true;
  });

  const handleSendReport = (id: number, patient: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Delivered" as const } : r))
    );
    setPendingList((prev) => prev.filter((p) => p.id !== id));
    addToast(`Lab report sent to ${patient} via WhatsApp ✓`, "success");
  };

  const handleBatchSend = () => {
    if (selectedIds.size === 0) return;
    setReports((prev) =>
      prev.map((r) => (selectedIds.has(r.id) ? { ...r, status: "Delivered" as const } : r))
    );
    setPendingList((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    addToast(`${selectedIds.size} reports sent via WhatsApp`, "success");
    setSelectedIds(new Set());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newReport: Report = {
      id: Date.now(),
      patient: "New Patient",
      age: 30,
      test: files[0].name.replace(/\.[^/.]+$/, ""),
      date: "Today",
      status: "Pending",
      flagged: false,
      notes: "Uploaded just now",
      phone: "+971 50 888 9999",
    };
    setReports((prev) => [newReport, ...prev]);
    setPendingList((prev) => [
      { id: newReport.id, patient: newReport.patient, test: newReport.test, uploadedAt: "Just now", timeAgo: "1m ago" },
      ...prev,
    ]);
    addToast(`"${files[0].name}" uploaded & queued for delivery`, "success");
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Lab Report Inbox</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Upload diagnostic reports and dispatch automated PDF notifications via WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Reports This Month"
          value={94}
          icon={<FileText className="w-4 h-4" />}
          trend="+14% vs last month"
          delay={0.05}
        />
        <StatCard
          label="Delivered via WhatsApp"
          value={89}
          sub="94% delivery rate"
          icon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
          delay={0.1}
        />
        <StatCard
          label="Awaiting Delivery"
          value={pendingList.length}
          sub="Requires dispatch"
          icon={<Clock className="w-4 h-4 text-amber-600" />}
          delay={0.15}
        />
        <StatCard
          label="Abnormal / Flagged"
          value={flaggedList.length}
          sub="Doctor review needed"
          icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border-2 border-dashed border-[#CCD5DF] hover:border-[#00685f] hover:bg-[#00685f]/[0.02] rounded-xl p-6 text-center cursor-pointer transition-all shadow-xs flex flex-col items-center justify-center gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
            />
            <div className="w-10 h-10 rounded-full bg-[#00685f]/10 text-[#00685f] flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">
              Drop PDF or image lab reports here to auto-match patients
            </p>
            <p className="text-xs text-slate-500">
              Supports PDF, PNG, JPG & DICOM up to 25MB with instant OCR extraction
            </p>
          </div>

          <div className="bg-white border border-[#CCD5DF] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#CCD5DF] flex items-center justify-between gap-4 flex-wrap bg-[#F8FAFC]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by patient name or test..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                />
              </div>
              <div className="flex items-center gap-2">
                {selectedIds.size > 0 && (
                  <button
                    onClick={handleBatchSend}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00685f] text-white rounded-lg text-xs font-bold shadow-xs hover:bg-[#005049] transition-colors"
                  >
                    <Send className="w-3 h-3" /> Send Selected ({selectedIds.size})
                  </button>
                )}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-[#CCD5DF]">
                  {(["All", "Pending", "Delivered", "Flagged"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
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
            </div>

            <div className="grid grid-cols-[auto_1.5fr_1fr_1fr_1fr_auto] gap-3 px-6 py-3 bg-[#F8FAFC] border-b border-[#CCD5DF] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <input
                type="checkbox"
                checked={selectedIds.size === filtered.length && filtered.length > 0}
                onChange={(e) => {
                  if (e.target.checked) setSelectedIds(new Set(filtered.map((r) => r.id)));
                  else setSelectedIds(new Set());
                }}
                className="rounded border-[#CCD5DF] text-[#00685f] focus:ring-[#00685f]"
              />
              <span>Patient</span>
              <span>Investigation</span>
              <span>Date</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            <div className="divide-y divide-[#CCD5DF]">
              {filtered.map((report) => (
                <div key={report.id} className="hover:bg-slate-50 transition-colors">
                  <div
                    onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                    className="grid grid-cols-[auto_1.5fr_1fr_1fr_1fr_auto] gap-3 px-6 py-3.5 items-center cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(report.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const next = new Set(selectedIds);
                        if (e.target.checked) next.add(report.id);
                        else next.delete(report.id);
                        setSelectedIds(next);
                      }}
                      className="rounded border-[#CCD5DF] text-[#00685f] focus:ring-[#00685f]"
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#00685f]/15 text-[#00685f] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {report.patient.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#0F172A] truncate">{report.patient}</p>
                        <p className="text-slate-400 text-[11px]">{report.age} yrs</p>
                      </div>
                    </div>

                    <span className="font-medium text-slate-700">{report.test}</span>
                    <span className="text-slate-500">{report.date}</span>

                    <div>
                      {report.status === "Delivered" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Delivered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {report.flagged && (
                        <span className="ml-1.5 inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Abnormal
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      {report.status === "Pending" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendReport(report.id, report.patient);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#00685f] text-white text-[11px] font-bold hover:bg-[#005049] shadow-xs"
                        >
                          <Send className="w-3 h-3" /> Send
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Delivered ✓</span>
                      )}
                      {expandedId === report.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === report.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#F8FAFC] border-t border-[#CCD5DF] px-6 py-3 text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-600">Clinical Finding: </span>
                            <span className="text-slate-800">{report.notes || "All parameters within normal reference limits."}</span>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">{report.phone}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#CCD5DF] pb-3">
              <h3 className="text-sm font-bold text-[#0F172A]">Pending Dispatch</h3>
              <span className="text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                {pendingList.length} queued
              </span>
            </div>
            <div className="space-y-2.5">
              {pendingList.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#CCD5DF] text-xs">
                  <div>
                    <p className="font-bold text-[#0F172A]">{p.patient}</p>
                    <p className="text-[11px] text-slate-500">{p.test} • {p.timeAgo}</p>
                  </div>
                  <button
                    onClick={() => handleSendReport(p.id, p.patient)}
                    className="px-2.5 py-1 bg-[#00685f] text-white text-[11px] font-bold rounded-md hover:bg-[#005049] shadow-xs"
                  >
                    Send
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#CCD5DF] pb-3">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Abnormal Flagged Scans
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                {flaggedList.length}
              </span>
            </div>
            <div className="space-y-2.5">
              {flaggedList.map((f) => (
                <div key={f.id} className="p-3 rounded-lg bg-rose-50/50 border border-rose-200 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-rose-900">{f.patient}</p>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">{f.test}</span>
                  </div>
                  <p className="text-[11px] text-rose-800 italic">{f.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
