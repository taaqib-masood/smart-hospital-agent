# Graph Report - smart-hospital-agent  (2026-11-05)

## Corpus Check
- 135 files · ~88,882 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .ico 2, .css 1)

## Summary
- 726 nodes · 1711 edges · 43 communities (all shown)
- Extraction: 99.8% EXTRACTED · 0.2% INFERRED · 0.0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a88ec778`
- Source-aware freshness check (stale only if this command prints paths; documentation-only and graph-only commits do not count):

```sh
git diff --name-only a88ec77846cc2172a6f886a7780dac2c26c9e4f3 HEAD -- ':(glob)**/*.js' ':(glob)**/*.json' ':(glob)**/*.mjs' ':(glob)**/*.ts' ':(glob)**/*.tsx' ':(exclude)graphify-out/**'
```
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useLang
- cn
- createClient
- api.ts
- dashboard/page.tsx
- use-toast.ts
- framer-motion
- OnboardingWizard.tsx
- checkin/page.tsx
- dependencies
- compilerOptions
- PrescriptionView.tsx
- BillingView.tsx
- NoShowView.tsx
- package.json
- devDependencies
- ReferralView.tsx
- DepositsView.tsx
- FollowUpView.tsx
- ConsentView.tsx
- LabReportsView.tsx
- clinic-marks.tsx
- AvailabilityView.tsx
- DoctorBrief.tsx
- QueueView.tsx
- middleware.ts
- next.config.mjs
- server.js
- PatientsView.tsx
- eslint.config.mjs
- scripts
- class-variance-authority
- embla-carousel-react
- @radix-ui/react-dropdown-menu@^2.1.24
- @radix-ui/react-select@^2.3.7
- @radix-ui/react-slot
- @radix-ui/react-tabs@^1.1.21
- @radix-ui/react-tooltip@^1.2.16
- react-dom@19.2.4
- @supabase/supabase-js@^2.104.1
- tailwind-merge
- postcss.config.mjs
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `cn()` - 70 edges
2. `useLang()` - 56 edges
3. `react` - 56 edges
4. `lucide-react` - 55 edges
5. `framer-motion` - 43 edges
6. `createClient()` - 41 edges
7. `FadeUp()` - 27 edges
8. `next` - 27 edges
9. `DashboardPageInner()` - 23 edges
10. `Home()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `RevaFullLogo()` --calls--> `cn()`  [EXTRACTED]
  components/landing/brand.tsx → lib/utils.ts
- `ToastAction` --calls--> `cn()`  [EXTRACTED]
  components/ui/toast.tsx → lib/utils.ts
- `DELETE()` --calls--> `createClient()`  [EXTRACTED]
  app/api/appointments/[id]/route.ts → lib/supabase/server.ts
- `GET()` --calls--> `safeNextPath()`  [EXTRACTED]
  app/api/auth/callback/route.ts → lib/utils.ts
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  app/api/clinic/route.ts → lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (43 total; all shown)

### Community 0 - "useLang"
Cohesion: 0.06
Nodes (104): app/page.tsx, Home(), before-after.tsx, BeforeAfter(), brand.tsx, RevaBrand(), RevaFullLogo(), RevaMark() (+96 more)

### Community 1 - "cn"
Cohesion: 0.05
Nodes (92): back-to-top.tsx, BackToTop(), faq.tsx, Cat, Faq(), POPULAR, lead-dialog.tsx, Intent (+84 more)

### Community 2 - "createClient"
Cohesion: 0.07
Nodes (74): appointments/[id]/route.ts, DELETE(), PATCH(), appointments/route.ts, GET(), getClinic(), POST(), callback/route.ts (+66 more)

### Community 3 - "api.ts"
Cohesion: 0.11
Nodes (38): MessagesView.tsx, ChatMessage, DEFAULT_CONTACTS, MessagesViewProps, MessageType, QUICK_REPLIES, WhatsAppContact, api.ts (+30 more)

### Community 4 - "dashboard/page.tsx"
Cohesion: 0.09
Nodes (36): dashboard/page.tsx, AnalyticsView(), Appointment, APPOINTMENTS_INIT, AppointmentStatus, Avatar(), BRIEF_SUBMITTED, CalendarView() (+28 more)

### Community 5 - "use-toast.ts"
Cohesion: 0.10
Nodes (36): app_globals, layout.tsx, jakarta, metadata, RootLayout(), tajawal, onSubmit(), toast.tsx (+28 more)

### Community 6 - "framer-motion"
Cohesion: 0.06
Nodes (36): queue/page.tsx, AnimatedNumber(), Phase, QueuePage(), statusUpdates, CTA.tsx, CTA(), footerLinks (+28 more)

### Community 7 - "OnboardingWizard.tsx"
Cohesion: 0.12
Nodes (28): login/page.tsx, LoginForm(), handleSubmit(), LoginPage(), OnboardingWizard.tsx, AnimatedCheck(), avatarColors, DayConfig (+20 more)

### Community 8 - "checkin/page.tsx"
Cohesion: 0.16
Nodes (28): checkin/page.tsx, AnimatedCheck(), BigNumber(), CheckinPage(), COMMON_COMPLAINTS, DURATIONS, getSeverityColor(), getSeverityEmoji() (+20 more)

### Community 9 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, clsx@^2.1.1, framer-motion@^12.38.0, lucide-react@^1.8.0, next@16.2.4, @radix-ui/react-accordion@^1.2.20, @radix-ui/react-dialog@^1.1.23, @radix-ui/react-label@^2.1.15 (+11 more)

### Community 10 - "compilerOptions"
Cohesion: 0.11
Nodes (19): tsconfig.json, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 11 - "PrescriptionView.tsx"
Cohesion: 0.12
Nodes (18): PrescriptionView.tsx, DIAGNOSIS_SUGGESTIONS, DOSAGE_OPTIONS, DosageOption, DurationUnit, FOLLOWUP_OPTIONS, genId(), Medicine (+10 more)

### Community 12 - "BillingView.tsx"
Cohesion: 0.17
Nodes (16): BillingView.tsx, BillingView(), BillingViewProps, Invoice, INVOICES_DATA, InvoiceStatus, PaymentMethod, SERVICE_OPTIONS (+8 more)

### Community 13 - "NoShowView.tsx"
Cohesion: 0.17
Nodes (16): NoShowView.tsx, ActionButtons(), Appointment, AppointmentRow(), APPOINTMENTS, DONUT_SEGMENTS, DONUT_TOTAL, DonutChart() (+8 more)

### Community 14 - "package.json"
Cohesion: 0.14
Nodes (14): package.json, @radix-ui/react-avatar@^1.2.6, @radix-ui/react-checkbox@^1.3.11, @radix-ui/react-slider@^1.4.7, @radix-ui/react-toast@^1.2.23, sharp@^0.35.4, name, private (+6 more)

### Community 15 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, tailwindcss@^4, @tailwindcss/postcss@^4, @types/node@^20, @types/react@^19, @types/react-dom@^19, typescript@^5, tailwindcss (+5 more)

### Community 16 - "ReferralView.tsx"
Cohesion: 0.18
Nodes (11): ReferralView.tsx, INITIAL_SENT, RECEIVED_REFERRALS, ReceivedReferral, ReferralStatus, ReferralView(), ReferralViewProps, SentReferral (+3 more)

### Community 17 - "DepositsView.tsx"
Cohesion: 0.20
Nodes (10): DepositsView.tsx, AMOUNT_OPTIONS, DepositsView(), sendLink(), Toggle(), DepositsViewProps, STATUS_CONFIG, Transaction (+2 more)

### Community 18 - "FollowUpView.tsx"
Cohesion: 0.20
Nodes (10): FollowUpView.tsx, DEFAULT_RULES, DEFAULT_TEMPLATES, FollowUpView(), FollowUpViewProps, INITIAL_QUEUE, QueueItem, Rule (+2 more)

### Community 19 - "ConsentView.tsx"
Cohesion: 0.22
Nodes (9): ConsentView.tsx, CONSENT_RECORDS, ConsentRecord, ConsentStatus, ConsentView(), ConsentViewProps, ProcedureCategory, Template (+1 more)

### Community 20 - "LabReportsView.tsx"
Cohesion: 0.29
Nodes (8): LabReportsView.tsx, FLAGGED_REPORTS, INITIAL_REPORTS, LabReportsView(), LabReportsViewProps, PENDING_REPORTS, Report, StatCard()

### Community 21 - "clinic-marks.tsx"
Cohesion: 0.25
Nodes (8): clinic-marks.tsx, AlNoorMark(), CrescentMark(), EmiratesHealthMark(), GulfCareMark(), MarkProps, NovaMark(), PrimeMark()

### Community 22 - "AvailabilityView.tsx"
Cohesion: 0.29
Nodes (7): AvailabilityView.tsx, AvailabilityView(), AvailabilityViewProps, DAYS_OF_WEEK, INITIAL_SLOTS, SlotStatus, TimeSlot

### Community 23 - "DoctorBrief.tsx"
Cohesion: 0.43
Nodes (7): DoctorBrief.tsx, BriefData, DoctorBrief(), DoctorBriefProps, getBriefData(), SectionHeader(), severityEmoji()

### Community 24 - "QueueView.tsx"
Cohesion: 0.29
Nodes (7): QueueView.tsx, INITIAL_QUEUE, NO_SHOW_RISKS, Patient, QueueView(), Toggle(), QueueViewProps

### Community 25 - "middleware.ts"
Cohesion: 0.29
Nodes (7): middleware.ts, config, middleware(), PROTECTED, @supabase/ssr@^0.10.2, @supabase/ssr, @supabase/ssr

### Community 26 - "next.config.mjs"
Cohesion: 0.29
Nodes (7): next, next.config.mjs, __dirname, __filename, nextConfig, ref_path, ref_url

### Community 27 - "server.js"
Cohesion: 0.29
Nodes (7): ref_http, server.js, app, handle, http, next, port

### Community 28 - "PatientsView.tsx"
Cohesion: 0.33
Nodes (6): PatientsView.tsx, INITIAL_PATIENTS, Patient, PatientsView(), PatientsViewProps, STATUS_COLORS

### Community 29 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (6): eslint.config.mjs, eslintConfig, eslint@^9, eslint-config-next@16.2.4, eslint, eslint-config-next

### Community 30 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 31 - "class-variance-authority"
Cohesion: 1.00
Nodes (2): class-variance-authority@^0.7.1, class-variance-authority

### Community 32 - "embla-carousel-react"
Cohesion: 1.00
Nodes (2): embla-carousel-react@^8.6.0, embla-carousel-react

### Community 33 - "@radix-ui/react-dropdown-menu@^2.1.24"
Cohesion: 1.00
Nodes (2): @radix-ui/react-dropdown-menu@^2.1.24, @radix-ui/react-dropdown-menu

### Community 34 - "@radix-ui/react-select@^2.3.7"
Cohesion: 1.00
Nodes (2): @radix-ui/react-select@^2.3.7, @radix-ui/react-select

### Community 35 - "@radix-ui/react-slot"
Cohesion: 1.00
Nodes (2): @radix-ui/react-slot@^1.3.3, @radix-ui/react-slot

### Community 36 - "@radix-ui/react-tabs@^1.1.21"
Cohesion: 1.00
Nodes (2): @radix-ui/react-tabs@^1.1.21, @radix-ui/react-tabs

### Community 37 - "@radix-ui/react-tooltip@^1.2.16"
Cohesion: 1.00
Nodes (2): @radix-ui/react-tooltip@^1.2.16, @radix-ui/react-tooltip

### Community 38 - "react-dom@19.2.4"
Cohesion: 1.00
Nodes (2): react-dom@19.2.4, react-dom

### Community 39 - "@supabase/supabase-js@^2.104.1"
Cohesion: 1.00
Nodes (2): @supabase/supabase-js@^2.104.1, @supabase/supabase-js

### Community 40 - "tailwind-merge"
Cohesion: 1.00
Nodes (2): tailwind-merge@^3.6.0, tailwind-merge

### Community 41 - "postcss.config.mjs"
Cohesion: 1.00
Nodes (2): postcss.config.mjs, config

### Community 42 - "vercel.json"
Cohesion: 1.00
Nodes (2): vercel.json, crons

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `cn` to `useLang`, `api.ts`, `dashboard/page.tsx`, `use-toast.ts`, `framer-motion`, `OnboardingWizard.tsx`, `checkin/page.tsx`, `dependencies`, `PrescriptionView.tsx`, `BillingView.tsx`, `NoShowView.tsx`, `package.json`, `ReferralView.tsx`, `DepositsView.tsx`, `FollowUpView.tsx`, `ConsentView.tsx`, `LabReportsView.tsx`, `AvailabilityView.tsx`, `DoctorBrief.tsx`, `QueueView.tsx`, `PatientsView.tsx`?**
  _High betweenness centrality (0.231) - this node is a cross-community bridge._
- **Should `useLang` be split into smaller, more focused modules?**
  _Cohesion score 0.0640403286034354 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `useLang` to `cn`, `api.ts`, `dashboard/page.tsx`, `use-toast.ts`, `framer-motion`, `OnboardingWizard.tsx`, `checkin/page.tsx`, `dependencies`, `PrescriptionView.tsx`, `BillingView.tsx`, `NoShowView.tsx`, `package.json`, `ReferralView.tsx`, `DepositsView.tsx`, `FollowUpView.tsx`, `ConsentView.tsx`, `LabReportsView.tsx`, `AvailabilityView.tsx`, `DoctorBrief.tsx`, `QueueView.tsx`, `PatientsView.tsx`?**
  _High betweenness centrality (0.211) - this node is a cross-community bridge._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.05351170568561873 - nodes in this community are weakly interconnected._
- **Why does `framer-motion` connect `framer-motion` to `useLang`, `cn`, `api.ts`, `dashboard/page.tsx`, `OnboardingWizard.tsx`, `checkin/page.tsx`, `dependencies`, `PrescriptionView.tsx`, `BillingView.tsx`, `NoShowView.tsx`, `package.json`, `ReferralView.tsx`, `DepositsView.tsx`, `ConsentView.tsx`, `LabReportsView.tsx`, `AvailabilityView.tsx`, `DoctorBrief.tsx`, `QueueView.tsx`, `PatientsView.tsx`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.06812291743798593 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10668563300142248 - nodes in this community are weakly interconnected._
## Build scope

AST-only extraction of 109 code files. Documents and media were not semantically extracted. Community names use deterministic hub labels. No LLM or paid API calls were made.

Raw pre-build extraction diagnostics (not exported-graph counts): dangling_endpoint_edges=2, undirected_same_endpoint_collapsed_edges=5. During build, endpoints may be resolved or external import stubs created; edges whose endpoints remain unresolved are dropped and are absent from `graph.json`. The exported graph has no dangling endpoints.
