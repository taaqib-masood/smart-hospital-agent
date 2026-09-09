import { NextRequest, NextResponse } from "next/server";
import { getClinicAccess } from "@/lib/auth";
import { generateSlotsFromWindows, getAvailableSlots } from "@/lib/availability";
import { createClient } from "@/lib/supabase/server";

function validTime(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const doctorId = searchParams.get("doctor_id");
  const { data: doctors, error: doctorsError } = await supabase.from("reva_doctors")
    .select("id,name,specialization,slot_duration_minutes")
    .eq("clinic_id", access.clinicId)
    .order("name");
  if (doctorsError) return NextResponse.json({ error: doctorsError.message }, { status: 500 });

  const [{ data: rules, error: rulesError }, { data: exceptions, error: exceptionsError }] = await Promise.all([
    supabase.from("reva_availability_rules").select("*").eq("clinic_id", access.clinicId).order("weekday").order("start_time"),
    supabase.from("reva_availability_exceptions").select("*").eq("clinic_id", access.clinicId).order("exception_date"),
  ]);
  const configError = rulesError ?? exceptionsError;
  if (configError) return NextResponse.json({ error: configError.message }, { status: 500 });

  if (!date || !doctorId) return NextResponse.json({ doctors, rules, exceptions, slots: [] });
  const doctor = doctors?.find(item => item.id === doctorId);
  if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const matchingRules = (rules ?? []).filter(rule => rule.weekday === weekday && rule.active && (!rule.doctor_id || rule.doctor_id === doctorId));
  const matchingExceptions = (exceptions ?? []).filter(item => item.exception_date === date && (!item.doctor_id || item.doctor_id === doctorId));
  const duration = matchingRules[0]?.slot_minutes ?? doctor.slot_duration_minutes ?? 30;
  const allTimes = [...new Set(generateSlotsFromWindows(matchingRules.map(rule => ({ start: rule.start_time, end: rule.end_time })), duration))].sort();
  const freeTimes = new Set(await getAvailableSlots(supabase, access.clinicId, doctorId, date, duration));
  const { data: appointments, error: appointmentError } = await supabase.from("reva_appointments")
    .select("appointment_time,patient:reva_patients(name)")
    .eq("clinic_id", access.clinicId)
    .eq("doctor_id", doctorId)
    .eq("appointment_date", date)
    .in("status", ["Pending", "Confirmed"]);
  if (appointmentError) return NextResponse.json({ error: appointmentError.message }, { status: 500 });

  const booked = new Map((appointments ?? []).map(item => [String(item.appointment_time).slice(0, 5), (item.patient as unknown as { name: string } | null)?.name ?? "Booked"]));
  const fullDayBlock = matchingExceptions.some(item => !item.available && !item.start_time && !item.end_time);
  const slots = allTimes.map(time => {
    const minute = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
    const blockingException = matchingExceptions.find(item => {
      if (item.available || !item.start_time || !item.end_time) return false;
      const start = Number(item.start_time.slice(0, 2)) * 60 + Number(item.start_time.slice(3, 5));
      const end = Number(item.end_time.slice(0, 2)) * 60 + Number(item.end_time.slice(3, 5));
      return minute >= start && minute < end;
    });
    return {
      time,
      status: booked.has(time) ? "booked" : freeTimes.has(time) ? "available" : "blocked",
      patient: booked.get(time) ?? null,
      reason: fullDayBlock ? "Closed" : blockingException?.reason ?? null,
      exception_id: blockingException?.id ?? (fullDayBlock ? matchingExceptions.find(item => !item.available && !item.start_time)?.id : null),
    };
  });
  return NextResponse.json({ doctors, rules, exceptions, slots });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (body?.doctor_id) {
    const { data: doctor } = await supabase.from("reva_doctors").select("id").eq("id", body.doctor_id).eq("clinic_id", access.clinicId).maybeSingle();
    if (!doctor) return NextResponse.json({ error: "Practitioner not found" }, { status: 404 });
  }
  if (body?.kind === "rule") {
    if (!Number.isInteger(body.weekday) || body.weekday < 0 || body.weekday > 6 || !validTime(body.start_time) || !validTime(body.end_time)) {
      return NextResponse.json({ error: "Valid weekday, start_time and end_time are required" }, { status: 400 });
    }
    const { data, error } = await supabase.from("reva_availability_rules").insert({
      clinic_id: access.clinicId,
      doctor_id: body.doctor_id ?? null,
      weekday: body.weekday,
      start_time: body.start_time,
      end_time: body.end_time,
      slot_minutes: Number(body.slot_minutes) || 30,
      active: body.active !== false,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await supabase.from("reva_audit_events").insert({ clinic_id: access.clinicId, actor_user_id: access.userId, action: "availability.rule_created", entity_type: "availability_rule", entity_id: data.id });
    return NextResponse.json({ rule: data }, { status: 201 });
  }

  if (body?.kind !== "exception" || typeof body.exception_date !== "string") {
    return NextResponse.json({ error: "A valid availability exception is required" }, { status: 400 });
  }
  if ((body.start_time && !validTime(body.start_time)) || (body.end_time && !validTime(body.end_time))) {
    return NextResponse.json({ error: "Invalid exception time" }, { status: 400 });
  }
  const { data, error } = await supabase.from("reva_availability_exceptions").insert({
    clinic_id: access.clinicId,
    doctor_id: body.doctor_id ?? null,
    exception_date: body.exception_date,
    start_time: body.start_time ?? null,
    end_time: body.end_time ?? null,
    available: body.available === true,
    reason: typeof body.reason === "string" ? body.reason : null,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("reva_audit_events").insert({ clinic_id: access.clinicId, actor_user_id: access.userId, action: "availability.exception_created", entity_type: "availability_exception", entity_id: data.id });
  return NextResponse.json({ exception: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  const kind = new URL(req.url).searchParams.get("kind");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const { error } = kind === "rule"
    ? await supabase.from("reva_availability_rules").delete().eq("id", id).eq("clinic_id", access.clinicId)
    : await supabase.from("reva_availability_exceptions").delete().eq("id", id).eq("clinic_id", access.clinicId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("reva_audit_events").insert({ clinic_id: access.clinicId, actor_user_id: access.userId, action: `availability.${kind === "rule" ? "rule" : "exception"}_deleted`, entity_type: kind === "rule" ? "availability_rule" : "availability_exception", entity_id: id });
  return NextResponse.json({ ok: true });
}
