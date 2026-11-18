begin;

-- Existing owner assignments need an authorized review; do not rewrite memberships.
drop policy reva_clinic_members_admin_insert on public.reva_clinic_members;
drop policy reva_clinic_members_admin_update on public.reva_clinic_members;
drop policy reva_clinic_members_admin_delete on public.reva_clinic_members;

create policy reva_clinic_members_admin_insert on public.reva_clinic_members
for insert to authenticated
with check (
  public.reva_has_clinic_role(clinic_id, array['owner'::public.reva_member_role])
  or (role <> 'owner' and public.reva_has_clinic_role(clinic_id, array['admin'::public.reva_member_role]))
);

create policy reva_clinic_members_admin_update on public.reva_clinic_members
for update to authenticated
using (
  public.reva_has_clinic_role(clinic_id, array['owner'::public.reva_member_role])
  or (role <> 'owner' and public.reva_has_clinic_role(clinic_id, array['admin'::public.reva_member_role]))
)
with check (
  public.reva_has_clinic_role(clinic_id, array['owner'::public.reva_member_role])
  or (role <> 'owner' and public.reva_has_clinic_role(clinic_id, array['admin'::public.reva_member_role]))
);

create policy reva_clinic_members_admin_delete on public.reva_clinic_members
for delete to authenticated
using (
  public.reva_has_clinic_role(clinic_id, array['owner'::public.reva_member_role])
  or (role <> 'owner' and public.reva_has_clinic_role(clinic_id, array['admin'::public.reva_member_role]))
);

commit;
