# Staging handoff

Complete these steps in order. Do not put API keys, tokens, or patient data in GitHub or chat.

## 1. Create a disposable Supabase project

1. Create a project named `reva-staging`.
2. In **SQL Editor**, run every migration in `supabase/migrations/` in filename order. This creates the clinic workflow first, then moves WhatsApp access tokens out of the receptionist-readable clinic record.

   The relationship migration `202610280003` requires PostgreSQL 15+ and validates existing clinic references. Conflicting rows make it roll back; review them without deleting patient data. Verify the refreshed PostgREST relationships after applying it.

   Pause consent issuing/signing while applying `202610280004` and deploying its matching API/UI. New requests preserve their issued wording; clean existing unsigned requests preserve the wording present at upgrade and show a review notice. Historical signed requests remain unverified rather than acquiring invented snapshots. Retained evidence is immutable; existing authorized admin deletion and patient-reference cleanup remain available.

   Earlier phone-identity collisions require an authorized manual data review; this patch does not rewrite or merge historical patient/conversation records.

3. Copy the project URL, anon key, and service-role key into a private `.env` file:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

4. Run `npm run check:config`. It must report that live Supabase credentials are present.

## 2. Connect a Meta test number

1. Create a Meta app with the WhatsApp product and use its test number first.
2. Add a public HTTPS staging URL for `/api/whatsapp/webhook`; Meta cannot call `localhost`.
3. Set the values below in the same private `.env` file:

```env
WHATSAPP_APP_SECRET=
WHATSAPP_VERIFY_TOKEN=
CRON_SECRET=
```

Provision each clinic's phone-number ID and access token together in `reva_whatsapp_credentials`, using only a service-role/admin process. Set the matching `reva_clinics.whatsapp_phone_id` for webhook routing. Every clinic needs its own complete credential pair; there is no shared environment fallback. Do not add an access token to `reva_clinics`, the browser, GitHub, or chat.

4. Subscribe the webhook to message and delivery-status events.
5. Use test contacts and synthetic data only until approved templates and opt-in wording exist.

## 3. Start the staging application

```powershell
docker compose up --build
```

Check `http://localhost:3001/api/health`, then sign in and test the portal. For scheduled reminders and the message worker, run exactly one scheduler:

```powershell
docker compose --profile scheduler up --build
```

## 4. Pilot approval checklist

- Clinic-approved English and Arabic templates, opt-in wording, service list, schedules, cancellation rules, and escalation contact.
- UAE privacy, retention, hosting-region, and staff-access approval.
- Payment links are deliberately deferred; Billing remains a manual receptionist workflow until merchant onboarding is approved.
- A carrier-approved phone/SIP route and recorded-call policy before enabling voice.

Do not enable Tabby, Tamara, or Meta SIP Calling until the clinic category and number-mode implications are approved in writing.
