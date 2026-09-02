"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LeadDialog } from "./lead-dialog";
import { setMobileCtaVisible } from "./mobile-cta-visibility";
import { useLang } from "./language-provider";

/**
 * Sticky mobile-only CTA bar.
 *
 * - Appears (slides up) once the visitor scrolls past ~70% of the hero.
 * - Hides again when scrolled back to the top.
 * - Hides while the footer is in view so it never overlaps the footer CTA.
 * - Publishes its visibility via the tiny module store in
 *   `mobile-cta-visibility.ts` so <BackToTop /> can rise above it on mobile.
 */
export function MobileCtaBar() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const hero = document.getElementById("top"); // hero <section id="top">
    let pastHero = false;
    let footerNear = false;

    const update = () => {
      const show = pastHero && !footerNear;
      setVisible(show);
      setMobileCtaVisible(show);
    };

    const onScroll = () => {
      const heroThreshold = hero
        ? hero.offsetTop + hero.offsetHeight * 0.7
        : window.innerHeight * 0.7;
      pastHero = window.scrollY >= heroThreshold;
      update();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Retire the bar as soon as any part of the footer is on screen.
    const footer = document.querySelector("footer");
    const footerObserver = footer
      ? new IntersectionObserver(
          ([entry]) => {
            footerNear = entry.isIntersecting;
            update();
          },
          { threshold: 0 }
        )
      : null;
    if (footer) footerObserver?.observe(footer);

    return () => {
      window.removeEventListener("scroll", onScroll);
      footerObserver?.disconnect();
      setMobileCtaVisible(false);
    };
  }, []);

  return (
    <>
      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="fixed inset-x-0 bottom-0 z-40 md:hidden"
            >
              <div className="border-t border-slate-200 bg-white/92 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_rgba(15,23,42,0.08)] backdrop-blur-md">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <p className="hidden min-[380px]:block text-[12px] font-medium leading-snug text-slate-500">
                    {t.mobileCta.line}
                    <span className="font-semibold text-slate-800">
                      {" "}
                      {t.mobileCta.clinic}
                    </span>
                  </p>
                  <Button
                    data-cta="Mobile sticky CTA"
                    data-cta-location="mobile-cta-bar"
                    onClick={() => setOpen(true)}
                    className="btn-shine h-10 flex-1 rounded-xl px-5 text-[14px] font-semibold shadow-[0_6px_18px_rgba(0,126,127,0.28)] hover:shadow-[0_8px_24px_rgba(0,126,127,0.36)] min-[380px]:flex-none"
                  >
                    {t.mobileCta.cta}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>

      <LeadDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
