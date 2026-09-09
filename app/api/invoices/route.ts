import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClinicAccess } from "@/lib/auth";
import { isPaymentMethod } from "@/lib/payment-methods";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const period = searchParams.get("period");

  let query = supabase
    .from("reva_invoices")
    .select("*, patient:reva_patients(id,name,phone)")
    .eq("clinic_id", access.clinicId)
    .order("created_at", { ascending: false });

  if (status && status !== "All") query = query.eq("status", status);

  if (period === "today") query = query.eq("invoice_date", new Date().toISOString().split("T")[0]);
  else if (period === "week") {
    const d = new Date(); d.setDate(d.getDate() - 7);
    query = query.gte("invoice_date", d.toISOString().split("T")[0]);
  } else if (period === "month") {
    const d = new Date(); d.setDate(1);
    query = query.gte("invoice_date", d.toISOString().split("T")[0]);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoices: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (typeof body.service_description !== "string" || !body.service_description.trim() || !Number.isFinite(Number(body.amount)) || Number(body.amount) < 0) {
    return NextResponse.json({ error: "service_description and a valid amount are required" }, { status: 400 });
  }
  if (body.status && !["Pending", "Paid", "Waived", "Cancelled"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid invoice status" }, { status: 400 });
  }
  if (body.payment_method && !isPaymentMethod(body.payment_method)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }
  if (body.patient_id) {
    const { data: patient } = await supabase.from("reva_patients").select("id").eq("id", body.patient_id).eq("clinic_id", access.clinicId).maybeSingle();
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }
  if (body.appointment_id) {
    const { data: appointment } = await supabase.from("reva_appointments").select("id").eq("id", body.appointment_id).eq("clinic_id", access.clinicId).maybeSingle();
    if (!appointment) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }
  const allowed = ["patient_id", "appointment_id", "service_description", "amount", "status", "payment_method", "invoice_date"] as const;
  const invoice = Object.fromEntries(allowed.filter(key => body[key] !== undefined).map(key => [key, body[key]]));
  const { data, error } = await supabase
    .from("reva_invoices")
    .insert({ ...invoice, clinic_id: access.clinicId })
    .select("*, patient:reva_patients(id,name,phone)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("reva_audit_events").insert({ clinic_id: access.clinicId, actor_user_id: access.userId, action: "invoice.created", entity_type: "invoice", entity_id: data.id });
  return NextResponse.json({ invoice: data }, { status: 201 });
}
