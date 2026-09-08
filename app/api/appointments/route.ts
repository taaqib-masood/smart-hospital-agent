/**
 * /api/appointments
 * GET  — list for clinic (date filter optional: ?date=2026-04-24)
 * POST — create new appointment
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClinicAccess } from "@/lib/auth";
import { enqueueMessage } from "@/lib/message-jobs";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");

  let query = supabase
    .from("reva_appointments")
    .select(`*, patient:reva_patients(id,name,phone,allergies,conditions), doctor:reva_doctors(id,name,specialization)`)
    .eq("clinic_id", access.clinicId)
    .order("appointment_date")
    .order("appointment_time");

  if (date) query = query.eq("appointment_date", date);
  if (from) query = query.gte("appointment_date", from);
  if (to) query = query.lte("appointment_date", to);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ appointments: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: clinic } = await supabase
    .from("reva_clinics")
    .select("id,name")
    .eq("id", access.clinicId)
    .single();
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const body = await req.json();
  const { patient_id, doctor_id, appointment_date, appointment_time, type, notes } = body;

  if (!appointment_date || !appointment_time) {
    return NextResponse.json({ error: "date and time required" }, { status: 400 });
  }

  if (patient_id) {
    const { data: patient } = await supabase.from("reva_patients").select("id").eq("id", patient_id).eq("clinic_id", clinic.id).maybeSingle();
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }
  if (doctor_id) {
    const { data: doctor } = await supabase.from("reva_doctors").select("id").eq("id", doctor_id).eq("clinic_id", clinic.id).eq("active", true).maybeSingle();
    if (!doctor) return NextResponse.json({ error: "Practitioner not found" }, { status: 404 });
  }

  const { data: appt, error } = await supabase
    .from("reva_appointments")
    .insert({ clinic_id: clinic.id, patient_id, doctor_id, appointment_date, appointment_time, type: type ?? "General Checkup", notes })
    .select(`*, patient:reva_patients(id,name,phone)`)
    .single();

  if (error) return NextResponse.json({ error: error.code === "23505" ? "That appointment slot is already booked" : error.message }, { status: error.code === "23505" ? 409 : 500 });

  let notification: "not_applicable" | "queued" | "template_missing" = "not_applicable";
  const patient = appt.patient as { name: string; phone: string } | null;
  if (patient?.phone) {
    const { data: template } = await supabase.from("reva_whatsapp_templates")
      .select("template_name,language_code")
      .eq("clinic_id", clinic.id)
      .eq("purpose", "appointment_confirmation")
      .eq("status", "approved")
      .limit(1)
      .maybeSingle();
    notification = template ? "queued" : "template_missing";
    if (template) {
      const { error: jobError } = await enqueueMessage(supabase, {
        clinicId: clinic.id,
        patientId: patient_id ?? null,
        recipientPhone: patient.phone,
        kind: "appointment_confirmation",
        idempotencyKey: `appointment-confirmation:${appt.id}`,
        payload: {
          template_name: template.template_name,
          language_code: template.language_code,
          requires_consent: true,
          components: [{
            type: "body",
            parameters: [patient.name, clinic.name, String(appointment_date), String(appointment_time)]
              .map(text => ({ type: "text", text })),
          }],
        },
      });
      if (jobError) notification = "template_missing";
    }
  }

  await supabase.from("reva_audit_events").insert({
    clinic_id: clinic.id,
    actor_user_id: access.userId,
    action: "appointment.created",
    entity_type: "appointment",
    entity_id: appt.id,
  });

  return NextResponse.json({ appointment: appt, notification }, { status: 201 });
}
