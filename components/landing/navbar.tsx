"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackCTA } from "@/lib/analytics";
import type { Lang } from "@/lib/i18n/dictionary";
import { RevaBrand } from "./brand";
import { LeadDialogButton } from "./lead-dialog";
import { useLang } from "./language-provider";

const LINK_HREFS = ["#features", "#how-it-works", "#pricing"] as const;

/** Highlights the nav link whose section currently occupies the viewport band. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/**
 * Compact EN ⇄ عربي segmented pill.
 * `tall` bumps the segments to 40px touch targets for the mobile menu.
 */
function LangToggle({ tall = false }: { tall?: boolean }) {
  const { lang, setLang, t } = useLang();

  const switchTo = (next: Lang) => {
    if (next === lang) return;
    setLang(next);
    trackCTA(`Language toggle — ${next}`, "navbar");
  };

  const segment = (code: Lang, label: string) => (
    <button
      key={code}
      type="button"
      onClick={() => switchTo(code)}
      lang={code}
      aria-pressed={lang === code}
      className={cn(
        "rounded-full text-[12.5px] font-bold leading-none transition-colors duration-200",
        tall ? "h-10 min-w-11 px-3" : "h-7 px-3",
        lang === code
          ? "bg-aloka-50 text-aloka-700"
          : "text-slate-500 hover:text-slate-800"
      )}
    >
      {label}
    </button>
  );

  return (
    <div
      role="group"
      aria-label={t.nav.langAria}
      className="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-white/70 p-0.5"
    >
      {segment("en", "EN")}
      {segment("ar", "عربي")}
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLang();
  const active = useActiveSection(["features", "how-it-works", "pricing"]);

  const links = [
    { label: t.nav.features, href: LINK_HREFS[0] },
    { label: t.nav.howItWorks, href: LINK_HREFS[1] },
    { label: t.nav.pricing, href: LINK_HREFS[2] },
  ];

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.4,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu first, then smooth-scroll once the collapse animation
  // has finished (otherwise the layout shift cancels the browser scroll).
  const handleMobileNav = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    window.setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }, 280);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || menuOpen
          ? "border-b border-slate-200/80 bg-white/85 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl"
          : "border-b border-transparent bg-white/0"
      )}
    >
      <nav
        aria-label={t.nav.navAria}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-[72px] lg:px-8"
      >
        <RevaBrand />

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => {
            const isActive = active === l.href.slice(1);
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative py-1.5 text-sm transition-colors",
                  isActive
                    ? "font-semibold text-slate-950"
                    : "font-medium text-slate-600 hover:text-slate-950"
                )}
              >
                {l.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-0 right-0 h-[2.5px] rounded-full bg-aloka-500"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <Button
            variant="ghost"
            className="h-9 px-3.5 text-sm font-medium text-slate-600 hover:text-slate-950"
            asChild
          >
            <a href="#portal">{t.nav.login}</a>
          </Button>
          <LangToggle />
          <LeadDialogButton
            label={t.nav.trial}
            plan="Clinic Pro"
            size="sm"
            cta="Start Free Trial"
            ctaLocation="navbar"
            className="h-9 rounded-lg px-4 shadow-[0_4px_16px_rgba(0,126,127,0.28)]"
          />
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Scroll progress line — sits on the header's bottom edge */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-aloka-400 via-aloka-500 to-aloka-600 rtl:origin-right"
        style={{ scaleX: progress }}
      />

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {links.map((l) => {
                const isActive = active === l.href.slice(1);
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={handleMobileNav(l.href)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2.5 text-[15px] transition-colors",
                      isActive
                        ? "bg-aloka-50 font-bold text-aloka-700"
                        : "font-medium text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {l.label}
                    {isActive && (
                      <span className="size-1.5 rounded-full bg-aloka-500" aria-hidden />
                    )}
                  </a>
                );
              })}
              <a
                href="#chat"
                onClick={handleMobileNav("#chat")}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Sparkles className="size-4 shrink-0 text-aloka-600" aria-hidden />
                {t.nav.tryAgent}
              </a>
              <a
                href="#portal"
                onClick={handleMobileNav("#portal")}
                className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {t.nav.login}
              </a>
              <div className="flex items-center justify-between gap-3 px-1 pt-3">
                <LangToggle tall />
                <span className="text-[12px] font-medium text-slate-400">
                  {t.nav.langAria}
                </span>
              </div>
              <div className="pt-3">
                <LeadDialogButton
                  label={t.nav.trialMobile}
                  plan="Clinic Pro"
                  cta="Start 14-Day Free Trial"
                  ctaLocation="navbar-mobile"
                  className="h-11 w-full rounded-xl text-[15px] font-semibold shadow-[0_8px_24px_rgba(0,126,127,0.28)]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
