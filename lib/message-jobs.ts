import type { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export function retryDelaySeconds(attempt: number) {
  return Math.min(3600, 60 * (2 ** Math.max(0, attempt - 1)));
}

export async function enqueueMessage(
  supabase: ServerClient,
  job: {
    clinicId: string;
    conversationId?: string | null;
    patientId?: string | null;
    recipientPhone: string;
    kind: "manual" | "appointment_confirmation" | "appointment_reminder" | "follow_up" | "consent_request" | "payment_reminder";
    idempotencyKey: string;
    payload: Record<string, unknown>;
    runAt?: string;
  },
) {
  return supabase.from("reva_message_jobs").insert({
    clinic_id: job.clinicId,
    conversation_id: job.conversationId ?? null,
    patient_id: job.patientId ?? null,
    recipient_phone: job.recipientPhone,
    kind: job.kind,
    idempotency_key: job.idempotencyKey,
    payload: job.payload,
    run_at: job.runAt ?? new Date().toISOString(),
  }).select().single();
}
