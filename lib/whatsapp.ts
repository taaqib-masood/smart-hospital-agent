/**
 * WhatsApp Cloud API helper
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const WA_API_BASE = "https://graph.facebook.com/v19.0";

export interface WASendResult {
  messaging_product: string;
  contacts: { input: string; wa_id: string }[];
  messages: { id: string }[];
}

/**
 * Send a plain text WhatsApp message.
 * phoneId and token come from the clinic's row in reva_clinics,
 * falling back to env vars (used for the default clinic during dev).
 */
export async function sendWhatsAppMessage(
  to: string,
  text: string,
  phoneId?: string | null,
  token?: string | null
): Promise<WASendResult> {
  const pid = phoneId || process.env.WHATSAPP_PHONE_ID;
  const tok = token || process.env.WHATSAPP_TOKEN;

  if (!pid || !tok) {
    throw new Error("WhatsApp credentials not configured");
  }

  const res = await fetch(`${WA_API_BASE}/${pid}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tok}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body: text, preview_url: false },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${err}`);
  }

  return res.json();
}

/**
 * Send a template message (for reminders, follow-ups).
 * template_name must be approved in Meta Business Manager.
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string,
  components: Record<string, unknown>[],
  phoneId?: string | null,
  token?: string | null
): Promise<WASendResult> {
  const pid = phoneId || process.env.WHATSAPP_PHONE_ID;
  const tok = token || process.env.WHATSAPP_TOKEN;

  if (!pid || !tok) throw new Error("WhatsApp credentials not configured");

  const res = await fetch(`${WA_API_BASE}/${pid}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tok}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: { name: templateName, language: { code: languageCode }, components },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${err}`);
  }

  return res.json();
}

/**
 * Mark a message as read (shows blue ticks).
 */
export async function markMessageRead(
  messageId: string,
  phoneId?: string | null,
  token?: string | null
): Promise<void> {
  const pid = phoneId || process.env.WHATSAPP_PHONE_ID;
  const tok = token || process.env.WHATSAPP_TOKEN;
  if (!pid || !tok) return;

  await fetch(`${WA_API_BASE}/${pid}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: messageId }),
  });
}

/** Extract the plain text body from a WA webhook message object */
export function extractMessageText(message: Record<string, unknown>): string {
  if (message.type === "text") {
    return (message.text as { body: string })?.body?.trim() ?? "";
  }
  if (message.type === "interactive") {
    const inter = message.interactive as Record<string, unknown>;
    if (inter.type === "button_reply") return (inter.button_reply as { id: string }).id;
    if (inter.type === "list_reply") return (inter.list_reply as { id: string }).id;
  }
  return "";
}

/** Format a phone number to E.164 (strips spaces, dashes, leading 0, adds 91 for India) */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 9 && digits.startsWith("5")) return `+971${digits}`;
  if (digits.length === 10) return `+971${digits.slice(1)}`;
  return `+${digits}`;
}
