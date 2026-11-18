import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

// Tokens live in reva_whatsapp_credentials, which only the service role can read.
// Never throws: missing credentials make sendWhatsAppMessage fail inside the caller's own error handling.
export async function getWhatsAppCredentials(clinicId: string, admin?: SupabaseClient) {
  try {
    const { data, error } = await (admin ?? createAdminClient())
      .from("reva_whatsapp_credentials")
      .select("phone_id,access_token")
      .eq("clinic_id", clinicId)
      .maybeSingle();
    if (error) throw error;
    return { phoneId: (data?.phone_id as string | undefined) ?? null, token: (data?.access_token as string | undefined) ?? null };
  } catch (err) {
    console.error(`WhatsApp credential lookup failed for clinic ${clinicId}:`, err instanceof Error ? err.message : err);
    return { phoneId: null, token: null };
  }
}
