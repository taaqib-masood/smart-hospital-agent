/**
 * POST /api/whatsapp/send
 * Queue a receptionist-authored WhatsApp message from the dashboard.
 * Body: { conversation_id, text }
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getClinicAccess } from "@/lib/auth";
import { enqueueMessage } from "@/lib/message-jobs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { conversation_id, text } = body;

  if (!conversation_id || !text?.trim()) {
    return NextResponse.json({ error: "conversation_id and text required" }, { status: 400 });
  }

  // Fetch conversation + clinic
  const { data: conv } = await supabase
    .from("reva_conversations")
    .select("*, clinic:reva_clinics(id)")
    .eq("id", conversation_id)
    .eq("clinic_id", access.clinicId)
    .single();

  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const clinic = conv.clinic as { id: string };

  const content = text.trim();
  const { data: msg, error: messageError } = await supabase.from("reva_messages").insert({
    conversation_id,
    clinic_id: clinic.id,
    direction: "outbound",
    content,
    status: "queued",
    sent_by: access.userId,
  }).select().single();
  if (messageError || !msg) return NextResponse.json({ error: messageError?.message ?? "Could not queue message" }, { status: 500 });

  const { error: jobError } = await enqueueMessage(supabase, {
    clinicId: clinic.id,
    conversationId: conversation_id,
    recipientPhone: conv.contact_phone,
    kind: "manual",
    idempotencyKey: `manual:${msg.id}:${randomUUID()}`,
    payload: { text: content, message_id: msg.id, requires_consent: false },
  });
  if (jobError) {
    await supabase.from("reva_messages").update({ status: "failed", error_message: jobError.message }).eq("id", msg.id);
    return NextResponse.json({ error: "Could not queue message" }, { status: 500 });
  }

  // Update conversation last_message
  await supabase.from("reva_conversations").update({
    last_message: content.slice(0, 200),
    last_message_at: new Date().toISOString(),
  }).eq("id", conversation_id);

  return NextResponse.json({ message: msg }, { status: 202 });
}
