/**
 * /api/appointments/[id]
 * PATCH — update status, notes, etc.
 * DELETE — cancel appointment
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWhatsAppCredentials } from "@/lib/whatsapp-credentials";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { status, notes, appointment_date, appointment_time } = body;

  const { data: clinic } = await supabase
    .from("reva_clinics")
    .select("id, name")
    .eq("owner_id", user.id)
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify patient on status changes
  const patient = appt.patient as { name: string; phone: string } | null;
  if (patient?.phone && status) {
    let msg = "";
    if (status === "Confirmed") msg = `✅ Hi ${patient.name}, your appointment at ${clinic.name} has been confirmed. See you soon!`;
    if (status === "Cancelled") msg = `❌ Hi ${patient.name}, your appointment at ${clinic.name} has been cancelled. Please contact us to reschedule.`;
    if (status === "No-Show") msg = `Hi ${patient.name}, we noticed you couldn't make it today. Would you like to reschedule? Reply to this message and we'll help you book a new slot. 😊`;
    if (msg) {
      const wa = await getWhatsAppCredentials(createAdminClient(), clinic.id);
      await sendWhatsAppMessage(patient.phone, msg, wa.phoneId, wa.token).catch(() => {});
    }
  }

  return NextResponse.json({ appointment: appt });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: clinic } = await supabase
    .from("reva_clinics")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const { error } = await supabase
    .from("reva_appointments")
    .update({ status: "Cancelled" })
    .eq("id", id)
    .eq("clinic_id", clinic.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
