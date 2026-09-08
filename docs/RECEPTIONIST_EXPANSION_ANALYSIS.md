# Reva clinic operations expansion

## Product position

Reva should be an **operations co-pilot for appointment-led clinics**, not a clinical system and not a replacement for the clinic's EMR/HIS. Its job is to keep the front desk moving: capture demand, make or change appointments, collect approved non-clinical information, route exceptions to a person, and show staff what needs attention next.

That positioning opens a useful product boundary:

- Reva can organise operational work around an existing clinical system.
- Reva must not diagnose, assess eligibility, give medical reassurance, decide urgency, create prescriptions, interpret reports, or make treatment decisions.
- A real clinic cannot opt out of privacy, consent, access-control, or licensing duties by calling the product a “demo”. The demo should not claim compliance; production requires clinic-specific legal, security, and workflow approval.

## Who should use it

The current application correctly treats the receptionist as the primary user. A scaled clinic needs a small role model rather than making every employee an admin.

| Role | What Reva should help them do | What should stay outside the role |
| --- | --- | --- |
| Receptionist / call centre | Inbox takeover, callbacks, booking, rescheduling, arrival and payment follow-up, patient communication preference, consent chase | Medical advice, consent explanation, clinical prioritisation |
| Reception lead / front-desk manager | Queue ownership, assignment, staffing coverage, message-template approval, coaching, daily exceptions | Full clinic configuration or clinical records |
| Clinic manager / owner | Service capacity, no-show/recall performance, staff workload, revenue-recovery reporting, escalation SLAs | Reading routine patient conversations without an operational reason |
| Practitioner / nurse coordinator | Own availability, see non-clinical handoff summary, approve clinical wording, receive urgent clinic-defined escalations | General inbox management, payment collection, autonomous triage |
| Billing / cashier | Invoice state, payment reminder queue, reconciliation exceptions | Clinical notes and unrelated conversations |
| Marketing / patient-relations | Approved campaign segments and outcome counts after explicit clinic approval | Raw patient data, consent editing, personal medical context |
| IT / operations administrator | Clinic setup, integrations, staff accounts, audit review, service and schedule configuration | Day-to-day patient messaging unless supporting an incident |

Start with four practical roles: **Receptionist, Reception Lead, Billing, Clinic Manager**. Add Practitioner availability and limited handoff views when a pilot demonstrates the need. This is materially safer and easier to learn than a broad “doctor portal”.

## What the receptionist is still doing manually

| Manual work today | Product opportunity | Safe first version |
| --- | --- | --- |
| Checking WhatsApp, missed calls, and walk-ins separately | Unified work queue with source, owner, due time, and one next action | Read-only queue that deep-links to the existing inbox or calendar |
| Repeating availability answers | Approved availability response with appointment options | Reuse the existing availability engine; receptionist confirms before sending where required |
| Finding someone who has not confirmed | Confirmation exception queue | “Due soon”, “no response”, and “reschedule requested” groups; no automatic clinical messaging |
| Copying patient detail between chat and calendar | One-click booking draft from a conversation | Prefill name/phone/service; receptionist selects practitioner and slot |
| Manually chasing no-shows and unpaid invoices | Follow-up worklist with an approved template and stop rules | Existing consent/permission checks remain the gate before any send |
| Keeping callback notes in free text | Structured callback card | Reason, preferred language, preferred time, owner, due-by, outcome |
| Asking colleagues “who is handling this?” | Ownership and handoff state | Assigned/unassigned, takeover indicator, SLA timer, manager escalation |
| Updating daily availability after a doctor changes plans | Quick block/unblock with a visible reason | Existing slot view plus reason and audit event; no medical data needed |

## UI/UX audit of the current demo

### What already works

- Calm, consistent visual language; the dashboard is legible and the daily schedule is quickly scannable.
- Existing functional areas are unusually complete for a demo: inbox, appointments, contacts, availability, follow-ups, billing, consent, analytics, and settings.
- The backend architecture already supports the right operational foundations: tenant isolation, appointment conflict protection, durable outbound jobs, consent state, automation pause during handoff, and audit events.

### Gaps that slow a receptionist down

1. **The first screen reports activity but does not prioritise work.** “New enquiries”, “pending confirmations”, and “takeovers” are counts, not a ranked list with an owner, age, deadline, or next step.
2. **The task is fragmented across navigation.** A receptionist must switch from inbox to contacts to calendar to billing, repeatedly rebuilding context.
3. **Important actions are concealed.** Appointment actions appear only after expanding a row; a high-volume desk needs obvious, keyboard-friendly next actions.
4. **Search looks global but is not an operational command bar.** It does not visibly resolve a phone number to a patient, appointment, unpaid invoice, or callback task.
5. **Exception states lack severity and ownership.** The demo has notifications but no reliable “assigned to me / overdue / escalate” workflow.
6. **Scheduling lacks a practical front-desk workflow.** It shows a calendar and slots, but not duration-aware service selection, a compact patient lookup, conflict explanation, or a reschedule comparison.
7. **The inbox lacks a usable handoff pack.** A receptionist needs an at-a-glance booking state, callback promise, preferred language, consent/communication status, and last action—not an isolated chat.
8. **Dense desktop controls use small type and wide tables.** Billing and consent become horizontally constrained; key actions should stay reachable at 1024 px and on a reception tablet.
9. **The previous receptionist portal was English-only.** The public site was bilingual, which creates a confusing mismatch for the actual daily user.

## Recommended product sequence

### Phase 1 — make the receptionist faster

1. **Today’s work queue**: a single list for unassigned enquiries, callback due, pending confirmation, requested reschedule, payment follow-up, and consent reminder. Each card shows owner, due time, language, patient, source, and exactly one primary action.
2. **Conversation-to-booking drawer**: keep the chat visible while choosing service, practitioner, duration, and availability. Save the rationale as an operational note.
3. **Callback tracker**: create, assign, snooze, resolve, and report callbacks. This is usually more valuable than a speculative AI feature.
4. **Reception command search**: phone/name search with results for contacts, upcoming appointments, invoices, and active conversations. Support `N` for new booking and `/` for search after usability testing.
5. **Bilingual receptionist portal**: English/Arabic toggle, RTL, Arabic date/time formatting, localized labels, and per-patient communication-language preference. Patient-facing templates remain independently clinic-approved.

### Phase 2 — support team coordination

1. **Ownership and SLA rules**: assign a conversation or task to a person/team; show unassigned, due, overdue, and manager-escalated states.
2. **Reception lead view**: workload by staff member, stale conversations, unworked callbacks, live queue health, and a safe reassignment tool.
3. **Practitioner availability mini-view**: allow an authorised coordinator to request a slot change; keep clinical decision-making outside Reva.
4. **Close-the-day checklist**: unresolved conversations, tomorrow's unconfirmed appointments, unpaid invoices, unsigned documents, and blocked slots.

### Phase 3 — manager outcomes, after baseline measurement

1. **Funnel reporting**: enquiry → contacted → booked → confirmed → attended → paid. Always show a denominator and time period.
2. **Capacity and demand view**: service/practitioner slot utilisation, cancellation reasons, time-to-first-response, and callback completion.
3. **Approved campaign workbench**: a manager selects a clinic-approved audience and template; Reva shows the eligible count, exclusions, and outcome measurement. Do not use patient data for a campaign without the clinic's approved process.

## Demo changes in this iteration

- The receptionist portal now uses the existing persisted language preference (`reva-lang`) rather than a second settings store.
- English and Arabic can be selected in the portal header. Arabic applies document direction, Arabic font, RTL layout, and Arabic date/time formatting.
- The shared navigation, dashboard, calendar, analytics, message controls, follow-up controls, consent queue, availability controls, and settings use the portal translation helper. Patient-provided names, phone numbers, free-text notes, and message history deliberately stay unchanged.
- The implementation is intentionally a small client-side layer built on the existing public-site `LanguageProvider`; it adds no localisation dependency or separate persistence model.

## Pilot success measures

Measure a baseline before enabling automation, then compare the same clinic and specialty over a defined window:

- first-response time and percentage of enquiries assigned within the agreed SLA;
- enquiry-to-booking, booking-to-confirmation, and confirmation-to-attendance rates;
- no-show and cancellation rates with the exact denominator;
- callback due/completed/overdue volume;
- number of manual touches per completed booking;
- queue age by type and staff ownership;
- invoice and consent follow-up completion; and
- staff-reported time saved and error reports.

Do not promise a recovery percentage, revenue increase, medical outcome, UAE compliance status, or template approval before those claims have been measured and formally approved.

## Sources and design rationale

- The World Health Organization recommends starting digital health design from real user personas, workflows, data elements, scheduling logic, and indicators, then validating with local health workers. [Digital transformation handbook for primary health care](https://www.who.int/publications/i/item/9789240093362)
- Dubai Health Authority's information-sharing policy describes consent and identity-verification expectations before disclosing health information over the telephone. That is why callback tasks need a verification step rather than a generic “call patient” action. [DHA Policy for Health Information Sharing](https://dha.gov.ae/uploads/082024/Policy%20for%20Health%20Information%20Sharing_EN202480306.pdf)
- DHA's consent/access-control standard distinguishes legitimate administrative access from unrestricted access, and requires unique user access and consent handling where mandated. This supports a narrow role model rather than a shared clinic login. [DHA Standards for Consent and Access Control](https://dha.gov.ae/uploads/012025/Standards%20for%20Consnet%20and%20Access%20Control2025129762.pdf)
