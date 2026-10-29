# Reva AI — The Intelligent WhatsApp Receptionist for Indian Clinics

<div align="center">

**Reva AI replaces your clinic's front desk with an AI-powered WhatsApp bot that books appointments, sends reminders, collects payments, manages patient records, and much more — 24 hours a day, 7 days a week, without a single phone call.**

*Built for Indian clinics · Powered by WhatsApp · No app download required for patients*

</div>

---

## What is Reva AI?

Most Indian clinics — dental practices, GP clinics, dermatology centres, physiotherapy studios — still rely on phone calls and manual registers to manage appointments. Patients call during busy hours, get put on hold, and forget their appointments. Doctors lose revenue from no-shows. Staff waste hours on administrative tasks that could be automated.

**Reva AI solves all of this.**

A patient simply messages the clinic on WhatsApp (the app every Indian already uses), and Reva's AI instantly responds — 24/7 — to:
- Book an appointment in under 60 seconds
- Send an automatic reminder before the appointment
- Answer basic questions about clinic timings and doctors
- Collect deposits and payments via a Razorpay link
- Send post-visit follow-ups and Google review requests

The doctor and clinic staff get a beautiful, real-time dashboard to see everything happening — every booking, every conversation, every payment — without touching WhatsApp themselves.

---

## The Problem Reva AI Solves

| Problem | Without Reva | With Reva |
|---|---|---|
| Patient wants to book at 11 PM | Calls go unanswered | Booked instantly via WhatsApp |
| Patient forgets appointment | No-show, revenue lost | Automatic reminder sent |
| Staff wastes time on calls | 2–3 hours/day on phones | Zero manual calls for bookings |
| Doctor doesn't know day's schedule | Checks register manually | Live dashboard with full brief |
| No-show risk unknown | Guess work | AI risk scoring per patient |
| Patient reviews not collected | Asked verbally, forgotten | Automated WhatsApp review request |
| Deposits hard to collect | Manual UPI, awkward | One-click Razorpay payment link |
| Lab reports take days to reach patient | Printed copy handed | Uploaded and sent via WhatsApp |

---

## Who Is This For?

### For Clinic Owners / Doctors
- See today's full schedule the moment you open the dashboard
- Get an AI-generated "Doctor Brief" — a one-paragraph summary of the day's patients, risk cases, and follow-ups
- Block time off without touching a calendar manually
- Know which patients are likely to no-show before they do
- Collect deposits before appointments to reduce cancellations
- Monitor Google reviews and respond — all in one place

### For Clinic Staff / Receptionists
- See a live queue of who's checked in, waiting, and done
- Send prescriptions, lab reports, and consent forms digitally — no printing
- Manage follow-up sequences automatically
- Handle all patient WhatsApp conversations from one inbox

### For Patients
- Book appointments without calling — message on WhatsApp at any time
- Receive appointment confirmations and reminders automatically
- Get lab reports, prescriptions, and documents directly on WhatsApp
- Pay a deposit online before the appointment
- Leave a Google review with one tap after the visit

---

## Full Feature Breakdown

### 1. AI WhatsApp Booking Bot
Reva's booking bot lives inside your clinic's WhatsApp number. When a patient messages:

1. Reva greets the patient by name (if returning) or asks for their name
2. Shows available doctors and their specialties
3. Displays available appointment slots for the chosen doctor
4. Confirms the booking and saves it to the clinic's database
5. Sends a confirmation message with all details

The bot handles back-and-forth naturally — patients can say "morning slot" or "cancel" and Reva understands. The entire conversation state is maintained so patients don't have to repeat themselves.

**How it works technically:** A state machine (`idle → greeting → collect_name → show_doctors → show_slots → confirm_slot → booked`) processes every inbound WhatsApp message via the Meta Cloud API webhook.

---

### 2. Main Dashboard — Real-Time Clinic Overview

The first screen doctors see after logging in. Designed to give complete situational awareness in 10 seconds.

**What's on the dashboard:**
- **Live KPI cards** — today's appointment count, total patients, unread messages, revenue (all animated with count-up numbers)
- **Today's appointment list** — every booking with patient name, time, type, and status (Confirmed / Pending / Cancelled). Click any appointment to change status instantly.
- **Recent WhatsApp activity** — latest messages from patients
- **Doctor Brief button** — generates an AI summary of the day's patient list, risk factors, and pending follow-ups
- **Quick stats** — weekly appointment trend, revenue this month

---

### 3. Appointment Calendar

A full calendar view with two modes:
- **Month view** — see every day's appointment count at a glance, colour-coded by load
- **Week view** — hour-by-hour schedule for the week

Click any day to see that day's appointments. Click any appointment to edit, reschedule, or cancel it. New appointments can be created directly from the calendar.

---

### 4. WhatsApp Inbox (Realtime Messages)

A complete messaging dashboard showing every patient conversation from WhatsApp — like a professional CRM inbox built for clinics.

**Features:**
- See all conversations sorted by most recent
- Unread message badges per conversation
- Click any conversation to see the full message history
- Send replies directly from the dashboard (the message appears on the patient's WhatsApp)
- Conversations marked as read automatically when opened
- Patient name, initials avatar, and last message preview in the list

This is the only place staff need to monitor — no switching between phones and computers.

---

### 5. Patient CRM (Patient Database)

A complete record of every patient who has ever interacted with the clinic.

**What's stored per patient:**
- Full name, phone number, city
- Number of visits, last visit date
- Total amount spent
- Tags (e.g., "VIP", "High Risk", "Regular")
- Full appointment history
- All WhatsApp messages

**Features:**
- Search patients by name or phone
- Add new patients manually
- View complete patient profile with visit history
- See which patients haven't visited in 3+ months (retention insights)

---

### 6. Live Patient Queue

For busy clinics, the live queue view shows who is physically in the clinic right now.

**Statuses:**
- **Waiting** — patient has arrived and is in the waiting area
- **In Consultation** — patient is with the doctor
- **Done** — consultation complete, patient has left

Staff can drag patients between statuses, or click to update. The queue auto-refreshes so all devices stay in sync. Shows estimated wait time based on average consultation duration.

---

### 7. Billing & Revenue Tracking

A complete financial overview of the clinic.

**Features:**
- All invoices listed with patient name, date, amount, and payment status
- Filter by Paid / Pending / Overdue
- Create new invoices directly from the dashboard
- Revenue breakdown by week and month
- Outstanding balance total highlighted in red

---

### 8. Deposits & Razorpay Integration

One of the most impactful features for clinic revenue. Clinics can now collect a deposit (e.g., ₹500) before an appointment is confirmed, dramatically reducing no-shows.

**How it works:**
- Staff selects a patient and enters a deposit amount
- Reva generates a Razorpay Payment Link and sends it to the patient on WhatsApp
- Patient pays online in under 60 seconds
- Payment status updates automatically in the dashboard

**Dashboard view includes:**
- Every deposit transaction with amount, method, patient, and status
- Total deposits collected (animated counter)
- Revenue breakdown mini bar chart
- Filter by payment method (UPI / Card / Net Banking / Cash)
- Toggle to enable/disable the deposits feature per clinic

---

### 9. Follow-Up Engine

Automated post-visit WhatsApp messages sent on a schedule defined by the clinic.

**Example sequences:**
- **Day 1 after visit:** "Hi [name], hope you're feeling better! Remember to take your medication."
- **Day 3:** "Hi [name], how are you doing? Let us know if you need anything."
- **Day 7:** "Time for your follow-up? Book your next appointment here: [link]"

**Features:**
- Create follow-up templates with variable placeholders (`{name}`, `{clinic}`, `{doctor}`)
- Set the number of days after visit to trigger each message
- View all pending and sent follow-ups
- Mark individual follow-ups as done manually
- Works automatically in the background via Vercel Cron

---

### 10. No-Show Prediction (AI Risk Scoring)

Every morning, Reva AI scores each of today's appointments with a no-show risk level — High, Medium, or Low — based on patient history.

**Risk factors considered:**
- Previous no-show history
- How far in advance the appointment was booked
- Time of appointment (late afternoon = higher risk)
- Whether the patient responded to the reminder

**What staff can do:**
- See a risk badge next to each patient's name
- Call or re-message high-risk patients before the appointment
- View aggregate no-show statistics (monthly trend, highest-risk appointment types)

---

### 11. Prescription Builder

Doctors can create digital prescriptions directly in the dashboard and send them to the patient on WhatsApp — no printing, no handwriting.

**Prescription includes:**
- Patient name, doctor name, date
- Drug name, dosage, frequency, duration
- Special instructions
- Doctor's digital signature placeholder

**Features:**
- Add multiple medicines in one prescription
- Save prescription templates for common conditions
- Send to patient's WhatsApp with one click
- Archive all past prescriptions per patient

---

### 12. Lab Report Inbox

Upload lab reports (PDF or image) directly in the dashboard and notify the patient on WhatsApp.

**Flow:**
1. Lab uploads the report file
2. Staff uploads it in the dashboard, selects the patient
3. Reva sends a WhatsApp message: "Your lab report is ready: [link]"
4. Patient downloads directly from WhatsApp

**Features:**
- See all uploaded reports with patient name, date, and status (Sent / Pending)
- Filter by date range
- Reactivate an old report (resend to patient)

---

### 13. Referral Network

Track all specialist referrals — both sent and received.

**For each referral:**
- Patient name
- Referring doctor and receiving doctor/specialist
- Reason for referral
- Status: Pending / Accepted / Completed
- Notes from both sides

**Features:**
- Send a referral note to the specialist directly from the dashboard
- Patient is notified via WhatsApp with the specialist's contact and details
- Track referral outcomes over time

---

### 14. Digital Consent Forms

Send, collect, and archive patient consent forms via WhatsApp — no paper, no clipboards.

**Flow:**
1. Select a consent form template (e.g., "Dental Procedure Consent", "Anaesthesia Consent")
2. Send to patient's WhatsApp
3. Patient fills it out on their phone and submits digitally
4. Consent is archived in the patient's record automatically

**Features:**
- Create custom consent form templates per procedure
- View all signed and pending consents
- Download any consent form as PDF
- Legally compliant digital signatures

---

### 15. Availability & Slot Blocker

The most operationally critical feature. Doctors can precisely control when they are available for bookings.

**What you can configure:**
- **Working hours per day** — e.g., Mon–Fri 9 AM–1 PM and 4 PM–7 PM, Sat 10 AM–2 PM, Sunday closed
- **Slot duration** — 15 min, 20 min, 30 min, or 45 min per appointment
- **Recurring blocks** — block every Thursday 1–2 PM for admin work, forever
- **One-time blocks** — block April 30 fully for a conference
- **Leave management** — mark full-day leaves, the bot will not offer slots on those days

**Without this configured, the booking bot doesn't know when to offer slots.** This is why it's the #1 priority feature — it gates all bookings.

---

### 16. Reviews & Reputation Management

Clinics live and die by their Google reviews. Reva makes collecting reviews effortless.

**Dashboard view:**
- Average star rating, total reviews, % positive (4★+), response rate
- Rating distribution bar chart (5★ down to 1★, animated CSS bars)
- All reviews listed with patient name, star rating, comment, and date
- Filter by star level or "Unreplied"
- Inline reply — click "Add Reply" on any review, type and submit. Reply saved to Supabase and shown on the review card.

**Automation:**
- After an appointment is marked complete, Reva sends the patient a WhatsApp message: "Hope your visit went well! Would you mind leaving us a quick review? [Google link]"
- This happens automatically, no manual action needed

**Google Business integration** (upcoming) — pull real reviews directly from your Google Business Profile.

---

### 17. Analytics

High-level performance metrics for the clinic.

**Metrics included:**
- Total appointments (weekly, monthly trend)
- Revenue chart (bar graph, last 8 weeks)
- Patient acquisition (new vs returning)
- Average consultation duration
- WhatsApp response rate
- Top appointment types by volume

---

### 18. Notifications Centre

All system notifications in one place — appointment updates, payment received, new WhatsApp message, follow-up sent, no-show alert. Unread count shown as a badge in the sidebar.

---

### 19. Settings

Full clinic configuration panel.

**What you can configure:**
- Clinic name, address, city, phone number
- WhatsApp Business Phone ID and API token (from Meta Developer Console)
- WhatsApp greeting message (what patients see when they first message)
- Reminder timing — how many hours before appointment to send the reminder (1, 2, 4, or 24 hours)
- Slot duration for bookings
- Razorpay integration keys

---

### 20. Onboarding Wizard

A 7-step guided setup that clinic owners complete when they first sign up. No technical knowledge required.

**Step by step:**
1. **Clinic Type** — GP, Dental, Dermatology, Orthopaedic, Physiotherapy, Paediatrics, or Other
2. **Clinic Info** — name, city, phone number, number of doctors
3. **Working Hours** — toggle each day on/off, set open and close times
4. **Doctor Profiles** — name, speciality, experience, and consultation fee for each doctor
5. **WhatsApp Setup** — enter WhatsApp number, send a test OTP to verify
6. **Greeting Message** — customise the first message patients receive
7. **Go Live** — everything is saved and the bot is activated

All data is saved to Supabase immediately. If the user skips any step, partial data is saved so they can resume later.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 16.2.4 (App Router) | Latest React server components, file-based routing |
| Language | TypeScript (strict mode) | Type safety across the entire codebase |
| Styling | Tailwind CSS | Utility-first, no CSS files to maintain |
| Animations | Framer Motion | Spring physics, layout animations, AnimatePresence |
| Database | Supabase (PostgreSQL) | Real-time, Row Level Security, built-in auth |
| Authentication | Supabase Auth | Email/password, JWT sessions |
| WhatsApp | Meta Cloud API v19.0 | Official WhatsApp Business API |
| Payments | Razorpay Payment Links | India's leading payment gateway |
| Deployment | Vercel | Edge network, automatic preview deployments |
| Cron Jobs | Vercel Cron | Runs appointment reminders every 30 minutes |
| Package Manager | npm | Standard Node.js package manager |

---

## Database Schema

All tables follow the `reva_*` naming convention. Row Level Security is enabled on all tables — each clinic can only see its own data.

| Table | What it stores |
|---|---|
| `reva_clinics` | Clinic profile, WhatsApp config, settings |
| `reva_doctors` | Doctor profiles per clinic |
| `reva_patients` | Patient CRM — name, phone, visit history |
| `reva_appointments` | Every appointment with date, time, status |
| `reva_conversations` | WhatsApp conversation threads |
| `reva_messages` | Individual WhatsApp messages (inbound + outbound) |
| `reva_follow_ups` | Scheduled post-visit messages |
| `reva_invoices` | Billing records |
| `reva_prescriptions` | Digital prescriptions |
| `reva_lab_reports` | Lab report uploads |
| `reva_referrals` | Specialist referrals |
| `reva_consent_forms` | Signed patient consent forms |
| `reva_booking_state` | WhatsApp bot conversation state machine |

---

## Project Structure

```
reva-ai/
├── app/
│   ├── (auth)/
│   │   └── login/           # Login & signup page
│   ├── api/
│   │   ├── appointments/    # CRUD appointments
│   │   ├── clinic/          # Clinic settings
│   │   ├── conversations/   # WhatsApp threads
│   │   ├── follow-ups/      # Follow-up engine
│   │   ├── invoices/        # Billing
│   │   ├── patients/        # Patient CRM
│   │   ├── reminders/       # Vercel cron endpoint
│   │   └── whatsapp/        # Webhook + send
│   └── dashboard/
│       └── page.tsx         # Main dashboard (18 views)
├── components/
│   ├── AvailabilityView.tsx  # Slot blocker & working hours
│   ├── BillingView.tsx       # Revenue & invoices
│   ├── BriefButton.tsx       # AI Doctor Brief trigger
│   ├── ConsentView.tsx       # Digital consent forms
│   ├── DepositsView.tsx      # Razorpay deposits
│   ├── DoctorBrief.tsx       # AI brief modal
│   ├── FollowUpView.tsx      # Follow-up engine
│   ├── LabReportsView.tsx    # Lab report inbox
│   ├── NoShowView.tsx        # No-show prediction
│   ├── OnboardingWizard.tsx  # 7-step onboarding
│   ├── PatientsView.tsx      # Patient CRM
│   ├── PrescriptionView.tsx  # Digital prescriptions
│   ├── QueueView.tsx         # Live patient queue
│   ├── ReferralView.tsx      # Referral network
│   └── ReviewsView.tsx       # Reviews & reputation
├── lib/
│   ├── api.ts               # Typed fetch wrappers for all API routes
│   ├── booking-bot.ts       # WhatsApp state machine
│   ├── dashboard-context.tsx # React context for Supabase data
│   ├── whatsapp.ts          # WhatsApp Cloud API helpers
│   └── supabase/
│       ├── client.ts        # Browser Supabase client
│       ├── server.ts        # Server Supabase client (SSR)
│       └── types.ts         # TypeScript interfaces for all tables
├── middleware.ts             # Auth guard on dashboard + API routes
├── next.config.ts            # Next.js + Turbopack config
└── vercel.json               # Cron job definition
```

---

## Running Locally on This Mac (Demo Guide)

This section is specifically for running the demo on **Taaqib's MacBook** where the code is already saved.

### Prerequisites (already installed)
- Node.js and npm ✓
- Git ✓
- Code is at: `/Users/taaqibmasood/Documents/Web Dev & Saas/reva-ai/`

### Step 1 — Navigate to the project

```bash
cd "/Users/taaqibmasood/Documents/Web Dev & Saas/reva-ai"
```

### Step 2 — Kill any existing server on port 3000

```bash
# Check what's running
lsof -i :3000

# Kill it (replace PID with the number shown)
kill <PID>
```

### Step 3 — Start the dev server

```bash
npm run dev
```

Wait for: `✓ Ready in ~300ms`

### Step 4 — Open in browser

```
http://localhost:3000/dashboard
```

> **Note:** `NEXT_PUBLIC_DEMO_MODE=true` is set in `.env.local` — this skips login and loads the full dashboard with mock data instantly. No Supabase credentials needed for the demo.

### Step 5 — Navigate the demo

Use the **sidebar** (left panel) to switch between views:

| Sidebar Item | What to show |
|---|---|
| Dashboard | KPI cards, appointment list, animated count-up numbers |
| Messages | WhatsApp inbox with threaded conversations |
| Patients | Patient CRM with search |
| Queue | Live queue — click to move patients between Waiting / In Consult / Done |
| Billing | Revenue charts and invoice list |
| Deposits | Razorpay payment links and transaction history |
| Follow-Up | Post-visit message sequences |
| No-Show | Risk scoring for today's appointments |
| Prescriptions | Digital Rx builder |
| Lab Reports | Upload and notify patients |
| Referrals | Specialist referral tracking |
| Consent | Digital consent form management |
| Availability | Slot blocker and working hours calendar |
| Reviews | Star ratings, distribution chart, inline replies |
| Analytics | Clinic performance overview |
| Settings | Full configuration panel |

### Tips for an impressive demo
- Start on **Dashboard** — the count-up animations on KPI cards always impress
- Go to **Messages** — click a conversation to show the real-time chat UI
- Go to **Availability** — show the slot blocker panel and how doctors can block time
- Go to **Reviews** — show the rating distribution animation and click "Add Reply"
- Go to **Deposits** — show the Razorpay payment link sender and transaction history
- Scroll down on any page — Framer Motion fade-up animations trigger on scroll

---

## Setting Up for Production (With Real Data)

### 1. Clone the repository

```bash
git clone --branch reva-ai https://github.com/taaqib-masood/smart-hospital-agent.git reva-ai
cd reva-ai
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase — get from supabase.com dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# WhatsApp Cloud API — get from Meta Developer Console
WHATSAPP_PHONE_ID=your-phone-number-id
WHATSAPP_TOKEN=your-permanent-access-token
WHATSAPP_VERIFY_TOKEN=your-random-verify-token
WHATSAPP_APP_SECRET=your-meta-app-secret

# Cron security — any random string
CRON_SECRET=your-random-secret

# App URL — your Vercel deployment URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Remove this line to enable real auth
# NEXT_PUBLIC_DEMO_MODE=true
```

### 3. WhatsApp Setup (Meta Developer Console)

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new app → Business → WhatsApp
3. Add a WhatsApp phone number
4. Copy the **Phone Number ID** and **Permanent Access Token**
5. Set your webhook URL to: `https://your-app.vercel.app/api/whatsapp/webhook`
6. Set webhook verify token to the same value as `WHATSAPP_VERIFY_TOKEN`
7. Subscribe to `messages` events

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

The `vercel.json` file already configures the cron job to run reminders every 30 minutes automatically.

---

## How the WhatsApp Bot Works (Technical Deep-Dive)

When a patient messages your clinic WhatsApp number:

1. **Meta sends a webhook POST** to `/api/whatsapp/webhook`
2. The webhook handler extracts the message, phone number, and clinic ID
3. It loads the patient's **conversation state** from `reva_booking_state`
4. The **state machine** in `lib/booking-bot.ts` processes the message:

```
idle
  ↓ (any message)
greeting → "Hi! Welcome to [Clinic]. What's your name?"
  ↓ (name received)
collect_name → "Thanks [name]! Which doctor would you like to see?"
  ↓ (doctor chosen)
show_doctors → "Dr. [X] has these slots: 10:30 AM, 2:00 PM..."
  ↓ (slot chosen)
show_slots → "Confirm: [name] with Dr. [X] on [date] at [time]? Reply YES"
  ↓ (YES received)
confirm_slot → Creates appointment in DB, sends confirmation
  ↓
booked ← terminal state (cleared after 24h)
```

5. The response is sent back via **Meta Cloud API** (`lib/whatsapp.ts`)
6. The conversation and all messages are saved to `reva_conversations` and `reva_messages`
7. The dashboard inbox updates in real-time

---

## Automated Reminder System

Every 30 minutes, Vercel Cron calls `GET /api/reminders`. This endpoint:

1. Queries all clinics from `reva_clinics`
2. For each clinic, calculates the target time (`now + reminder_hours_before`)
3. Finds all confirmed/pending appointments within ±30 minutes of that target time that haven't had a reminder sent yet
4. Sends each patient a WhatsApp reminder message
5. Marks `reminder_sent_at` so the same appointment is never reminded twice
6. Also processes any pending follow-up messages (`reva_follow_ups`) that are due

The cron schedule in `vercel.json`:
```json
{
  "crons": [{ "path": "/api/reminders", "schedule": "*/30 * * * *" }]
}
```

---

## Design System

Reva AI uses a consistent dark glassmorphism design language:

- **Background:** `#0A0A0F` — near-black with a deep navy tint
- **Cards:** `bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl` — frosted glass effect
- **Primary accent:** Purple/Violet (`purple-500`, `violet-500`, `fuchsia-500`)
- **Success:** Emerald green (`emerald-400`)
- **Warning:** Amber (`amber-400`)
- **Error:** Rose (`rose-500`)
- **Typography:** White with opacity variants (`text-white/80`, `text-white/40`, `text-white/20`)

All interactive elements have:
- `hover:scale-[1.02]` — subtle lift on hover
- `active:scale-[0.98]` — press feedback
- `transition-all duration-200` — smooth state transitions

Scroll animations use `IntersectionObserver` with CSS opacity + translateY transitions, staggered by index × 60ms.

---

## Future Improvements (Roadmap)

### Near-term (Next 3 Months)

- **Google Business Profile Integration** — pull real Google reviews directly into the Reviews dashboard, reply to Google reviews from within Reva
- **Realtime dashboard** — Supabase `channel()` subscriptions for live appointment updates without page refresh
- **Multi-doctor calendar** — side-by-side view of all doctors' schedules
- **Voice notes on WhatsApp** — Reva transcribes voice messages and processes them as text
- **Automated payment reconciliation** — match Razorpay payments to invoices automatically
- **SMS fallback** — if the patient doesn't have WhatsApp, send an SMS instead

### Medium-term (3–6 Months)

- **AI Diagnosis Helper** — based on symptoms the patient describes in WhatsApp, flag potential urgency to the doctor before the appointment
- **Insurance claim assistant** — auto-fill insurance claim forms from appointment and prescription data
- **Multi-location support** — one doctor, multiple clinic branches, shared patient records
- **Custom WhatsApp chatbot flows** — drag-and-drop builder for clinic owners to customise the booking conversation
- **Patient self-service portal** — a web link patients can visit to see their appointments, prescriptions, and lab reports
- **Stripe/PayU integration** — expand beyond Razorpay for international clinics

### Long-term (6–12 Months)

- **EMR (Electronic Medical Records) integration** — sync with Practo, eVital, or NHA's ABDM health records
- **Predictive analytics** — forecast next month's revenue, identify seasonal patterns, suggest optimal scheduling
- **Video consultation** — integrate with Daily.co for in-app video calls booked via WhatsApp
- **Pharmacy integration** — automatically send prescriptions to empanelled pharmacies for delivery
- **AI-powered review responses** — generate contextually appropriate replies to patient reviews
- **Multilingual bot** — support for Hindi, Tamil, Telugu, Kannada, and Marathi in the WhatsApp bot
- **HIPAA/DPDP compliance module** — full audit trail and data retention policies for regulatory compliance

---

## Metrics Reva AI Targets

Based on comparable deployments in similar markets:

| Metric | Expected Improvement |
|---|---|
| No-show rate | Reduced by 35–50% |
| Time staff spend on calls | Reduced by 2–3 hours/day |
| Patient booking time | Under 60 seconds (from 5–10 minutes by phone) |
| Google review count | 3× increase within 30 days of enabling |
| Deposit collection rate | 70%+ of appointments pay deposit upfront |
| Patient satisfaction | Measurable improvement from "always reachable" perception |

---

## License

Private — All rights reserved.

---

<div align="center">

**Built for Indian clinics by Taaqib Masood**

*Next.js · Supabase · WhatsApp Cloud API · Tailwind CSS · Framer Motion · Razorpay*

</div>
