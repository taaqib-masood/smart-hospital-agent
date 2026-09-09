begin;

-- WhatsApp access tokens are operational secrets. Keep them separate from the
-- receptionist-readable clinic profile; the service-role worker is the only
-- code path that reads this table.
create table public.reva_whatsapp_credentials (
  clinic_id uuid primary key references public.reva_clinics(id) on delete cascade,
  phone_id text not null,
  access_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.reva_whatsapp_credentials (clinic_id, phone_id, access_token)
select id, whatsapp_phone_id, whatsapp_token
from public.reva_clinics
where whatsapp_phone_id is not null and nullif(trim(whatsapp_token), '') is not null
on conflict (clinic_id) do update
set phone_id = excluded.phone_id,
    access_token = excluded.access_token,
    updated_at = now();

alter table public.reva_whatsapp_credentials enable row level security;
revoke all on table public.reva_whatsapp_credentials from anon, authenticated;

create trigger reva_whatsapp_credentials_updated_at
before update on public.reva_whatsapp_credentials
for each row execute function public.reva_set_updated_at();

alter table public.reva_clinics drop column whatsapp_token;

commit;
