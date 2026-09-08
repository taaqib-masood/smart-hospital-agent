# Containers

Reva runs as a Next.js application container. Supabase and the WhatsApp Cloud API remain managed services; do not add a local Postgres, Redis, or broker for the pilot.

## Team start

1. Copy `.env.example` to `.env` and set the Supabase public URL/key before the image build. Keep service credentials out of source control.
2. Run `docker compose up --build`, confirm `http://localhost:3001/api/health` returns `{ "status": "ok" }`, then open `http://localhost:3001`.
3. For a non-demo environment that needs background work, set `CRON_SECRET` and run `docker compose --profile scheduler up --build`.

The optional scheduler calls the internal message worker every five minutes and materializes reminders every thirty minutes. Run exactly one scheduler replica per environment.

## Staging migration

Apply `supabase/migrations/202609080001_receptionist_foundation.sql` to a disposable or staging Supabase project using the Supabase CLI or dashboard. Do not run migrations automatically from Compose: this schema depends on Supabase Auth, row-level-security roles, and `auth.users`.

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are build arguments because Next.js embeds them in the browser bundle. Rebuild after either value changes. Service-role, Meta and cron secrets are runtime-only environment values.
