begin;

-- One clinic per owner. Fails loudly if duplicate owner rows already exist; resolve those first.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.reva_clinics'::regclass and conname = 'reva_clinics_owner_id_key'
  ) then
    alter table public.reva_clinics add constraint reva_clinics_owner_id_key unique (owner_id);
  end if;
end;
$$;

alter table public.reva_clinics enable row level security;

-- Replace any existing insert policy; only a signed-in user may create their own clinic.
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'reva_clinics' and cmd = 'INSERT'
  loop
    execute format('drop policy %I on public.reva_clinics', p.policyname);
  end loop;
end;
$$;

revoke insert on public.reva_clinics from anon, public;

create policy reva_clinics_insert_own on public.reva_clinics
for insert to authenticated
with check (owner_id = auth.uid());

-- Signup clinic is created server-side from signUp options.data, not by the unauthenticated browser.
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
  values (new.id, left(coalesce(requested_name, 'My Clinic'), 120))
  on conflict (owner_id) do nothing;
  return new;
end;
$$;

revoke execute on function public.reva_bootstrap_signup_clinic() from public, anon, authenticated;

drop trigger if exists reva_bootstrap_signup_clinic on auth.users;
create trigger reva_bootstrap_signup_clinic
after insert on auth.users
for each row execute function public.reva_bootstrap_signup_clinic();

commit;
