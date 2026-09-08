"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountUp } from "@/lib/hooks";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit3,
  Shield,
  Smartphone,
  Check,
  X,
  Lock
} from "lucide-react";
import { createConsent, getConsentWorkspace, type ConsentWorkspace } from "@/lib/api";

interface ConsentViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

type ConsentStatus = "Signed" | "Pending";
type ProcedureCategory = "surgical" | "dental" | "diagnostic" | "therapeutic";

interface ConsentRecord {
  id: string | number;
  patientId?: string;
  templateId?: string;
  patient: string;
  initials: string;
  procedure: string;
  category: ProcedureCategory;
  sentTime: string;
  status: ConsentStatus;
  signedAt: string | null;
  signTimeMin: number | null;
  ipAddress: string;
}

interface Template {
  id: string | number;
  name: string;
  usedCount: number;
  lastEdited: string;
  content: string;
}

const CONSENT_RECORDS: ConsentRecord[] = [
  { id: 1,  patient: "Priya Sharma",  initials: "PS", procedure: "Dental Implant Consent",   category: "dental",      sentTime: "9:00 AM",  status: "Signed",  signedAt: "9:14 AM",   signTimeMin: 14, ipAddress: "94.200.41.xx (Dubai, UAE)" },
  { id: 2,  patient: "Rahul Gupta",   initials: "RG", procedure: "Root Canal Consent",       category: "dental",      sentTime: "9:15 AM",  status: "Signed",  signedAt: "9:31 AM",   signTimeMin: 16, ipAddress: "86.96.12.xx (Dubai, UAE)" },
  { id: 3,  patient: "Ananya Nair",   initials: "AN", procedure: "Dental Extraction",        category: "dental",      sentTime: "9:30 AM",  status: "Pending", signedAt: null,        signTimeMin: null, ipAddress: "" },
  { id: 4,  patient: "Vikram Patel",  initials: "VP", procedure: "Crown Treatment Consent", category: "dental",      sentTime: "10:00 AM", status: "Signed",  signedAt: "10:08 AM",  signTimeMin: 8, ipAddress: "185.120.89.xx (Abu Dhabi, UAE)" },
  { id: 5,  patient: "Sunita Rao",    initials: "SR", procedure: "Dental Implant Consent",  category: "dental",      sentTime: "10:15 AM", status: "Pending", signedAt: null,        signTimeMin: null, ipAddress: "" },
  { id: 6,  patient: "Karan Mehta",   initials: "KM", procedure: "Root Canal Consent",      category: "dental",      sentTime: "10:30 AM", status: "Pending", signedAt: null,        signTimeMin: null, ipAddress: "" },
  { id: 7,  patient: "Deepa Singh",   initials: "DS", procedure: "Dental Extraction",       category: "dental",      sentTime: "11:00 AM", status: "Signed",  signedAt: "11:12 AM",  signTimeMin: 12, ipAddress: "217.165.4.xx (Dubai, UAE)" },
  { id: 8,  patient: "Meera Joshi",   initials: "MJ", procedure: "Crown Treatment Consent", category: "dental",      sentTime: "11:15 AM", status: "Signed",  signedAt: "11:22 AM",  signTimeMin: 7, ipAddress: "94.200.78.xx (Sharjah, UAE)" },
];

const TEMPLATES_DATA: Template[] = [
  { id: 1, name: "Dental Implant Consent", usedCount: 34, lastEdited: "Apr 10", content: "Demo template only. The clinic must supply and approve the final consent wording, risks, alternatives, translations, and signatory requirements before use." },
  { id: 2, name: "Dental Extraction", usedCount: 28, lastEdited: "Mar 22", content: "I consent to the dental extraction procedure recommended by my attending dentist. Potential complications including dry socket and post-op swelling have been detailed." },
  { id: 3, name: "Root Canal Consent", usedCount: 19, lastEdited: "Apr 1", content: "Demo template only. The clinic's approved clinical and legal wording is required before production use." },
];

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function formatClock(value: string | null) {
  return value ? new Date(value).toLocaleTimeString("en-AE", { hour: "numeric", minute: "2-digit" }) : "Not sent";
}

function mapConsent(record: ConsentWorkspace["consents"][number]): ConsentRecord {
  const patient = record.patient?.name ?? "Patient";
  const created = new Date(record.created_at).getTime();
  const signed = record.signed_at ? new Date(record.signed_at).getTime() : null;
  const procedure = record.template?.name ?? "Consent form";
  return {
    id: record.id,
    patientId: record.patient?.id,
    templateId: record.template?.id,
    patient,
    initials: patient.split(" ").map(word => word[0]).join("").slice(0, 2).toUpperCase(),
    procedure,
    category: procedure.toLowerCase().includes("dental") ? "dental" : "therapeutic",
    sentTime: formatClock(record.sent_at ?? record.created_at),
    status: record.status === "Signed" ? "Signed" : "Pending",
    signedAt: record.signed_at ? formatClock(record.signed_at) : null,
    signTimeMin: signed ? Math.max(0, Math.round((signed - created) / 60000)) : null,
    ipAddress: record.ip_address ? record.ip_address.replace(/\.\d+$/, ".xx") : "",
  };
}

export default function ConsentView({ addToast }: ConsentViewProps) {
  const [records, setRecords] = useState<ConsentRecord[]>(CONSENT_RECORDS);
  const [templates, setTemplates] = useState<Template[]>(TEMPLATES_DATA);
  const [activeTab, setActiveTab] = useState<"queue" | "templates">("queue");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [newPatient, setNewPatient] = useState("");
  const [newProcedure, setNewProcedure] = useState(TEMPLATES_DATA[0].name);
  const [patients, setPatients] = useState<ConsentWorkspace["patients"]>([]);
  const [sending, setSending] = useState(false);

  const loadWorkspace = async () => {
    if (isDemoMode) return;
    const workspace = await getConsentWorkspace();
    setRecords(workspace.consents.map(mapConsent));
    setPatients(workspace.patients);
    const realTemplates: Template[] = workspace.templates.map(template => ({
      id: template.id,
      name: template.name,
      usedCount: workspace.consents.filter(consent => consent.template?.id === template.id).length,
      lastEdited: new Date(template.updated_at).toLocaleDateString("en-AE", { month: "short", day: "numeric" }),
      content: template.body,
    }));
    setTemplates(realTemplates);
    if (realTemplates[0]) setNewProcedure(realTemplates[0].name);
  };

  useEffect(() => {
    // Initial data synchronization is intentionally started once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkspace().catch(error => addToast(error instanceof Error ? error.message : "Could not load consent records", "warn"));
    // addToast is supplied by the dashboard shell and is stable for its lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signedCount = records.filter(r => r.status === "Signed").length;
  const pendingCount = records.filter(r => r.status === "Pending").length;
  const avgSignTime = Math.round(
    records.filter(r => r.signTimeMin !== null).reduce((s, r) => s + (r.signTimeMin || 0), 0) / (signedCount || 1)
  );

  const filteredRecords = records.filter(r =>
    r.patient.toLowerCase().includes(search.toLowerCase()) ||
    r.procedure.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendConsent = async () => {
    if (!newPatient.trim()) return;
    if (!isDemoMode) {
      const patient = patients.find(item => item.name.toLowerCase() === newPatient.trim().toLowerCase());
      const template = templates.find(item => item.name === newProcedure);
      if (!patient || !template || typeof template.id !== "string") {
        addToast("Choose an existing patient and consent template", "warn");
        return;
      }
      setSending(true);
      try {
        const result = await createConsent({ patient_id: patient.id, template_id: template.id });
        await loadWorkspace();
        setShowSendModal(false);
        setNewPatient("");
        addToast(
          result.delivery === "queued"
            ? `Consent request queued for ${patient.name} via WhatsApp`
            : "Consent saved, but an approved WhatsApp consent template must be configured before it can be sent",
          result.delivery === "queued" ? "success" : "warn",
        );
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Could not send consent", "warn");
      } finally {
        setSending(false);
      }
      return;
    }
    const newRec: ConsentRecord = {
      id: Date.now(),
      patient: newPatient.trim(),
      initials: newPatient.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      procedure: newProcedure,
      category: "surgical",
      sentTime: "Just now",
      status: "Pending",
      signedAt: null,
      signTimeMin: null,
      ipAddress: "",
    };
    setRecords(prev => [newRec, ...prev]);
    setShowSendModal(false);
    setNewPatient("");
    addToast(`Informed consent form sent to ${newRec.patient} via WhatsApp ✓`, "success");
  };

  const handleResend = async (record: ConsentRecord) => {
    if (!isDemoMode && record.patientId && record.templateId) {
      try {
        const result = await createConsent({ patient_id: record.patientId, template_id: record.templateId });
        await loadWorkspace();
        addToast(
          result.delivery === "queued"
            ? `A fresh consent link was queued for ${record.patient}`
            : "A fresh link was created, but no approved WhatsApp consent template is configured",
          result.delivery === "queued" ? "info" : "warn",
        );
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Could not resend consent", "warn");
      }
      return;
    }
    addToast(`WhatsApp consent reminder resent to ${record.patient} ✓`, "info");
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Informed Digital Consent</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            WhatsApp consent requests, mobile signing, and timestamped audit evidence for receptionist follow-up.
          </p>
        </div>

        <button
          onClick={() => setShowSendModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
        >
          <Plus size={14} /> Send Consent Form
        </button>
      </div>

      {/* KPI Bento Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-4"
      >
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Signed Today</span>
          <p className="text-2xl font-bold text-[#00685f]">{signedCount}</p>
          <span className="text-xs text-emerald-700 font-bold">Recorded with audit evidence</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Awaiting Signature</span>
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <span className="text-xs text-slate-500">Auto-reminders active</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Avg Sign Time</span>
          <p className="text-2xl font-bold text-[#0F172A]">{avgSignTime} mins</p>
          <span className="text-xs text-[#00685f] font-semibold">Based on completed requests</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Audit Evidence</span>
          <p className="text-2xl font-bold text-emerald-700 flex items-center gap-1">
            <Shield size={20} /> Evidence Stored
          </p>
          <span className="text-xs text-slate-500">SHA-256 evidence hash</span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#CCD5DF] pb-2">
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "queue"
              ? "bg-[#00685f] text-white"
              : "text-slate-600 hover:text-[#0F172A]"
          }`}
        >
          Consent Queue ({records.length})
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "templates"
              ? "bg-[#00685f] text-white"
              : "text-slate-600 hover:text-[#0F172A]"
          }`}
        >
          Procedure Templates ({templates.length})
        </button>
      </div>

      {activeTab === "queue" ? (
        /* Queue Table */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-[#CCD5DF] rounded-xl overflow-x-auto shadow-xs"
        >
          <div className="p-4 border-b border-[#CCD5DF] bg-[#F8FAFC]">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient or procedure..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
              />
            </div>
          </div>

          <div className="grid min-w-[800px] grid-cols-[180px_minmax(200px,1fr)_105px_150px_165px] items-center px-6 py-3 bg-[#F8FAFC] border-b border-[#CCD5DF] text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Patient</span>
            <span>Procedure</span>
            <span>Sent time</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-[#CCD5DF]">
            {filteredRecords.map((rec) => (
              <div key={rec.id} className="hover:bg-slate-50 transition-colors">
                <div
                  onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                  className="grid min-w-[800px] grid-cols-[180px_minmax(200px,1fr)_105px_150px_165px] items-center px-6 py-3.5 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#00685f]/15 text-[#00685f] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {rec.initials}
                    </div>
                    <span className="font-bold text-[#0F172A]">{rec.patient}</span>
                  </div>

                  <span className="min-w-0 truncate text-slate-600 font-medium" title={rec.procedure}>{rec.procedure}</span>
                  <span className="text-slate-500">{rec.sentTime}</span>

                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        rec.status === "Signed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {rec.status === "Signed" ? "Signed ✓" : "Pending Signature"}
                    </span>
                  </div>

                  <div className="flex min-w-0 items-center justify-end gap-2">
                    {rec.status === "Pending" ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleResend(rec); }}
                        className="whitespace-nowrap px-2.5 py-1 bg-[#00685f] hover:bg-[#005049] text-white text-[11px] font-bold rounded shadow-xs"
                      >
                        Resend WhatsApp
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); addToast("Downloading signed PDF", "info"); }}
                        className="flex items-center gap-1 text-[11px] text-[#00685f] font-bold hover:underline"
                      >
                        <Download size={12} /> PDF
                      </button>
                    )}
                    {expandedId === rec.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === rec.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-[#F8FAFC] border-t border-[#CCD5DF] px-6 py-3 text-xs flex justify-between items-center text-slate-500"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Lock size={12} className="text-emerald-700" /> IP: {rec.ipAddress || "Awaiting Signature"}
                        </span>
                        {rec.signedAt && (
                          <span>Signed at: {rec.signedAt} (in {rec.signTimeMin} mins)</span>
                        )}
                      </div>
                      <span className="text-slate-400">Consent Reference: #CON-{rec.id}04</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        /* Templates List */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm text-[#0F172A]">{tpl.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400">Used {tpl.usedCount}x</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-2">
                  {tpl.content}
                </p>
              </div>

              <div className="pt-3 border-t border-[#CCD5DF] flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Edited {tpl.lastEdited}</span>
                <button
                  onClick={() => addToast(`Template '${tpl.name}' opened for editing`, "info")}
                  className="text-xs font-bold text-[#00685f] hover:underline flex items-center gap-1"
                >
                  <Edit3 size={12} /> Edit Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Consent Modal */}
      <AnimatePresence>
        {showSendModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#CCD5DF] rounded-xl p-6 w-full max-w-md shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#CCD5DF] pb-3">
                <h3 className="text-base font-bold text-[#0F172A]">Send Informed Consent Form</h3>
                <button onClick={() => setShowSendModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={newPatient}
                    onChange={(e) => setNewPatient(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                    list={!isDemoMode ? "consent-patients" : undefined}
                  />
                  {!isDemoMode && (
                    <datalist id="consent-patients">
                      {patients.map(patient => <option key={patient.id} value={patient.name}>{patient.phone}</option>)}
                    </datalist>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Clinical Procedure
                  </label>
                  <select
                    value={newProcedure}
                    onChange={(e) => setNewProcedure(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#CCD5DF]">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 py-2 border border-[#CCD5DF] text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendConsent}
                  disabled={sending}
                  className="flex-1 py-2 bg-[#00685f] hover:bg-[#005049] disabled:opacity-60 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  {sending ? "Queuing..." : "Send via WhatsApp"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
