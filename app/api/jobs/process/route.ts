import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppMessage, sendWhatsAppTemplate } from "@/lib/whatsapp";
import { retryDelaySeconds } from "@/lib/message-jobs";
import { getWhatsAppCredentials } from "@/lib/whatsapp-credentials";

type MessageJob = {
  id: string;
  clinic_id: string;
  conversation_id: string | null;
  recipient_phone: string;
  kind: string;
  payload: Record<string, unknown>;
  attempts: number;
  max_attempts: number;
};

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && (
    req.headers.get("authorization") === `Bearer ${secret}` ||
    req.headers.get("x-cron-secret") === secret
  );
}

async function processJobs() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("reva_claim_message_jobs", { batch_size: 20 });
  if (error) throw error;

  let sent = 0;
  let failed = 0;
  let suppressed = 0;

  for (const job of (data ?? []) as MessageJob[]) {
    const payload = job.payload ?? {};
    const messageId = typeof payload.message_id === "string" ? payload.message_id : null;
    try {
      if (payload.requires_consent === true) {
        const { data: permission } = await supabase.from("reva_communication_consents")
          .select("status")
          .eq("clinic_id", job.clinic_id)
          .eq("phone", job.recipient_phone)
          .eq("channel", "whatsapp")
          .maybeSingle();
        if (permission?.status !== "opted_in") {
          await supabase.from("reva_message_jobs").update({ status: "dead", last_error: "Recipient has not opted in" }).eq("id", job.id);
          if (messageId) await supabase.from("reva_messages").update({ status: "suppressed", error_message: "Recipient has not opted in" }).eq("id", messageId);
          if (typeof payload.follow_up_id === "string") await supabase.from("reva_follow_ups").update({ status: "Skipped" }).eq("id", payload.follow_up_id).eq("clinic_id", job.clinic_id);
          suppressed++;
          continue;
        }
      }

      if (!payload.template_name && job.conversation_id) {
        const { data: conversation } = await supabase.from("reva_conversations")
          .select("last_inbound_at")
          .eq("id", job.conversation_id)
          .eq("clinic_id", job.clinic_id)
          .maybeSingle();
        const inboundAt = conversation?.last_inbound_at
          ? new Date(conversation.last_inbound_at).getTime()
          : 0;
        if (!inboundAt || Date.now() - inboundAt > 24 * 60 * 60 * 1000) {
          const reason = "An approved WhatsApp template is required outside the 24-hour service window";
          await supabase.from("reva_message_jobs").update({ status: "dead", last_error: reason }).eq("id", job.id);
          if (messageId) await supabase.from("reva_messages").update({ status: "suppressed", error_message: reason }).eq("id", messageId);
          suppressed++;
          continue;
        }
      }

      const credentials = await getWhatsAppCredentials(supabase, job.clinic_id);

      const templateName = typeof payload.template_name === "string" ? payload.template_name : null;
      const result = templateName
        ? await sendWhatsAppTemplate(
            job.recipient_phone,
            templateName,
            typeof payload.language_code === "string" ? payload.language_code : "en",
            Array.isArray(payload.components) ? payload.components as Record<string, unknown>[] : [],
            credentials.phoneId,
            credentials.token,
          )
        : await sendWhatsAppMessage(
            job.recipient_phone,
            String(payload.text ?? ""),
            credentials.phoneId,
            credentials.token,
          );

      const waMessageId = result.messages?.[0]?.id ?? null;
      await supabase.from("reva_message_jobs").update({ status: "sent", sent_at: new Date().toISOString(), last_error: null }).eq("id", job.id);
      if (messageId) await supabase.from("reva_messages").update({ status: "sent", wa_message_id: waMessageId }).eq("id", messageId);
      if (typeof payload.appointment_id === "string" && job.kind === "appointment_reminder") {
        await supabase.from("reva_appointments").update({ reminder_sent_at: new Date().toISOString() }).eq("id", payload.appointment_id).eq("clinic_id", job.clinic_id);
      }
      if (typeof payload.follow_up_id === "string" && job.kind === "follow_up") {
        await supabase.from("reva_follow_ups").update({ status: "Sent", sent_at: new Date().toISOString() }).eq("id", payload.follow_up_id).eq("clinic_id", job.clinic_id);
      }
      sent++;
    } catch (sendError) {
      const lastError = sendError instanceof Error ? sendError.message : "Unknown send failure";
      const dead = job.attempts >= job.max_attempts;
      const delaySeconds = retryDelaySeconds(job.attempts);
      await supabase.from("reva_message_jobs").update({
        status: dead ? "dead" : "failed",
        last_error: lastError,
        run_at: new Date(Date.now() + delaySeconds * 1000).toISOString(),
      }).eq("id", job.id);
      if (messageId) await supabase.from("reva_messages").update({ status: "failed", error_message: lastError }).eq("id", messageId);
      if (dead && typeof payload.follow_up_id === "string") {
        await supabase.from("reva_follow_ups").update({ status: "Failed" }).eq("id", payload.follow_up_id).eq("clinic_id", job.clinic_id);
      }
      failed++;
    }
  }

  return { claimed: data?.length ?? 0, sent, failed, suppressed };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await processJobs());
  } catch (error) {
    console.error("Message worker failed", error);
    return NextResponse.json({ error: "Message worker failed" }, { status: 500 });
  }
}

export const POST = GET;
