# Reva receptionist backend

## Scope

Reva is a receptionist-operated WhatsApp workflow for clinics. Doctors are booking resources, not portal users. The supported journey is message, booking or handoff, confirmation, reminder, attendance, follow-up, billing and receptionist-managed consent.

The first release keeps Dashboard, WhatsApp Inbox, Appointments, Contacts, Billing, Automations, Consent, Availability, Analytics and Settings. Queue, Referrals, Deposits and Reviews remain outside the production backend until a paid pilot requests them.

## Architecture

The application remains a Next.js modular monolith backed by Supabase Postgres. Browser code uses the authenticated Supabase client or route handlers. Public Meta webhooks use a server-only service client after signature verification. All clinic records carry `clinic_id` and are protected by database row-level security.

Reliable outbound work is stored in `reva_message_jobs` and claimed by a scheduled worker. `reva_webhook_events` provides inbound idempotency. Booking conflicts are rejected by a partial unique database index. `reva_audit_events` is append-only for authenticated users.

No microservices, Redis, Kafka or autonomous clinical AI are required for the pilot.

## Delivery phases

| Phase | Scope | Repository status | Production gate |
| --- | --- | --- | --- |
| 1. Foundation | Tenant model, receptionist roles, row-level security, audit events, schema | Implemented | Apply the migration to disposable Supabase and run cross-clinic tests |
| 2. WhatsApp reliability | Signed webhook, inbound deduplication, opt-out, human handoff, durable outbound jobs and retries | Implemented | Connect a Meta test number and approved sandbox templates |
| 3. Reception workflow | Contacts, availability, conflict-safe booking, cancellation, rescheduling and reminders | Implemented | Load clinic-approved practitioners, services, schedules and escalation rules |
| 4. Revenue operations | Follow-ups, Billing, Consent and operational analytics | Implemented | Approve templates, consent wording, retention and measured pilot baselines |
| 5. Pilot readiness | Desktop/mobile portal, honest demo data, local browser QA and operational runbook | Implemented locally | Complete staging soak, backups, monitoring, rollback and clinic sign-off |

“Implemented” means the source, local build and UI workflow are complete. It does not mean Meta approval, regulatory approval or staging-database validation has happened; those external gates are listed in `MANUAL_BLOCKERS.md`.

## Delivery gates

1. Foundation: migrations apply cleanly; cross-clinic reads and writes fail.
2. WhatsApp: invalid signatures fail; repeated events do not duplicate work; failed jobs remain retryable.
3. Reception: booking conflicts fail atomically; handoff pauses automation; changes are audited.
4. Automations: reminders and follow-ups respect communication permission and are traceable.
5. Pilot: test clinic runs for one week without unintended messages or developer intervention.

## Manual production inputs

- Meta Business and WhatsApp Business Account verification.
- Clinic-owned WhatsApp number, app secret, verification token and permanent credential.
- Approved Arabic and English templates.
- Clinic services, schedules, holidays, practitioners, cancellation rules and escalation contacts.
- UAE privacy/legal review, approved retention rules and hosting/data-location decision.
- Anonymized import samples and the clinic's PMS/calendar integration details.
