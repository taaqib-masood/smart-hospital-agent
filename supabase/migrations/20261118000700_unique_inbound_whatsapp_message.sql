-- Existing duplicates require operator review before this migration.
create unique index if not exists reva_inbound_whatsapp_message_key
on public.reva_messages (clinic_id, wa_message_id)
where direction = 'inbound' and wa_message_id is not null;
