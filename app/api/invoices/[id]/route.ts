import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClinicAccess } from "@/lib/auth";
import { enqueueMessage } from "@/lib/message-jobs";
import { isPaymentMethod } from "@/lib/payment-methods";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: clinic } = await supabase
    .from("reva_clinics").select("id,name")
    .eq("id", access.clinicId).single();
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const body = await req.json();
  if (body.status && !["Pending", "Paid", "Waived", "Cancelled"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid invoice status" }, { status: 400 });
  }
  if (body.amount !== undefined && (!Number.isFinite(Number(body.amount)) || Number(body.amount) < 0)) {
    return NextResponse.json({ error: "Invalid invoice amount" }, { status: 400 });
  }
  if (body.payment_method && !isPaymentMethod(body.payment_method)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }
  const allowed = ["status", "payment_method", "waived_reason", "amount"] as const;
  const updates: Record<string, unknown> = Object.fromEntries(allowed.filter(key => body[key] !== undefined).map(key => [key, body[key]]));
  if (body.status === "Paid") updates.paid_at = new Date().toISOString();

  const query = supabase.from("reva_invoices");
  const { data, error } = Object.keys(updates).length
    ? await query.update(updates).eq("id", id).eq("clinic_id", clinic.id).select("*, patient:reva_patients(id,name,phone)").single()
    : await query.select("*, patient:reva_patients(id,name,phone)").eq("id", id).eq("clinic_id", clinic.id).single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send WhatsApp reminder if requested
  if (body.send_reminder) {
    const patient = data.patient as { name: string; phone: string } | null;
    if (patient?.phone) {
      const { data: template } = await supabase.from("reva_whatsapp_templates")
        .select("template_name,language_code")
        .eq("clinic_id", clinic.id)
        .eq("purpose", "payment_reminder")
        .eq("status", "approved")
        .limit(1)
        .maybeSingle();
      if (!template) return NextResponse.json({ error: "Approved payment reminder template not configured" }, { status: 409 });
      const { error: jobError } = await enqueueMessage(supabase, {
        clinicId: clinic.id,
        patientId: data.patient_id,
        recipientPhone: patient.phone,
        kind: "payment_reminder",
        idempotencyKey: `payment-reminder:${data.id}:${Date.now()}`,
        payload: {
          template_name: template.template_name,
          language_code: template.language_code,
          requires_consent: true,
          components: [{ type: "body", parameters: [patient.name, String(data.amount), clinic.name].map(text => ({ type: "text", text })) }],
        },
      });
      if (jobError) return NextResponse.json({ error: "Could not queue reminder" }, { status: 500 });
    }
  }

  await supabase.from("reva_audit_events").insert({
    clinic_id: clinic.id,
    actor_user_id: access.userId,
    action: body.send_reminder ? "invoice.reminder_queued" : "invoice.updated",
    entity_type: "invoice",
    entity_id: data.id,
    metadata: { fields: Object.keys(updates) },
  });

  return NextResponse.json({ invoice: data });
}
