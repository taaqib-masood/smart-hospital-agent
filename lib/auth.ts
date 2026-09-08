import type { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export type ClinicAccess = {
  userId: string;
  clinicId: string;
  role: "owner" | "admin" | "receptionist";
};

export async function getClinicAccess(supabase: ServerClient): Promise<ClinicAccess | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("reva_clinic_members")
    .select("clinic_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership) {
    return {
      userId: user.id,
      clinicId: membership.clinic_id,
      role: membership.role as ClinicAccess["role"],
    };
  }

  // Legacy fallback until the baseline migration backfills owner memberships.
  const { data: clinic } = await supabase
    .from("reva_clinics")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  return clinic ? { userId: user.id, clinicId: clinic.id, role: "owner" } : null;
}
