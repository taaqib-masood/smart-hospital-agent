"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Invisible engagement analytics — two event families, each fired at most
 * once per pageload:
 *
 * 1. `scroll_depth` — milestones at 25 / 50 / 75 / 100 % of the document
 *    (100 % requires grazing the very bottom, so it is a genuine
 *    read-through signal, not just a tall scrollbar).
 * 2. `section_view` — the first time each landmark section enters the
 *    viewport. Measures how far down the persuasion funnel visitors
 *    actually travel (e.g. "42 % of visitors reach #pricing").
 *
 * Everything lands on `window.dataLayer` alongside the existing
 * `cta_click` events, so a single GTM/GA4 container can consume all of it.
 */
export function ScrollDepthTracker() {
  useEffect(() => {
    const fired = new Set<string>();

    /* ---------------- Scroll-depth milestones ---------------- */
    const milestones = [25, 50, 75, 100];

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = Math.min(100, (window.scrollY / scrollable) * 100);

      for (const m of milestones) {
        if (pct >= m && !fired.has(`depth-${m}`)) {
          fired.add(`depth-${m}`);
          trackEvent("scroll_depth", {
            depth_percent: m,
            depth_label: m === 100 ? "bottom" : `${m}%`,
          });
        }
      }
    };
    onScroll(); // visitors who land mid-scroll (deep links, restores)
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------------- First section views ---------------- */
    const sectionIds = [
      "top",
      "features",
      "journey",
      "how-it-works",
      "portal",
      "chat",
      "before-after",
      "day",
      "security",
      "pricing",
      "faq",
    ];

    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          if (seen.has(id)) continue;
          seen.add(id);
          fired.add(`section-${id}`);
          trackEvent("section_view", { section_id: id });
          observer.unobserve(entry.target);
        }
      },
      // A section counts as "viewed" once a meaningful slice of it is on
      // screen — grazing the section edge during a fast scroll does not.
      { rootMargin: "0px 0px -20% 0px", threshold: 0.25 }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return null;
}
