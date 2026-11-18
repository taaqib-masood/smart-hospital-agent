-- Clinic owners may edit their profile, but not the columns that route WhatsApp traffic or own the row.
-- whatsapp_phone_id / whatsapp_token are set by the operator (service role or SQL editor), see README.

-- Fails if two clinics already share a phone ID: resolve those rows by hand before applying.
update public.reva_clinics set whatsapp_phone_id = null where trim(whatsapp_phone_id) = '';
alter table public.reva_clinics
  add constraint reva_clinics_whatsapp_phone_id_key unique (whatsapp_phone_id);

-- Column-level grants: the browser writes reva_clinics directly (signup, onboarding upsert), so the API allowlist alone is not enough.
revoke insert, update on public.reva_clinics from anon, authenticated;
grant insert (owner_id, name, phone, whatsapp_number, address, specialty, registration_no, greeting_message, working_hours, reminder_hours_before, updated_at)
  on public.reva_clinics to authenticated;
-- owner_id is listed because PostgREST upserts (onConflict: owner_id) re-set it; the policy below pins it.
grant update (owner_id, name, phone, whatsapp_number, address, specialty, registration_no, greeting_message, working_hours, reminder_hours_before, updated_at)
  on public.reva_clinics to authenticated;

-- Restrictive, so it is ANDed with whatever permissive update policy already exists.
drop policy if exists reva_clinics_owner_update_check on public.reva_clinics;
create policy reva_clinics_owner_update_check on public.reva_clinics
  as restrictive for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
drop policy if exists reva_clinics_owner_insert_check on public.reva_clinics;
create policy reva_clinics_owner_insert_check on public.reva_clinics
  as restrictive for insert to authenticated
  with check (owner_id = auth.uid());

alter table public.reva_clinics
  add constraint reva_clinics_reminder_hours_before_range check (reminder_hours_before between 1 and 168) not valid;
