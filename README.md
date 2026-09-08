# Reva AI

Reva is a receptionist-operated WhatsApp workflow for UAE clinics. It helps staff manage patient messages, appointment booking and rescheduling, reminders, follow-ups, invoices, and consent requests from one portal. It is designed to work alongside a receptionist; it is not a doctor portal and does not provide clinical advice.

## Current scope

- WhatsApp inbox with receptionist takeover and automation pause/resume
- Patient contact directory with operational reception notes
- Appointment calendar, booking, cancellation, reminders, and conflict protection
- Practitioner availability rules and one-off blocked periods
- Scheduled follow-up and no-show automations using approved Meta templates
- Billing records and payment reminders
- Receptionist-managed consent templates, secure expiring signing links, and audit evidence
- Operational analytics calculated from recorded activity
- Clinic settings, tenant membership, row-level security, and audit events

Prescription creation, lab reports, doctor briefs, clinical records, waiting-room queues, referral management, deposits, and review campaigns are intentionally outside the current product.

## Stack

- Next.js 16 and React 19
- Supabase Auth and Postgres
- Meta WhatsApp Cloud API
- Vercel-compatible scheduled routes

The pilot remains a modular monolith. Outbound messages are stored as durable jobs, incoming Meta events are deduplicated, and booking conflicts are rejected in Postgres.

## Local setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env.local` and supply the required values.

3. Apply `supabase/migrations/202609080001_receptionist_foundation.sql` to a development Supabase project.

4. Start the app:

   ```powershell
   npm run dev -- --port 3001
   ```

5. Open `http://localhost:3001/dashboard`.

Set `NEXT_PUBLIC_DEMO_MODE=true` for the UI-only demo. Demo mode bypasses page login but never exposes protected API routes.

## Quality gates

```powershell
npm test
npm run typecheck
npm run lint -- --quiet
npm run build
```

## Production inputs still required

- A clinic-owned Meta Business and WhatsApp Business Account
- App secret, verification token, phone-number ID, and permanent credential
- Approved Arabic and English templates for each outbound purpose
- Clinic practitioners, services, schedules, holidays, and escalation rules
- Clinic-approved consent wording and retention policy
- UAE privacy/legal review and an approved hosting/data-location decision
- A reconciliation migration if an existing Supabase database already contains earlier hand-created `reva_*` tables

See [docs/BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md) for system boundaries and delivery gates. The repository does not claim regulatory compliance or guaranteed commercial results; those require clinic-specific legal, security, and pilot validation.
