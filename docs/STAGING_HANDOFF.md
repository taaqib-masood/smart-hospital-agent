# Staging handoff

Complete these steps in order. Do not put API keys, tokens, or patient data in GitHub or chat.

## 1. Create a disposable Supabase project

1. Create a project named `reva-staging`.
2. In **SQL Editor**, run the full contents of `supabase/migrations/202609080001_receptionist_foundation.sql`.
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
WHATSAPP_PHONE_ID=
WHATSAPP_TOKEN=
CRON_SECRET=
```

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
- A payment-link merchant account and sandbox credentials before linking payments.
- A carrier-approved phone/SIP route and recorded-call policy before enabling voice.

Do not enable Tabby, Tamara, or Meta SIP Calling until the clinic category and number-mode implications are approved in writing.
