begin;

-- The public anon key ships in the browser bundle. Sessionless server paths
-- (WhatsApp webhook, booking bot, reminders cron) use the service-role client,
-- so the anon role needs no access to clinic data.
do $$
declare r record;
begin
  -- Strip anon from policies; keep the rest of a shared policy for its other roles.
  for r in
    select tablename, policyname, array_remove(roles, 'anon'::name) as rest from pg_policies
    where schemaname = 'public' and tablename like 'reva\_%' and 'anon' = any(roles)
  loop
    if cardinality(r.rest) = 0 then
      execute format('drop policy %I on public.%I', r.policyname, r.tablename);
    else
      execute format('alter policy %I on public.%I to %s', r.policyname, r.tablename,
        (select string_agg(quote_ident(role_name), ', ') from unnest(r.rest) as role_name));
    end if;
  end loop;

  for r in
    select tablename from pg_tables
    where schemaname = 'public' and tablename like 'reva\_%'
  loop
    execute format('revoke all on table public.%I from anon', r.tablename);
  end loop;
end $$;

commit;
