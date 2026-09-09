"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Copy, MessageCircle, Phone, Plus, Search, Users, X } from "lucide-react";
import { createPatient, getCommunicationConsent, recordCommunicationConsent, updatePatient, type CommunicationConsent } from "@/lib/api";
import { useDashboard } from "@/lib/dashboard-context";
import type { RevaPatient } from "@/lib/supabase/types";
import { usePortalLanguage } from "@/lib/i18n/portal";

interface PatientsViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const pageLoadedAt = Date.now();
const DEMO_CONTACTS: RevaPatient[] = [
  { id: "demo-1", clinic_id: "demo", name: "Sarah Al-Hashimi", phone: "+971 50 892 4110", whatsapp_phone: null, age: null, gender: null, blood_group: null, allergies: [], conditions: [], notes: "Prefers morning appointments. Contact in English.", last_visit: "2026-08-18", total_visits: 5, created_at: "2026-01-10", updated_at: "2026-08-18" },
  { id: "demo-2", clinic_id: "demo", name: "Omar Rahman", phone: "+971 55 234 5678", whatsapp_phone: null, age: null, gender: null, blood_group: null, allergies: [], conditions: [], notes: "Requested a receptionist callback about rescheduling.", last_visit: "2026-08-29", total_visits: 2, created_at: "2026-06-01", updated_at: "2026-08-29" },
  { id: "demo-3", clinic_id: "demo", name: "Meera Joshi", phone: "+971 52 345 6789", whatsapp_phone: null, age: null, gender: null, blood_group: null, allergies: [], conditions: [], notes: "Arabic WhatsApp template preferred.", last_visit: null, total_visits: 0, created_at: "2026-09-01", updated_at: "2026-09-01" },
];

function initials(name: string) {
  return name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
}

function statusFor(patient: RevaPatient): "Active" | "Inactive" | "New" {
  if (patient.total_visits === 0) return "New";
  if (!patient.last_visit) return "Inactive";
  const age = pageLoadedAt - new Date(`${patient.last_visit}T12:00:00`).getTime();
  return age <= 180 * 24 * 60 * 60 * 1000 ? "Active" : "Inactive";
}

const STATUS_COLORS = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-200",
  New: "bg-[#00685f]/10 text-[#00685f] border-[#00685f]/20",
};

export default function PatientsView({ addToast }: PatientsViewProps) {
  const { t } = usePortalLanguage();
  const { patients: remotePatients, loading, refresh } = useDashboard();
  const [contacts, setContacts] = useState<RevaPatient[]>(isDemoMode ? DEMO_CONTACTS : []);
  const [selectedId, setSelectedId] = useState(isDemoMode ? DEMO_CONTACTS[0].id : "");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Inactive" | "New">("All");
  const [note, setNote] = useState(isDemoMode ? DEMO_CONTACTS[0].notes ?? "" : "");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState<CommunicationConsent | null>(null);
  const [consentEvidence, setConsentEvidence] = useState("");

  useEffect(() => {
    if (!isDemoMode && !loading) {
      // Remote contacts are the source of truth in production mode.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContacts(remotePatients);
      if (!selectedId && remotePatients[0]) {
        setSelectedId(remotePatients[0].id);
        setNote(remotePatients[0].notes ?? "");
      }
    }
  }, [loading, remotePatients, selectedId]);

  const selected = contacts.find(contact => contact.id === selectedId) ?? null;

  useEffect(() => {
    if (!isDemoMode && selected) {
      getCommunicationConsent(selected.phone).then(value => {
        setWhatsappConsent(value);
        setConsentEvidence(value?.wording ?? "");
      }).catch(() => setWhatsappConsent(null));
    }
  }, [selected]);
  const filtered = useMemo(() => contacts.filter(contact => {
    const matches = `${contact.name} ${contact.phone} ${contact.notes ?? ""}`.toLowerCase().includes(search.toLowerCase());
    return matches && (filter === "All" || statusFor(contact) === filter);
  }), [contacts, filter, search]);

  const choose = (contact: RevaPatient) => {
    setSelectedId(contact.id);
    setNote(contact.notes ?? "");
  };

  const addContact = async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    try {
      const contact = isDemoMode
        ? { ...DEMO_CONTACTS[0], id: `demo-${Date.now()}`, name: newName.trim(), phone: newPhone.trim(), notes: "", total_visits: 0, last_visit: null }
        : await createPatient({ name: newName.trim(), phone: newPhone.trim(), notes: "" });
      setContacts(previous => [contact, ...previous]);
      setSelectedId(contact.id);
      setNote("");
      setNewName("");
      setNewPhone("");
      setShowAdd(false);
      if (!isDemoMode) refresh();
      addToast("Contact added ✓", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Could not add contact", "warn");
    }
  };

  const saveNote = async () => {
    if (!selected) return;
    try {
      if (!isDemoMode) await updatePatient(selected.id, { notes: note });
      setContacts(previous => previous.map(contact => contact.id === selected.id ? { ...contact, notes: note } : contact));
      addToast("Reception note saved ✓", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Could not save note", "warn");
    }
  };

  const saveConsent = async (status: CommunicationConsent["status"]) => {
    if (!selected || consentEvidence.trim().length < 5) {
      addToast("Enter where and how the patient gave or withdrew permission", "warn");
      return;
    }
    if (isDemoMode) {
      setWhatsappConsent({ id: "demo", patient_id: selected.id, phone: selected.phone, status, source: "demo", wording: consentEvidence, language: "en", recorded_at: new Date().toISOString() });
      addToast(`WhatsApp ${status === "opted_in" ? "opt-in" : "opt-out"} recorded`, "success");
      return;
    }
    try {
      const value = await recordCommunicationConsent({ patient_id: selected.id, status, wording: consentEvidence, source: "receptionist_record" });
      setWhatsappConsent(value);
      addToast(`WhatsApp ${status === "opted_in" ? "opt-in" : "opt-out"} recorded`, "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Could not record WhatsApp permission", "warn");
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-2xl font-bold text-[#0F172A]">{t("Patient Contacts")}</h2><p className="text-sm text-slate-500 mt-0.5">{t("Reception contact details, visit count, and operational notes.")}</p></div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00685f] text-white text-xs font-bold rounded-lg"><Plus size={14} /> {t("Add Contact")}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-5 bg-white border border-[#CCD5DF] rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#CCD5DF] space-y-3 bg-[#F8FAFC]">
            <div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={t("Search name, phone or reception note...")} className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#CCD5DF] rounded-lg text-xs" /></div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-[#CCD5DF]">{(["All", "Active", "Inactive", "New"] as const).map(tab => <button key={tab} onClick={() => setFilter(tab)} className={`flex-1 py-1 text-xs font-bold rounded-md ${filter === tab ? "bg-white text-[#00685f] shadow-xs" : "text-slate-600"}`}>{t(tab)}</button>)}</div>
          </div>
          <div className="divide-y divide-[#CCD5DF] overflow-y-auto flex-1">
            {filtered.map(contact => {
              const status = statusFor(contact);
              return <button key={contact.id} onClick={() => choose(contact)} className={`w-full p-4 text-left flex items-center justify-between border-l-4 ${contact.id === selectedId ? "bg-[#00685f]/[0.04] border-l-[#00685f]" : "border-l-transparent hover:bg-slate-50"}`}><span className="flex items-center gap-3 min-w-0"><span className="w-9 h-9 rounded-full bg-[#00685f]/15 text-[#00685f] font-bold text-xs flex items-center justify-center">{initials(contact.name)}</span><span className="min-w-0"><span className="text-sm font-bold text-[#0F172A] block truncate">{contact.name}</span><span className="text-xs text-slate-500">{contact.phone}</span></span></span><span className="text-right"><span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${STATUS_COLORS[status]}`}>{t(status)}</span><span className="text-[11px] text-slate-400 block mt-1">{contact.total_visits} {t("visits")}</span></span></button>;
            })}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#CCD5DF] rounded-xl p-6 overflow-y-auto">
          {selected ? <div className="space-y-6">
            <div className="flex items-start justify-between"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-[#00685f] text-white font-bold flex items-center justify-center">{initials(selected.name)}</div><div><h3 className="text-lg font-bold">{selected.name}</h3><button onClick={() => navigator.clipboard.writeText(selected.phone).then(() => addToast(t("Phone copied"), "success"))} className="flex items-center gap-1 text-xs text-slate-500"><Phone size={12} /> {selected.phone} <Copy size={10} /></button></div></div><button onClick={() => addToast(`${t("WhatsApp")} · ${selected.name}`, "info")} className="px-3 py-1.5 bg-[#00685f] text-white text-xs font-bold rounded-lg flex items-center gap-1.5"><MessageCircle size={13} /> {t("WhatsApp")}</button></div>
            <div className="grid grid-cols-2 gap-4"><div className="bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl p-4"><span className="text-[10px] font-bold uppercase text-slate-500">{t("Last recorded visit")}</span><p className="text-sm font-bold mt-1 flex items-center gap-1"><Calendar size={14} className="text-[#00685f]" /> {selected.last_visit ?? t("No visit recorded")}</p></div><div className="bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl p-4"><span className="text-[10px] font-bold uppercase text-slate-500">{t("Lifetime visits")}</span><p className="text-sm font-bold mt-1">{selected.total_visits}</p></div></div>
            <div className="bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl p-4 space-y-2"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase text-slate-500">{t("WhatsApp permission")}</span><span className={`text-[10px] font-bold ${whatsappConsent?.status === "opted_in" ? "text-emerald-700" : "text-amber-700"}`}>{t(whatsappConsent?.status === "opted_in" ? "Opted in" : whatsappConsent?.status === "opted_out" ? "Opted out" : "Not recorded")}</span></div><textarea rows={2} value={consentEvidence} onChange={event => setConsentEvidence(event.target.value)} placeholder={t("Evidence, e.g. signed registration form dated...")} className="w-full p-3 bg-white border border-[#CCD5DF] rounded-lg text-xs" /><div className="flex gap-2"><button onClick={() => saveConsent("opted_in")} className="flex-1 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold">{t("Record opt-in")}</button><button onClick={() => saveConsent("opted_out")} className="flex-1 py-1.5 bg-white border border-[#CCD5DF] text-slate-700 rounded-lg text-xs font-bold">{t("Record opt-out")}</button></div></div>
            <div className="space-y-2"><div className="flex items-center justify-between"><h4 className="text-[11px] font-bold uppercase text-slate-500">{t("Reception notes")}</h4><button onClick={saveNote} className="px-3 py-1 bg-[#00685f] text-white text-xs font-bold rounded-md">{t("Save")}</button></div><textarea rows={5} value={note} onChange={event => setNote(event.target.value)} placeholder={t("Language preference, callback request, accessibility or scheduling note...")} className="w-full p-4 bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl text-xs" /></div>
          </div> : <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs"><Users size={32} className="mb-2" /> {t("Select a contact to view reception details.")}</div>}
        </div>
      </div>

      {showAdd && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><div className="bg-white rounded-xl border border-[#CCD5DF] p-6 w-full max-w-md space-y-4"><div className="flex justify-between"><h3 className="font-bold">{t("Add Patient Contact")}</h3><button onClick={() => setShowAdd(false)}><X size={16} /></button></div><input value={newName} onChange={event => setNewName(event.target.value)} placeholder={t("Full name")} className="w-full px-3 py-2 border border-[#CCD5DF] rounded-lg text-xs" /><input value={newPhone} onChange={event => setNewPhone(event.target.value)} placeholder={t("WhatsApp number, e.g. +971...")} className="w-full px-3 py-2 border border-[#CCD5DF] rounded-lg text-xs" /><div className="flex gap-2"><button onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-[#CCD5DF] rounded-lg text-xs font-bold">{t("Cancel")}</button><button onClick={addContact} className="flex-1 py-2 bg-[#00685f] text-white rounded-lg text-xs font-bold">{t("Add Contact")}</button></div></div></div>}
    </div>
  );
}
