export const WHATSAPP_SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface WhatsAppWindowState {
  isOpen: boolean;
  openedAt: string | null;
  closesAt: string | null;
  remainingSeconds: number;
}

/** Return the current customer-service-window state for an inbound WhatsApp message. */
export function getWhatsAppWindow(
  lastInboundAt: string | null | undefined,
  now = Date.now(),
): WhatsAppWindowState {
  if (!lastInboundAt) {
    return { isOpen: false, openedAt: null, closesAt: null, remainingSeconds: 0 };
  }

  const openedMs = Date.parse(lastInboundAt);
  if (!Number.isFinite(openedMs)) {
    return { isOpen: false, openedAt: null, closesAt: null, remainingSeconds: 0 };
  }

  const closesMs = openedMs + WHATSAPP_SERVICE_WINDOW_MS;
  const remainingSeconds = Math.max(0, Math.ceil((closesMs - now) / 1000));
  return {
    isOpen: remainingSeconds > 0,
    openedAt: new Date(openedMs).toISOString(),
    closesAt: new Date(closesMs).toISOString(),
    remainingSeconds,
  };
}
