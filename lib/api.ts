/**
 * Client-side API helpers — typed fetch wrappers for all Reva API routes.
 * Use these in "use client" components / hooks.
 */

import type {
  RevaAppointment, RevaPatient, RevaConversation,
  RevaMessage, RevaInvoice, RevaFollowUp, RevaClinic
} from "@/lib/supabase/types";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? res.statusText);
  }
  return res.json();
}

/* ── Clinic ─────────────────────────────────────────────────── */
export const getClinic = () =>
  apiFetch<{ clinic: RevaClinic }>("/api/clinic").then(r => r.clinic);

export const updateClinic = (data: Partial<RevaClinic>) =>
  apiFetch<{ clinic: RevaClinic }>("/api/clinic", { method: "PATCH", body: JSON.stringify(data) }).then(r => r.clinic);

/* ── Appointments ─────────────────────────────────────────────── */
export const getAppointments = (params?: { date?: string; from?: string; to?: string; status?: string }) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<{ appointments: RevaAppointment[] }>(`/api/appointments${qs ? `?${qs}` : ""}`).then(r => r.appointments);
};

export const createAppointment = (data: {
  patient_id?: string; doctor_id?: string;
  appointment_date: string; appointment_time: string;
  type?: string; notes?: string;
}) => apiFetch<{ appointment: RevaAppointment }>("/api/appointments", { method: "POST", body: JSON.stringify(data) }).then(r => r.appointment);

export const updateAppointment = (id: string, data: {
  status?: string; notes?: string;
  appointment_date?: string; appointment_time?: string;
  send_reminder?: boolean;
}) => apiFetch<{ appointment: RevaAppointment }>(`/api/appointments/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r.appointment);

export const queueAppointmentReminder = (id: string) =>
  apiFetch<{ appointment: RevaAppointment; notification: "not_applicable" | "queued" | "template_missing" }>(`/api/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ send_reminder: true }),
  });

/* ── Patients ─────────────────────────────────────────────────── */
export const getPatients = (search?: string) => {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<{ patients: RevaPatient[] }>(`/api/patients${qs}`).then(r => r.patients);
};

export const createPatient = (data: Partial<RevaPatient>) =>
  apiFetch<{ patient: RevaPatient }>("/api/patients", { method: "POST", body: JSON.stringify(data) }).then(r => r.patient);

export const updatePatient = (id: string, data: Pick<Partial<RevaPatient>, "name" | "phone" | "notes">) =>
  apiFetch<{ patient: RevaPatient }>(`/api/patients/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r.patient);

export interface CommunicationConsent {
  id: string;
  patient_id: string | null;
  phone: string;
  status: "opted_in" | "opted_out";
  source: string;
  wording: string | null;
  language: "en" | "ar";
  recorded_at: string;
}

export const getCommunicationConsent = (phone: string) =>
  apiFetch<{ consent: CommunicationConsent | null }>(`/api/communication-consents?phone=${encodeURIComponent(phone)}`).then(result => result.consent);

export const recordCommunicationConsent = (data: { patient_id: string; status: CommunicationConsent["status"]; wording: string; source?: string; language?: "en" | "ar" }) =>
  apiFetch<{ consent: CommunicationConsent }>("/api/communication-consents", { method: "POST", body: JSON.stringify(data) }).then(result => result.consent);

/* ── Conversations ─────────────────────────────────────────────── */
export const getConversations = () =>
  apiFetch<{ conversations: RevaConversation[] }>("/api/conversations").then(r => r.conversations);

export const getMessages = (conversationId: string) =>
  apiFetch<{ messages: RevaMessage[] }>(`/api/conversations/${conversationId}/messages`).then(r => r.messages);

export const sendMessage = (conversationId: string, text: string) =>
  apiFetch<{ message: RevaMessage }>("/api/whatsapp/send", { method: "POST", body: JSON.stringify({ conversation_id: conversationId, text }) }).then(r => r.message);

export const sendTemplateMessage = (conversationId: string, templateId: string) =>
  apiFetch<{ message: RevaMessage }>("/api/whatsapp/send", {
    method: "POST",
    body: JSON.stringify({ conversation_id: conversationId, template_id: templateId }),
  }).then(r => r.message);

export const markConversationRead = (conversationId: string) =>
  apiFetch<{ ok: boolean }>(`/api/conversations/${conversationId}/read`, { method: "POST" });

export const setConversationAutomation = (conversationId: string, isBotActive: boolean, handoffReason?: string) =>
  apiFetch<{ conversation: RevaConversation }>(`/api/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_bot_active: isBotActive, handoff_reason: handoffReason }),
  }).then(r => r.conversation);

/* ── Invoices ─────────────────────────────────────────────────── */
export const getInvoices = (params?: { status?: string; period?: string }) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<{ invoices: RevaInvoice[] }>(`/api/invoices${qs ? `?${qs}` : ""}`).then(r => r.invoices);
};

export const updateInvoice = (id: string, data: { status?: string; payment_method?: string; waived_reason?: string; amount?: number; send_reminder?: boolean }) =>
  apiFetch<{ invoice: RevaInvoice }>(`/api/invoices/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r.invoice);

export const createInvoice = (data: Partial<RevaInvoice>) =>
  apiFetch<{ invoice: RevaInvoice }>("/api/invoices", { method: "POST", body: JSON.stringify(data) }).then(r => r.invoice);

/* ── Follow-ups ─────────────────────────────────────────────────── */
export const getFollowUps = () =>
  apiFetch<{ follow_ups: RevaFollowUp[] }>("/api/follow-ups").then(r => r.follow_ups);

export const updateFollowUp = (id: string, data: { status: string }) =>
  apiFetch<{ follow_up: RevaFollowUp }>(`/api/follow-ups/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r.follow_up);

export interface RevaAutomationRule {
  id: string;
  clinic_id: string;
  name: string;
  trigger_type: "after_completed" | "after_no_show";
  delay_minutes: number;
  whatsapp_template_id: string;
  enabled: boolean;
  template: { id: string; purpose: string; template_name: string; language_code: string; status: "pending" | "approved" | "rejected" | "paused" } | null;
}

export interface AutomationWorkspace {
  rules: RevaAutomationRule[];
  templates: Array<{ id: string; purpose: string; template_name: string; language_code: string; status: "pending" | "approved" | "rejected" | "paused"; components: Array<Record<string, unknown>> }>;
}

export const getAutomationRules = () => apiFetch<AutomationWorkspace>("/api/automation-rules");

export const createAutomationRule = (data: { name: string; trigger_type: RevaAutomationRule["trigger_type"]; delay_minutes: number; whatsapp_template_id: string; enabled?: boolean }) =>
  apiFetch<{ rule: RevaAutomationRule }>("/api/automation-rules", { method: "POST", body: JSON.stringify(data) }).then(result => result.rule);

export const updateAutomationRule = (id: string, data: Partial<Pick<RevaAutomationRule, "name" | "trigger_type" | "delay_minutes" | "whatsapp_template_id" | "enabled">>) =>
  apiFetch<{ rule: RevaAutomationRule }>(`/api/automation-rules/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then(result => result.rule);

/* ── Consent ─────────────────────────────────────────────────── */
export interface ConsentWorkspace {
  consents: Array<{
    id: string;
    status: "Pending" | "Sent" | "Viewed" | "Signed" | "Declined" | "Expired" | "Cancelled";
    sent_at: string | null;
    signed_at: string | null;
    created_at: string;
    ip_address: string | null;
    patient: { id: string; name: string; phone: string } | null;
    template: { id: string; name: string; version: number } | null;
  }>;
  patients: Array<{ id: string; name: string; phone: string }>;
  templates: Array<{ id: string; name: string; body: string; version: number; updated_at: string }>;
}

export const getConsentWorkspace = () => apiFetch<ConsentWorkspace>("/api/consents");

export const createConsent = (data: { patient_id: string; template_id: string; expires_in_hours?: number }) =>
  apiFetch<{ consent: ConsentWorkspace["consents"][number]; signing_url: string; delivery: "queued" | "template_missing" }>("/api/consents", {
    method: "POST",
    body: JSON.stringify(data),
  });

/* ── Availability ─────────────────────────────────────────────── */
export interface AvailabilityWorkspace {
  doctors: Array<{ id: string; name: string; specialization: string | null; slot_duration_minutes: number }>;
  rules: Array<{ id: string; doctor_id: string | null; weekday: number; start_time: string; end_time: string; slot_minutes: number; active: boolean }>;
  exceptions: Array<{ id: string; doctor_id: string | null; exception_date: string; start_time: string | null; end_time: string | null; available: boolean; reason: string | null }>;
  slots: Array<{ time: string; status: "available" | "blocked" | "booked"; patient: string | null; reason: string | null; exception_id: string | null }>;
}

export const getAvailability = (date?: string, doctorId?: string) => {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (doctorId) params.set("doctor_id", doctorId);
  return apiFetch<AvailabilityWorkspace>(`/api/availability${params.size ? `?${params}` : ""}`);
};

export const createAvailabilityException = (data: { doctor_id: string; exception_date: string; start_time?: string; end_time?: string; available?: boolean; reason?: string }) =>
  apiFetch<{ exception: AvailabilityWorkspace["exceptions"][number] }>("/api/availability", {
    method: "POST",
    body: JSON.stringify({ kind: "exception", ...data }),
  }).then(result => result.exception);

export const deleteAvailabilityException = (id: string) =>
  apiFetch<{ ok: true }>(`/api/availability?id=${encodeURIComponent(id)}`, { method: "DELETE" });

export const createAvailabilityRule = (data: { doctor_id?: string; weekday: number; start_time: string; end_time: string; slot_minutes?: number }) =>
  apiFetch<{ rule: AvailabilityWorkspace["rules"][number] }>("/api/availability", { method: "POST", body: JSON.stringify({ kind: "rule", ...data }) }).then(result => result.rule);

export const deleteAvailabilityRule = (id: string) =>
  apiFetch<{ ok: true }>(`/api/availability?kind=rule&id=${encodeURIComponent(id)}`, { method: "DELETE" });

/* ── Analytics ───────────────────────────────────────────────── */
export interface RevaAnalytics {
  period_days: number;
  metrics: {
    bookings: number;
    whatsapp_bookings: number;
    completed: number;
    no_shows: number;
    recorded_revenue: number;
    outstanding: number;
    conversations: number;
    unread: number;
    human_handoffs: number;
  };
  daily: Array<{ date: string; bookings: number }>;
  services: Array<{ name: string; count: number }>;
}

export const getAnalytics = (days = 30) => apiFetch<RevaAnalytics>(`/api/analytics?days=${days}`);
