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
 *   "reschedule" mid-flow → back to date selection (times only come from offered slots)
 *   "cancel" mid-flow → stops the booking; "cancel" when idle → cancels the next real appointment
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import type { RevaClinic, RevaDoctor } from "@/lib/supabase/types";
import { formatDate, formatTime } from "@/lib/utils";

type BotClinic = RevaClinic & { whatsapp_token: string | null };

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

function generateSlots(date: string, slotMinutes: number): string[] {
  // Simple 9AM–5PM slots, skip lunch 1–2PM
  const slots: string[] = [];
  for (let h = 9; h < 17; h++) {
    if (h === 13) continue;
    for (let m = 0; m < 60; m += slotMinutes) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  // Return only 6 slots for readability
  return slots.slice(0, 6);
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
  clinic: BotClinic,
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
  if (matchesKeyword(text, KEYWORDS.cancel) && text.toUpperCase() !== "CANCEL") {
    await reply(clinic, contactPhone, "I have not cancelled anything. Reply CANCEL only if you want to cancel your appointment.");
    return;
  }
  if (matchesKeyword(text, KEYWORDS.cancel)) {
    await saveState(supabase, clinic.id, contactPhone, "idle", {});
    // Mid-flow "cancel" only stops the unfinished booking; it must not cancel an earlier appointment.
    if (state !== "idle") {
      await reply(clinic, contactPhone, "The new booking was stopped. Any existing appointment remains scheduled. Reply CANCEL again to cancel it, or BOOK to start again.");
      return;
    }
    const upcoming = await findUpcomingAppointment(supabase, clinic.id, contactPhone);
    const { error } = upcoming
      ? await supabase.from("reva_appointments").update({ status: "Cancelled" }).eq("id", upcoming.id).eq("clinic_id", clinic.id)
      : { error: null };
    await reply(clinic, contactPhone, !upcoming
      ? "I couldn't find an upcoming appointment to cancel. Feel free to book anytime. 😊"
      : error
        ? "Sorry, I couldn't cancel your appointment. Please call the clinic."
        : "Your upcoming appointment has been cancelled. Feel free to book again anytime. 😊");
    return;
  }

  if (matchesKeyword(text, KEYWORDS.reschedule) && state !== "idle") {
    if (!context.patient_name) {
      await reply(clinic, contactPhone, "Please tell me your name first so we can continue your booking.");
      return;
    }
    if (!context.selected_doctor_id) {
      await goToShowDoctors(supabase, clinic, contactPhone, context);
      return;
    }
    context.selected_time = undefined;
    const dates = nextDays(5);
    await saveState(supabase, clinic.id, contactPhone, "show_slots", { ...context, _dates: dates });
    await reply(clinic, contactPhone, dates.map((date, index) => `${index + 1}. ${formatDate(date)}`).join("\n") + "\n\nReply with a number to choose a date.");
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
        await reply(clinic, contactPhone, `Please reply with a number 1-${dates.length} to pick a date.`);
        break;
      }

      context.selected_date = pickedDate;
      const freeSlots = await getFreeSlots(supabase, clinic.id, context.selected_doctor_id!, pickedDate);

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
        // Re-check at confirm time: the slot may have been taken since it was offered.
        const freeSlots = context.selected_doctor_id && context.selected_date
          ? await getFreeSlots(supabase, clinic.id, context.selected_doctor_id, context.selected_date)
          : [];
        if (!context.selected_time || !freeSlots.includes(context.selected_time)) {
          await replySlotUnavailable(supabase, clinic, contactPhone, context);
          break;
        }

        const { error } = await supabase
          .from("reva_appointments")
          .insert({
            clinic_id: clinic.id,
            patient_id: context.patient_id,
            doctor_id: context.selected_doctor_id,
            appointment_date: context.selected_date,
            appointment_time: context.selected_time,
            type: "General Checkup",
            status: "Confirmed",
            confirmed_via: "whatsapp",
          });

        if (error) {
          // 23505 = unique index on active slots: another booking won the race.
          if (error.code === "23505") {
            await replySlotUnavailable(supabase, clinic, contactPhone, context);
          } else {
            await reply(clinic, contactPhone, "Sorry, I couldn't complete that booking. Please call the clinic.");
            await saveState(supabase, clinic.id, contactPhone, "idle", {});
          }
          break;
        }

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

async function goToShowDoctors(
  supabase: ReturnType<typeof createAdminClient>,
  clinic: BotClinic,
  contactPhone: string,
  context: BotContext
) {
  const { data: doctors } = await supabase
    .from("reva_doctors")
    .select("id, name, specialization")
    .eq("clinic_id", clinic.id);

  if (!doctors?.length) {
    await sendWhatsAppMessage(contactPhone, "Sorry, no doctors are available right now. Please call the clinic.", clinic.whatsapp_phone_id, clinic.whatsapp_token);
    return;
  }

  if (doctors.length === 1) {
    // Auto-select only doctor
    context.selected_doctor_id = doctors[0].id;
    context.selected_doctor_name = doctors[0].name;
    await sendWhatsAppMessage(contactPhone, `Great! You'll be seeing *${doctors[0].name}*.\n\nWhich date works for you?`, clinic.whatsapp_phone_id, clinic.whatsapp_token);
    const dates = nextDays(5);
    const dateList = dates.map((d, i) => `${i + 1}. ${formatDate(d)}`).join("\n");
    await sendWhatsAppMessage(contactPhone, dateList + "\n\nReply with a number (1-5).", clinic.whatsapp_phone_id, clinic.whatsapp_token);
    await saveState(supabase, clinic.id, contactPhone, "show_slots", { ...context, _dates: dates });
  } else {
    const list = doctors.map((d, i) => `${i + 1}. ${d.name}${d.specialization ? ` (${d.specialization})` : ""}`).join("\n");
    await sendWhatsAppMessage(contactPhone, `Who would you like to see?\n\n${list}\n\nReply with a number.`, clinic.whatsapp_phone_id, clinic.whatsapp_token);
    await saveState(supabase, clinic.id, contactPhone, "show_doctors", context);
  }
}

async function getFreeSlots(
  supabase: ReturnType<typeof createAdminClient>,
  clinicId: string,
  doctorId: string,
  date: string
) {
  const { data: doctor } = await supabase
    .from("reva_doctors")
    .select("slot_duration_minutes")
    .eq("id", doctorId)
    .eq("clinic_id", clinicId)
    .single();

  const { data: taken, error } = await supabase
    .from("reva_appointments")
    .select("appointment_time")
    .eq("clinic_id", clinicId)
    .eq("doctor_id", doctorId)
    .eq("appointment_date", date)
    .in("status", ["Confirmed", "Pending"]);
  if (error) throw error;

  const takenTimes = new Set((taken ?? []).map(a => a.appointment_time.slice(0, 5)));
  return generateSlots(date, doctor?.slot_duration_minutes ?? 15).filter(s => !takenTimes.has(s));
}

async function replySlotUnavailable(
  supabase: ReturnType<typeof createAdminClient>,
  clinic: BotClinic,
  contactPhone: string,
  context: BotContext
) {
  const dates = nextDays(5);
  const dateList = dates.map((d, i) => `${i + 1}. ${formatDate(d)}`).join("\n");
  await reply(clinic, contactPhone, `Sorry, that slot is no longer available. Please pick another date:\n\n${dateList}\n\nReply with a number (1-5).`);
  await saveState(supabase, clinic.id, contactPhone, "show_slots", { ...context, selected_time: undefined, _dates: dates });
}

async function findUpcomingAppointment(
  supabase: ReturnType<typeof createAdminClient>,
  clinicId: string,
  phone: string
) {
  const { data: patient } = await supabase
    .from("reva_patients")
    .select("id")
    .eq("clinic_id", clinicId)
    .eq("phone", phone)
    .maybeSingle();
  if (!patient) return null;

  const now = new Date().toISOString();
  const { data } = await supabase
    .from("reva_appointments")
    .select("id")
    .eq("clinic_id", clinicId)
    .eq("patient_id", patient.id)
    .in("status", ["Confirmed", "Pending"])
    .or(`appointment_date.gt.${now.slice(0, 10)},and(appointment_date.eq.${now.slice(0, 10)},appointment_time.gte.${now.slice(11, 19)})`)
    .order("appointment_date")
    .order("appointment_time")
    .limit(1)
    .maybeSingle();
  return data;
}

async function reply(clinic: BotClinic, to: string, text: string) {
  await sendWhatsAppMessage(to, text, clinic.whatsapp_phone_id, clinic.whatsapp_token);
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
