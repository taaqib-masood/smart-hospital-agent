import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClinicAccess } from "@/lib/auth";

const CLINIC_FIELDS = "id,owner_id,name,phone,whatsapp_number,whatsapp_phone_id,address,specialty,registration_no,greeting_message,reminder_hours_before,working_hours,timezone,currency,created_at,updated_at";

export async function GET() {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("reva_clinics").select(CLINIC_FIELDS).eq("id", access.clinicId).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clinic: data });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (access.role === "receptionist") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const allowed = ["name", "phone", "whatsapp_number", "address", "specialty", "registration_no", "greeting_message", "reminder_hours_before", "working_hours", "timezone", "currency"] as const;
  const updates = Object.fromEntries(allowed.filter(key => body[key] !== undefined).map(key => [key, body[key]]));
  const { data, error } = await supabase
    .from("reva_clinics")
    .update(updates)
    .eq("id", access.clinicId)
    .select(CLINIC_FIELDS)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("reva_audit_events").insert({
    clinic_id: access.clinicId,
    actor_user_id: access.userId,
    action: "clinic.updated",
    entity_type: "clinic",
    entity_id: access.clinicId,
    metadata: { fields: Object.keys(updates) },
  });
  return NextResponse.json({ clinic: data });
}
