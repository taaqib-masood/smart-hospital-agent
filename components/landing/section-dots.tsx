"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { trackCTA } from "@/lib/analytics";
import type { Dict } from "@/lib/i18n/dictionary";
import { useLang } from "./language-provider";

/** Section ids in page order, mapped to their dictionary label keys. */
const SECTIONS: { id: string; key: keyof Dict["dots"] }[] = [
  { id: "top", key: "home" },
  { id: "features", key: "features" },
  { id: "journey", key: "journey" },
  { id: "how-it-works", key: "how" },
  { id: "portal", key: "portal" },
  { id: "chat", key: "chat" },
  { id: "before-after", key: "compare" },
  { id: "day", key: "day" },
  { id: "security", key: "security" },
  { id: "pricing", key: "pricing" },
  { id: "faq", key: "faq" },
];

/**
 * Desktop-only vertical dot navigator pinned to the viewport's end edge.
 * Tracks the active section with an IntersectionObserver (same band
 * technique as the navbar) and expands the active dot into a green pill.
 * Tooltips reveal section names on hover; fully keyboard accessible.
 */
export function SectionDots() {
  const { t } = useLang();
  const [active, setActive] = useState<string>("top");

  useEffect(() => {
    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.15, 0.35, 0.6, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const jump = (id: string) => {
    trackCTA(`Section dots — ${id}`, "section-dots");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      aria-label={t.dots.aria}
      className="fixed end-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 xl:flex"
    >
      {SECTIONS.map(({ id, key }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => jump(id)}
            aria-label={t.dots[key]}
            aria-current={isActive ? "true" : undefined}
            className="group relative flex size-4 items-center justify-center focus-visible:outline-none"
          >
            <span
              className={cn(
                "rounded-full transition-all duration-300",
                isActive
                  ? "h-2.5 w-6 bg-aloka-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
                  : "size-2 bg-slate-300 group-hover:scale-125 group-hover:bg-slate-400 group-focus-visible:bg-slate-400"
              )}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute end-full me-3.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 opacity-0 shadow-soft transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {t.dots[key]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
