---
type: "query"
date: "2026-09-08T11:15:49.425694+00:00"
question: "Does the receptionist focused backend cover the complete portal workflow while keeping Billing and Consent?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["DashboardView()", "MessagesView.tsx", "BillingView.tsx", "ConsentView.tsx", "AvailabilityView.tsx", "handleBotMessage()", "runReminders()"]
---

# Q: Does the receptionist focused backend cover the complete portal workflow while keeping Billing and Consent?

## Answer

Expanded from original query via graph vocabulary: clinic, whatsapp, conversation, messages, appointments, availability, billing, invoices, consent, follow, reminders, dashboard, security, patient. The graph connected the dashboard views to the client API, WhatsApp webhook and booking bot, reminder route, BillingView, ConsentView, AvailabilityView, MessagesView, and PatientsView. Current source verification then confirmed tenant-scoped APIs, durable outbound jobs, consent evidence, billing follow-ups, availability conflict protection, receptionist handoff, and scheduled reminders. External Meta setup, clinic configuration, legal review, staging database migration, and production operations remain documented manual blockers.

## Outcome

- Signal: useful

## Source Nodes

- DashboardView()
- MessagesView.tsx
- BillingView.tsx
- ConsentView.tsx
- AvailabilityView.tsx
- handleBotMessage()
- runReminders()