import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && (
    req.headers.get("authorization") === `Bearer ${secret}` ||
    req.headers.get("x-cron-secret") === secret
  );
}

function localParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")), minute: Number(get("minute")) };
}

async function scheduleReminders() {
  const supabase = createAdminClient();
  const { data: clinics, error: clinicsError } = await supabase
    .from("reva_clinics")
    .select("id,name,timezone,reminder_hours_before");
  if (clinicsError) throw clinicsError;

  let queued = 0;
  let skipped = 0;

  for (const clinic of clinics ?? []) {
    const hoursAhead = clinic.reminder_hours_before ?? 24;
    const target = localParts(new Date(Date.now() + hoursAhead * 60 * 60 * 1000), clinic.timezone ?? "Asia/Dubai");
    const { data: template } = await supabase.from("reva_whatsapp_templates")
      .select("template_name,language_code")
      .eq("clinic_id", clinic.id)
      .eq("purpose", "appointment_reminder")
      .eq("status", "approved")
      .limit(1)
      .maybeSingle();

    const { data: appointments } = await supabase.from("reva_appointments")
      .select("id,appointment_date,appointment_time,patient_id,patient:reva_patients(name,phone)")
      .eq("clinic_id", clinic.id)
      .eq("appointment_date", target.date)
      .in("status", ["Confirmed", "Pending"])
      .is("reminder_sent_at", null);

    for (const appointment of appointments ?? []) {
      const patient = appointment.patient as unknown as { name: string; phone: string } | null;
      if (!patient?.phone || !template) { skipped++; continue; }
      const [hour, minute] = String(appointment.appointment_time).split(":").map(Number);
      if (Math.abs(hour * 60 + minute - (target.hour * 60 + target.minute)) > 30) continue;

      const { error } = await supabase.from("reva_message_jobs").insert({
        clinic_id: clinic.id,
        patient_id: appointment.patient_id,
        kind: "appointment_reminder",
        recipient_phone: patient.phone,
        idempotency_key: `appointment-reminder:${appointment.id}:${hoursAhead}`,
        payload: {
          template_name: template.template_name,
          language_code: template.language_code,
          appointment_id: appointment.id,
          requires_consent: true,
          components: [{
            type: "body",
            parameters: [patient.name, clinic.name, String(appointment.appointment_date), String(appointment.appointment_time)]
              .map(text => ({ type: "text", text })),
          }],
        },
      });
      if (!error) queued++;
      else if (error.code === "23505") skipped++;
      else throw error;
    }
  }

  const followUps = await scheduleFollowUps(supabase);
  return { appointment_reminders: { queued, skipped }, follow_ups: followUps };
}

async function scheduleFollowUps(supabase: AdminClient) {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: rules, error: rulesError } = await supabase.from("reva_automation_rules")
    .select("id,clinic_id,name,trigger_type,delay_minutes,template:reva_whatsapp_templates(template_name,language_code,status)")
    .eq("enabled", true);
  if (rulesError) throw rulesError;

  let materialized = 0;
  let queued = 0;
  let skipped = 0;
  for (const rule of rules ?? []) {
    const status = rule.trigger_type === "after_no_show" ? "No-Show" : "Completed";
    const template = rule.template as unknown as { template_name: string; language_code: string; status: string } | null;
    if (!template || template.status !== "approved") { skipped++; continue; }
    const { data: appointments, error: appointmentError } = await supabase.from("reva_appointments")
      .select("id,patient_id,updated_at")
      .eq("clinic_id", rule.clinic_id)
      .eq("status", status)
      .gte("updated_at", cutoff)
      .not("patient_id", "is", null);
    if (appointmentError) throw appointmentError;

    for (const appointment of appointments ?? []) {
      const scheduledAt = new Date(new Date(appointment.updated_at).getTime() + rule.delay_minutes * 60 * 1000).toISOString();
      const { error } = await supabase.from("reva_follow_ups").upsert({
        clinic_id: rule.clinic_id,
        patient_id: appointment.patient_id,
        appointment_id: appointment.id,
        rule_id: rule.id,
        rule_type: rule.trigger_type,
        template_message: template.template_name,
        scheduled_at: scheduledAt,
      }, { onConflict: "appointment_id,rule_id", ignoreDuplicates: true });
      if (!error) materialized++;
      else if (error.code !== "23505") throw error;
    }
  }

  const { data: due, error: dueError } = await supabase.from("reva_follow_ups")
    .select("id,clinic_id,patient_id,scheduled_at,patient:reva_patients(name,phone),rule:reva_automation_rules(template:reva_whatsapp_templates(template_name,language_code,status))")
    .eq("status", "Pending")
    .lte("scheduled_at", new Date().toISOString())
    .limit(200);
  if (dueError) throw dueError;

  for (const followUp of due ?? []) {
    const patient = followUp.patient as unknown as { name: string; phone: string } | null;
    const rule = followUp.rule as unknown as { template: { template_name: string; language_code: string; status: string } | null } | null;
    const template = rule?.template;
    if (!patient?.phone || !template || template.status !== "approved") { skipped++; continue; }
    const { error } = await supabase.from("reva_message_jobs").insert({
      clinic_id: followUp.clinic_id,
      patient_id: followUp.patient_id,
      kind: "follow_up",
      recipient_phone: patient.phone,
      idempotency_key: `follow-up:${followUp.id}`,
      payload: {
        template_name: template.template_name,
        language_code: template.language_code,
        follow_up_id: followUp.id,
        requires_consent: true,
        components: [{ type: "body", parameters: [{ type: "text", text: patient.name }] }],
      },
    });
    if (!error) queued++;
    else if (error.code === "23505") skipped++;
    else throw error;
  }
  return { materialized, queued, skipped };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await scheduleReminders());
  } catch (error) {
    console.error("Reminder scheduler failed", error);
    return NextResponse.json({ error: "Reminder scheduler failed" }, { status: 500 });
  }
}

export const POST = GET;
