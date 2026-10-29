/**
 * WhatsApp Cloud API Webhook
 * GET  — Meta verification challenge
 * POST — Incoming messages + status updates
 *
 * Set this URL in Meta Developer Console:
 *   https://yourdomain.com/api/whatsapp/webhook
 * Required env: WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET
 */

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleBotMessage } from "@/lib/booking-bot";
import { markMessageRead, extractMessageText, normalizePhone } from "@/lib/whatsapp";

// GET — webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (verifyToken && mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST — incoming messages
export async function POST(req: NextRequest) {
  // Verify Meta's X-Hub-Signature-256 over the raw body before parsing
  const rawBody = await req.text();
  if (!verifySignature(req, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ status: "ok" });
  }
  if (!body) return NextResponse.json({ status: "ok" });

  const entry = body?.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;

  if (!value) return NextResponse.json({ status: "ok" });

  const waPhoneId = value.metadata?.phone_number_id as string;
  if (!waPhoneId) return NextResponse.json({ status: "ok" });

  // Find clinic by whatsapp_phone_id
  const supabase = await createClient();
  const { data: clinic } = await supabase
    .from("reva_clinics")
    .select("*")
    .eq("whatsapp_phone_id", waPhoneId)
    .single();

  if (!clinic) {
    console.warn(`No clinic found for phone_id: ${waPhoneId}`);
    return NextResponse.json({ status: "ok" });
  }

  // Status updates (delivered, read) — just acknowledge
  if (value.statuses?.length) {
    await handleStatusUpdate(value.statuses, clinic.id);
    return NextResponse.json({ status: "ok" });
  }

  const messages = value.messages;
  if (!messages?.length) return NextResponse.json({ status: "ok" });

  const message = messages[0];
  const contactPhone = normalizePhone(message.from);

  // Mark message as read
  await markMessageRead(message.id, clinic.whatsapp_phone_id, clinic.whatsapp_token).catch(() => {});

  // Upsert conversation
  const contactName = value.contacts?.[0]?.profile?.name ?? null;
  const textContent = extractMessageText(message);

  const { data: conversation } = await supabase
    .from("reva_conversations")
    .upsert({
      clinic_id: clinic.id,
      wa_contact_id: message.from,
      contact_name: contactName,
      contact_phone: contactPhone,
      last_message: textContent.slice(0, 200),
      last_message_at: new Date().toISOString(),
    }, { onConflict: "clinic_id,contact_phone" })
    .select("id, unread_count")
    .single();

  // Increment unread count
  if (conversation?.id) {
    await supabase.from("reva_conversations")
      .update({ unread_count: (conversation.unread_count ?? 0) + 1 })
      .eq("id", conversation.id);
  }

  // Save inbound message
  if (conversation?.id) {
    await supabase.from("reva_messages").insert({
      conversation_id: conversation.id,
      clinic_id: clinic.id,
      direction: "inbound",
      content: textContent,
      message_type: message.type,
      wa_message_id: message.id,
      status: "delivered",
      sent_by: "patient",
      sent_at: new Date(Number(message.timestamp) * 1000).toISOString(),
    });
  }

  // Check if bot is active for this conversation
  const { data: conv } = await supabase
    .from("reva_conversations")
    .select("is_bot_active")
    .eq("id", conversation?.id)
    .single();

  if (conv?.is_bot_active !== false && textContent) {
    // Run booking bot
    await handleBotMessage(clinic, contactPhone, textContent, message.id).catch(err => {
      console.error("Bot error:", err);
    });
  }

  return NextResponse.json({ status: "ok" });
}

async function handleStatusUpdate(statuses: { id: string; status: string }[], clinicId: string) {
  const supabase = await createClient();
  for (const s of statuses) {
    await supabase
      .from("reva_messages")
      .update({ status: s.status })
      .eq("wa_message_id", s.id)
      .eq("clinic_id", clinicId);
  }
}

function verifySignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  const signature = req.headers.get("x-hub-signature-256") ?? "";
  if (!secret || !signature.startsWith("sha256=")) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(signature.slice("sha256=".length), "hex");
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
