begin;

drop policy reva_audit_events_member_insert on public.reva_audit_events;
create policy reva_audit_events_member_insert on public.reva_audit_events
for insert to authenticated
with check (
  public.reva_is_clinic_member(clinic_id)
  and actor_user_id = auth.uid()
);

commit;
