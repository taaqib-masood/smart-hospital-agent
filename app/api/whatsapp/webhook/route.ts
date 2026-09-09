/** Meta WhatsApp Cloud API webhook. */

import { NextRequest, NextResponse } from "next/server";
import { handleBotMessage } from "@/lib/booking-bot";
import { verifyMetaWebhookSignature } from "@/lib/security";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractMessageText, markMessageRead, normalizePhone } from "@/lib/whatsapp";

type AdminClient = ReturnType<typeof createAdminClient>;
type WAStatus = { id: string; status: string };
type WAMessage = {
  id: string;
  from: string;
  type: string;
  timestamp: string;
  text?: { body: string };
  interactive?: Record<string, unknown>;
};
type WAValue = {
  statuses?: WAStatus[];
  messages?: WAMessage[];
  metadata?: { phone_number_id?: string };
  contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
};
type WAWebhookBody = { entry?: Array<{ changes?: Array<{ value?: WAValue }> }> };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const valid = verifyToken
    && searchParams.get("hub.mode") === "subscribe"
    && searchParams.get("hub.verify_token") === verifyToken
    && searchParams.get("hub.challenge");
  return valid
    ? new NextResponse(searchParams.get("hub.challenge"), { status: 200 })
    : NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  if (!verifyMetaWebhookSignature(rawBody, req.headers.get("x-hub-signature-256"), appSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: WAWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createAdminClient();
  let processed = 0;
  let duplicates = 0;
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) continue;
      if (value.statuses?.length) processed += await handleStatusUpdates(supabase, value.statuses);
      for (const message of value.messages ?? []) {
        const result = await handleInboundMessage(supabase, value, message);
        if (result === "duplicate") duplicates++;
        else processed++;
      }
    }
  }
  return NextResponse.json({ status: "ok", processed, duplicates });
}

async function handleInboundMessage(supabase: AdminClient, value: WAValue, message: WAMessage) {
  const eventId = `message:${message.id}`;
  const { error: eventError } = await supabase.from("reva_webhook_events").insert({
    provider_event_id: eventId,
    event_type: "message",
    payload: { value, message },
  });
  if (eventError?.code === "23505") return "duplicate" as const;
  if (eventError) throw eventError;

  const waPhoneId = value.metadata?.phone_number_id;
  const { data: clinic } = await supabase.from("reva_clinics").select("*").eq("whatsapp_phone_id", waPhoneId).maybeSingle();
  if (!clinic) {
    await recordWebhookError(supabase, eventId, `No clinic found for WhatsApp phone ID ${waPhoneId ?? "missing"}`);
    return "ignored" as const;
  }

  await markMessageRead(message.id, clinic.whatsapp_phone_id, clinic.whatsapp_token).catch(() => undefined);
  const contactPhone = normalizePhone(message.from);
  const contactName = value.contacts?.find(contact => contact.wa_id === message.from)?.profile?.name
    ?? value.contacts?.[0]?.profile?.name
    ?? contactPhone;
  const textContent = extractMessageText(message as unknown as Record<string, unknown>);
  const normalizedText = textContent.trim().toLowerCase();
  const optedOut = ["stop", "unsubscribe", "opt out", "quit", "end"].includes(normalizedText);
  const requestedHuman = ["human", "agent", "receptionist", "person", "موظف", "استقبال", "بشري"]
    .some(keyword => normalizedText.includes(keyword));
  const receivedAt = new Date(Number(message.timestamp) * 1000);
  const eventTime = Number.isNaN(receivedAt.getTime()) ? new Date().toISOString() : receivedAt.toISOString();

  const { data: conversation, error: conversationError } = await supabase.from("reva_conversations").upsert({
    clinic_id: clinic.id,
    wa_contact_id: message.from,
    contact_name: contactName,
    contact_phone: contactPhone,
    last_message: textContent.slice(0, 200),
    last_message_at: eventTime,
    last_inbound_at: eventTime,
  }, { onConflict: "clinic_id,contact_phone" }).select("id").single();
  if (conversationError || !conversation) {
    await recordWebhookError(supabase, eventId, conversationError?.message ?? "Conversation unavailable");
    return "failed" as const;
  }

  const { error: messageError } = await supabase.from("reva_messages").insert({
    conversation_id: conversation.id,
    clinic_id: clinic.id,
    direction: "inbound",
    content: textContent,
    message_type: message.type,
    wa_message_id: message.id,
    status: "delivered",
    sent_by: "patient",
    sent_at: eventTime,
  });
  if (messageError) {
    await recordWebhookError(supabase, eventId, messageError.message);
    return "failed" as const;
  }
  await supabase.rpc("reva_increment_conversation_unread", { target_conversation_id: conversation.id });

  if (optedOut) {
    await supabase.from("reva_communication_consents").upsert({
      clinic_id: clinic.id,
      phone: contactPhone,
      channel: "whatsapp",
      status: "opted_out",
      source: "patient_message",
      wording: textContent,
      language: /[\u0600-\u06ff]/.test(textContent) ? "ar" : "en",
      recorded_at: new Date().toISOString(),
    }, { onConflict: "clinic_id,phone,channel" });
    await pauseConversation(supabase, clinic.id, conversation.id, "Patient opted out", "whatsapp.opt_out");
  } else if (requestedHuman) {
    await pauseConversation(supabase, clinic.id, conversation.id, "Patient requested receptionist", "whatsapp.handoff_requested");
  }

  const { data: routing } = await supabase.from("reva_conversations").select("is_bot_active").eq("id", conversation.id).single();
  if (!optedOut && !requestedHuman && routing?.is_bot_active !== false && textContent) {
    try {
      await handleBotMessage(clinic, contactPhone, textContent, message.id);
    } catch (error) {
      await recordWebhookError(supabase, eventId, error instanceof Error ? error.message : "Booking bot failed");
      return "failed" as const;
    }
  }

  await supabase.from("reva_webhook_events").update({ processed_at: new Date().toISOString() }).eq("provider_event_id", eventId);
  return "processed" as const;
}

async function pauseConversation(supabase: AdminClient, clinicId: string, conversationId: string, reason: string, action: string) {
  await supabase.from("reva_conversations").update({ is_bot_active: false, handoff_reason: reason }).eq("id", conversationId).eq("clinic_id", clinicId);
  await supabase.from("reva_audit_events").insert({ clinic_id: clinicId, action, entity_type: "conversation", entity_id: conversationId, metadata: { reason } });
}

async function recordWebhookError(supabase: AdminClient, eventId: string, error: string) {
  await supabase.from("reva_webhook_events").update({ error }).eq("provider_event_id", eventId);
}

async function handleStatusUpdates(supabase: AdminClient, statuses: WAStatus[]) {
  const supportedStatuses = new Set(["sent", "delivered", "read", "failed"]);
  let processed = 0;
  for (const status of statuses) {
    const eventId = `status:${status.id}:${status.status}`;
    const { error } = await supabase.from("reva_webhook_events").insert({ provider_event_id: eventId, event_type: "status", payload: status });
    if (error?.code === "23505") continue;
    if (error) throw error;
    if (supportedStatuses.has(status.status)) {
      const { error: updateError } = await supabase.from("reva_messages").update({ status: status.status }).eq("wa_message_id", status.id);
      if (updateError) {
        await recordWebhookError(supabase, eventId, updateError.message);
        continue;
      }
    }
    await supabase.from("reva_webhook_events").update({ processed_at: new Date().toISOString() }).eq("provider_event_id", eventId);
    processed++;
  }
  return processed;
}
