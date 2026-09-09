import { NextRequest, NextResponse } from "next/server";
import { getClinicAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function dateOnly(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestedDays = Number(new URL(req.url).searchParams.get("days"));
  const days = Number.isFinite(requestedDays) ? Math.min(90, Math.max(7, requestedDays)) : 30;
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - days + 1);
  const fromDate = dateOnly(from);

  const [appointmentsResult, invoicesResult, conversationsResult] = await Promise.all([
    supabase.from("reva_appointments")
      .select("appointment_date,type,status,confirmed_via")
      .eq("clinic_id", access.clinicId)
      .gte("appointment_date", fromDate),
    supabase.from("reva_invoices")
      .select("amount,status")
      .eq("clinic_id", access.clinicId)
      .gte("invoice_date", fromDate),
    supabase.from("reva_conversations")
      .select("id,unread_count,is_bot_active")
      .eq("clinic_id", access.clinicId),
  ]);
  const error = appointmentsResult.error ?? invoicesResult.error ?? conversationsResult.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const appointments = appointmentsResult.data ?? [];
  const invoices = invoicesResult.data ?? [];
  const conversations = conversationsResult.data ?? [];
  const byDay = new Map<string, number>();
  const byService = new Map<string, number>();
  for (const appointment of appointments) {
    byDay.set(appointment.appointment_date, (byDay.get(appointment.appointment_date) ?? 0) + 1);
    byService.set(appointment.type, (byService.get(appointment.type) ?? 0) + 1);
  }
  const daily = Array.from({ length: days }, (_, index) => {
    const date = new Date(from);
    date.setUTCDate(from.getUTCDate() + index);
    const value = dateOnly(date);
    return { date: value, bookings: byDay.get(value) ?? 0 };
  });
  const services = [...byService.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return NextResponse.json({
    period_days: days,
    metrics: {
      bookings: appointments.length,
      whatsapp_bookings: appointments.filter(item => item.confirmed_via === "whatsapp").length,
      completed: appointments.filter(item => item.status === "Completed").length,
      no_shows: appointments.filter(item => item.status === "No-Show").length,
      recorded_revenue: invoices.filter(item => item.status === "Paid").reduce((sum, item) => sum + Number(item.amount), 0),
      outstanding: invoices.filter(item => item.status === "Pending").reduce((sum, item) => sum + Number(item.amount), 0),
      conversations: conversations.length,
      unread: conversations.reduce((sum, item) => sum + item.unread_count, 0),
      human_handoffs: conversations.filter(item => !item.is_bot_active).length,
    },
    daily,
    services,
  });
}
