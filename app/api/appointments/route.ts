/**
 * /api/appointments
 * GET  — list for clinic (date filter optional: ?date=2026-04-24)
 * POST — create new appointment
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

async function getClinic(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("reva_clinics")
    .select("*")
    .eq("owner_id", userId)
    .single();
  return data;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clinic = await getClinic(supabase, user.id);
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  let query = supabase
    .from("reva_appointments")
    .select(`*, patient:reva_patients(id,name,phone,allergies,conditions), doctor:reva_doctors(id,name,specialization)`)
    .eq("clinic_id", clinic.id)
    .order("appointment_time");

  if (date) query = query.eq("appointment_date", date);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ appointments: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clinic = await getClinic(supabase, user.id);
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const body = await req.json();
  const { patient_id, doctor_id, appointment_date, appointment_time, type, notes } = body;

  if (!appointment_date || !appointment_time) {
    return NextResponse.json({ error: "date and time required" }, { status: 400 });
  }

  const { data: appt, error } = await supabase
    .from("reva_appointments")
    .insert({ clinic_id: clinic.id, patient_id, doctor_id, appointment_date, appointment_time, type: type ?? "General Checkup", notes })
    .select(`*, patient:reva_patients(id,name,phone)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send WhatsApp confirmation if patient has a phone
  const patient = appt.patient as { name: string; phone: string } | null;
  if (patient?.phone) {
    const dateStr = new Date(appointment_date).toLocaleDateString("en-AE", { weekday: "short", day: "numeric", month: "short" });
    const [h, m] = appointment_time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const timeStr = `${h12}:${String(m).padStart(2, "0")} ${period}`;

    await sendWhatsAppMessage(
      patient.phone,
      `✅ *Appointment Confirmed!*\n\nHi ${patient.name}! Your appointment at ${clinic.name} is confirmed.\n📅 ${dateStr} at ${timeStr}\n\nWe'll send you a reminder before your appointment. See you! 😊`,
      clinic.whatsapp_phone_id,
      clinic.whatsapp_token
    ).catch(() => {});
  }

  return NextResponse.json({ appointment: appt }, { status: 201 });
}
