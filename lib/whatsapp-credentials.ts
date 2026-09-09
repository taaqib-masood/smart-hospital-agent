import type { SupabaseClient } from "@supabase/supabase-js";

type CredentialRow = { phone_id: string; access_token: string } | null;

export function resolveWhatsAppCredentials(stored: CredentialRow) {
  return {
    phoneId: stored?.phone_id || process.env.WHATSAPP_PHONE_ID || null,
    token: stored?.access_token || process.env.WHATSAPP_TOKEN || null,
  };
}

export async function getWhatsAppCredentials(client: SupabaseClient, clinicId: string) {
  const { data, error } = await client
    .from("reva_whatsapp_credentials")
    .select("phone_id,access_token")
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (error) throw new Error(`WhatsApp credential lookup failed: ${error.message}`);
  return resolveWhatsAppCredentials(data as CredentialRow);
}
