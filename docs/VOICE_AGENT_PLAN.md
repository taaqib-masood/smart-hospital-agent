# Voice receptionist plan

## Decision record

WhatsApp messaging and voice must be separate channels sharing the same patient, appointment and audit model. WhatsApp opt-in is not phone-call or WhatsApp-calling permission.

Do **not** enable Meta SIP on the existing WhatsApp messaging number. Meta documents that SIP signaling on a number is exclusive and does not work with Graph API signaling on that same number. Meta Calling also has explicit user-permission, calling-webhook and acceptance-time requirements. See [Meta Calling](https://developers.facebook.com/docs/whatsapp/cloud-api/calling/) and [Meta SIP](https://developers.facebook.com/docs/whatsapp/cloud-api/calling/sip/).

For UAE operation, use a clinic-approved, TDRA-compatible licensed telecom/SIP route and receive written confirmation from the carrier before a public voice rollout. TDRA classifies VoIP as a regulated telecommunications service: [TDRA FAQ](https://tdra.gov.ae/en/FAQs).

## Provider choice

For the first ordinary clinic-phone pilot, evaluate **Retell with a licensed compatible SIP carrier**. It is the quickest option for inbound/outbound call control and supports custom telephony: [Retell custom telephony](https://docs.retellai.com/deploy/custom-telephony). Keep **LiveKit** as the long-term control option when the team is ready to own SIP, media, speech, model and recording orchestration: [LiveKit SIP](https://docs.livekit.io/telephony/start/sip-trunk-setup/). Vapi is a comparable pilot alternative but not evidence of UAE carrier or data-residency suitability: [Vapi SIP](https://docs.vapi.ai/advanced/sip/sip-trunk).

LiveKit is not a direct WhatsApp voice-bot integration. No source reviewed proves a supported Meta-Calling-to-LiveKit bridge; do not sell it that way.

## Phases

| Phase | Scope | Gate before advancing |
| --- | --- | --- |
| 0. Governance | Clinic script, permitted tasks, transfer path, recording/retention policy, carrier decision | Written clinic and carrier approval |
| 1. Inbound phone pilot | One regular clinic number; identify caller, book/change/cancel, resend payment link; immediate human transfer | No medical advice or triage; Arabic and English test scripts pass |
| 2. Controlled pilot | One or two clinics, supervised transfer, redacted QA, callback/latency/wrong-booking measurement | Agreed quality and safety thresholds met |
| 3. Outbound calls | Only channel-specific recorded permission, quiet hours, rate limits, WhatsApp confirmation after each call | Consent and escalation audit passes |
| 4. WhatsApp Calling proof | Dedicated staging number, explicit calling permission or user-initiated call, Meta Cloud API flow | Do not convert the existing messaging number to SIP |
| 5. Production | Supervisor controls, retention/deletion, incident response and periodic quality review | Legal, telecom, data and clinic sign-off |

## Build boundary now

The portal labels voice calling as awaiting approved setup rather than pretending it is live. The next code phase begins only when a clinic selects a carrier/provider and supplies a test account. At that point, add a provider-specific webhook, idempotent call-event ledger, separate phone consent evidence, transfer/audit events, and end-to-end sandbox tests.
