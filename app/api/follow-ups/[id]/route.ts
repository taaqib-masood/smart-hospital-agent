import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClinicAccess } from "@/lib/auth";
import { enqueueMessage } from "@/lib/message-jobs";

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

  if (!['Pending', 'Skipped', 'Sent'].includes(body.status)) {
    return NextResponse.json({ error: "A valid status is required" }, { status: 400 });
  }

  const { data: fu, error } = await supabase
    .from("reva_follow_ups")
    .update({ status: body.status === "Sent" ? "Pending" : body.status })
    .eq("id", id)
    .eq("clinic_id", clinic.id)
    .select("*, patient:reva_patients(id,name,phone)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let delivery: "unchanged" | "queued" | "template_missing" = "unchanged";
  if (body.status === "Sent") {
    const patient = fu.patient as { name: string; phone: string } | null;
    if (patient?.phone) {
      const { data: template } = await supabase.from("reva_whatsapp_templates")
        .select("template_name,language_code")
        .eq("clinic_id", clinic.id)
        .eq("purpose", "follow_up")
        .eq("status", "approved")
        .limit(1)
        .maybeSingle();
      delivery = template ? "queued" : "template_missing";
      if (template) {
        const { error: jobError } = await enqueueMessage(supabase, {
          clinicId: clinic.id,
          patientId: fu.patient_id,
          recipientPhone: patient.phone,
          kind: "follow_up",
          idempotencyKey: `follow-up:${fu.id}`,
          payload: {
            template_name: template.template_name,
            language_code: template.language_code,
            follow_up_id: fu.id,
            requires_consent: true,
            components: [{ type: "body", parameters: [patient.name, clinic.name].map(text => ({ type: "text", text })) }],
          },
        });
        if (jobError?.code !== "23505") delivery = jobError ? "template_missing" : "queued";
      }
    }
  }

  await supabase.from("reva_audit_events").insert({
    clinic_id: clinic.id,
    actor_user_id: access.userId,
    action: body.status === "Sent" ? "follow_up.queued" : "follow_up.updated",
    entity_type: "follow_up",
    entity_id: fu.id,
    metadata: { requested_status: body.status, delivery },
  });

  return NextResponse.json({ follow_up: fu, delivery });
}
