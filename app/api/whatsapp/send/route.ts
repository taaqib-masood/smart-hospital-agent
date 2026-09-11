/**
 * POST /api/whatsapp/send
 * Queue a receptionist-authored WhatsApp message from the dashboard.
 * Body: { conversation_id, text } or { conversation_id, template_id }
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getClinicAccess } from "@/lib/auth";
import { enqueueMessage } from "@/lib/message-jobs";
import { getWhatsAppWindow } from "@/lib/whatsapp-window";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { conversation_id, text, template_id } = body;
  const hasText = typeof text === "string" && text.trim().length > 0;
  const hasTemplate = typeof template_id === "string" && template_id.length > 0;

  if (!conversation_id || hasText === hasTemplate) {
    return NextResponse.json({ error: "conversation_id and exactly one of text or template_id required" }, { status: 400 });
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

  let template: {
    id: string;
    purpose: string;
    template_name: string;
    language_code: string;
    status: string;
    components: unknown;
  } | null = null;

  if (hasTemplate) {
    const result = await supabase
      .from("reva_whatsapp_templates")
      .select("id,purpose,template_name,language_code,status,components")
      .eq("id", template_id)
      .eq("clinic_id", clinic.id)
      .eq("status", "approved")
      .single();
    template = result.data;
    if (!template) {
      return NextResponse.json({ error: "Approved WhatsApp template not found", code: "WHATSAPP_TEMPLATE_NOT_FOUND" }, { status: 409 });
    }
  } else {
    const window = getWhatsAppWindow(conv.last_inbound_at);
    if (!window.isOpen) {
      return NextResponse.json({
        error: "An approved WhatsApp template is required outside the 24-hour service window",
        code: "WHATSAPP_TEMPLATE_REQUIRED",
        closes_at: window.closesAt,
        requires_template: true,
      }, { status: 409 });
    }
  }

  const content = template ? `Approved template: ${template.purpose}` : text.trim();
  const { data: msg, error: messageError } = await supabase.from("reva_messages").insert({
    conversation_id,
    clinic_id: clinic.id,
    direction: "outbound",
    content,
    message_type: template ? "template" : "text",
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
    payload: template
      ? {
          template_name: template.template_name,
          language_code: template.language_code,
          components: Array.isArray(template.components) ? template.components : [],
          message_id: msg.id,
          requires_consent: true,
        }
      : { text: content, message_id: msg.id, requires_consent: false },
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
