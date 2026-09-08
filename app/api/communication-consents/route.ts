import { NextRequest, NextResponse } from "next/server";
import { getClinicAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const phone = new URL(req.url).searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "phone is required" }, { status: 400 });
  const { data, error } = await supabase.from("reva_communication_consents")
    .select("id,patient_id,phone,status,source,wording,language,recorded_at,recorded_by")
    .eq("clinic_id", access.clinicId)
    .eq("phone", phone)
    .eq("channel", "whatsapp")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ consent: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const status = body?.status;
  const wording = typeof body?.wording === "string" ? body.wording.trim() : "";
  if (typeof body?.patient_id !== "string" || !["opted_in", "opted_out"].includes(status) || wording.length < 5) {
    return NextResponse.json({ error: "patient_id, status and consent evidence wording are required" }, { status: 400 });
  }
  const { data: patient } = await supabase.from("reva_patients").select("id,phone").eq("id", body.patient_id).eq("clinic_id", access.clinicId).single();
  if (!patient) return NextResponse.json({ error: "Patient contact not found" }, { status: 404 });
  const { data, error } = await supabase.from("reva_communication_consents").upsert({
    clinic_id: access.clinicId,
    patient_id: patient.id,
    phone: patient.phone,
    channel: "whatsapp",
    status,
    source: typeof body.source === "string" && body.source.trim() ? body.source.trim() : "receptionist_record",
    wording,
    language: body.language === "ar" ? "ar" : "en",
    recorded_at: new Date().toISOString(),
    recorded_by: access.userId,
  }, { onConflict: "clinic_id,phone,channel" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("reva_audit_events").insert({ clinic_id: access.clinicId, actor_user_id: access.userId, action: `whatsapp.${status}`, entity_type: "communication_consent", entity_id: data.id, metadata: { source: data.source } });
  return NextResponse.json({ consent: data });
}
