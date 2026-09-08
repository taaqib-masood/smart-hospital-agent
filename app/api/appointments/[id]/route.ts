/**
 * /api/appointments/[id]
 * PATCH — update status, notes, etc.
 * DELETE — cancel appointment
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClinicAccess } from "@/lib/auth";
import { enqueueMessage } from "@/lib/message-jobs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { status, notes, appointment_date, appointment_time, send_reminder } = body;
  if (status && !["Pending", "Confirmed", "Cancelled", "Completed", "No-Show"].includes(status)) {
    return NextResponse.json({ error: "Invalid appointment status" }, { status: 400 });
  }

  const { data: clinic } = await supabase
    .from("reva_clinics")
    .select("id, name")
    .eq("id", access.clinicId)
    .single();

  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (notes !== undefined) updates.notes = notes;
  if (appointment_date) updates.appointment_date = appointment_date;
  if (appointment_time) updates.appointment_time = appointment_time;

  const { data: appt, error } = await supabase
    .from("reva_appointments")
    .update(updates)
    .eq("id", id)
    .eq("clinic_id", clinic.id)
    .select(`*, patient:reva_patients(id,name,phone)`)
    .single();

  if (error) return NextResponse.json({ error: error.code === "23505" ? "That appointment slot is already booked" : error.message }, { status: error.code === "23505" ? 409 : 500 });

  let notification: "not_applicable" | "queued" | "template_missing" = "not_applicable";
  const patient = appt.patient as { name: string; phone: string } | null;
  const purpose = send_reminder === true ? "appointment_reminder"
    : status === "Confirmed" ? "appointment_confirmed"
    : status === "Cancelled" ? "appointment_cancelled"
      : status === "No-Show" ? "appointment_no_show"
        : null;
  if (patient?.phone && purpose) {
    const { data: template } = await supabase.from("reva_whatsapp_templates")
      .select("template_name,language_code")
      .eq("clinic_id", clinic.id)
      .eq("purpose", purpose)
      .eq("status", "approved")
      .limit(1)
      .maybeSingle();
    notification = template ? "queued" : "template_missing";
    if (template) {
      const { error: jobError } = await enqueueMessage(supabase, {
        clinicId: clinic.id,
        patientId: appt.patient_id,
        recipientPhone: patient.phone,
        kind: send_reminder === true ? "appointment_reminder" : status === "No-Show" ? "follow_up" : "appointment_confirmation",
        idempotencyKey: send_reminder === true
          ? `appointment-manual-reminder:${appt.id}:${Date.now()}`
          : `appointment-status:${appt.id}:${status}:${appt.updated_at}`,
        payload: {
          template_name: template.template_name,
          language_code: template.language_code,
          appointment_id: send_reminder === true ? appt.id : undefined,
          requires_consent: true,
          components: [{ type: "body", parameters: [patient.name, clinic.name, String(appt.appointment_date), String(appt.appointment_time)].map(text => ({ type: "text", text })) }],
        },
      });
      if (jobError) notification = "template_missing";
    }
  }

  await supabase.from("reva_audit_events").insert({
    clinic_id: clinic.id,
    actor_user_id: access.userId,
    action: "appointment.updated",
    entity_type: "appointment",
    entity_id: appt.id,
    metadata: { fields: Object.keys(updates), notification },
  });

  return NextResponse.json({ appointment: appt, notification });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: clinic } = await supabase
    .from("reva_clinics")
    .select("id")
    .eq("id", access.clinicId)
    .single();
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const { error } = await supabase
    .from("reva_appointments")
    .update({ status: "Cancelled" })
    .eq("id", id)
    .eq("clinic_id", clinic.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("reva_audit_events").insert({
    clinic_id: clinic.id,
    actor_user_id: access.userId,
    action: "appointment.cancelled",
    entity_type: "appointment",
    entity_id: id,
  });
  return NextResponse.json({ success: true });
}
