"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMobileCtaVisible,
  subscribeMobileCta,
} from "./mobile-cta-visibility";
import { useLang } from "./language-provider";

/** Floating back-to-top control — appears after the first viewport height. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { t } = useLang();
  // When the sticky mobile CTA bar is showing, sit just above it (below md).
  const mobileCtaVisible = useSyncExternalStore(
    subscribeMobileCta,
    getMobileCtaVisible,
    () => false
  );

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 14, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.9 }}
          transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={t.backToTop}
          className={cn(
            "fixed end-6 z-40 flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-soft-lg backdrop-blur transition-all hover:-translate-y-0.5 hover:text-aloka-600 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-500/40",
            mobileCtaVisible ? "bottom-24 md:bottom-6" : "bottom-6"
          )}
        >
          <ArrowUp className="size-[18px]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
