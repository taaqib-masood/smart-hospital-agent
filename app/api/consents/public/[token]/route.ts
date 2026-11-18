import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sha256 } from "@/lib/security";

async function findConsent(token: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.from("reva_consent_requests")
    .select("id,clinic_id,status,expires_at,document_snapshot,document_hash,document_origin,patient:reva_patients(name,clinic_id),clinic:reva_clinics(name)")
    .eq("access_token_hash", sha256(token))
    .single();
  const expiresAt = data?.expires_at ? Date.parse(data.expires_at) : NaN;
  const patient = data?.patient as unknown as { name: string; clinic_id: string } | null;
  if (!data || !Number.isFinite(expiresAt) || expiresAt <= Date.now()
    || !data.document_snapshot || !data.document_hash || data.document_origin === "legacy_unverified"
    || (patient && patient.clinic_id !== data.clinic_id)
    || ["Signed", "Declined", "Cancelled", "Expired"].includes(data.status)) return null;
  return { supabase, consent: { ...data, patient } };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await findConsent(token);
  if (!result) return NextResponse.json({ error: "Consent link is invalid or expired" }, { status: 404 });

  await result.supabase.from("reva_consent_requests")
    .update({ status: "Viewed", viewed_at: new Date().toISOString() })
    .eq("id", result.consent.id)
    .in("status", ["Pending", "Sent"]);
  return NextResponse.json({ consent: {
    patient: { name: result.consent.patient?.name ?? "Patient" },
    template: result.consent.document_snapshot,
    document_hash: result.consent.document_hash,
    clinic: result.consent.clinic,
    evidence_notice: result.consent.document_origin === "legacy_unsigned_snapshot"
      ? "These terms were preserved during an upgrade. Review them before signing; earlier wording cannot be verified."
      : null,
  } });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await findConsent(token);
  if (!result) return NextResponse.json({ error: "Consent link is invalid or expired" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const signerName = typeof body?.signer_name === "string" ? body.signer_name.trim() : "";
  if (signerName.length < 2 || body?.accepted !== true) {
    return NextResponse.json({ error: "Signer name and acceptance are required" }, { status: 400 });
  }
  if (body.document_hash !== result.consent.document_hash) {
    return NextResponse.json({ error: "The consent document changed. Reload and review it before signing." }, { status: 409 });
  }

  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip");
  const userAgent = req.headers.get("user-agent");
  const { data: signedConsent, error } = await result.supabase.from("reva_consent_requests").update({
    status: "Signed",
    signer_name: signerName,
    accepted_terms: true,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
    .eq("id", result.consent.id)
    .eq("document_hash", body.document_hash)
    .in("status", ["Pending", "Sent", "Viewed"])
    .select("id,signed_at,signature_hash,document_hash")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Could not record consent" }, { status: 500 });
  if (!signedConsent) return NextResponse.json({ error: "Consent was already completed" }, { status: 409 });

  await result.supabase.from("reva_audit_events").insert({
    clinic_id: result.consent.clinic_id,
    action: "consent.signed",
    entity_type: "consent_request",
    entity_id: result.consent.id,
    metadata: { evidence_hash: signedConsent.signature_hash, document_hash: signedConsent.document_hash },
  });
  return NextResponse.json({ ok: true, signed_at: signedConsent.signed_at });
}
