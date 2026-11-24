-- One active booking per doctor slot; the WhatsApp bot treats a 23505 on insert as "slot unavailable".
-- Resolve any existing duplicate Pending/Confirmed rows before applying.
create unique index if not exists reva_active_appointment_slot
  on public.reva_appointments (clinic_id, doctor_id, appointment_date, appointment_time)
  where doctor_id is not null and status in ('Pending', 'Confirmed');
