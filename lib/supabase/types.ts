export interface RevaClinic {
  id: string;
  owner_id: string;
  name: string;
  phone: string | null;
  whatsapp_number: string | null;
  whatsapp_token: string | null;
  whatsapp_phone_id: string | null;
  address: string | null;
  specialty: string;
  registration_no: string | null;
  greeting_message: string;
  reminder_hours_before: number;
  timezone: string;
  currency: string;
  working_hours: Record<string, { open: string; close: string } | null>;
  created_at: string;
  updated_at: string;
}

export interface RevaDoctor {
  id: string;
  clinic_id: string;
  name: string;
  specialization: string | null;
  qualification: string | null;
  reg_no: string | null;
  phone: string | null;
  available_days: string[];
  slot_duration_minutes: number;
  created_at: string;
}

export interface RevaPatient {
  id: string;
  clinic_id: string;
  name: string;
  phone: string;
  whatsapp_phone: string | null;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  allergies: string[];
  conditions: string[];
  notes: string | null;
  last_visit: string | null;
  total_visits: number;
  created_at: string;
  updated_at: string;
}

export interface RevaAppointment {
  id: string;
  clinic_id: string;
  patient_id: string | null;
  doctor_id: string | null;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  type: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed" | "No-Show";
  notes: string | null;
  reminder_sent_at: string | null;
  confirmed_via: string | null;
  no_show_risk: number;
  created_at: string;
  updated_at: string;
  // joined
  patient?: RevaPatient;
  doctor?: RevaDoctor;
}

export interface RevaConversation {
  id: string;
  clinic_id: string;
  patient_id: string | null;
  wa_contact_id: string;
  contact_name: string | null;
  contact_phone: string;
  last_message: string | null;
  last_message_at: string;
  last_inbound_at: string | null;
  unread_count: number;
  is_bot_active: boolean;
  created_at: string;
}

export interface RevaMessage {
  id: string;
  conversation_id: string;
  clinic_id: string;
  direction: "inbound" | "outbound";
  content: string;
  message_type: string;
  wa_message_id: string | null;
  status: "queued" | "sent" | "delivered" | "read" | "failed" | "suppressed";
  sent_by: string;
  sent_at: string;
}

export interface RevaInvoice {
  id: string;
  clinic_id: string;
  patient_id: string | null;
  appointment_id: string | null;
  service_description: string;
  amount: number;
  status: "Pending" | "Paid" | "Waived";
  payment_method: string | null;
  paid_at: string | null;
  waived_reason: string | null;
  invoice_date: string;
  created_at: string;
  patient?: RevaPatient;
}

export interface RevaFollowUp {
  id: string;
  clinic_id: string;
  patient_id: string;
  appointment_id: string | null;
  rule_type: string;
  template_message: string;
  scheduled_at: string;
  sent_at: string | null;
  status: "Pending" | "Sent" | "Skipped" | "Failed";
  created_at: string;
  patient?: RevaPatient;
}

export interface BookingState {
  id: string;
  clinic_id: string;
  contact_phone: string;
  state: string;
  context: Record<string, unknown>;
  expires_at: string;
  updated_at: string;
}
