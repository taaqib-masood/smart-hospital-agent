import { NextRequest, NextResponse } from "next/server";
import { getClinicAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const allowed = ["name", "phone", "notes"] as const;
  const updates = Object.fromEntries(allowed.filter(key => body?.[key] !== undefined).map(key => [key, typeof body[key] === "string" ? body[key].trim() : body[key]]));
  if (!Object.keys(updates).length) return NextResponse.json({ error: "No supported fields supplied" }, { status: 400 });
  const { data, error } = await supabase.from("reva_patients")
    .update(updates)
    .eq("id", id)
    .eq("clinic_id", access.clinicId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("reva_audit_events").insert({ clinic_id: access.clinicId, actor_user_id: access.userId, action: "contact.updated", entity_type: "patient", entity_id: id, metadata: { fields: Object.keys(updates) } });
  return NextResponse.json({ patient: data });
}
