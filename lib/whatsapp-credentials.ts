import type { SupabaseClient } from "@supabase/supabase-js";

// Tokens live in reva_whatsapp_credentials, which only the service role can read.
export async function getWhatsAppCredentials(admin: SupabaseClient, clinicId: string) {
  const { data, error } = await admin
    .from("reva_whatsapp_credentials")
    .select("phone_id,access_token")
    .eq("clinic_id", clinicId)
    .maybeSingle();
  if (error) console.error(`WhatsApp credential lookup failed for clinic ${clinicId}: ${error.message}`);
  return { phoneId: (data?.phone_id as string | undefined) ?? null, token: (data?.access_token as string | undefined) ?? null };
}
