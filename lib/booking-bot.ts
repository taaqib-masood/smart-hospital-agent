/**
 * Reva Booking Bot — conversation state machine
 *
 * States:
 *   idle          → user sends any message → greeting
 *   greeting      → user replies → collect_name (if name unknown) | show_doctors
 *   collect_name  → user sends name → show_doctors
 *   show_doctors  → user picks doctor → show_slots
 *   show_slots    → user picks slot → confirm_slot
 *   confirm_slot  → user confirms → booked
 *   booked        → terminal (resets to idle after 5 min)
 *
 * Reschedule / cancel flows:
 *   If user says "reschedule" or "cancel" from any state → handle inline
 */

import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import type { RevaClinic } from "@/lib/supabase/types";
import { formatDate, formatTime } from "@/lib/utils";
import { getAvailableSlots } from "@/lib/availability";

type BotState =
  | "idle"
  | "greeting"
  | "collect_name"
  | "show_doctors"
  | "show_slots"
  | "confirm_slot"
  | "booked";

interface BotContext extends Record<string, unknown> {
  patient_name?: string;
  patient_id?: string;
  selected_doctor_id?: string;
  selected_doctor_name?: string;
  selected_date?: string;
  selected_time?: string;
  reschedule_appointment_id?: string;
  appointment_type?: string;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function nextDays(n: number): string[] {
  const days: string[] = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

const KEYWORDS = {
  reschedule: ["reschedule", "change", "rebook", "different time"],
  cancel: ["cancel", "won't come", "wont come", "not coming", "drop"],
  greeting: ["hi", "hello", "hey", "book", "appointment", "appoint", "booking"],
  yes: ["yes", "ok", "okay", "confirm", "confirmed", "sure", "1"],
  no: ["no", "nope", "don't", "dont", "cancel"],
};

function matchesKeyword(text: string, group: string[]): boolean {
  const lower = text.toLowerCase();
  return group.some(k => lower.includes(k));
}

export async function handleBotMessage(
  clinic: RevaClinic,
  contactPhone: string,
  incomingText: string,
  waMessageId: string
) {
  const supabase = createAdminClient();

  // Load or init state
  const { data: stateRow } = await supabase
    .from("reva_booking_state")
    .select("*")
    .eq("clinic_id", clinic.id)
    .eq("contact_phone", contactPhone)
    .single();

  let state: BotState = (stateRow?.state as BotState) ?? "idle";
  let context: BotContext = (stateRow?.context as BotContext) ?? {};

  // Expired state → reset
  if (stateRow && new Date(stateRow.expires_at) < new Date()) {
    state = "idle";
    context = {};
  }

  const text = incomingText.trim();

  // --- Global keyword overrides ---
  if (matchesKeyword(text, KEYWORDS.cancel)) {
    const cancelled = await findUpcomingAppointment(supabase, clinic.id, contactPhone);
    if (cancelled) {
      const { error } = await supabase.from("reva_appointments").update({ status: "Cancelled" }).eq("id", cancelled.id).eq("clinic_id", clinic.id);
      if (!error) await recordBotAudit(supabase, clinic.id, "appointment.cancelled_via_whatsapp", cancelled.id, contactPhone);
    }
    await saveState(supabase, clinic.id, contactPhone, "idle", {});
    await reply(clinic, contactPhone, cancelled
      ? "Your upcoming appointment has been cancelled. Reply BOOK whenever you would like a new time."
      : "I could not find an upcoming appointment to cancel. A receptionist can help you.");
    return;
  }

  if (matchesKeyword(text, KEYWORDS.reschedule)) {
    const appointment = await findUpcomingAppointment(supabase, clinic.id, contactPhone);
    if (!appointment?.doctor_id) {
      await reply(clinic, contactPhone, "I could not find an upcoming appointment to reschedule. A receptionist can help you.");
      return;
    }
    state = "show_slots";
    const dates = nextDays(5);
    context = {
      ...context,
      patient_id: appointment.patient_id,
      selected_doctor_id: appointment.doctor_id,
      selected_doctor_name: appointment.doctor?.name,
      reschedule_appointment_id: appointment.id,
      appointment_type: appointment.type,
      selected_time: undefined,
      _dates: dates,
    };
    await saveState(supabase, clinic.id, contactPhone, state, context);
    await reply(clinic, contactPhone, dates.map((date, index) => `${index + 1}. ${formatDate(date)}`).join("\n") + "\n\nReply with a number to choose a new date.");
    return;
  }

  // --- State machine ---
  switch (state) {
    case "idle": {
      // Load patient by phone
      const { data: patient } = await supabase
        .from("reva_patients")
        .select("id, name")
        .eq("clinic_id", clinic.id)
        .eq("phone", contactPhone)
        .single();

      if (patient) {
        context.patient_name = patient.name;
        context.patient_id = patient.id;
      }

      const greeting = clinic.greeting_message
        .replace("{name}", context.patient_name ?? "there")
        .replace("{clinic}", clinic.name);

      await reply(clinic, contactPhone, greeting);

      if (context.patient_name) {
        // Known patient — skip name collection
        await goToShowDoctors(supabase, clinic, contactPhone, context);
      } else {
        await reply(clinic, contactPhone, "What's your name? 😊");
        await saveState(supabase, clinic.id, contactPhone, "collect_name", context);
      }
      break;
    }

    case "collect_name": {
      if (!text || text.length < 2) {
        await reply(clinic, contactPhone, "Sorry, I didn't catch that. What's your name?");
        break;
      }
      context.patient_name = text.split(" ").map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");

      // Upsert patient
      const { data: patient } = await supabase
        .from("reva_patients")
        .upsert({ clinic_id: clinic.id, name: context.patient_name, phone: contactPhone }, { onConflict: "clinic_id,phone" })
        .select("id")
        .single();

      if (patient) context.patient_id = patient.id;

      await reply(clinic, contactPhone, `Nice to meet you, ${context.patient_name}! 👋`);
      await goToShowDoctors(supabase, clinic, contactPhone, context);
      break;
    }

    case "show_doctors": {
      // Load doctors
      const { data: doctors } = await supabase
        .from("reva_doctors")
        .select("id, name, specialization")
        .eq("clinic_id", clinic.id);

      if (!doctors?.length) {
        await reply(clinic, contactPhone, "Sorry, no doctors are currently available. Please call the clinic directly.");
        await saveState(supabase, clinic.id, contactPhone, "idle", {});
        break;
      }

      // Match by number or name
      const num = parseInt(text);
      let picked: typeof doctors[0] | null = null;

      if (!isNaN(num) && num >= 1 && num <= doctors.length) {
        picked = doctors[num - 1];
      } else {
        picked = doctors.find(d => d.name.toLowerCase().includes(text.toLowerCase())) ?? null;
      }

      if (!picked) {
        // Re-show list
        const list = doctors.map((d, i) => `${i + 1}. ${d.name}${d.specialization ? ` (${d.specialization})` : ""}`).join("\n");
        await reply(clinic, contactPhone, `Please choose a doctor by replying with the number:\n\n${list}`);
        break;
      }

      context.selected_doctor_id = picked.id;
      context.selected_doctor_name = picked.name;

      await reply(clinic, contactPhone, `Great! You've selected *${picked.name}*.\n\nWhich date works for you?`);

      const dates = nextDays(5);
      const dateList = dates.map((d, i) => `${i + 1}. ${formatDate(d)}`).join("\n");
      await reply(clinic, contactPhone, dateList + "\n\nReply with a number (1-5).");

      await saveState(supabase, clinic.id, contactPhone, "show_slots", { ...context, _dates: dates });
      break;
    }

    case "show_slots": {
      const ctx = context as BotContext & { _dates?: string[] };
      const dates = ctx._dates ?? nextDays(5);
      const num = parseInt(text);

      let pickedDate: string | null = null;

      if (!isNaN(num) && num >= 1 && num <= dates.length) {
        pickedDate = dates[num - 1];
      } else {
        // Try to find a slot time directly (e.g. "10:30 AM")
        const timeMatch = text.match(/\d{1,2}:\d{2}/);
        if (timeMatch && ctx.selected_date) {
          pickedDate = ctx.selected_date;
          context.selected_time = timeMatch[0];
          await confirmAndBook(supabase, clinic, contactPhone, context);
          break;
        }

        await reply(clinic, contactPhone, `Please reply with a number 1-${dates.length} to pick a date.`);
        break;
      }

      context.selected_date = pickedDate;

      // Get doctor slot duration
      const { data: doctor } = await supabase
        .from("reva_doctors")
        .select("slot_duration_minutes")
        .eq("id", context.selected_doctor_id!)
        .single();

      const duration = doctor?.slot_duration_minutes ?? 15;
      const freeSlots = await getAvailableSlots(supabase, clinic.id, context.selected_doctor_id!, pickedDate, duration);

      if (!freeSlots.length) {
        await reply(clinic, contactPhone, `Sorry, no slots available on ${formatDate(pickedDate)}. Please pick another date.`);
        const dateList = dates.map((d, i) => `${i + 1}. ${formatDate(d)}`).join("\n");
        await reply(clinic, contactPhone, dateList + "\n\nReply with a number (1-5).");
        break;
      }

      const slotList = freeSlots.map((s, i) => `${i + 1}. ${formatTime(s)}`).join("\n");
      await reply(clinic, contactPhone,
        `Available slots on *${formatDate(pickedDate)}*:\n\n${slotList}\n\nReply with a number to pick a slot.`);

      await saveState(supabase, clinic.id, contactPhone, "confirm_slot",
        { ...context, _dates: dates, _slots: freeSlots });
      break;
    }

    case "confirm_slot": {
      const ctx = context as BotContext & { _slots?: string[] };
      const slots = ctx._slots ?? [];
      const num = parseInt(text);

      if (isNaN(num) || num < 1 || num > slots.length) {
        await reply(clinic, contactPhone, `Please reply with a number 1-${slots.length}.`);
        break;
      }

      context.selected_time = slots[num - 1];
      const dateStr = formatDate(context.selected_date!);
      const timeStr = formatTime(context.selected_time!);

      await reply(clinic, contactPhone,
        `Almost done! ✅\n\n*${context.patient_name}*\nDoctor: ${context.selected_doctor_name}\nDate: ${dateStr}\nTime: ${timeStr}\n\nReply *YES* to confirm or *NO* to cancel.`);

      await saveState(supabase, clinic.id, contactPhone, "booked", context);
      break;
    }

    case "booked": {
      if (matchesKeyword(text, KEYWORDS.yes)) {
        // Create appointment
        const booking = {
              clinic_id: clinic.id,
              patient_id: context.patient_id,
              doctor_id: context.selected_doctor_id,
              appointment_date: context.selected_date,
              appointment_time: context.selected_time,
              type: context.appointment_type ?? "General Checkup",
              status: "Confirmed",
              confirmed_via: "whatsapp",
            };
        const query = context.reschedule_appointment_id
          ? supabase.from("reva_appointments").update(booking).eq("id", context.reschedule_appointment_id).eq("clinic_id", clinic.id)
          : supabase.from("reva_appointments").insert(booking);
        const { data: savedBooking, error: bookingError } = await query
          .select("id")
          .single();

        if (bookingError) {
          const conflict = bookingError.code === "23505";
          await reply(clinic, contactPhone, conflict
            ? "That slot was just taken. Please choose another available time."
            : "I could not complete that booking. A receptionist has been notified.");
          await saveState(supabase, clinic.id, contactPhone, conflict ? "show_slots" : "idle", context);
          break;
        }

        await recordBotAudit(
          supabase,
          clinic.id,
          context.reschedule_appointment_id ? "appointment.rescheduled_via_whatsapp" : "appointment.created_via_whatsapp",
          savedBooking.id,
          contactPhone,
        );

        const dateStr = formatDate(context.selected_date!);
        const timeStr = formatTime(context.selected_time!);

        await reply(clinic, contactPhone,
          `🎉 *Booked!* Your appointment is confirmed.\n\n📅 ${dateStr} at ${timeStr}\n👨‍⚕️ ${context.selected_doctor_name}\n🏥 ${clinic.name}\n\nYou'll get a reminder ${clinic.reminder_hours_before} hour(s) before. See you! 😊`);

        await saveState(supabase, clinic.id, contactPhone, "idle", {});
      } else if (matchesKeyword(text, KEYWORDS.no)) {
        await reply(clinic, contactPhone, "No problem! The booking was cancelled. You can start again anytime. 😊");
        await saveState(supabase, clinic.id, contactPhone, "idle", {});
      } else {
        await reply(clinic, contactPhone, "Please reply *YES* to confirm or *NO* to cancel.");
      }
      break;
    }
  }
}

// --- Helpers ---

async function findUpcomingAppointment(
  supabase: ReturnType<typeof createAdminClient>,
  clinicId: string,
  phone: string,
) {
  const { data: patient } = await supabase.from("reva_patients")
    .select("id")
    .eq("clinic_id", clinicId)
    .eq("phone", phone)
    .maybeSingle();
  if (!patient) return null;

  const { data } = await supabase.from("reva_appointments")
    .select("id,patient_id,doctor_id,type,appointment_date,appointment_time,doctor:reva_doctors(name)")
    .eq("clinic_id", clinicId)
    .eq("patient_id", patient.id)
    .in("status", ["Pending", "Confirmed"])
    .gte("appointment_date", today())
    .order("appointment_date")
    .order("appointment_time")
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  const doctor = data.doctor as unknown as { name: string } | null;
  return { ...data, doctor };
}

async function goToShowDoctors(
  supabase: ReturnType<typeof createAdminClient>,
  clinic: RevaClinic,
  contactPhone: string,
  context: BotContext
) {
  const { data: doctors } = await supabase
    .from("reva_doctors")
    .select("id, name, specialization")
    .eq("clinic_id", clinic.id);

  if (!doctors?.length) {
    await reply(clinic, contactPhone, "Sorry, no doctors are available right now. Please call the clinic.");
    return;
  }

  if (doctors.length === 1) {
    // Auto-select only doctor
    context.selected_doctor_id = doctors[0].id;
    context.selected_doctor_name = doctors[0].name;
    await reply(clinic, contactPhone, `Great! You'll be seeing *${doctors[0].name}*.\n\nWhich date works for you?`);
    const dates = nextDays(5);
    const dateList = dates.map((d, i) => `${i + 1}. ${formatDate(d)}`).join("\n");
    await reply(clinic, contactPhone, dateList + "\n\nReply with a number (1-5).");
    await saveState(supabase, clinic.id, contactPhone, "show_slots", { ...context, _dates: dates });
  } else {
    const list = doctors.map((d, i) => `${i + 1}. ${d.name}${d.specialization ? ` (${d.specialization})` : ""}`).join("\n");
    await reply(clinic, contactPhone, `Who would you like to see?\n\n${list}\n\nReply with a number.`);
    await saveState(supabase, clinic.id, contactPhone, "show_doctors", context);
  }
}

async function confirmAndBook(
  supabase: ReturnType<typeof createAdminClient>,
  clinic: RevaClinic,
  contactPhone: string,
  context: BotContext
) {
  const dateStr = formatDate(context.selected_date!);
  const timeStr = formatTime(context.selected_time!);
  await reply(clinic, contactPhone,
    `Almost done! ✅\n\n*${context.patient_name}*\nDoctor: ${context.selected_doctor_name}\nDate: ${dateStr}\nTime: ${timeStr}\n\nReply *YES* to confirm or *NO* to cancel.`);
  await saveState(supabase, clinic.id, contactPhone, "booked", context);
}

async function reply(clinic: RevaClinic, to: string, text: string) {
  const supabase = createAdminClient();
  const { data: conversation } = await supabase.from("reva_conversations")
    .select("id")
    .eq("clinic_id", clinic.id)
    .eq("contact_phone", to)
    .maybeSingle();

  const { data: message } = conversation
    ? await supabase.from("reva_messages").insert({
        conversation_id: conversation.id,
        clinic_id: clinic.id,
        direction: "outbound",
        content: text,
        status: "queued",
        sent_by: "automation",
      }).select("id").single()
    : { data: null };

  try {
    const result = await sendWhatsAppMessage(to, text, clinic.whatsapp_phone_id, clinic.whatsapp_token);
    if (message) {
      await supabase.from("reva_messages").update({
        status: "sent",
        wa_message_id: result.messages?.[0]?.id ?? null,
      }).eq("id", message.id);
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : "WhatsApp send failed";
    if (message && conversation) {
      await supabase.from("reva_messages").update({ status: "failed", error_message: reason }).eq("id", message.id);
      await supabase.from("reva_message_jobs").insert({
        clinic_id: clinic.id,
        conversation_id: conversation.id,
        recipient_phone: to,
        kind: "manual",
        idempotency_key: `bot-retry:${message.id}:${randomUUID()}`,
        payload: { text, message_id: message.id, requires_consent: false },
      });
      return;
    }
    throw error;
  }

  if (conversation) {
    await supabase.from("reva_conversations").update({
      last_message: text.slice(0, 200),
      last_message_at: new Date().toISOString(),
    }).eq("id", conversation.id);
  }
}

async function saveState(
  supabase: ReturnType<typeof createAdminClient>,
  clinicId: string,
  phone: string,
  state: BotState,
  context: Record<string, unknown>
) {
  await supabase.from("reva_booking_state").upsert({
    clinic_id: clinicId,
    contact_phone: phone,
    state,
    context,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: "clinic_id,contact_phone" });
}

async function recordBotAudit(
  supabase: ReturnType<typeof createAdminClient>,
  clinicId: string,
  action: string,
  appointmentId: string,
  phone: string,
) {
  await supabase.from("reva_audit_events").insert({
    clinic_id: clinicId,
    action,
    entity_type: "appointment",
    entity_id: appointmentId,
    metadata: { channel: "whatsapp", phone_suffix: phone.slice(-4) },
  });
}
