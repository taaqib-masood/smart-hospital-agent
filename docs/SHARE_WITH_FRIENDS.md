# Share Reva with friends

## Fast demo mode

This mode needs no Supabase account, WhatsApp credentials, or patient data. It uses the synthetic clinic data already included in the portal.

### Prerequisites

- Docker Desktop installed and running.
- Git installed if cloning from GitHub.

### Start the demo

```powershell
git clone -b codex/receptionist-bilingual-expansion https://github.com/taaqib-masood/smart-hospital-agent.git
cd smart-hospital-agent
docker compose --env-file demo.env.example up --build
```

Open `http://localhost:3001/dashboard`.

The health check is available at `http://localhost:3001/api/health` and should return a successful JSON response.

Stop it with `Ctrl+C`, or from another terminal run:

```powershell
docker compose down
```

## Private staging mode

Do not share real credentials in GitHub, chat, or the repository. Copy `.env.example` to `.env`, set `NEXT_PUBLIC_DEMO_MODE=false`, and add the private Supabase, Meta WhatsApp, and cron values. Then run:

```powershell
npm run check:config
docker compose up --build
```

Apply the SQL migrations to the intended Supabase staging project before testing live routes. Add the scheduler only after `CRON_SECRET` is configured:

```powershell
CHECK_SCHEDULER=true npm run check:config
docker compose --profile scheduler up --build
```

Only one scheduler should run for an environment. Use test contacts and synthetic data until the clinic has approved templates, opt-in wording, retention, and access rules.

## What the demo does not prove

Demo mode proves that the container and portal run. It does not prove Supabase connectivity, Meta webhook delivery, scheduled messages, WhatsApp template approval, production backups, clinic-specific configuration, or regulatory readiness. Those gates are listed in `docs/MANUAL_BLOCKERS.md`.
