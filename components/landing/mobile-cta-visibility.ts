/**
 * Tiny module-level store that lets <MobileCtaBar /> publish its visibility
 * so sibling fixed UI (<BackToTop />) can adjust its position on mobile.
 *
 * Zero dependencies — consumed via React's `useSyncExternalStore`
 * (subscribe / getSnapshot / server snapshot). The server snapshot is always
 * `false`, so SSR and first paint are stable.
 */

type Listener = () => void;

let visible = false;
const listeners = new Set<Listener>();

/** Called by <MobileCtaBar /> whenever its visibility changes. */
export function setMobileCtaVisible(next: boolean): void {
  if (visible === next) return;
  visible = next;
  listeners.forEach((listener) => listener());
}

/** `useSyncExternalStore` subscribe plumbing. */
export function subscribeMobileCta(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** `useSyncExternalStore` client snapshot. */
export function getMobileCtaVisible(): boolean {
  return visible;
}
