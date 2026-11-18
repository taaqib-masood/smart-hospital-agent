begin;

-- PostgreSQL 15+ is required for column-specific SET NULL; validate existing rows without deleting them.
alter table public.reva_doctors add constraint reva_doctors_id_clinic_key unique (id, clinic_id);
alter table public.reva_patients add constraint reva_patients_id_clinic_key unique (id, clinic_id);
alter table public.reva_services add constraint reva_services_id_clinic_key unique (id, clinic_id);
alter table public.reva_conversations add constraint reva_conversations_id_clinic_key unique (id, clinic_id);
alter table public.reva_whatsapp_templates add constraint reva_whatsapp_templates_id_clinic_key unique (id, clinic_id);
alter table public.reva_consent_templates add constraint reva_consent_templates_id_clinic_key unique (id, clinic_id);
alter table public.reva_appointments add constraint reva_appointments_id_clinic_key unique (id, clinic_id);
alter table public.reva_automation_rules add constraint reva_automation_rules_id_clinic_key unique (id, clinic_id);

alter table public.reva_availability_rules
  drop constraint reva_availability_rules_doctor_id_fkey,
  add constraint reva_availability_rules_doctor_id_fkey foreign key (doctor_id, clinic_id)
    references public.reva_doctors(id, clinic_id) on delete cascade;
alter table public.reva_availability_exceptions
  drop constraint reva_availability_exceptions_doctor_id_fkey,
  add constraint reva_availability_exceptions_doctor_id_fkey foreign key (doctor_id, clinic_id)
    references public.reva_doctors(id, clinic_id) on delete cascade;
alter table public.reva_appointments
  drop constraint reva_appointments_patient_id_fkey,
  add constraint reva_appointments_patient_id_fkey foreign key (patient_id, clinic_id)
    references public.reva_patients(id, clinic_id) on delete set null (patient_id);
alter table public.reva_appointments
  drop constraint reva_appointments_doctor_id_fkey,
  add constraint reva_appointments_doctor_id_fkey foreign key (doctor_id, clinic_id)
    references public.reva_doctors(id, clinic_id) on delete set null (doctor_id);
alter table public.reva_appointments
  drop constraint reva_appointments_service_id_fkey,
  add constraint reva_appointments_service_id_fkey foreign key (service_id, clinic_id)
    references public.reva_services(id, clinic_id) on delete set null (service_id);
alter table public.reva_conversations
  drop constraint reva_conversations_patient_id_fkey,
  add constraint reva_conversations_patient_id_fkey foreign key (patient_id, clinic_id)
    references public.reva_patients(id, clinic_id) on delete set null (patient_id);
alter table public.reva_messages
  drop constraint reva_messages_conversation_id_fkey,
  add constraint reva_messages_conversation_id_fkey foreign key (conversation_id, clinic_id)
    references public.reva_conversations(id, clinic_id) on delete cascade;
alter table public.reva_communication_consents
  drop constraint reva_communication_consents_patient_id_fkey,
  add constraint reva_communication_consents_patient_id_fkey foreign key (patient_id, clinic_id)
    references public.reva_patients(id, clinic_id) on delete set null (patient_id);
alter table public.reva_automation_rules
  drop constraint reva_automation_rules_whatsapp_template_id_fkey,
  add constraint reva_automation_rules_whatsapp_template_id_fkey foreign key (whatsapp_template_id, clinic_id)
    references public.reva_whatsapp_templates(id, clinic_id) on delete restrict;
alter table public.reva_consent_requests
  drop constraint reva_consent_requests_patient_id_fkey,
  add constraint reva_consent_requests_patient_id_fkey foreign key (patient_id, clinic_id)
    references public.reva_patients(id, clinic_id) on delete set null (patient_id);
alter table public.reva_consent_requests
  drop constraint reva_consent_requests_template_id_fkey,
  add constraint reva_consent_requests_template_id_fkey foreign key (template_id, clinic_id)
    references public.reva_consent_templates(id, clinic_id) on delete restrict;
alter table public.reva_invoices
  drop constraint reva_invoices_patient_id_fkey,
  add constraint reva_invoices_patient_id_fkey foreign key (patient_id, clinic_id)
    references public.reva_patients(id, clinic_id) on delete set null (patient_id);
alter table public.reva_invoices
  drop constraint reva_invoices_appointment_id_fkey,
  add constraint reva_invoices_appointment_id_fkey foreign key (appointment_id, clinic_id)
    references public.reva_appointments(id, clinic_id) on delete set null (appointment_id);
alter table public.reva_follow_ups
  drop constraint reva_follow_ups_patient_id_fkey,
  add constraint reva_follow_ups_patient_id_fkey foreign key (patient_id, clinic_id)
    references public.reva_patients(id, clinic_id) on delete cascade;
alter table public.reva_follow_ups
  drop constraint reva_follow_ups_appointment_id_fkey,
  add constraint reva_follow_ups_appointment_id_fkey foreign key (appointment_id, clinic_id)
    references public.reva_appointments(id, clinic_id) on delete set null (appointment_id);
alter table public.reva_follow_ups
  drop constraint reva_follow_ups_rule_id_fkey,
  add constraint reva_follow_ups_rule_id_fkey foreign key (rule_id, clinic_id)
    references public.reva_automation_rules(id, clinic_id) on delete set null (rule_id);
alter table public.reva_message_jobs
  drop constraint reva_message_jobs_conversation_id_fkey,
  add constraint reva_message_jobs_conversation_id_fkey foreign key (conversation_id, clinic_id)
    references public.reva_conversations(id, clinic_id) on delete cascade;
alter table public.reva_message_jobs
  drop constraint reva_message_jobs_patient_id_fkey,
  add constraint reva_message_jobs_patient_id_fkey foreign key (patient_id, clinic_id)
    references public.reva_patients(id, clinic_id) on delete set null (patient_id);

notify pgrst, 'reload schema';
commit;
