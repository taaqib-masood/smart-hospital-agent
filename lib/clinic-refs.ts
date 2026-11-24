import type { SupabaseClient } from "@supabase/supabase-js";

/** True when every provided id is a row of `table` in the caller's clinic; absent ids are skipped. */
export async function ownsClinicRefs(supabase: SupabaseClient, clinicId: string, refs: [table: string, id: unknown][]) {
  for (const [table, id] of refs) {
    if (id === undefined || id === null) continue;
    if (typeof id !== "string") return false;
    const { data } = await supabase.from(table).select("id").eq("id", id).eq("clinic_id", clinicId).maybeSingle();
    if (!data) return false;
  }
  return true;
}
