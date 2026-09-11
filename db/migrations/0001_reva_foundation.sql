-- Cloudflare D1 foundation for Reva.
-- D1 uses SQLite: ids and auth references stay TEXT, JSON/arrays are JSON strings,
-- timestamps are ISO-8601 TEXT, and clinic authorization is enforced in Worker code.

PRAGMA foreign_keys = ON;

CREATE TABLE reva_clinics (
  id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 120),
  phone TEXT,
  whatsapp_number TEXT,
  whatsapp_phone_id TEXT UNIQUE,
  address TEXT,
  specialty TEXT NOT NULL DEFAULT 'clinic',
  registration_no TEXT,
  greeting_message TEXT NOT NULL DEFAULT 'Hello! How can we help you today?',
  reminder_hours_before INTEGER NOT NULL DEFAULT 24 CHECK (reminder_hours_before BETWEEN 1 AND 168),
  timezone TEXT NOT NULL DEFAULT 'Asia/Dubai',
  currency TEXT NOT NULL DEFAULT 'AED',
  working_hours TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE reva_clinic_members (
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'receptionist' CHECK (role IN ('owner', 'admin', 'receptionist')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (clinic_id, user_id)
);

CREATE TABLE reva_doctors (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialization TEXT,
  qualification TEXT,
  reg_no TEXT,
  phone TEXT,
  available_days TEXT NOT NULL DEFAULT '[]',
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (slot_duration_minutes BETWEEN 5 AND 480),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE reva_services (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes BETWEEN 5 AND 480),
  buffer_minutes INTEGER NOT NULL DEFAULT 0 CHECK (buffer_minutes BETWEEN 0 AND 180),
  price REAL CHECK (price IS NULL OR price >= 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (clinic_id, name)
);

CREATE TABLE reva_patients (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_phone TEXT,
  age INTEGER CHECK (age IS NULL OR age BETWEEN 0 AND 130),
  gender TEXT,
  blood_group TEXT,
  allergies TEXT NOT NULL DEFAULT '[]',
  conditions TEXT NOT NULL DEFAULT '[]',
  notes TEXT,
  last_visit TEXT,
  total_visits INTEGER NOT NULL DEFAULT 0 CHECK (total_visits >= 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (clinic_id, phone)
);

CREATE TABLE reva_availability_rules (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  doctor_id TEXT REFERENCES reva_doctors(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  slot_minutes INTEGER NOT NULL DEFAULT 30 CHECK (slot_minutes BETWEEN 5 AND 480),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (start_time < end_time)
);

CREATE TABLE reva_availability_exceptions (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  doctor_id TEXT REFERENCES reva_doctors(id) ON DELETE CASCADE,
  exception_date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  available INTEGER NOT NULL DEFAULT 0 CHECK (available IN (0, 1)),
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK ((start_time IS NULL AND end_time IS NULL) OR (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time))
);

CREATE TABLE reva_appointments (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  patient_id TEXT REFERENCES reva_patients(id) ON DELETE SET NULL,
  doctor_id TEXT REFERENCES reva_doctors(id) ON DELETE SET NULL,
  service_id TEXT REFERENCES reva_services(id) ON DELETE SET NULL,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes BETWEEN 5 AND 480),
  type TEXT NOT NULL DEFAULT 'Appointment',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed', 'No-Show')),
  notes TEXT,
  reminder_sent_at TEXT,
  confirmed_via TEXT,
  no_show_risk REAL NOT NULL DEFAULT 0 CHECK (no_show_risk BETWEEN 0 AND 100),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX reva_active_appointment_slot
  ON reva_appointments (clinic_id, doctor_id, appointment_date, appointment_time)
  WHERE doctor_id IS NOT NULL AND status IN ('Pending', 'Confirmed');

CREATE TABLE reva_conversations (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  patient_id TEXT REFERENCES reva_patients(id) ON DELETE SET NULL,
  wa_contact_id TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT NOT NULL,
  last_message TEXT,
  last_message_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_inbound_at TEXT,
  unread_count INTEGER NOT NULL DEFAULT 0 CHECK (unread_count >= 0),
  is_bot_active INTEGER NOT NULL DEFAULT 1 CHECK (is_bot_active IN (0, 1)),
  assigned_to TEXT,
  handoff_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (clinic_id, contact_phone)
);

CREATE TABLE reva_messages (
  id TEXT PRIMARY KEY NOT NULL,
  conversation_id TEXT NOT NULL REFERENCES reva_conversations(id) ON DELETE CASCADE,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT NOT NULL DEFAULT '',
  message_type TEXT NOT NULL DEFAULT 'text',
  wa_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed', 'suppressed')),
  error_code TEXT,
  error_message TEXT,
  sent_by TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX reva_messages_wa_id ON reva_messages (wa_message_id) WHERE wa_message_id IS NOT NULL;

CREATE TABLE reva_booking_state (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  contact_phone TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'idle',
  context TEXT NOT NULL DEFAULT '{}',
  expires_at TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (clinic_id, contact_phone)
);

CREATE TABLE reva_communication_consents (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  patient_id TEXT REFERENCES reva_patients(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel = 'whatsapp'),
  status TEXT NOT NULL CHECK (status IN ('opted_in', 'opted_out')),
  source TEXT NOT NULL,
  wording TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  recorded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  recorded_by TEXT,
  UNIQUE (clinic_id, phone, channel)
);

CREATE TABLE reva_whatsapp_templates (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  template_name TEXT NOT NULL,
  language_code TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paused')),
  components TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (clinic_id, purpose, language_code)
);

CREATE TABLE reva_consent_templates (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  body TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (clinic_id, name, version)
);

CREATE TABLE reva_automation_rules (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('after_completed', 'after_no_show')),
  delay_minutes INTEGER NOT NULL DEFAULT 120 CHECK (delay_minutes BETWEEN 0 AND 525600),
  whatsapp_template_id TEXT NOT NULL REFERENCES reva_whatsapp_templates(id) ON DELETE RESTRICT,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE reva_consent_requests (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  patient_id TEXT REFERENCES reva_patients(id) ON DELETE SET NULL,
  template_id TEXT NOT NULL REFERENCES reva_consent_templates(id) ON DELETE RESTRICT,
  access_token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Viewed', 'Signed', 'Declined', 'Expired', 'Cancelled')),
  sent_at TEXT,
  viewed_at TEXT,
  signed_at TEXT,
  signer_name TEXT,
  accepted_terms INTEGER CHECK (accepted_terms IS NULL OR accepted_terms IN (0, 1)),
  signature_hash TEXT,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE reva_invoices (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  patient_id TEXT REFERENCES reva_patients(id) ON DELETE SET NULL,
  appointment_id TEXT REFERENCES reva_appointments(id) ON DELETE SET NULL,
  service_description TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'AED',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Waived', 'Cancelled')),
  payment_method TEXT,
  paid_at TEXT,
  waived_reason TEXT,
  invoice_date TEXT NOT NULL DEFAULT (date('now')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE reva_follow_ups (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES reva_patients(id) ON DELETE CASCADE,
  appointment_id TEXT REFERENCES reva_appointments(id) ON DELETE SET NULL,
  rule_id TEXT REFERENCES reva_automation_rules(id) ON DELETE SET NULL,
  rule_type TEXT NOT NULL,
  template_message TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  sent_at TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Skipped', 'Failed')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX reva_follow_up_once_per_rule
  ON reva_follow_ups (appointment_id, rule_id)
  WHERE appointment_id IS NOT NULL AND rule_id IS NOT NULL;

CREATE TABLE reva_webhook_events (
  id TEXT PRIMARY KEY NOT NULL,
  provider_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  processed_at TEXT,
  error TEXT
);

CREATE TABLE reva_message_jobs (
  id TEXT PRIMARY KEY NOT NULL,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  conversation_id TEXT REFERENCES reva_conversations(id) ON DELETE CASCADE,
  patient_id TEXT REFERENCES reva_patients(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  payload TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'dead')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts BETWEEN 1 AND 20),
  run_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  locked_at TEXT,
  last_error TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX reva_message_jobs_due
  ON reva_message_jobs (run_at, created_at)
  WHERE status IN ('pending', 'failed', 'processing');

CREATE TABLE reva_audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id TEXT NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  actor_user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX reva_audit_events_clinic_time ON reva_audit_events (clinic_id, created_at DESC);

-- Keep WhatsApp access tokens out of D1 plaintext. For multi-clinic production,
-- encrypted_access_token must be written by a Worker-side encryption adapter.
CREATE TABLE reva_whatsapp_credentials (
  clinic_id TEXT PRIMARY KEY NOT NULL REFERENCES reva_clinics(id) ON DELETE CASCADE,
  phone_id TEXT NOT NULL,
  encrypted_access_token TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX reva_doctors_clinic ON reva_doctors (clinic_id, active);
CREATE INDEX reva_services_clinic ON reva_services (clinic_id, active);
CREATE INDEX reva_patients_clinic ON reva_patients (clinic_id, created_at DESC);
CREATE INDEX reva_appointments_clinic_date ON reva_appointments (clinic_id, appointment_date, appointment_time);
CREATE INDEX reva_conversations_clinic_activity ON reva_conversations (clinic_id, last_message_at DESC);
CREATE INDEX reva_messages_conversation_time ON reva_messages (conversation_id, created_at);
