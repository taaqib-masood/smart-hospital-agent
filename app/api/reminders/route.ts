/**
 * GET  /api/reminders  — called by Vercel Cron every 30 minutes
 * POST /api/reminders  — manual trigger (secured with x-cron-secret header)
 */

import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWhatsAppCredentials } from "@/lib/whatsapp-credentials";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

function safeEqual(received: string | null, expected: string) {
  const a = Buffer.from(received ?? "");
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Fail closed: an unset or empty CRON_SECRET rejects every caller.
function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && (
    safeEqual(req.headers.get("authorization"), `Bearer ${secret}`) ||
    safeEqual(req.headers.get("x-cron-secret"), secret!)
  );
}

async function runReminders() {
  const supabase = createAdminClient();

  // Find all clinics
  const { data: clinics } = await supabase.from("reva_clinics").select("*");
  if (!clinics?.length) return NextResponse.json({ sent: 0 });

  let totalSent = 0;

  for (const clinic of clinics) {
    const wa = await getWhatsAppCredentials(clinic.id, supabase);
    const hoursAhead = clinic.reminder_hours_before ?? 2;
    const targetTime = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
    const targetDate = targetTime.toISOString().split("T")[0];
    const targetHour = targetTime.getUTCHours();
    const targetMin = targetTime.getUTCMinutes();

    // Find appointments within ±30 minutes of target
    const { data: appointments } = await supabase
      .from("reva_appointments")
      .select(`*, patient:reva_patients(name, phone)`)
      .eq("clinic_id", clinic.id)
      .eq("appointment_date", targetDate)
      .in("status", ["Confirmed", "Pending"])
      .is("reminder_sent_at", null);

    for (const appt of appointments ?? []) {
      const patient = appt.patient as { name: string; phone: string } | null;
      if (!patient?.phone) continue;

      const [apptH, apptM] = appt.appointment_time.split(":").map(Number);
      const diffMinutes = Math.abs((apptH * 60 + apptM) - (targetHour * 60 + targetMin));
      if (diffMinutes > 30) continue;

      const dateStr = new Date(appt.appointment_date).toLocaleDateString("en-AE", { weekday: "short", day: "numeric", month: "short" });
      const h12 = apptH % 12 || 12;
      const period = apptH >= 12 ? "PM" : "AM";
      const timeStr = `${h12}:${String(apptM).padStart(2, "0")} ${period}`;

      const reminderSent = await sendWhatsAppMessage(
        patient.phone,
        `⏰ *Appointment Reminder*\n\nHi ${patient.name}! You have an appointment at ${clinic.name} in ${hoursAhead} hour(s).\n📅 ${dateStr} at ${timeStr}\n\nSee you soon! 😊\n\nReply *CANCEL* if you need to cancel.`,
        wa.phoneId,
        wa.token
      ).then(() => true, () => false);
      if (!reminderSent) continue;

      // Mark reminder sent
      await supabase.from("reva_appointments")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", appt.id);

      totalSent++;
    }

    // Also process pending follow-ups for this clinic
    const { data: followUps } = await supabase
      .from("reva_follow_ups")
      .select(`*, patient:reva_patients(name, phone)`)
      .eq("clinic_id", clinic.id)
      .eq("status", "Pending")
      .lte("scheduled_at", new Date().toISOString());

    for (const fu of followUps ?? []) {
      const patient = fu.patient as { name: string; phone: string } | null;
      if (!patient?.phone) continue;

      const message = fu.template_message
        .replace("{name}", patient.name)
        .replace("{clinic}", clinic.name);

      const followUpSent = await sendWhatsAppMessage(patient.phone, message, wa.phoneId, wa.token)
        .then(() => true, () => false);
      if (!followUpSent) continue;

      await supabase.from("reva_follow_ups")
        .update({ status: "Sent", sent_at: new Date().toISOString() })
        .eq("id", fu.id);

      totalSent++;
    }
  }

  return NextResponse.json({ sent: totalSent });
}

// Vercel Cron calls GET
export async function GET(req: NextRequest) {
  // Vercel sets Authorization: Bearer <CRON_SECRET> on cron requests
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runReminders();
}

// Manual trigger via POST
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runReminders();
}
