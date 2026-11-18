begin;

alter table public.reva_consent_requests
  add column issued_patient_id uuid,
  add column document_snapshot jsonb,
  add column document_hash text,
  add column document_captured_at timestamptz,
  add column document_origin text not null default 'legacy_unverified',
  add constraint reva_consent_document_origin check (document_origin in ('issued_snapshot', 'legacy_unsigned_snapshot', 'legacy_unverified')),
  add constraint reva_consent_document_capture check (
    (document_origin = 'legacy_unverified' and document_snapshot is null and document_hash is null and document_captured_at is null)
    or (document_origin <> 'legacy_unverified' and document_snapshot is not null and document_hash is not null and document_captured_at is not null)
  );

-- Only unsigned, clean requests can preserve current wording; this is not evidence of earlier wording.
with snapshots as (
  select request.id, jsonb_build_object('name', template.name, 'version', template.version, 'body', template.body) as document
  from public.reva_consent_requests request
  join public.reva_consent_templates template on template.id = request.template_id and template.clinic_id = request.clinic_id
  where request.status in ('Pending', 'Sent', 'Viewed')
    and request.signed_at is null and request.signer_name is null and request.accepted_terms is null
    and request.signature_hash is null and request.ip_address is null and request.user_agent is null
)
update public.reva_consent_requests request
set document_snapshot = snapshots.document,
    document_hash = encode(sha256(convert_to(snapshots.document::text, 'UTF8')), 'hex'),
    document_captured_at = statement_timestamp(),
    document_origin = 'legacy_unsigned_snapshot',
    issued_patient_id = request.patient_id
from snapshots where request.id = snapshots.id;

create or replace function public.reva_protect_consent_evidence()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  document jsonb;
  is_service boolean := coalesce(auth.role() = 'service_role', false);
begin
  if tg_op = 'INSERT' then
    if new.status <> 'Pending' or new.signed_at is not null or new.signer_name is not null
      or new.accepted_terms is not null or new.signature_hash is not null or new.ip_address is not null
      or new.user_agent is not null or new.sent_at is not null or new.viewed_at is not null then
      raise exception 'Consent requests must start unsigned' using errcode = '23514';
    end if;
    if new.expires_at is null or not isfinite(new.expires_at) or new.expires_at <= statement_timestamp() then
      raise exception 'Consent requests require a future expiry' using errcode = '23514';
    end if;
    select jsonb_build_object('name', template.name, 'version', template.version, 'body', template.body)
    into document from public.reva_consent_templates template
    where template.id = new.template_id and template.clinic_id = new.clinic_id and template.active;
    if not found then
      raise exception 'Active consent template must belong to the request clinic' using errcode = '23514';
    end if;
    new.document_snapshot := document;
    new.issued_patient_id := new.patient_id;
    new.document_hash := encode(sha256(convert_to(document::text, 'UTF8')), 'hex');
    new.document_captured_at := statement_timestamp();
    new.document_origin := 'issued_snapshot';
    new.created_at := statement_timestamp();
    return new;
  end if;

  -- Preserve the original FK cleanup without allowing direct identity replacement or evidence changes.
  if old.patient_id is not null and new.patient_id is null and pg_trigger_depth() > 1
    and not exists (select 1 from public.reva_patients where id = old.patient_id) then
    if (to_jsonb(new) - array['patient_id','updated_at']) is distinct from (to_jsonb(old) - array['patient_id','updated_at']) then
      raise exception 'Patient cleanup cannot alter consent evidence' using errcode = '23514';
    end if;
    return new;
  end if;

  if (to_jsonb(new) - array['status','sent_at','viewed_at','signed_at','signer_name','accepted_terms','signature_hash','ip_address','user_agent','updated_at'])
    is distinct from
    (to_jsonb(old) - array['status','sent_at','viewed_at','signed_at','signer_name','accepted_terms','signature_hash','ip_address','user_agent','updated_at']) then
    raise exception 'Consent identity, token, expiry and document are immutable' using errcode = '23514';
  end if;

  if old.status in ('Signed', 'Declined', 'Cancelled', 'Expired') then
    if (to_jsonb(new) - 'updated_at') is distinct from (to_jsonb(old) - 'updated_at') then
      raise exception 'Completed consent evidence is immutable' using errcode = '23514';
    end if;
    return new;
  end if;

  if new.status is distinct from old.status and not (
    (old.status = 'Pending' and new.status = 'Sent')
    or (is_service and old.status in ('Pending', 'Sent') and new.status = 'Viewed')
    or (is_service and new.status in ('Signed', 'Declined'))
    or new.status in ('Cancelled', 'Expired')
  ) then
    raise exception 'Consent status transition is not authorized' using errcode = '42501';
  end if;

  if old.status = 'Pending' and new.status = 'Sent' then
    new.sent_at := statement_timestamp();
  elsif new.sent_at is distinct from old.sent_at then
    raise exception 'Consent delivery evidence is immutable' using errcode = '23514';
  end if;
  if old.status in ('Pending', 'Sent') and new.status = 'Viewed' and is_service then
    new.viewed_at := statement_timestamp();
  elsif new.viewed_at is distinct from old.viewed_at then
    raise exception 'Only the signing service can record a consent view' using errcode = '42501';
  end if;

  if new.status = 'Signed' then
    if not is_service or new.document_hash is null or new.document_snapshot is null
      or new.document_origin = 'legacy_unverified' or new.expires_at is null
      or not isfinite(new.expires_at) or new.expires_at <= statement_timestamp()
      or new.accepted_terms is distinct from true or length(btrim(coalesce(new.signer_name, ''))) < 2 then
      raise exception 'Consent cannot be signed' using errcode = '23514';
    end if;
    new.signer_name := btrim(new.signer_name);
    new.signed_at := statement_timestamp();
    new.signature_hash := encode(sha256(convert_to(jsonb_build_object(
      'consent_id', new.id, 'clinic_id', new.clinic_id, 'patient_id', new.issued_patient_id,
      'document_hash', new.document_hash, 'signer_name', new.signer_name,
      'accepted_terms', new.accepted_terms, 'signed_at', new.signed_at,
      'ip_address', new.ip_address, 'user_agent', new.user_agent
    )::text, 'UTF8')), 'hex');
  elsif row(new.signed_at, new.signer_name, new.accepted_terms, new.signature_hash, new.ip_address, new.user_agent)
    is distinct from row(old.signed_at, old.signer_name, old.accepted_terms, old.signature_hash, old.ip_address, old.user_agent) then
    raise exception 'Only the signing service can record a signature' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.reva_protect_consent_evidence() from public, anon, authenticated;
create trigger reva_consent_requests_protect_evidence
before insert or update on public.reva_consent_requests
for each row execute function public.reva_protect_consent_evidence();

commit;
