import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getClinicAccess } from "@/lib/auth";
import { enqueueMessage } from "@/lib/message-jobs";
import { sha256 } from "@/lib/security";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [consentsResult, patientsResult, templatesResult] = await Promise.all([
    supabase.from("reva_consent_requests")
      .select("id,status,sent_at,viewed_at,signed_at,expires_at,created_at,ip_address,template_id,document_name:document_snapshot->>name,document_version:document_snapshot->version,document_hash,document_origin,document_captured_at,patient:reva_patients(id,name,phone)")
      .eq("clinic_id", access.clinicId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("reva_patients")
      .select("id,name,phone")
      .eq("clinic_id", access.clinicId)
      .order("name"),
    supabase.from("reva_consent_templates")
      .select("id,name,body,version,updated_at")
      .eq("clinic_id", access.clinicId)
      .eq("active", true)
      .order("name"),
  ]);
  const error = consentsResult.error ?? patientsResult.error ?? templatesResult.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    consents: consentsResult.data?.map(({ template_id, document_name, document_version, ...consent }) => ({
      ...consent,
      template: document_name ? { id: template_id, name: document_name, version: document_version } : null,
      evidence_notice: consent.document_origin === "legacy_unverified"
        ? "The original signed wording cannot be verified."
        : consent.document_origin === "legacy_unsigned_snapshot"
          ? "These terms were preserved during an upgrade; earlier wording cannot be verified."
          : null,
    })),
    patients: patientsResult.data,
    templates: templatesResult.data,
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.patient_id || !body?.template_id) {
    return NextResponse.json({ error: "patient_id and template_id are required" }, { status: 400 });
  }

  const [{ data: patient }, { data: template }] = await Promise.all([
    supabase.from("reva_patients").select("id,name,phone").eq("id", body.patient_id).eq("clinic_id", access.clinicId).single(),
    supabase.from("reva_consent_templates").select("id").eq("id", body.template_id).eq("clinic_id", access.clinicId).eq("active", true).single(),
  ]);
  if (!patient || !template) return NextResponse.json({ error: "Patient or consent template not found" }, { status: 404 });

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + Math.min(168, Math.max(1, Number(body.expires_in_hours) || 72)) * 60 * 60 * 1000).toISOString();
  const { data: consent, error } = await supabase.from("reva_consent_requests").insert({
    clinic_id: access.clinicId,
    patient_id: patient.id,
    template_id: template.id,
    access_token_hash: sha256(token),
    expires_at: expiresAt,
  }).select().single();
  if (error || !consent) return NextResponse.json({ error: error?.message ?? "Could not create consent request" }, { status: 500 });
  if (!consent.document_snapshot || !consent.document_hash) {
    return NextResponse.json({ error: "Consent document protection is unavailable" }, { status: 503 });
  }

  const origin = new URL(req.url).origin;
  const signingUrl = `${origin}/consent/${token}`;
  const { data: waTemplate } = await supabase.from("reva_whatsapp_templates")
    .select("template_name,language_code")
    .eq("clinic_id", access.clinicId)
    .eq("purpose", "consent_request")
    .eq("status", "approved")
    .limit(1)
    .maybeSingle();

  let delivery: "queued" | "template_missing" = "template_missing";
  if (waTemplate) {
    const { error: jobError } = await enqueueMessage(supabase, {
      clinicId: access.clinicId,
      patientId: patient.id,
      recipientPhone: patient.phone,
      kind: "consent_request",
      idempotencyKey: `consent-request:${consent.id}`,
      payload: {
        template_name: waTemplate.template_name,
        language_code: waTemplate.language_code,
        requires_consent: true,
        components: [{ type: "body", parameters: [patient.name, consent.document_snapshot.name, signingUrl].map(text => ({ type: "text", text })) }],
      },
    });
    if (!jobError) {
      delivery = "queued";
      await supabase.from("reva_consent_requests").update({ status: "Sent", sent_at: new Date().toISOString() }).eq("id", consent.id).eq("status", "Pending");
    }
  }

  await supabase.from("reva_audit_events").insert({
    clinic_id: access.clinicId,
    actor_user_id: access.userId,
    action: "consent.created",
    entity_type: "consent_request",
    entity_id: consent.id,
  });

  return NextResponse.json({ consent, signing_url: signingUrl, delivery }, { status: 201 });
}
