-- Leads are written only by /api/leads with the service-role key, which
-- validates input and rate-limits. Block direct anon/authenticated REST writes.
alter table public.leads enable row level security;
revoke insert, update, delete on table public.leads from anon, authenticated;
