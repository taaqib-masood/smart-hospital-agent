import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;
type TimeWindow = { start: string; end: string };

function toMinutes(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function generateSlotsFromWindows(
  windows: TimeWindow[],
  durationMinutes: number,
  blockedTimes: string[] = [],
  blockedWindows: TimeWindow[] = [],
) {
  const blocked = new Set(blockedTimes.map(time => time.slice(0, 5)));
  return windows.flatMap(window => {
    const slots: string[] = [];
    for (let time = toMinutes(window.start); time + durationMinutes <= toMinutes(window.end); time += durationMinutes) {
      const value = fromMinutes(time);
      const overlapsBlock = blockedWindows.some(block => time < toMinutes(block.end) && time + durationMinutes > toMinutes(block.start));
      if (!blocked.has(value) && !overlapsBlock) slots.push(value);
    }
    return slots;
  });
}

export async function getAvailableSlots(
  supabase: AdminClient,
  clinicId: string,
  doctorId: string,
  date: string,
  fallbackDuration: number,
) {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const { data: rules, error: rulesError } = await supabase.from("reva_availability_rules")
    .select("start_time,end_time,slot_minutes")
    .eq("clinic_id", clinicId)
    .eq("weekday", weekday)
    .eq("active", true)
    .or(`doctor_id.eq.${doctorId},doctor_id.is.null`)
    .order("start_time");
  if (rulesError) throw rulesError;

  const { data: exceptions, error: exceptionsError } = await supabase.from("reva_availability_exceptions")
    .select("start_time,end_time,available")
    .eq("clinic_id", clinicId)
    .eq("exception_date", date)
    .or(`doctor_id.eq.${doctorId},doctor_id.is.null`);
  if (exceptionsError) throw exceptionsError;
  if (exceptions?.some(item => !item.available && !item.start_time && !item.end_time)) return [];

  const windows: TimeWindow[] = (rules ?? []).map(rule => ({ start: rule.start_time, end: rule.end_time }));
  for (const exception of exceptions ?? []) {
    if (exception.available && exception.start_time && exception.end_time) {
      windows.push({ start: exception.start_time, end: exception.end_time });
    }
  }

  const { data: appointments, error: appointmentsError } = await supabase.from("reva_appointments")
    .select("appointment_time")
    .eq("clinic_id", clinicId)
    .eq("doctor_id", doctorId)
    .eq("appointment_date", date)
    .in("status", ["Confirmed", "Pending"]);
  if (appointmentsError) throw appointmentsError;

  const blockedTimes = (appointments ?? []).map(item => item.appointment_time);
  const blockedWindows = (exceptions ?? [])
    .filter(exception => !exception.available && exception.start_time && exception.end_time)
    .map(exception => ({ start: exception.start_time!, end: exception.end_time! }));

  const duration = rules?.[0]?.slot_minutes ?? fallbackDuration;
  return [...new Set(generateSlotsFromWindows(windows, duration, blockedTimes, blockedWindows))].sort();
}
