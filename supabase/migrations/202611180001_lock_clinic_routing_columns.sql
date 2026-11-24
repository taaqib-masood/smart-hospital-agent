begin;

revoke insert, update on public.reva_clinics from anon, authenticated;
grant insert (owner_id, name, phone, whatsapp_number, address, specialty, registration_no, greeting_message, working_hours, reminder_hours_before, timezone, currency, updated_at)
  on public.reva_clinics to authenticated;
grant update (name, phone, whatsapp_number, address, specialty, registration_no, greeting_message, working_hours, reminder_hours_before, timezone, currency, updated_at)
  on public.reva_clinics to authenticated;

commit;
