import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ownsClinicRefs } from "@/lib/clinic-refs";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: clinic } = await supabase.from("reva_clinics").select("id").eq("owner_id", user.id).single();
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const period = searchParams.get("period");

  let query = supabase
    .from("reva_invoices")
    .select("*, patient:reva_patients(id,name,phone)")
    .eq("clinic_id", clinic.id)
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: clinic } = await supabase.from("reva_clinics").select("id").eq("owner_id", user.id).single();
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const { patient_id, appointment_id, service_description, amount, invoice_date, payment_method } = await req.json();
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
    return NextResponse.json({ error: "Invalid invoice amount" }, { status: 400 });
  }
  if (!await ownsClinicRefs(supabase, clinic.id, [["reva_patients", patient_id], ["reva_appointments", appointment_id]])) {
    return NextResponse.json({ error: "Patient or appointment not found in this clinic" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reva_invoices")
    .insert({ clinic_id: clinic.id, patient_id, appointment_id, service_description, amount, invoice_date, payment_method, status: "Pending" })
    .select("*, patient:reva_patients(id,name,phone)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoice: data }, { status: 201 });
}
