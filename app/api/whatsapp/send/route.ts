/**
 * POST /api/whatsapp/send
 * Send a WhatsApp message from the dashboard (doctor-initiated)
 * Body: { conversation_id, text }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getWhatsAppCredentials } from "@/lib/whatsapp-credentials";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { conversation_id, text } = body;

  if (!conversation_id || !text?.trim()) {
    return NextResponse.json({ error: "conversation_id and text required" }, { status: 400 });
  }

  // Fetch conversation + clinic
  const { data: conv } = await supabase
    .from("reva_conversations")
    .select("*, clinic:reva_clinics(id, owner_id)")
    .eq("id", conversation_id)
    .single();

  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const clinic = conv.clinic as { id: string; owner_id: string };
  if (clinic.owner_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const wa = await getWhatsAppCredentials(clinic.id);
  // Send via WhatsApp
  const result = await sendWhatsAppMessage(
    conv.contact_phone,
    text.trim(),
    wa.phoneId,
    wa.token
  );

  const waMessageId = result.messages?.[0]?.id;

  // Save outbound message
  const { data: msg } = await supabase.from("reva_messages").insert({
    conversation_id,
    clinic_id: clinic.id,
    direction: "outbound",
    content: text.trim(),
    wa_message_id: waMessageId,
    status: "sent",
    sent_by: "doctor",
  }).select().single();

  // Update conversation last_message
  await supabase.from("reva_conversations").update({
    last_message: text.trim().slice(0, 200),
    last_message_at: new Date().toISOString(),
  }).eq("id", conversation_id);

  return NextResponse.json({ message: msg });
}
