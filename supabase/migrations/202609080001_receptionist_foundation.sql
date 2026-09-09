begin;

create extension if not exists pgcrypto;

create type public.reva_member_role as enum ('owner', 'admin', 'receptionist');
create type public.reva_message_direction as enum ('inbound', 'outbound');
create type public.reva_message_status as enum ('queued', 'sent', 'delivered', 'read', 'failed', 'suppressed');
create type public.reva_job_status as enum ('pending', 'processing', 'sent', 'failed', 'dead');

create table public.reva_clinics (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  phone text,
  whatsapp_number text,
  whatsapp_phone_id text unique,
  whatsapp_token text, -- legacy only; move to a managed secret before production
  address text,
  specialty text not null default 'clinic',
  registration_no text,
  greeting_message text not null default 'Hello! How can we help you today?',
  reminder_hours_before integer not null default 24 check (reminder_hours_before between 1 and 168),
  timezone text not null default 'Asia/Dubai',
  currency text not null default 'AED',
  working_hours jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reva_clinic_members (
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.reva_member_role not null default 'receptionist',
  created_at timestamptz not null default now(),
  primary key (clinic_id, user_id)
);

create or replace function public.reva_add_owner_membership()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.reva_clinic_members (clinic_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end;
$$;

create trigger reva_clinics_add_owner_membership
after insert on public.reva_clinics
for each row execute function public.reva_add_owner_membership();

create or replace function public.reva_bootstrap_signup_clinic()
returns trigger language plpgsql security definer set search_path = public
as $$
declare requested_name text;
begin
  if coalesce(new.raw_user_meta_data ->> 'reva_create_clinic', 'false') <> 'true' then
    return new;
  end if;

  requested_name := nullif(trim(new.raw_user_meta_data ->> 'clinic_name'), '');
  insert into public.reva_clinics (owner_id, name)
  values (new.id, left(coalesce(requested_name, 'My Clinic'), 120));
  return new;
end;
$$;

drop trigger if exists reva_bootstrap_signup_clinic on auth.users;
create trigger reva_bootstrap_signup_clinic
after insert on auth.users
for each row execute function public.reva_bootstrap_signup_clinic();

create table public.reva_doctors (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  name text not null,
  specialization text,
  qualification text,
  reg_no text,
  phone text,
  available_days text[] not null default '{}',
  slot_duration_minutes integer not null default 30 check (slot_duration_minutes between 5 and 480),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reva_services (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  name text not null,
  duration_minutes integer not null default 30 check (duration_minutes between 5 and 480),
  buffer_minutes integer not null default 0 check (buffer_minutes between 0 and 180),
  price numeric(12,2) check (price is null or price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, name)
);

create table public.reva_patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  name text not null,
  phone text not null,
  whatsapp_phone text,
  age integer check (age is null or age between 0 and 130),
  gender text,
  blood_group text,
  allergies text[] not null default '{}',
  conditions text[] not null default '{}',
  notes text,
  last_visit date,
  total_visits integer not null default 0 check (total_visits >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, phone)
);

create table public.reva_availability_rules (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  doctor_id uuid references public.reva_doctors(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_minutes integer not null default 30 check (slot_minutes between 5 and 480),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create table public.reva_availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  doctor_id uuid references public.reva_doctors(id) on delete cascade,
  exception_date date not null,
  start_time time,
  end_time time,
  available boolean not null default false,
  reason text,
  created_at timestamptz not null default now(),
  check ((start_time is null and end_time is null) or (start_time is not null and end_time is not null and start_time < end_time))
);

create table public.reva_appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  patient_id uuid references public.reva_patients(id) on delete set null,
  doctor_id uuid references public.reva_doctors(id) on delete set null,
  service_id uuid references public.reva_services(id) on delete set null,
  appointment_date date not null,
  appointment_time time not null,
  duration_minutes integer not null default 30 check (duration_minutes between 5 and 480),
  type text not null default 'Appointment',
  status text not null default 'Pending' check (status in ('Pending','Confirmed','Cancelled','Completed','No-Show')),
  notes text,
  reminder_sent_at timestamptz,
  confirmed_via text,
  no_show_risk numeric(5,2) not null default 0 check (no_show_risk between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index reva_active_appointment_slot
  on public.reva_appointments (clinic_id, doctor_id, appointment_date, appointment_time)
  where doctor_id is not null and status in ('Pending', 'Confirmed');

create table public.reva_conversations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  patient_id uuid references public.reva_patients(id) on delete set null,
  wa_contact_id text not null,
  contact_name text,
  contact_phone text not null,
  last_message text,
  last_message_at timestamptz not null default now(),
  last_inbound_at timestamptz,
  unread_count integer not null default 0 check (unread_count >= 0),
  is_bot_active boolean not null default true,
  assigned_to uuid references auth.users(id) on delete set null,
  handoff_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, contact_phone)
);

create table public.reva_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.reva_conversations(id) on delete cascade,
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  direction public.reva_message_direction not null,
  content text not null default '',
  message_type text not null default 'text',
  wa_message_id text,
  status public.reva_message_status not null default 'queued',
  error_code text,
  error_message text,
  sent_by text not null,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index reva_messages_wa_id on public.reva_messages (wa_message_id) where wa_message_id is not null;

create table public.reva_booking_state (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  contact_phone text not null,
  state text not null default 'idle',
  context jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  unique (clinic_id, contact_phone)
);

create table public.reva_communication_consents (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  patient_id uuid references public.reva_patients(id) on delete set null,
  phone text not null,
  channel text not null default 'whatsapp' check (channel = 'whatsapp'),
  status text not null check (status in ('opted_in', 'opted_out')),
  source text not null,
  wording text,
  language text not null default 'en',
  recorded_at timestamptz not null default now(),
  recorded_by uuid references auth.users(id) on delete set null,
  unique (clinic_id, phone, channel)
);

create table public.reva_whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  purpose text not null,
  template_name text not null,
  language_code text not null default 'en',
  status text not null default 'pending' check (status in ('pending','approved','rejected','paused')),
  components jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, purpose, language_code)
);

create table public.reva_consent_templates (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  name text not null,
  version integer not null default 1 check (version > 0),
  body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, name, version)
);

create table public.reva_automation_rules (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  name text not null,
  trigger_type text not null check (trigger_type in ('after_completed','after_no_show')),
  delay_minutes integer not null default 120 check (delay_minutes between 0 and 525600),
  whatsapp_template_id uuid not null references public.reva_whatsapp_templates(id) on delete restrict,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reva_consent_requests (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  patient_id uuid references public.reva_patients(id) on delete set null,
  template_id uuid not null references public.reva_consent_templates(id) on delete restrict,
  access_token_hash text not null unique,
  status text not null default 'Pending' check (status in ('Pending','Sent','Viewed','Signed','Declined','Expired','Cancelled')),
  sent_at timestamptz,
  viewed_at timestamptz,
  signed_at timestamptz,
  signer_name text,
  accepted_terms boolean,
  signature_hash text,
  ip_address inet,
  user_agent text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reva_invoices (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  patient_id uuid references public.reva_patients(id) on delete set null,
  appointment_id uuid references public.reva_appointments(id) on delete set null,
  service_description text not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'AED',
  status text not null default 'Pending' check (status in ('Pending','Paid','Waived','Cancelled')),
  payment_method text,
  paid_at timestamptz,
  waived_reason text,
  invoice_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reva_follow_ups (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  patient_id uuid not null references public.reva_patients(id) on delete cascade,
  appointment_id uuid references public.reva_appointments(id) on delete set null,
  rule_id uuid references public.reva_automation_rules(id) on delete set null,
  rule_type text not null,
  template_message text not null,
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  status text not null default 'Pending' check (status in ('Pending','Sent','Skipped','Failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index reva_follow_up_once_per_rule
  on public.reva_follow_ups (appointment_id, rule_id)
  where appointment_id is not null and rule_id is not null;

create table public.reva_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text
);

create table public.reva_message_jobs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  conversation_id uuid references public.reva_conversations(id) on delete cascade,
  patient_id uuid references public.reva_patients(id) on delete set null,
  kind text not null,
  recipient_phone text not null,
  payload jsonb not null,
  idempotency_key text not null unique,
  status public.reva_job_status not null default 'pending',
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 5 check (max_attempts between 1 and 20),
  run_at timestamptz not null default now(),
  locked_at timestamptz,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reva_message_jobs_due on public.reva_message_jobs (run_at, created_at) where status in ('pending', 'failed', 'processing');

create or replace function public.reva_claim_message_jobs(batch_size integer default 20)
returns setof public.reva_message_jobs
language plpgsql security definer set search_path = public
as $$
begin
  return query
  update public.reva_message_jobs jobs
  set status = 'processing', attempts = jobs.attempts + 1, locked_at = now(), updated_at = now()
  where jobs.id in (
    select due.id from public.reva_message_jobs due
    where (
      due.status in ('pending', 'failed')
      or (due.status = 'processing' and due.locked_at < now() - interval '15 minutes')
    ) and due.run_at <= now()
    order by due.run_at, due.created_at
    for update skip locked
    limit greatest(1, least(batch_size, 100))
  )
  returning jobs.*;
end;
$$;

revoke all on function public.reva_claim_message_jobs(integer) from public, anon, authenticated;
grant execute on function public.reva_claim_message_jobs(integer) to service_role;

create table public.reva_audit_events (
  id bigint generated always as identity primary key,
  clinic_id uuid not null references public.reva_clinics(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index reva_audit_events_clinic_time on public.reva_audit_events (clinic_id, created_at desc);

insert into public.reva_clinic_members (clinic_id, user_id, role)
select id, owner_id, 'owner'::public.reva_member_role from public.reva_clinics
on conflict do nothing;

create or replace function public.reva_is_clinic_member(target_clinic_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.reva_clinic_members
    where clinic_id = target_clinic_id and user_id = auth.uid()
  );
$$;

create or replace function public.reva_has_clinic_role(target_clinic_id uuid, allowed_roles public.reva_member_role[])
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.reva_clinic_members
    where clinic_id = target_clinic_id and user_id = auth.uid() and role = any(allowed_roles)
  );
$$;

create or replace function public.reva_increment_conversation_unread(target_conversation_id uuid)
returns void language sql security definer set search_path = public
as $$
  update public.reva_conversations set unread_count = unread_count + 1, updated_at = now()
  where id = target_conversation_id;
$$;

revoke all on function public.reva_increment_conversation_unread(uuid) from public, anon, authenticated;
grant execute on function public.reva_increment_conversation_unread(uuid) to service_role;

create or replace function public.reva_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'reva_clinics','reva_doctors','reva_services','reva_patients','reva_appointments',
    'reva_conversations','reva_booking_state','reva_whatsapp_templates','reva_consent_templates','reva_automation_rules','reva_consent_requests',
    'reva_invoices','reva_follow_ups','reva_message_jobs'
  ] loop
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.reva_set_updated_at()', table_name, table_name);
  end loop;
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'reva_clinic_members','reva_doctors','reva_services','reva_patients',
    'reva_availability_rules','reva_availability_exceptions','reva_appointments','reva_conversations',
    'reva_messages','reva_booking_state','reva_communication_consents','reva_whatsapp_templates','reva_consent_templates',
    'reva_automation_rules','reva_consent_requests','reva_invoices','reva_follow_ups','reva_message_jobs','reva_audit_events'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy %I_member_select on public.%I for select to authenticated using (public.reva_is_clinic_member(clinic_id))', table_name, table_name);
    execute format('create policy %I_member_insert on public.%I for insert to authenticated with check (public.reva_is_clinic_member(clinic_id))', table_name, table_name);
    execute format('create policy %I_member_update on public.%I for update to authenticated using (public.reva_is_clinic_member(clinic_id)) with check (public.reva_is_clinic_member(clinic_id))', table_name, table_name);
    execute format('create policy %I_admin_delete on public.%I for delete to authenticated using (public.reva_has_clinic_role(clinic_id, array[''owner''::public.reva_member_role,''admin''::public.reva_member_role]))', table_name, table_name);
  end loop;
end $$;

alter table public.reva_clinics enable row level security;
create policy reva_clinics_member_select on public.reva_clinics for select to authenticated
  using (public.reva_is_clinic_member(id));
create policy reva_clinics_owner_insert on public.reva_clinics for insert to authenticated with check (owner_id = auth.uid());
create policy reva_clinics_admin_update on public.reva_clinics for update to authenticated
  using (public.reva_has_clinic_role(id, array['owner'::public.reva_member_role,'admin'::public.reva_member_role]))
  with check (public.reva_has_clinic_role(id, array['owner'::public.reva_member_role,'admin'::public.reva_member_role]));
create policy reva_clinics_owner_delete on public.reva_clinics for delete to authenticated
  using (public.reva_has_clinic_role(id, array['owner'::public.reva_member_role]));

drop policy reva_clinic_members_member_insert on public.reva_clinic_members;
drop policy reva_clinic_members_member_update on public.reva_clinic_members;
drop policy reva_clinic_members_admin_delete on public.reva_clinic_members;
create policy reva_clinic_members_admin_insert on public.reva_clinic_members for insert to authenticated
  with check (public.reva_has_clinic_role(clinic_id, array['owner'::public.reva_member_role,'admin'::public.reva_member_role]));
create policy reva_clinic_members_admin_update on public.reva_clinic_members for update to authenticated
  using (public.reva_has_clinic_role(clinic_id, array['owner'::public.reva_member_role,'admin'::public.reva_member_role]))
  with check (public.reva_has_clinic_role(clinic_id, array['owner'::public.reva_member_role,'admin'::public.reva_member_role]));
create policy reva_clinic_members_admin_delete on public.reva_clinic_members for delete to authenticated
  using (public.reva_has_clinic_role(clinic_id, array['owner'::public.reva_member_role,'admin'::public.reva_member_role]));

drop policy reva_audit_events_member_update on public.reva_audit_events;
drop policy reva_audit_events_admin_delete on public.reva_audit_events;

alter table public.reva_webhook_events enable row level security;

commit;
