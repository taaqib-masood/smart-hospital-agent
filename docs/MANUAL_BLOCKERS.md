# Manual production blockers

These require the founders or the pilot clinic. The application can be developed and tested locally without pretending they are complete.

## Meta and WhatsApp

- [ ] Verify the company in Meta Business Manager.
- [ ] Create or connect the clinic-owned WhatsApp Business Account.
- [ ] Confirm whether the clinic will migrate its existing number or use a new one.
- [ ] Supply the app secret, webhook verification token, phone-number ID, and a permanent production credential.
- [ ] Submit Arabic and English templates for appointment confirmation, reminder, cancellation, no-show, follow-up, payment reminder, and consent request.
- [ ] Record explicit WhatsApp opt-in wording and source approved by the clinic.

## Clinic configuration

- [ ] Provide practitioners, services, durations, schedules, holidays, and blocked periods.
- [ ] Provide the clinic address, public phone, timezone, and escalation/callback rules.
- [ ] Approve every patient-facing message in Arabic and English.
- [ ] Provide anonymized patient, appointment, and invoice import samples.
- [ ] Identify the existing PMS/calendar and obtain its integration documentation or export format.

## Consent, privacy, and security

- [ ] Have UAE counsel/privacy staff approve the consent flow, wording, evidence model, retention, deletion, and data-subject request process.
- [ ] Decide and document the production hosting region and data-location policy.
- [ ] Approve staff roles and perform a real cross-clinic access test in staging.
- [ ] Move per-clinic WhatsApp credentials to an approved secrets/encryption design before multi-tenant production use.
- [ ] Configure monitoring, credential rotation, database backups, restore testing, and incident contacts.

## Database and operations

- [ ] Compare the current Supabase schema with the foundation migration; create a reconciliation migration if earlier tables already exist.
- [ ] Apply migrations to a disposable staging database, then run the RLS and duplicate-event tests against it.
- [ ] Configure `CRON_SECRET` and call both scheduler and message-worker routes from the production scheduler.
- [ ] Run a one-week internal sandbox with test phone numbers and no real patient data.
- [ ] Begin a paid 30–60 day clinic pilot only after message templates, opt-in, access control, and rollback procedures are verified.

## Payment links and voice calling

- [ ] Obtain a UAE payment-link merchant account and test credentials; do not enable Tabby or Tamara until each clinic's category is approved in writing.
- [ ] Provide the payment-provider webhook secret and complete test payment, failure, duplicate webhook, cancellation/refund and reconciliation checks.
- [ ] Choose a TDRA-compatible clinic phone/SIP carrier and obtain the provider's written UAE/data-processing confirmation.
- [ ] Approve voice scripts, Arabic/English quality tests, human-transfer path, call/recording consent, retention and deletion rules.
- [ ] Keep WhatsApp Calling separate from the existing messaging number until Meta's calling permissions and number-mode implications have been proven in staging.
