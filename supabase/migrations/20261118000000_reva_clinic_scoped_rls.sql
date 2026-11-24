-- Per-clinic row policies for signed-in clinic owners.
-- The RESTRICTIVE policies are ANDed with every permissive policy already deployed,
-- so an existing `using (true)` policy can no longer expose other clinics' rows to
-- the `authenticated` role. The `anon` role used by the WhatsApp webhook and the
-- reminders cron is not affected.

do $$
declare t text;
begin
  foreach t in array array['reva_patients', 'reva_appointments', 'reva_conversations'] loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_clinic_select', t);
    execute format('drop policy if exists %I on public.%I', t || '_clinic_update', t);
    execute format('drop policy if exists %I on public.%I', t || '_clinic_select_only', t);
    execute format('drop policy if exists %I on public.%I', t || '_clinic_update_only', t);

    execute format($p$
      create policy %I on public.%I for select to authenticated
      using (clinic_id in (select id from public.reva_clinics where owner_id = (select auth.uid())))
    $p$, t || '_clinic_select', t);

    execute format($p$
      create policy %I on public.%I for update to authenticated
      using (clinic_id in (select id from public.reva_clinics where owner_id = (select auth.uid())))
      with check (clinic_id in (select id from public.reva_clinics where owner_id = (select auth.uid())))
    $p$, t || '_clinic_update', t);

    execute format($p$
      create policy %I on public.%I as restrictive for select to authenticated
      using (clinic_id in (select id from public.reva_clinics where owner_id = (select auth.uid())))
    $p$, t || '_clinic_select_only', t);

    execute format($p$
      create policy %I on public.%I as restrictive for update to authenticated
      using (clinic_id in (select id from public.reva_clinics where owner_id = (select auth.uid())))
      with check (clinic_id in (select id from public.reva_clinics where owner_id = (select auth.uid())))
    $p$, t || '_clinic_update_only', t);
  end loop;
end $$;
