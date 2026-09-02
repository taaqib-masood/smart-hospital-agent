"use client";

import { useLang } from "./language-provider";

/**
 * Keyboard-accessibility skip link — the first focusable element on the page.
 * Visually hidden until focused; jumps past the fixed navbar to <main>.
 */
export function SkipLink() {
  const { t } = useLang();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[70] focus:inline-flex focus:items-center focus:rounded-lg focus:border focus:border-aloka-200 focus:bg-white focus:px-4 focus:py-2.5 focus:text-[13px] focus:font-bold focus:text-aloka-700 focus:shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-aloka-500/40"
    >
      {t.skip}
    </a>
  );
}
