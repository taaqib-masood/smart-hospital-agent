import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sha256 } from "@/lib/security";

async function findConsent(token: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.from("reva_consent_requests")
    .select("id,clinic_id,status,expires_at,patient:reva_patients(name),template:reva_consent_templates(name,version,body),clinic:reva_clinics(name)")
    .eq("access_token_hash", sha256(token))
    .single();
  if (!data || new Date(data.expires_at).getTime() <= Date.now() || ["Signed", "Declined", "Cancelled", "Expired"].includes(data.status)) return null;
  return { supabase, consent: data };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await findConsent(token);
  if (!result) return NextResponse.json({ error: "Consent link is invalid or expired" }, { status: 404 });

  await result.supabase.from("reva_consent_requests")
    .update({ status: "Viewed", viewed_at: new Date().toISOString() })
    .eq("id", result.consent.id)
    .in("status", ["Pending", "Sent"]);
  return NextResponse.json({ consent: result.consent });
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

  const signedAt = new Date().toISOString();
  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip");
  const userAgent = req.headers.get("user-agent");
  const evidenceHash = sha256([result.consent.id, signerName, signedAt, ipAddress, userAgent].join("|"));
  const { data: signedConsent, error } = await result.supabase.from("reva_consent_requests").update({
    status: "Signed",
    signer_name: signerName,
    accepted_terms: true,
    signed_at: signedAt,
    signature_hash: evidenceHash,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
    .eq("id", result.consent.id)
    .in("status", ["Pending", "Sent", "Viewed"])
    .select("id")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Could not record consent" }, { status: 500 });
  if (!signedConsent) return NextResponse.json({ error: "Consent was already completed" }, { status: 409 });

  await result.supabase.from("reva_audit_events").insert({
    clinic_id: result.consent.clinic_id,
    action: "consent.signed",
    entity_type: "consent_request",
    entity_id: result.consent.id,
    metadata: { evidence_hash: evidenceHash },
  });
  return NextResponse.json({ ok: true, signed_at: signedAt });
}
