begin;

-- The public anon key ships in the browser bundle. Sessionless server paths
-- (WhatsApp webhook, booking bot, reminders cron) use the service-role client,
-- so the anon role needs no access to clinic data.
do $$
declare r record;
begin
  for r in
    select tablename, policyname from pg_policies
    where schemaname = 'public' and tablename like 'reva\_%' and 'anon' = any(roles)
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;

  for r in
    select tablename from pg_tables
    where schemaname = 'public' and tablename like 'reva\_%'
  loop
    execute format('alter table public.%I enable row level security', r.tablename);
    execute format('revoke all on table public.%I from anon', r.tablename);
  end loop;
end $$;

commit;
