begin;

-- PostgreSQL 15+ is required for column-specific SET NULL; validate existing rows without deleting them.
alter table public.reva_patients add constraint reva_patients_id_clinic_key unique (id, clinic_id);
alter table public.reva_doctors add constraint reva_doctors_id_clinic_key unique (id, clinic_id);
alter table public.reva_appointments add constraint reva_appointments_id_clinic_key unique (id, clinic_id);

alter table public.reva_appointments
  drop constraint if exists reva_appointments_patient_id_fkey,
  add constraint reva_appointments_patient_id_fkey foreign key (patient_id, clinic_id)
    references public.reva_patients(id, clinic_id) on delete set null (patient_id);
alter table public.reva_appointments
  drop constraint if exists reva_appointments_doctor_id_fkey,
  add constraint reva_appointments_doctor_id_fkey foreign key (doctor_id, clinic_id)
    references public.reva_doctors(id, clinic_id) on delete set null (doctor_id);
alter table public.reva_invoices
  drop constraint if exists reva_invoices_patient_id_fkey,
  add constraint reva_invoices_patient_id_fkey foreign key (patient_id, clinic_id)
    references public.reva_patients(id, clinic_id) on delete set null (patient_id);
alter table public.reva_invoices
  drop constraint if exists reva_invoices_appointment_id_fkey,
  add constraint reva_invoices_appointment_id_fkey foreign key (appointment_id, clinic_id)
    references public.reva_appointments(id, clinic_id) on delete set null (appointment_id);
alter table public.reva_follow_ups
  drop constraint if exists reva_follow_ups_patient_id_fkey,
  add constraint reva_follow_ups_patient_id_fkey foreign key (patient_id, clinic_id)
    references public.reva_patients(id, clinic_id) on delete cascade;
alter table public.reva_follow_ups
  drop constraint if exists reva_follow_ups_appointment_id_fkey,
  add constraint reva_follow_ups_appointment_id_fkey foreign key (appointment_id, clinic_id)
    references public.reva_appointments(id, clinic_id) on delete set null (appointment_id);

-- Restrictive: ANDed with the existing permissive policies, so signed-in writes can only land in the caller's own clinic.
do $$
declare table_name text;
begin
  foreach table_name in array array['reva_appointments', 'reva_invoices', 'reva_follow_ups'] loop
    execute format('create policy %I_own_clinic_insert on public.%I as restrictive for insert to authenticated with check (clinic_id in (select id from public.reva_clinics where owner_id = auth.uid()))', table_name, table_name);
    execute format('create policy %I_own_clinic_update on public.%I as restrictive for update to authenticated using (clinic_id in (select id from public.reva_clinics where owner_id = auth.uid())) with check (clinic_id in (select id from public.reva_clinics where owner_id = auth.uid()))', table_name, table_name);
  end loop;
end $$;

notify pgrst, 'reload schema';
commit;
