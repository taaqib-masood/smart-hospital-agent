/**
 * Tiny client-side CTA analytics.
 *
 * Events are pushed onto `window.dataLayer` (GTM-compatible) with the shape:
 *   { event: "cta_click", cta_label, cta_location, timestamp }
 *
 * Usage — two mechanisms:
 *  1. Declarative: add `data-cta="<label>"` (and optionally
 *     `data-cta-location="<where>"`) to any clickable element. A single
 *     delegated document-level listener (installed once via
 *     `initCtaTracking()`) captures the click.
 *  2. Programmatic: call `trackCTA(label, location)` directly, e.g. after an
 *     async action succeeds.
 */

export type CtaClickEvent = {
  event: "cta_click";
  cta_label: string;
  cta_location: string;
  timestamp: string;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

/** Push a `cta_click` event onto the data layer. SSR-safe no-op. */
export function trackCTA(label: string, location: string): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  const event: CtaClickEvent = {
    event: "cta_click",
    cta_label: label,
    cta_location: location,
    timestamp: new Date().toISOString(),
  };
  window.dataLayer.push(event);
}

/**
 * Push a custom (non-CTA) analytics event onto the data layer.
 *
 * Used for engagement signals that are not clicks — e.g. scroll-depth
 * milestones (`scroll_depth`) and first section views (`section_view`).
 * Same GTM-compatible shape as `cta_click`, so one GA4 config can read
 * all three event families.
 */
export function trackEvent(
  event: "scroll_depth" | "section_view",
  payload: Record<string, string | number>
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event,
    ...payload,
    timestamp: new Date().toISOString(),
  });
}

/* ------------------------------------------------------------------ */
/* Delegated [data-cta] click capture                                  */
/* ------------------------------------------------------------------ */

let listenerInstalled = false;

/**
 * Install a single delegated document-level click listener that tracks any
 * element carrying a `data-cta` attribute. Idempotent — safe to call from
 * multiple client components.
 */
export function initCtaTracking(): void {
  if (typeof document === "undefined" || listenerInstalled) return;
  listenerInstalled = true;

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const el = target.closest<HTMLElement>("[data-cta]");
      if (!el) return;
      const label = el.getAttribute("data-cta");
      if (!label) return;
      const location = el.getAttribute("data-cta-location") ?? "unknown";
      trackCTA(label, location);
    },
    { passive: true }
  );
}
